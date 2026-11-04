import { website } from '$lib/data/links';
import { darkColors, FIELDS } from '$lib/mock/theme';
import { base64, bytes, check, family, link, type Canonical } from '$lib/theme-file';
import { githubProfile } from '$lib/theme-submitter';

/** One theme file of a community theme. */
export type ThemeVariant = {
	/** The file name without `.json`. */
	id: string;
	/** The name inside its family, such as "Dark". A theme of one file uses the whole title. */
	name: string;
	/** The name the file gives, such as "Pastel Pink Dark". */
	title: string;
	author: string;
	/** Every colour token as CSS, the theme's own over the Dark theme's. */
	colors: Record<string, string>;
};

/**
 * A community theme as the gallery shows it: a single file in `src/lib/themes`, or a folder
 * there whose files are its variants, the way Sonora's themes folder groups them.
 */
export type CommunityTheme = {
	id: string;
	name: string;
	/** Everyone who wrote a variant, in order of first appearance. */
	authors: string[];
	/** The submitter's GitHub username, shared by all variants. */
	github?: string;
	/** Sorted by file name, the order Sonora lists them in once installed. */
	variants: ThemeVariant[];
	/** The `sonora://theme/` link that carries every file. */
	link: string;
	/** The file to save: the theme file itself, or a zip of the folder for a family. */
	download: { name: string; href: string };
};

