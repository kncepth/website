<script lang="ts">
	import { menu } from '$lib/mock/menu.svelte';
	import { albumMenu, artistMenu } from '$lib/mock/menus';
	import { ABOUT_FALLBACK, albumsOf, artistColumns, artists, popularOf } from '$lib/mock/screens';
	import { albums } from '$lib/mock/album';
	import { player } from '$lib/mock/player.svelte';
	import { route } from '$lib/mock/route.svelte';
	import About from '../About.svelte';
	import Card from '../Card.svelte';
	import { library } from '$lib/mock/library.svelte';
	import Control from '../Control.svelte';
	import Modal from '../Modal.svelte';
	import PageHero from '../PageHero.svelte';
	import Table from '../Table.svelte';

	const CARD = 145;
	const GAP = 33;
	const COLUMNS = 4;
	const RELEASE_ROWS = 2;
	const LISTED = 5;
	const LISTED_MAX = 10;
	const RAIL_GAP = 16;

	const FILTERS = [
		{ id: 'All', kinds: [] },
		{ id: 'Singles', kinds: ['Single'] },
		{ id: 'Albums', kinds: ['Album'] },
		{ id: 'EPs', kinds: ['Ep'] }
	];

	let { id = 'chopin' }: { id?: string } = $props();

	const DIALOG = 630;

	let expanded = $state(false);
	let spread = $state(false);
	let filter = $state('All');
	let telling = $state(false);

	const artist = $derived(artists.find((one) => one.id === id) ?? artists[0]);
	const popular = $derived(popularOf(artist.id));
	const releases = $derived(albumsOf(artist.id));
	const mine = $derived(popular.some((track) => track.id === player.id));
	const holding = $derived(mine && player.playing);

	const listed = $derived(popular.slice(0, expanded ? LISTED_MAX : LISTED));

	const filters = $derived(
		FILTERS.filter(
			(one) => !one.kinds.length || releases.some((entry) => one.kinds.includes(entry.release))
		).map((one) => one.id)
	);

	const matching = $derived(
		filter === 'All'
			? releases
			: releases.filter((entry) =>
					(FILTERS.find((one) => one.id === filter)?.kinds ?? []).includes(entry.release)
				)
	);

	const shown = $derived(spread ? matching : matching.slice(0, COLUMNS * RELEASE_ROWS));

	function narrow(next: string) {
		if (filter === next) return;
		filter = next;
		spread = false;
	}

	$effect(() => {
		void artist;
		expanded = false;
		spread = false;
		filter = 'All';
		telling = false;
	});

	let slide = $state(0);

	const appears = $derived(albums.filter((entry) => entry.artist !== artist.name).slice(0, 6));
	const reachable = $derived(Math.max(appears.length - COLUMNS, 0));
</script>

