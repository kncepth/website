<script lang="ts">
	import Glyph from '$lib/components/Glyph.svelte';
	import ThemeCard from '$lib/components/ThemeCard.svelte';
	import { names, submit as manual, themes, variant, type ThemeVariant } from '$lib/data/themes';
	import { check, family, read, slug, slugged, VARIANT_LIMIT } from '$lib/theme-file';
	import { onMount } from 'svelte';

	/** A theme file the visitor added, by its file name inside the theme's folder. */
	type Added = { stem: string; source: string; text: string };

	/** What the worker answers. A dry run means it has no app key and filed nothing. */
	type Outcome =
		| { url: string }
		| { dry: true; branch: string; title: string; body: string; files: Record<string, string> };

	/**
	 * Turnstile's always-passing test key, used when the build has no site key. The worker only
	 * accepts its tokens while it has no secret, which is the local dry run.
	 */
	const TEST_KEY = '1x00000000000000000000AA';
	const SITE_KEY: string = import.meta.env.VITE_TURNSTILE_SITE_KEY || TEST_KEY;
	const taken = new Set(themes.map((theme) => theme.id));

	let added: Added[] = $state([]);
	let pasting = $state(false);
	let pasted = $state('');
	let dragging = $state(false);
	let typed: string | null = $state(null);
	let github = $state('');
	let tested = $state(false);
	let rights = $state(false);
	let token = $state('');
	let sending = $state(false);
	let failure = $state('');
	let outcome: Outcome | null = $state(null);
	let widget: HTMLDivElement | undefined = $state();
	let widgetId: string | undefined;
	let widgetBroken = $state(false);

	/** The id the files suggest: the shared words of the variant names, or the one theme's name. */
	const suggested = $derived.by(() => {
		const titles = added.flatMap((file) => {
			try {
				return [read(file.text, fail).name];
			} catch {
				return [];
			}
		});
		return titles.length ? slug(family('', titles).name || titles[0]) : '';
	});
	const id = $derived(typed ?? suggested);

	/** The theme as the gallery would build it, or the first reason it would not. */
	const result = $derived.by(
		(): { variants: ThemeVariant[]; name: string } | { problem: string } => {
			if (!added.length) return { problem: '' };
			if (!id) return { problem: 'Give the theme an id.' };
			if (!slugged(id)) {
				return {
					problem: 'The id must be lowercase words joined by hyphens, at most 40 characters.'
				};
			}
			if (taken.has(id)) return { problem: `A theme called "${id}" is already in the gallery.` };
			try {
				const single = added.length === 1;
				const files = check(
					id,
					added.map((file) => [single ? null : file.stem, file.text]),
					fail
				);
				const variants = files.map(([stem, file]) => variant(stem ?? id, file));
				const name = single ? variants[0].name : names(id, variants);
				return { variants, name };
			} catch (error) {
				return { problem: (error as Error).message };
			}
		}
	);
	const ready = $derived('variants' in result && tested && rights && !!token && !sending);

	onMount(() => {
		const render = () => {
			widgetId = window.turnstile!.render(widget!, {
				sitekey: SITE_KEY,
				theme: document.documentElement.dataset.theme ?? 'auto',
				callback: (value: string) => (token = value),
				'expired-callback': () => (token = ''),
				'error-callback': () => (token = '')
			});
		};
		if (window.turnstile) return render();
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
		script.async = true;
		script.onload = render;
		script.onerror = () => (widgetBroken = true);
		document.head.append(script);
	});

	function fail(reason: string): never {
		throw new Error(`${reason[0].toUpperCase()}${reason.slice(1)}.`);
	}

	/** Adds dropped or picked files, each under its own file name. */
	async function take(list: FileList | null | undefined) {
		for (const file of list ?? []) {
			if (added.length >= VARIANT_LIMIT) break;
			add(slug(file.name.replace(/\.json$/i, '')) || 'theme', file.name, await file.text());
		}
	}

	/** Adds the pasted text, named after the theme it holds. */
	function addPasted() {
		let stem = 'theme';
		try {
			stem = slug(read(pasted, fail).name) || stem;
		} catch {}
		add(stem, 'Pasted', pasted);
		pasted = '';
		pasting = false;
	}

	/** Adds a file, numbering its name when another file has it already. */
	function add(stem: string, source: string, text: string) {
		let unique = stem;
		for (let n = 2; added.some((file) => file.stem === unique); n++) unique = `${stem}-${n}`;
		added.push({ stem: unique, source, text });
		outcome = null;
	}

	async function send(event: SubmitEvent) {
		event.preventDefault();
		if (!ready) return;
		sending = true;
		failure = '';
		try {
			const single = added.length === 1;
			const res = await fetch('/api/themes/submit', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					id,
					files: added.map((file) => ({ name: single ? null : file.stem, text: file.text })),
					github: github.trim() || undefined,
					tested,
					rights,
					token
				})
			});
			const body = await res.json().catch(() => ({}));
			if (res.ok) outcome = body;
			else failure = body.error ?? 'The submission did not go through. Try again later.';
		} catch {
			failure = 'The submission did not go through. Check your connection and try again.';
		} finally {
			sending = false;
			token = '';
			if (widgetId) window.turnstile?.reset(widgetId);
		}
	}

	function restart() {
		added = [];
		typed = null;
		outcome = null;
		tested = false;
		rights = false;
	}