const files = import.meta.glob(['../themes/*.json', '../themes/*/*.json'], {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const submitters = import.meta.glob('../theme-submitters/*.json', {
	eager: true,
	import: 'default'
}) as Record<string, string>;

/** The file a new theme starts from. Every color it leaves out comes from the Dark theme. */
const STARTER = `{
	"name": "My theme",
	"author": "Your name",
	"version": 1,
	"theme": {
		"background": "#101014",
		"foreground": "#fafafa",
		"primary": "#a5b4fc",
		"primary_foreground": "#101014"
	}
}
`;

/**
 * Opens GitHub's editor on a new file in `src/lib/themes`. Committing it forks the repository
 * and opens a pull request that starts from the theme template.
 */
export const submit = `${website}/new/main/src/lib/themes?filename=my-theme.json&value=${encodeURIComponent(STARTER)}`;

/**
 * Every theme in `src/lib/themes`, sorted by name. A file or folder Sonora would refuse fails
 * the build.
 */
export const themes: CommunityTheme[] = collect()
	.map(([id, entries]) => build(id, entries))
	.sort((a, b) => a.name.localeCompare(b.name));

/**
 * Groups the files by theme id, each with its file name inside the folder and its text. A loose
 * file is a theme of one with no file name there.
 */
function collect(): [string, [string | null, string][]][] {
	const groups = new Map<string, [string | null, string][]>();
	for (const [path, text] of Object.entries(files)) {
		const parts = path.replace(/^\.\.\/themes\//, '').split('/');
		const id = parts[0].replace(/\.json$/, '');
		const stem = parts.length > 1 ? parts[1].replace(/\.json$/, '') : null;
		if (groups.has(id) && (stem === null || groups.get(id)![0][0] === null)) {
			throw new Error(`src/lib/themes/${id}: a theme is either ${id}.json or a folder, not both`);
		}
		groups.set(id, [...(groups.get(id) ?? []), [stem, text]]);
	}
	return [...groups];
}

/** Checks a theme's files the way Sonora checks a theme link, and builds its link. */
function build(id: string, entries: [string | null, string][]): CommunityTheme {
	const where = entries[0][0] !== null ? `src/lib/themes/${id}/` : `src/lib/themes/${id}.json`;
	const fail = (reason: string): never => {
		throw new Error(`${where}: ${reason}`);
	};
	const checked = check(id, entries, fail);
	const github = submitters[`../theme-submitters/${id}.json`];
	if (github !== undefined && !githubProfile(github)) fail('invalid submitter GitHub username');

	if (checked[0][0] === null) {
		const file = checked[0][1];
		const text = JSON.stringify(file, null, 2) + '\n';
		return {
			id,
			name: file.name,
			authors: [file.author],
			github,
			variants: [variant(id, file)],
			link: link(id, checked, fail),
			download: { name: `${id}.json`, href: `data:application/json;base64,${base64(bytes(text))}` }
		};
	}

	const sorted = checked as [string, Canonical][];
	const variants = sorted.map(([stem, file]) => variant(stem, file));
	const name = names(id, variants);
	const archive = zip(
		sorted.map(([stem, file]) => [`${id}/${stem}.json`, JSON.stringify(file, null, 2) + '\n'])
	);
	return {
		id,
		name,
		authors: [...new Set(variants.map((variant) => variant.author))],
		github,
		variants,
		link: link(id, checked, fail),
		download: { name: `${id}.zip`, href: `data:application/zip;base64,${base64(archive)}` }
	};
}

/** The colours a theme file paints, every token it leaves out taken from the Dark theme. */
export function variant(id: string, file: Canonical): ThemeVariant {
	const colors: Record<string, string> = {};
	for (const token of FIELDS) colors[token] = css(file.theme[token] ?? darkColors[token]);
	return { id, name: file.name, title: file.name, author: file.author, colors };
}

/** Names a family and each of its variants from their titles, the way Sonora names them. */
export function names(id: string, variants: ThemeVariant[]): string {
	const named = family(
		id,
		variants.map((variant) => variant.title)
	);
	variants.forEach((variant, index) => (variant.name = named.variants[index]));
	return named.name;
}

/** A hex colour, with or without `#` and with an optional alpha byte, as CSS `rgb()`. */
function css(hex: string): string {
	const digits = hex.replace(/^#/, '');
	const [red, green, blue, alpha = 255] = (digits.match(/../g) ?? []).map((pair) =>
		parseInt(pair, 16)
	);
	return `rgb(${red} ${green} ${blue} / ${Math.round((alpha / 255) * 1000) / 1000})`;
}

/** A zip archive that stores `entries`, each a path and its text, without compressing them. */
function zip(entries: [string, string][]): Uint8Array {
	const parts: Uint8Array[] = [];
	const directory: Uint8Array[] = [];
	let offset = 0;
	for (const [path, text] of entries) {
		const name = bytes(path);
		const data = bytes(text);
		const sum = crc32(data);
		const local = header(30 + name.length, [
			[4, 0x04034b50],
			[2, 20],
			[2, 0x0800],
			[2, 0],
			[2, 0],
			[2, 0x21],
			[4, sum],
			[4, data.length],
			[4, data.length],
			[2, name.length],
			[2, 0]
		]);
		local.set(name, 30);
		const central = header(46 + name.length, [
			[4, 0x02014b50],
			[2, 20],
			[2, 20],
			[2, 0x0800],
			[2, 0],
			[2, 0],
			[2, 0x21],
			[4, sum],
			[4, data.length],
			[4, data.length],
			[2, name.length],
			[2, 0],
			[2, 0],
			[2, 0],
			[2, 0],
			[4, 0],
			[4, offset]
		]);
		central.set(name, 46);
		parts.push(local, data);
		directory.push(central);
		offset += local.length + data.length;
	}
	const size = directory.reduce((total, entry) => total + entry.length, 0);
	const end = header(22, [
		[4, 0x06054b50],
		[2, 0],
		[2, 0],
		[2, entries.length],
		[2, entries.length],
		[4, size],
		[4, offset],
		[2, 0]
	]);
	const out = new Uint8Array(offset + size + end.length);
	let at = 0;
	for (const part of [...parts, ...directory, end]) {
		out.set(part, at);
		at += part.length;
	}
	return out;
}

/** A zip record of `length` bytes that starts with `fields`, each a width and a little-endian value. */
function header(length: number, fields: [2 | 4, number][]): Uint8Array {
	const record = new Uint8Array(length);
	const view = new DataView(record.buffer);
	let at = 0;
	for (const [width, value] of fields) {
		if (width === 2) view.setUint16(at, value, true);
		else view.setUint32(at, value >>> 0, true);
		at += width;
	}
	return record;
}

function crc32(data: Uint8Array): number {
	let crc = ~0;
	for (const byte of data) {
		crc ^= byte;
		for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
	}
	return ~crc >>> 0;
}
