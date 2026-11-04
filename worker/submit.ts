import { DurableObject } from 'cloudflare:workers';
import { githubProfile } from '../src/lib/theme-submitter';
import {
	check,
	family,
	format,
	link,
	RESERVED,
	slugged,
	type Canonical
} from '../src/lib/theme-file';

/** What the submission route reads from the worker's environment. */
export type SubmitEnv = {
	/** The Sonora Buddy GitHub App's id. */
	SONORA_BUDDY_APP_ID?: string;
	/** The app's private key as GitHub hands it out, PKCS#1 or PKCS#8 PEM. Without it nothing is filed. */
	SONORA_BUDDY_KEY?: string;
	/** The Turnstile widget's secret. Required once the app key is set. */
	TURNSTILE_SECRET?: string;
	/** The repository pull requests go to, `sonorahq/website` unless set. */
	THEME_REPO?: string;
	SUBMISSIONS: { getByName(name: string): Pick<Submissions, 'take'> };
};

/** What the form posts. A theme of one file sends one file with no name. */
type Submission = {
	id: string;
	files: { name: string | null; text: string }[];
	github?: string;
	tested: boolean;
	rights: boolean;
	token: string;
};

/** The largest request body the route reads. A theme link holds at most 16 KiB. */
const BODY_LIMIT = 64 * 1024;
/** How many themes one visitor may submit a day. */
const DAILY_LIMIT = 3;
const API = 'https://api.github.com';
const MARKER = '<!-- sonora-theme-template:v1 -->';

/** A refusal the form shows the visitor as it is. */
class Refusal extends Error {
	constructor(
		message: string,
		readonly status = 400
	) {
		super(message);
	}
}

/**
 * Files a theme from the submission form as a pull request by Sonora Buddy, holding it to the
 * same template the theme check reads. Without the app's key it files nothing and answers with
 * the pull request it would have opened, which is how the form runs locally.
 */
export async function submit(request: Request, env: SubmitEnv): Promise<Response> {
	try {
		const submission = await parse(request);
		const files = validate(submission);
		const pull = draft(submission, files);
		if (!env.SONORA_BUDDY_KEY || !env.SONORA_BUDDY_APP_ID) return json({ dry: true, ...pull });
		if (!env.TURNSTILE_SECRET) throw new Refusal('Submissions are not set up yet.', 503);

		const address = request.headers.get('cf-connecting-ip') ?? '';
		await verify(env.TURNSTILE_SECRET, submission.token, address);
		const day = new Date().toISOString().slice(0, 10);
		const allowed = await env.SUBMISSIONS.getByName('themes').take(
			await digest(`${day}:${address}`),
			day,
			DAILY_LIMIT
		);
		if (!allowed) {
			throw new Refusal(`You can submit ${DAILY_LIMIT} themes a day. Try again tomorrow.`, 429);
		}

		const github = await GitHub.connect(env);
		return json({ url: await github.open(submission.id, pull) });
	} catch (error) {
		if (error instanceof Refusal) return json({ error: error.message }, error.status);
		console.error(error);
		return json({ error: 'Something went wrong on our side. Try again later.' }, 502);
	}
}

/**
 * Keeps how many themes each visitor submitted today, known by a hash of the day and the
 * address, so no address is stored.
 */
export class Submissions extends DurableObject {
	sql: { exec(query: string, ...bindings: unknown[]): { toArray(): Record<string, unknown>[] } };

	constructor(ctx: { storage: { sql: unknown } }, env: unknown) {
		super(ctx as never, env);
		this.sql = ctx.storage.sql as Submissions['sql'];
		this.sql.exec(
			'CREATE TABLE IF NOT EXISTS submitted (visitor TEXT PRIMARY KEY, day TEXT NOT NULL, count INTEGER NOT NULL)'
		);
	}

	/** Counts a submission by `visitor` on `day`, or returns false when they reached `limit`. */
	take(visitor: string, day: string, limit: number): boolean {
		this.sql.exec('DELETE FROM submitted WHERE day < ?', day);
		const [row] = this.sql
			.exec(
				'INSERT INTO submitted (visitor, day, count) VALUES (?, ?, 1) ON CONFLICT (visitor) DO UPDATE SET count = count + 1 WHERE count < ? RETURNING count',
				visitor,
				day,
				limit
			)
			.toArray();
		return row !== undefined;
	}
}