<div class="frame">
	<div class="screen" class:washed={!!artist.image}>
		{#if artist.image}
			<div class="banner" aria-hidden="true">
				{#key artist.id}
					<img src={artist.image} alt="" />
				{/key}
			</div>
		{/if}
		<PageHero
			title={artist.name}
			eyebrow="Artist"
			cover={artist.image}
			fallback="user-round"
			circle
			meta={[`${artist.listeners} monthly listeners`]}
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
						else if (popular.length) player.select(popular[0].id);
					}}
				/>
				<Control variant="outline" icon="shuffle" title="Shuffle" />
				<Control
					variant="outline"
					icon={library.saved(artist.id) ? 'heart-filled' : 'heart'}
					title={library.saved(artist.id) ? 'Remove from Favorites' : 'Add to Favorites'}
					tint={library.saved(artist.id) ? 'primary' : ''}
					onclick={() => library.toggle(artist.id)}
				/>
				<Control
					icon="ellipsis"
					title="More"
					selected={menu.owner === `hero-${artist.id}`}
					onclick={(event: MouseEvent) =>
						menu.from(event.currentTarget as Element, `hero-${artist.id}`, () =>
							artistMenu(artist.id, { here: true })
						)}
				/>
			{/snippet}
		</PageHero>

		<h2>Popular</h2>
		<div class="listed">
			<Table framed columns={artistColumns} rows={listed} />
			{#if popular.length > LISTED}
				<span class="toggle">
					<Control
						small
						label={expanded ? 'Show less' : 'Show all'}
						trailing={expanded ? 'chevron-up' : 'chevron-down'}
						onclick={() => (expanded = !expanded)}
					/>
				</span>
			{/if}
		</div>

		{#if releases.length}
			<section class="releases">
				<h2 class="flush">Releases</h2>
				{#if filters.length}
					<div class="filters">
						{#each filters as one (one)}
							<Control
								small
								variant="outline"
								label={one}
								selected={filter === one}
								onclick={() => narrow(one)}
							/>
						{/each}
					</div>
				{/if}
				<div class="grid" style:gap="21px {GAP}px">
					{#each shown as entry (entry.id)}
						<Card
							tile={CARD}
							flat
							weight={600}
							title={entry.title}
							meta="{entry.released} · {entry.artist}"
							cover={entry.cover}
							onpress={() => route.go({ screen: 'album', id: entry.id })}
							oncontext={(event: MouseEvent) =>
								menu.at(event, `album-${entry.id}`, () => albumMenu(entry.id))}
						/>
					{/each}
				</div>
				{#if matching.length > COLUMNS * RELEASE_ROWS}
					<span class="toggle">
						<Control
							small
							label={spread ? 'Show less' : 'Show all'}
							trailing={spread ? 'chevron-up' : 'chevron-down'}
							onclick={() => (spread = !spread)}
						/>
					</span>
				{/if}
			</section>
		{/if}

		{#if appears.length}
			<section class="rail">
				<div class="rail-head">
					<h2 class="flush">Appears on</h2>
					{#if appears.length > COLUMNS}
						<div class="steps">
							<Control
								icon="chevron-left"
								title="Previous"
								variant="outline"
								small
								disabled={slide === 0}
								onclick={() => (slide = Math.max(slide - COLUMNS, 0))}
							/>
							<Control
								icon="chevron-right"
								title="Next"
								variant="outline"
								small
								disabled={slide >= reachable}
								onclick={() => (slide = Math.min(slide + COLUMNS, reachable))}
							/>
						</div>
					{/if}
				</div>
				<div class="lane">
					<div class="run" style:transform="translateX(-{slide * (CARD + RAIL_GAP)}px)">
						{#each appears as entry (entry.id)}
							<Card
								tile={CARD}
								flat
								weight={600}
								title={entry.title}
								meta="{entry.released} · {entry.artist}"
								cover={entry.cover}
								onpress={() => route.go({ screen: 'album', id: entry.id })}
								oncontext={(event: MouseEvent) =>
									menu.at(event, `album-${entry.id}`, () => albumMenu(entry.id))}
							/>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<div class="about">
			<About
				name={artist.name}
				cover={artist.image}
				biography={artist.biography}
				onpress={() => (telling = true)}
			/>
		</div>
	</div>

	{#if telling}
		<Modal
			title="About the artist"
			detail={artist.name}
			width={DIALOG}
			ondismiss={() => (telling = false)}
		>
			{#snippet body()}
				{artist.biography || ABOUT_FALLBACK}
			{/snippet}
			{#snippet actions()}
				<Control variant="filled" label="Dismiss" onclick={() => (telling = false)} />
			{/snippet}
		</Modal>
	{/if}
</div>

<style>
	.frame {
		position: relative;
		display: flex;
		flex: 1;
		min-width: 0;
	}

	.screen {
		position: relative;
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		padding: 24px;
		background: var(--m-background);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--m-muted-foreground) 45%, transparent) transparent;
	}

	/* an artist without a banner gets a wash of their portrait's colours above and behind the hero */
	.washed {
		padding-top: calc(24px + 84px);
	}

	.banner {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: calc(24px + 84px + 140px);
		overflow: hidden;
		pointer-events: none;
		mask-image: linear-gradient(to bottom, #000 43.5%, transparent 100%);
	}

	.banner img {
		position: absolute;
		inset: -96px;
		width: calc(100% + 192px);
		height: calc(100% + 192px);
		object-fit: cover;
		filter: blur(48px) saturate(1.2);
		animation: wash 600ms ease;
	}

	.banner::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				to bottom,
				transparent 21.75%,
				color-mix(in srgb, var(--m-background) 85%, transparent) 100%
			),
			color-mix(in srgb, var(--m-background) 30%, transparent);
	}

	@keyframes wash {
		from {
			opacity: 0;
		}
	}

	.banner + :global(.hero) {
		position: relative;
	}

	h2 {
		margin: 0;
		padding-bottom: 10.5px;
		font-size: 24px;
		font-weight: 700;
		letter-spacing: normal;
		text-align: left;
	}

	h2.flush {
		padding-bottom: 0;
	}

	.listed {
		display: flex;
		flex: none;
		flex-direction: column;
		align-items: flex-start;
		gap: 7px;
	}

	.releases {
		display: flex;
		flex: none;
		flex-direction: column;
		align-items: flex-start;
		gap: 10.5px;
		padding-top: 21px;
	}

	.filters {
		display: flex;
		flex: none;
		gap: 3.5px;
	}

	.toggle {
		display: flex;
		flex: none;
	}

	.grid {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		flex: none;
	}
	.about {
		display: flex;
		flex: none;
		padding-top: 21px;
	}

	.rail {
		display: flex;
		flex-direction: column;
		gap: 10.5px;
	}

	.rail-head {
		display: flex;
		height: 39px;
		align-items: flex-end;
		justify-content: space-between;
		gap: 14px;
	}

	.steps {
		display: flex;
		gap: 3.5px;
	}

	.lane {
		overflow: hidden;
	}

	.run {
		display: flex;
		gap: 16px;
		transition: transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1);
	}
</style>