</script>

<svelte:head>
	<title>Submit a theme · Sonora</title>
	<meta
		name="description"
		content="Send a Sonora theme to the community gallery. A pull request opens for you."
	/>
</svelte:head>

<section class="section">
	<span class="cross start"></span>
	<span class="cross end"></span>

	<div class="page submit">
		<header>
			<a class="back" href="/themes">Community themes</a>
			<h1>Submit a theme</h1>
		</header>

		{#if outcome && 'url' in outcome}
			<div class="done">
				<h2>Pull request opened</h2>
				<div class="row">
					<a class="btn btn-primary" href={outcome.url}>
						View on GitHub
						<Glyph name="arrow-right" />
					</a>
					<button class="btn btn-secondary" type="button" onclick={restart}>
						Submit another
					</button>
				</div>
			</div>
		{:else}
			<form class="layout" onsubmit={send}>
				<div class="fields">
					<fieldset>
						<legend>Theme files</legend>
						<label
							class="drop"
							class:dragging
							ondragover={(event) => {
								event.preventDefault();
								dragging = true;
							}}
							ondragleave={() => (dragging = false)}
							ondrop={(event) => {
								event.preventDefault();
								dragging = false;
								take(event.dataTransfer?.files);
							}}
						>
							<Glyph name="file-text" size={18} />
							<span>Drop <code>.json</code> files here or <u>choose them</u></span>
							<input
								type="file"
								accept=".json,application/json"
								multiple
								onchange={(event) => {
									take(event.currentTarget.files);
									event.currentTarget.value = '';
								}}
							/>
						</label>

						{#if added.length}
							<ul class="files">
								{#each added as file, index (file.stem)}
									<li>
										<code>
											{added.length === 1
												? `${id || 'theme'}.json`
												: `${id || 'theme'}/${file.stem}.json`}
										</code>
										<span class="source">{file.source}</span>
										<button
											type="button"
											class="remove"
											aria-label="Remove {file.source}"
											onclick={() => added.splice(index, 1)}
										>
											<Glyph name="circle-minus" size={14} />
										</button>
									</li>
								{/each}
							</ul>
						{/if}

						{#if pasting}
							<textarea
								bind:value={pasted}
								rows="10"
								spellcheck="false"
								placeholder={'{\n\t"name": "My theme",\n\t"author": "Your name",\n\t"version": 1,\n\t"theme": { … }\n}'}
							></textarea>
							<div class="row">
								<button
									class="btn btn-secondary small"
									type="button"
									disabled={!pasted.trim()}
									onclick={addPasted}>Add</button
								>
								<button
									class="btn btn-secondary small"
									type="button"
									onclick={() => (pasting = false)}>Cancel</button
								>
							</div>
						{:else if added.length < VARIANT_LIMIT}
							<button class="link" type="button" onclick={() => (pasting = true)}>
								Paste a file instead
							</button>
						{/if}
					</fieldset>

					<label class="field">
						<span class="name">Theme id</span>
						<input
							value={id}
							oninput={(event) => (typed = event.currentTarget.value)}
							placeholder="night-owl"
							spellcheck="false"
							autocomplete="off"
						/>
					</label>

					<label class="field">
						<span class="name">GitHub username <span class="optional">optional</span></span>
						<input
							bind:value={github}
							placeholder="octocat"
							spellcheck="false"
							autocomplete="off"
						/>
						<span class="optional"
							>Links the author names to your GitHub profile in the gallery.</span
						>
					</label>

					<fieldset class="checks">
						<label>
							<input type="checkbox" bind:checked={tested} />
							I installed the theme in Sonora and text stays readable on every screen I opened.
						</label>
						<label>
							<input type="checkbox" bind:checked={rights} />
							I made this theme, or I have the right to share it.
						</label>
					</fieldset>

					<div class="captcha" bind:this={widget}></div>
					{#if widgetBroken}
						<p class="problem">
							The spam check did not load. Allow challenges.cloudflare.com, or
							<a href={manual}>open the pull request on GitHub</a> instead.
						</p>
					{/if}

					{#if 'problem' in result && result.problem}
						<p class="problem">{result.problem}</p>
					{/if}
					{#if failure}
						<p class="problem">{failure}</p>
					{/if}

					<div class="row">
						<button class="btn btn-primary" type="submit" disabled={!ready}>
							{sending ? 'Opening…' : 'Open pull request'}
						</button>
					</div>
				</div>

				<aside class="preview-column">
					{#if 'variants' in result}
						<ThemeCard
							name={result.name}
							authors={[...new Set(result.variants.map((entry) => entry.author))]}
							{github}
							variants={result.variants}
						/>
					{:else}
						<div class="empty"></div>
					{/if}

					{#if outcome && 'dry' in outcome}
						<div class="dry">
							<p>Dry run, nothing was filed. Branch <code>{outcome.branch}</code>.</p>
							<h3>{outcome.title}</h3>
							{#each Object.entries(outcome.files) as [path, text] (path)}
								<details>
									<summary><code>{path}</code></summary>
									<pre>{text}</pre>
								</details>
							{/each}
							<details open>
								<summary>Description</summary>
								<pre>{outcome.body}</pre>
							</details>
						</div>
					{/if}
				</aside>
			</form>
		{/if}

		<p class="alternative">
			Prefer GitHub? <a href={manual}>Open the pull request yourself.</a>
		</p>
	</div>
</section>

<style>
	.submit {
		padding-top: 72px;
		padding-bottom: 96px;
	}

	header {
		max-width: 640px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 40px;
	}

	.back {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--muted-fg);
	}

	.back:hover {
		color: var(--fg);
	}

	h1 {
		font-size: 36px;
	}

	.alternative a,
	.problem a {
		color: var(--fg);
		text-decoration: underline;
		text-decoration-color: var(--faint);
		text-underline-offset: 3px;
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
		gap: 48px;
		align-items: start;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 560px;
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0;
		padding: 0;
		border: 0;
	}

	legend,
	.name {
		margin-bottom: 8px;
		padding: 0;
		font-size: 13px;
		font-weight: 600;
	}

	.optional {
		margin-left: 6px;
		font-weight: 400;
		color: var(--dim);
	}

	.drop {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-height: 96px;
		padding: 16px;
		border: 1px dashed var(--border);
		border-radius: var(--radius);
		font-size: 14px;
		color: var(--muted-fg);
		cursor: pointer;
		transition:
			background-color 0.18s ease,
			border-color 0.18s ease;
	}

	.drop:hover,
	.drop.dragging {
		border-color: var(--faint);
		background: var(--secondary);
	}

	.drop u {
		color: var(--fg);
		text-decoration-color: var(--faint);
		text-underline-offset: 3px;
	}

	.drop input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.files {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		list-style: none;
	}

	.files li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 8px 8px 12px;
		font-size: 13px;
	}

	.files li + li {
		border-top: 1px solid var(--line);
	}

	.files code {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.source {
		max-width: 40%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--dim);
	}

	.remove {
		display: flex;
		padding: 4px;
		border-radius: 6px;
		color: var(--muted-fg);
	}

	.remove:hover {
		background: var(--secondary);
		color: var(--fg);
	}

	.field {
		display: flex;
		flex-direction: column;
	}

	input:not([type]),
	textarea {
		width: 100%;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--fg);
		font: inherit;
		font-size: 14px;
	}

	input:not([type]) {
		height: 38px;
	}

	textarea {
		padding: 10px 12px;
		font-family: var(--mono);
		font-size: 13px;
		line-height: 1.5;
		resize: vertical;
		tab-size: 2;
	}

	input:not([type]):focus,
	textarea:focus {
		outline: none;
		border-color: var(--faint);
	}

	.checks label {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: 14px;
		line-height: 1.5;
		color: var(--muted-fg);
		cursor: pointer;
	}

	/* shadcn's checkbox: a hairline box that fills with the primary colour and shows lucide's check */
	.checks input {
		display: grid;
		flex: none;
		place-content: center;
		width: 16px;
		height: 16px;
		margin: 3px 0 0;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: transparent;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
		appearance: none;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.checks input::before {
		content: '';
		width: 14px;
		height: 14px;
		background: var(--primary-fg);
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E")
			center / contain no-repeat;
		opacity: 0;
	}

	.checks input:checked {
		border-color: var(--primary);
		background: var(--primary);
	}

	.checks input:checked::before {
		opacity: 1;
	}

	.checks input:focus-visible {
		outline: none;
		border-color: var(--faint);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--faint) 50%, transparent);
	}

	.captcha:empty {
		display: none;
	}

	.problem {
		font-size: 13px;
		line-height: 1.5;
		color: #f87171;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.btn.small {
		height: 32px;
		padding: 0 14px;
		font-size: 13px;
	}

	.link {
		align-self: flex-start;
		font-size: 13px;
		color: var(--muted-fg);
		text-decoration: underline;
		text-decoration-color: var(--faint);
		text-underline-offset: 3px;
	}

	.link:hover {
		color: var(--fg);
	}

	.preview-column {
		position: sticky;
		top: calc(var(--header) + 24px);
		display: flex;
		flex-direction: column;
	}

	.empty {
		aspect-ratio: 148 / 94;
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
	}

	.dry {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 20px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--muted-fg);
	}

	.dry h3 {
		font-size: 14px;
		color: var(--fg);
	}

	.dry summary {
		cursor: pointer;
	}

	.dry pre {
		max-height: 320px;
		margin-top: 8px;
		padding: 10px;
		overflow: auto;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		font-family: var(--mono);
		font-size: 12px;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.done {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 560px;
		padding: 24px;
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--card);
	}

	.done h2 {
		font-size: 18px;
	}

	.alternative {
		margin-top: 48px;
		font-size: 13px;
		color: var(--muted-fg);
	}

	@media (max-width: 900px) {
		.submit {
			padding-top: 48px;
			padding-bottom: 64px;
		}

		.layout {
			grid-template-columns: minmax(0, 1fr);
		}

		.preview-column {
			position: static;
			order: -1;
		}
	}
</style>
