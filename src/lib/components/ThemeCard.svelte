<script lang="ts">
	import type { ThemeVariant } from '$lib/data/themes';
	import { githubProfile } from '$lib/theme-submitter';
	import type { Snippet } from 'svelte';
	import ThemeMiniature from './ThemeMiniature.svelte';

	/**
	 * A community theme's card as the gallery shows it: the miniature, the name with a dot per
	 * variant that previews it on hover, and the authors. `meta` sits at the end of the byline and
	 * `actions` along the bottom.
	 */
	let {
		name,
		authors,
		github,
		variants,
		tag = 'div',
		meta,
		actions
	}: {
		name: string;
		authors: string[];
		github?: string;
		variants: ThemeVariant[];
		tag?: string;
		meta?: Snippet;
		actions?: Snippet;
	} = $props();

	/** The variant whose dot the pointer is on. */
	let previewed: string | null = $state(null);

	const shown = $derived(variants.find((variant) => variant.id === previewed) ?? variants[0]);
	const profile = $derived(githubProfile(github));
	const credit = $derived(
		authors.length < 2
			? authors.join('')
			: `${authors.slice(0, -1).join(', ')} and ${authors.at(-1)}`
	);
</script>

<svelte:element this={tag} class="card">
	<div class="preview">
		<ThemeMiniature colors={shown.colors} />
	</div>
	<div class="body">
		<div class="names">
			<div class="title">
				<h2>{name}</h2>
				{#if variants.length > 1}
					<ul class="variants" aria-label="Variants" onpointerleave={() => (previewed = null)}>
						{#each variants as variant (variant.id)}
							<li aria-label={variant.name} onpointerenter={() => (previewed = variant.id)}>
								<span
									class="swatch"
									style:--page={variant.colors.background}
									style:--accent={variant.colors.primary}
								></span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			<div class="byline">
				<span class="author">
					by {#if profile}<a href={profile}>{credit}</a>{:else}{credit}{/if}
				</span>
				{@render meta?.()}
			</div>
		</div>
		{#if actions}
			<div class="actions">
				{@render actions()}
			</div>
		{/if}
	</div>
</svelte:element>

<style>
	.card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--card);
		overflow: hidden;
	}

	.preview {
		padding: 16px;
		border-bottom: 1px solid var(--line);
	}

	.preview :global(svg) {
		border-radius: var(--radius);
		overflow: hidden;
	}

	.body {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 14px;
		padding: 14px 16px 16px;
	}

	.names {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}

	h2 {
		flex: 1;
		min-width: 0;
		font-size: 15px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.byline {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}

	.author {
		flex: 1;
		min-width: 0;
		font-size: 13px;
		color: var(--muted-fg);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.author a:hover,
	.author a:focus-visible {
		color: var(--fg);
		text-decoration: underline;
	}

	/* The dots' padding keeps the pointer from falling between them. */
	.variants {
		display: flex;
		flex: none;
		margin: 0 -2px;
		padding: 0;
		list-style: none;
	}

	.variants li {
		display: flex;
		padding: 2px;
	}

	/* the page colour at the top left and the accent at the bottom right, like the app's menu */
	.swatch {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--page) 50%, var(--accent) 50%);
		box-shadow: inset 0 0 0 1px rgb(127 127 127 / 0.3);
		transition: transform 0.12s ease;
	}

	.variants li:hover .swatch {
		transform: scale(1.2);
	}

	.actions {
		display: flex;
		margin-top: auto;
		gap: 8px;
	}

	.actions :global(.btn) {
		flex: 1;
		height: 34px;
		padding: 0 14px;
		font-size: 13px;
	}
</style>
