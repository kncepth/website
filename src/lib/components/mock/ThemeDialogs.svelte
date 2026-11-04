<script lang="ts">
	import { community, installed } from '$lib/mock/installed.svelte';
	import ThemeMiniature from '../ThemeMiniature.svelte';
	import Control from './Control.svelte';
	import Modal from './Modal.svelte';

	/** As many variants as the desktop slices a miniature into. */
	const SLICES = 4;

	let query = $state('');

	const listed = $derived(
		community.filter((theme) =>
			`${theme.name} ${theme.authors.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())
		)
	);

	const slice = (at: number, count: number) =>
		`inset(0 ${100 - ((at + 1) / count) * 100}% 0 ${(at / count) * 100}%)`;
</script>

{#snippet sliced(colors: Record<string, string>[])}
	{@const shown = colors.slice(0, SLICES)}
	<span class="sliced">
		{#each shown as palette, at (at)}
			<span class="slice" style:clip-path={slice(at, shown.length)}>
				<ThemeMiniature colors={palette} />
			</span>
		{/each}
	</span>
{/snippet}

{#if installed.browsing && !installed.offer}
	<Modal
		title="Community themes"
		detail="Themes people share on sonorahq.org/themes"
		width={640}
		ondismiss={() => installed.browse(false)}
	>
		{#snippet body()}
			<input class="search" placeholder="Search themes or authors" bind:value={query} />
			<div class="gallery">
				{#each listed as theme (theme.id)}
					{@const has = installed.has(theme.id)}
					<div class="item">
						<span class="thumb">{@render sliced(theme.variants.map((one) => one.colors))}</span>
						<span class="name">{theme.name}</span>
						<span class="by">by {theme.authors.join(' and ')}</span>
						<Control
							variant={has ? 'outline' : 'filled'}
							label={has ? 'Installed' : 'Install'}
							title={has ? 'Installed' : `Install ${theme.name}`}
							small
							disabled={has}
							onclick={() => installed.ask(theme)}
						/>
					</div>
				{/each}
				{#if !listed.length}<p class="none">Nothing here</p>{/if}
			</div>
		{/snippet}
		{#snippet actions()}
			<Control label="Close" title="Close" onclick={() => installed.browse(false)} />
		{/snippet}
	</Modal>
{/if}

{#if installed.offer}
	{@const theme = installed.offer}
	<Modal
		title="Install {theme.name}?"
		detail="This will add it to your themes folder."
		width={334}
		ondismiss={() => installed.ask(null)}
	>
		{#snippet body()}
			<div class="offer">
				<span class="big">{@render sliced(theme.variants.map((one) => one.colors))}</span>
				{#if theme.variants.length > 1}
					<span class="variants">{theme.variants.map((one) => one.name).join(', ')}</span>
				{/if}
			</div>
		{/snippet}
		{#snippet actions()}
			<Control label="Cancel" title="Cancel" onclick={() => installed.ask(null)} />
			<Control
				variant="filled"
				label="Install"
				title="Install"
				onclick={() => installed.install()}
			/>
		{/snippet}
	</Modal>
{/if}

{#if installed.doomed}
	{@const family = installed.doomed}
	<Modal
		title="Delete {family.label}?"
		detail="This removes it from your themes folder. It cannot be undone."
		ondismiss={() => installed.confirmDelete(null)}
	>
		{#snippet actions()}
			<Control label="Cancel" title="Cancel" onclick={() => installed.confirmDelete(null)} />
			<Control
				variant="destructive"
				label="Delete"
				title="Delete theme"
				onclick={() => installed.remove()}
			/>
		{/snippet}
	</Modal>
{/if}

<style>
	.search {
		flex: none;
		height: 34px;
		padding: 0 10px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: var(--m-secondary);
		color: var(--m-foreground);
		font: inherit;
		font-size: 13px;
		outline: none;
	}

	.gallery {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
		padding: 4px 0 8px;
	}

	.item {
		display: flex;
		min-width: 0;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		padding: 8px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
	}

	.thumb {
		display: block;
		width: 100%;
		aspect-ratio: 150 / 96;
		margin-bottom: 4px;
		overflow: hidden;
		border-radius: max(calc(var(--m-radius) - 2px), 0px);
	}

	.sliced {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
	}

	.slice {
		position: absolute;
		inset: 0;
		display: flex;
	}

	.slice :global(svg) {
		width: 100%;
		height: 100%;
	}

	.name {
		max-width: 100%;
		overflow: hidden;
		color: var(--m-foreground);
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.by {
		max-width: 100%;
		margin-bottom: 4px;
		overflow: hidden;
		font-size: 12px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.none {
		grid-column: 1 / -1;
		margin: 0;
		padding: 16px;
		text-align: center;
	}

	.offer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.big {
		display: block;
		width: 300px;
		height: 192px;
		overflow: hidden;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
	}

	.variants {
		font-size: 12px;
	}
</style>
