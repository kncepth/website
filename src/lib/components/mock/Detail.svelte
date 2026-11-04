<script lang="ts">
	import { menu } from '$lib/mock/menu.svelte';
	import { albumMenu, artistMenu } from '$lib/mock/menus';
	import { album as first, albums, columns, records, runtime, shelf } from '$lib/mock/album';
	import { player } from '$lib/mock/player.svelte';
	import { route } from '$lib/mock/route.svelte';
	import { artists } from '$lib/mock/screens';
	import Card from './Card.svelte';
	import { library } from '$lib/mock/library.svelte';
	import Control from './Control.svelte';
	import HeroDownload from './HeroDownload.svelte';
	import PageHero from './PageHero.svelte';
	import Table from './Table.svelte';

	let { id = 'airs' }: { id?: string } = $props();

	const album = $derived(shelf.get(id) ?? first);
	const rows = $derived(records.get(id) ?? []);
	const total = $derived(rows.reduce((sum, track) => sum + track.length, 0));
	const mine = $derived(rows.some((track) => track.id === player.id));
	const holding = $derived(mine && player.playing);
	const meta = $derived([album.artist, album.released, `${rows.length} songs`, runtime(total)]);
	const notices = $derived(album.label ? [`℗ ${album.label}`] : []);

	const TILE = 146;
	const GAP = 16;
	const COLUMNS = 4;

	let kind = $state('Albums');
	let shift = $state(0);

	const alike = $derived(albums.filter((entry) => entry.id !== album.id));
	const kin = $derived(artists.filter((artist) => artist.name !== album.artist));
	const count = $derived(kind === 'Albums' ? alike.length : kin.length);
	const pages = $derived(Math.max(count - COLUMNS, 0));
</script>

<div class="screen">
	<div class="gutter">
		<PageHero title={album.title} eyebrow={album.eyebrow ?? 'Album'} cover={album.cover} {meta}>
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
								album.title,
								'Album'
							);
					}}
				/>
				<Control
					variant="outline"
					icon="shuffle"
					title="Shuffle"
					onclick={() => player.playShuffled()}
				/>
				<Control
					variant="outline"
					icon={library.saved(album.id) ? 'heart-filled' : 'heart'}
					title={library.saved(album.id) ? 'Remove from Favorites' : 'Add to Favorites'}
					tint={library.saved(album.id) ? 'primary' : ''}
					onclick={() => library.toggle(album.id)}
				/>
				<HeroDownload
					job={{
						key: `album-${album.id}`,
						subject: 'Album',
						name: album.title,
						cover: album.cover
					}}
					ids={rows.map((track) => track.id)}
				/>
				<Control
					icon="ellipsis"
					title="More"
					selected={menu.owner === `hero-${album.id}`}
					onclick={(event: MouseEvent) =>
						menu.from(event.currentTarget as Element, `hero-${album.id}`, () =>
							albumMenu(album.id)
						)}
				/>
			{/snippet}
		</PageHero>
	</div>

	<Table {columns} {rows} album={album.id} />

	{#if notices.length}
		<div class="notices">
			{#each notices as line (line)}
				<span>{line}</span>
			{/each}
		</div>
	{/if}

	<section class="rail">
		<div class="rail-head">
			<h2>You might also like</h2>
			{#if count > COLUMNS}
				<div class="steps">
					<Control
						icon="chevron-left"
						title="Previous"
						variant="outline"
						small
						disabled={shift === 0}
						onclick={() => (shift = Math.max(shift - COLUMNS, 0))}
					/>
					<Control
						icon="chevron-right"
						title="Next"
						variant="outline"
						small
						disabled={shift >= pages}
						onclick={() => (shift = Math.min(shift + COLUMNS, pages))}
					/>
				</div>
			{/if}
		</div>
		<div class="kinds">
			{#each ['Albums', 'Artists'] as name (name)}
				<Control
					label={name}
					title={name}
					variant="outline"
					small
					selected={kind === name}
					onclick={() => {
						kind = name;
						shift = 0;
					}}
				/>
			{/each}
		</div>
		<div class="cards">
			<div class="track" style:transform="translateX(-{shift * (TILE + GAP)}px)">
				{#if kind === 'Albums'}
					{#each alike as entry (entry.id)}
						<Card
							tile={TILE}
							flat
							weight={600}
							title={entry.title}
							meta={`${entry.released} · ${entry.artist}`}
							cover={entry.cover}
							onpress={() => route.go({ screen: 'album', id: entry.id })}
							oncontext={(event: MouseEvent) =>
								menu.at(event, `album-${entry.id}`, () => albumMenu(entry.id))}
						/>
					{/each}
				{:else}
					{#each kin as artist (artist.id)}
						<Card
							tile={TILE}
							flat
							circle
							weight={600}
							title={artist.name}
							meta="Artist"
							fallback="user-round"
							cover={artist.image}
							onpress={() => route.go({ screen: 'artist', id: artist.id })}
							oncontext={(event: MouseEvent) =>
								menu.at(event, `artist-${artist.id}`, () => artistMenu(artist.id))}
						/>
					{/each}
				{/if}
			</div>
		</div>
	</section>
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

	.rail {
		display: flex;
		flex: none;
		flex-direction: column;
		gap: 10.5px;
		padding: 35px 24px 0;
	}

	.rail-head {
		display: flex;
		height: 39px;
		align-items: flex-end;
		justify-content: space-between;
		gap: 14px;
	}

	.rail-head h2 {
		margin: 0;
		font-size: 24px;
		font-weight: 600;
		line-height: 1.25;
	}

	.steps,
	.kinds {
		display: flex;
		gap: 3.5px;
	}

	.cards {
		overflow: hidden;
	}

	.track {
		display: flex;
		gap: 16px;
		transition: transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1);
	}

	.notices {
		display: flex;
		flex: none;
		flex-direction: column;
		gap: 3.5px;
		min-width: 0;
		padding: 7px 16px 0;
		font-size: 11px;
		color: var(--m-muted-foreground);
	}
</style>
