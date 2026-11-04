<script lang="ts">
	import { clock } from '$lib/mock/album';
	import { historyColumns, played } from '$lib/mock/screens';
	import Control from '../Control.svelte';
	import PageHero from '../PageHero.svelte';
	import Table from '../Table.svelte';

	const total = played.reduce((sum, track) => sum + track.length, 0);
</script>

<div class="screen">
	<div class="gutter">
		<PageHero
			title="History"
			eyebrow="Playlist"
			fallback="rotate-ccw-clock"
			accent
			meta={[`${played.length} songs`, clock(total)]}
		>
			{#snippet actions()}
				<Control variant="outline" icon="trash-2" label="Clear history" />
			{/snippet}
		</PageHero>
	</div>
	<Table columns={historyColumns} rows={played} history />
</div>

<style>
	.screen {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		padding: 24px 0;
		background: var(--m-background);
		overflow-x: hidden;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--m-muted-foreground) 45%, transparent) transparent;
	}

	.gutter {
		padding: 0 24px;
		flex: none;
	}
</style>
