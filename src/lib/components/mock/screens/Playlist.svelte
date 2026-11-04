<script lang="ts">
	import { catalogue } from '$lib/mock/album';
	import { library } from '$lib/mock/library.svelte';
	import { clock } from '$lib/mock/album';
	import { libraryColumns, playlists } from '$lib/mock/screens';
	import { player } from '$lib/mock/player.svelte';
	import { menu } from '$lib/mock/menu.svelte';
	import { playlistMenu } from '$lib/mock/menus';
	import Control from '../Control.svelte';
	import HeroDownload from '../HeroDownload.svelte';
	import PageHero from '../PageHero.svelte';
	import Table from '../Table.svelte';

	let { id = 'quiet-hours' }: { id?: string } = $props();

	const list = $derived(playlists.find((one) => one.id === id) ?? playlists[0]);
	const rows = $derived([
		...list.tracks.filter((track) => library.holds(list.id, track.id)),
		...library
			.added(list.id)
			.filter((id) => !list.tracks.some((track) => track.id === id))
			.map((id) => catalogue.get(id))
			.filter((track) => track !== undefined)
			.map((track) => ({ ...track, added: 'Today' }))
	]);
	const total = $derived(rows.reduce((sum, track) => sum + track.length, 0));
	const mine = $derived(rows.some((track) => track.id === player.id));
	const holding = $derived(mine && player.playing);
</script>

<div class="screen">
	<div class="gutter">
		<PageHero
			title={list.name}
			eyebrow="Playlist"
			cover={list.cover}
			fallback="list-music"
			accent
			meta={[list.owner, `${rows.length} songs`, clock(total)]}
		>
			{#snippet actions()}
				<Control
					variant="filled"
					icon={holding ? 'pause' : 'play'}
					label={holding ? 'Pause' : 'Play'}
					wide
					onclick={() => {
						if (holding) player.pause();
						else if (mine) player.resume();
						else
							player.play(
								rows.map((track) => track.id),
								list.name,
								'Playlist'
							);
					}}
				/>
				<Control
					variant="outline"
					icon="shuffle"
					title="Shuffle"
					onclick={() => player.playShuffled()}
				/>
				<HeroDownload
					job={{
						key: `playlist-${list.id}`,
						subject: 'Playlist',
						name: list.name,
						cover: list.cover
					}}
					ids={rows.map((track) => track.id)}
				/>
				<Control
					icon="ellipsis"
					title="More"
					selected={menu.owner === `hero-${list.id}`}
					onclick={(event: MouseEvent) =>
						menu.from(event.currentTarget as Element, `hero-${list.id}`, () =>
							playlistMenu(list.id)
						)}
				/>
			{/snippet}
		</PageHero>
	</div>
	<Table columns={libraryColumns} {rows} playlist={list.id} />
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