async function parse(request: Request): Promise<Submission> {
	const length = Number(request.headers.get('content-length') ?? 0);
	if (length > BODY_LIMIT) throw new Refusal('The theme is too large.', 413);
	const text = await request.text();
	if (text.length > BODY_LIMIT) throw new Refusal('The theme is too large.', 413);
	let body: Partial<Submission>;
	try {
		body = JSON.parse(text);
	} catch {
		throw new Refusal('The request is not valid JSON.');
	}
	if (
		typeof body?.id !== 'string' ||
		!Array.isArray(body.files) ||
		!body.files.every(
			(file) =>
				typeof file?.text === 'string' && (file.name === null || typeof file.name === 'string')
		)
	) {
		throw new Refusal('The request is missing the theme.');
	}
	return {
		id: body.id,
		files: body.files,
		github: typeof body.github === 'string' ? body.github.trim().replace(/^@/, '') : undefined,
		tested: body.tested === true,
		rights: body.rights === true,
		token: typeof body.token === 'string' ? body.token : ''
	};
}

/** Checks the theme the way the gallery build will, and returns its files as they are saved. */
function validate(submission: Submission): [string | null, Canonical][] {
	const fail = (reason: string): never => {
		throw new Refusal(`${reason[0].toUpperCase()}${reason.slice(1)}.`);
	};
	if (!submission.tested) fail('confirm that you installed the theme and checked it in Sonora');
	if (!submission.rights) fail('confirm that you made the theme or may share it');
	if (submission.github && !githubProfile(submission.github)) {
		fail('that is not a GitHub username');
	}
	if (!slugged(submission.id)) {
		fail('the theme id must be lowercase words joined by hyphens, at most 40 characters');
	}
	if (RESERVED.has(submission.id)) fail(`"${submission.id}" is the id of a built-in theme`);
	const files = check(
		submission.id,
		submission.files.map((file) => [file.name, file.text]),
		fail
	);
	link(submission.id, files, fail);
	return files;
}

/** The commit and pull request a submission becomes. */
type Pull = { branch: string; title: string; body: string; files: Record<string, string> };

/** Prepares canonical theme files and the optional gallery credit for one pull request. */
function draft(submission: Submission, files: [string | null, Canonical][]): Pull {
	const { id } = submission;
	const single = files[0][0] === null;
	const named = family(
		id,
		files.map(([, file]) => file.name)
	);
	const title = single
		? `feat: add the ${named.name.toLowerCase()} theme`
		: `feat: add the ${named.name.toLowerCase()} theme with ${list(named.variants.map((name) => name.toLowerCase()))} variants`;
	const by = submission.github
		? `[${submission.github}](https://github.com/${submission.github})`
		: 'someone who left no GitHub username';
	const install = link(id, files, () => {
		throw new Error('unreachable');
	});
	const body = [
		MARKER,
		'',
		`Submitted through the theme form on the website by ${by}.`,
		'',
		'## Theme',
		'',
		'- [x] Adds a new theme',
		'- [ ] Updates an existing theme',
		'',
		'## Screenshot',
		'',
		'Form submission. Link:',
		'',
		'```',
		install,
		'```',
		'',
		'## Checklist',
		'',
		'- [x] This pull request only changes theme files and their optional submitter credit.',
		'- [x] It adds or changes exactly one theme: a single file, or one folder with a file per variant.',
		'- [x] Files and folders are named in lowercase with hyphens, such as `night-owl.json` or `night-owl/dark.json`.',
		'- [x] I installed the theme in Sonora and text stays readable on every screen I opened.',
		'- [x] I made this theme, or I have the right to share it.',
		''
	].join('\n');
	return {
		branch: `themes/${id}`,
		title,
		body,
		files: {
			...Object.fromEntries(
				files.map(([stem, file]) => [
					single ? `src/lib/themes/${id}.json` : `src/lib/themes/${id}/${stem}.json`,
					format(file)
				])
			),
			...(submission.github
				? { [`src/lib/theme-submitters/${id}.json`]: JSON.stringify(submission.github) + '\n' }
				: {})
		}
	};
}

/** Sonora Buddy's access to the theme repository through an installation token. */
class GitHub {
	private constructor(
		private readonly repo: string,
		private readonly token: string
	) {}

	static async connect(env: SubmitEnv): Promise<GitHub> {
		const repo = env.THEME_REPO || 'sonorahq/website';
		const jwt = await sign(env.SONORA_BUDDY_APP_ID!, env.SONORA_BUDDY_KEY!);
		const installation = await call<{ id: number }>(jwt, 'GET', `/repos/${repo}/installation`);
		const { token } = await call<{ token: string }>(
			jwt,
			'POST',
			`/app/installations/${installation.id}/access_tokens`,
			{
				repositories: [repo.split('/')[1]],
				permissions: { contents: 'write', pull_requests: 'write' }
			}
		);
		return new GitHub(repo, token);
	}

	/**
	 * Commits the theme to a branch of its own off `main` and opens the pull request, returning
	 * its address. Refuses a theme id that is taken on `main` or already waiting on its branch.
	 */
	async open(id: string, pull: Pull): Promise<string> {
		const themes = await this.call<{ name: string }[]>(
			'GET',
			`/repos/${this.repo}/contents/src/lib/themes?ref=main`
		);
		if (themes.some((entry) => entry.name === id || entry.name === `${id}.json`)) {
			throw new Refusal(`A theme called "${id}" is already in the gallery. Pick another id.`, 409);
		}

		const main = await this.call<{ object: { sha: string } }>(
			'GET',
			`/repos/${this.repo}/git/ref/heads/main`
		);
		const base = await this.call<{ tree: { sha: string } }>(
			'GET',
			`/repos/${this.repo}/git/commits/${main.object.sha}`
		);
		const tree = await this.call<{ sha: string }>('POST', `/repos/${this.repo}/git/trees`, {
			base_tree: base.tree.sha,
			tree: Object.entries(pull.files).map(([path, content]) => ({
				path,
				mode: '100644',
				type: 'blob',
				content
			}))
		});
		const commit = await this.call<{ sha: string }>('POST', `/repos/${this.repo}/git/commits`, {
			message: pull.title,
			tree: tree.sha,
			parents: [main.object.sha]
		});
		try {
			await this.call('POST', `/repos/${this.repo}/git/refs`, {
				ref: `refs/heads/${pull.branch}`,
				sha: commit.sha
			});
		} catch (error) {
			if (error instanceof Failure && error.status === 422) {
				throw new Refusal(`A theme called "${id}" is already waiting for review.`, 409);
			}
			throw error;
		}
		const opened = await this.call<{ html_url: string }>('POST', `/repos/${this.repo}/pulls`, {
			title: pull.title,
			head: pull.branch,
			base: 'main',
			body: pull.body
		});
		return opened.html_url;
	}

	private call<T>(method: string, path: string, body?: unknown): Promise<T> {
		return call<T>(this.token, method, path, body);
	}
}

/** A GitHub API call that did not succeed. */
class Failure extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
	}
}

async function call<T = unknown>(
	token: string,
	method: string,
	path: string,
	body?: unknown
): Promise<T> {
	const res = await fetch(`${API}${path}`, {
		method,
		headers: {
			accept: 'application/vnd.github+json',
			authorization: `Bearer ${token}`,
			'user-agent': 'sonora-website',
			'x-github-api-version': '2022-11-28',
			...(body ? { 'content-type': 'application/json' } : {})
		},
		body: body ? JSON.stringify(body) : undefined
	});
	if (!res.ok)
		throw new Failure(res.status, `${method} ${path}: ${res.status} ${await res.text()}`);
	return (await res.json()) as T;
}

/** Throws a refusal unless Turnstile vouches for `token`. */
async function verify(secret: string, token: string, address: string): Promise<void> {
	const form = new FormData();
	form.append('secret', secret);
	form.append('response', token);
	if (address) form.append('remoteip', address);
	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		body: form
	});
	const outcome = (await res.json()) as { success?: boolean };
	if (!outcome.success)
		throw new Refusal('The spam check failed. Reload the page and try again.', 403);
}

/** A JSON Web Token that authenticates as the GitHub App for ten minutes. */
async function sign(app: string, pem: string): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const encode = (value: unknown) => base64url(new TextEncoder().encode(JSON.stringify(value)));
	const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iat: now - 60, exp: now + 540, iss: app })}`;
	const key = await crypto.subtle.importKey(
		'pkcs8',
		pkcs8(pem),
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign(
		'RSASSA-PKCS1-v1_5',
		key,
		new TextEncoder().encode(unsigned)
	);
	return `${unsigned}.${base64url(new Uint8Array(signature))}`;
}

/**
 * The DER of a private key in PEM. GitHub hands out PKCS#1 keys, which Web Crypto cannot read,
 * so those are wrapped in the PKCS#8 structure around them.
 */
function pkcs8(pem: string): Uint8Array {
	const der = Uint8Array.from(
		atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')),
		(char) => char.charCodeAt(0)
	);
	if (!pem.includes('BEGIN RSA PRIVATE KEY')) return der;
	const version = [0x02, 0x01, 0x00];
	const algorithm = [
		0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00
	];
	const octets = [0x04, ...length(der.length), ...der];
	const inner = [...version, ...algorithm, ...octets];
	return Uint8Array.from([0x30, ...length(inner.length), ...inner]);
}

/** A DER length field. */
function length(size: number): number[] {
	if (size < 0x80) return [size];
	const digits: number[] = [];
	for (let rest = size; rest > 0; rest >>= 8) digits.unshift(rest & 0xff);
	return [0x80 | digits.length, ...digits];
}

function base64url(data: Uint8Array): string {
	let binary = '';
	for (const byte of data) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Items as "a", "a and b" or "a, b and c". */
function list(items: string[]): string {
	return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

/** The SHA-256 of `text` in hex. */
async function digest(text: string): Promise<string> {
	const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
	return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
