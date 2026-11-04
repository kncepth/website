<script module lang="ts">
	let recent = $state(['Debussy', 'nocturne', 'Four Seasons', 'Gymnopédie']);
</script>

<script lang="ts">
	import type { Hit } from '$lib/mock/screens';
	import { albums, catalogue, shelf } from '$lib/mock/album';
	import { artists, genres, playlists } from '$lib/mock/screens';
	import { player } from '$lib/mock/player.svelte';
	import { route } from '$lib/mock/route.svelte';
	import Card from '../Card.svelte';
	import HitRow from '../HitRow.svelte';
	import Icon from './../Icon.svelte';

	const LANES = 2;
	const WIDE = 740;

	const COLUMNS = [
		{ title: 'Songs', kinds: ['Song'] },
		{ title: 'Artists', kinds: ['Artist'] },
		{ title: 'Albums & playlists', kinds: ['Album', 'Playlist'] }
	];

	let { room = 729 }: { room?: number } = $props();

	const PAST = 8;
	const SUGGESTED = 6;

	let query = $state('');
	let typed = $state('');
	let focused = $state(false);
	let dismissed = $state(false);
	let pick = $state(-1);

	const wide = $derived(room >= WIDE);

	const asked = $derived(query.trim().length > 0);

	function find(text: string): Hit[] {
		const needle = text.trim().toLowerCase();
		if (!needle) return [];
		const holds = (value: string) => value.toLowerCase().includes(needle);
		const songs: Hit[] = [...catalogue.values()]
			.filter((track) => holds(track.title))
			.map((track) => ({
				kind: 'Song',
				id: `song-${track.id}`,
				title: track.title,
				meta: shelf.get(track.album)?.artist ?? track.artist,
				cover: track.cover,
				fallback: 'music',
				circle: false,
				track
			}));
		const people: Hit[] = artists
			.filter((artist) => holds(artist.name))
			.map((artist) => ({
				kind: 'Artist',
				id: `artist-${artist.id}`,
				title: artist.name,
				meta: `${artist.listeners} monthly listeners`,
				cover: artist.image,
				fallback: 'user-round',
				circle: true,
				to: { screen: 'artist', id: artist.id }
			}));
		const records: Hit[] = albums
			.filter((entry) => holds(entry.title))
			.map((entry) => ({
				kind: 'Album',
				id: `album-${entry.id}`,
				title: entry.title,
				meta: entry.artist,
				cover: entry.cover,
				fallback: 'music',
				circle: false,
				to: { screen: 'album', id: entry.id }
			}));
		const lists: Hit[] = playlists
			.filter((list) => holds(list.name))
			.map((list) => ({
				kind: 'Playlist',
				id: `playlist-${list.id}`,
				title: list.name,
				meta: list.owner,
				cover: '',
				fallback: 'list-music',
				circle: false,
				to: { screen: 'playlist', id: list.id }
			}));
		const score = (hit: Hit) => {
			const title = hit.title.toLowerCase();
			if (title.startsWith(needle)) return 0;
			if (title.split(/[\s,.(]+/).some((word) => word.startsWith(needle))) return 1;
			return 2;
		};
		return [...songs, ...people, ...records, ...lists].sort(
			(one, other) => score(one) - score(other)
		);
	}

	const hits = $derived(find(query));
	const best = $derived(hits[0]);
	const rest = $derived(hits.slice(1));

	/** What the panel under the field offers: past searches while it is empty, else the best hits. */
	const offers = $derived.by(() => {
		if (!typed.trim()) return recent.slice(0, PAST).map((past) => ({ past, hit: undefined }));
		return find(typed)
			.slice(0, SUGGESTED)
			.map((hit) => ({ past: '', hit }));
	});
	const panel = $derived(focused && !dismissed && offers.length > 0);

	$effect(() => {
		void typed;
		pick = -1;
	});

	function remember(text: string) {
		const clean = text.trim();
		if (!clean) return;
		recent = [clean, ...recent.filter((past) => past.toLowerCase() !== clean.toLowerCase())];
	}

	function run(text: string) {
		const clean = text.trim();
		if (!clean) return;
		remember(clean);
		typed = clean;
		query = clean;
		dismissed = true;
	}

	function take(offer: { past: string; hit?: Hit }) {
		if (offer.hit) {
			remember(typed);
			dismissed = true;
			open(offer.hit);
			return;
		}
		run(offer.past);
	}

	function key(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (!panel) dismissed = false;
			else pick = Math.min(pick + 1, offers.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			pick = Math.max(pick - 1, -1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (panel && pick >= 0) take(offers[pick]);
			else run(typed);
		} else if (event.key === 'Escape') {
			event.stopPropagation();
			if (panel) dismissed = true;
			else (event.currentTarget as HTMLInputElement).blur();
		}
	}

	function open(hit: Hit) {
		if (hit.track) player.select(hit.track.id);
		else if (hit.to) route.go(hit.to);
	}

	const plates = (lane: number) => genres.filter((_, at) => at % LANES === lane);
</script>

{#snippet spotlight()}
	<div class="best">
		<span class="eyebrow pad">Best match</span>
		<Card
			filled
			flat
			art={63}
			size={24}
			weight={700}
			circle={best.circle}
			eyebrow={best.kind}
			title={best.title}
			meta={best.meta}
			cover={best.cover}
			fallback={best.fallback}
			onpress={() => open(best)}
		/>
	</div>
{/snippet}

<div class="screen">
	<div class="gutter">
		<div class="line">
			<div class="drop">
				<div class="field" class:open={panel}>
					<Icon name="search" />
					<input
						type="text"
						bind:value={typed}
						placeholder="What do you want to listen to?"
						aria-label="Search"
						role="combobox"
						aria-controls="search-offers"
						aria-expanded={panel}
						aria-autocomplete="list"
						onfocus={() => {
							focused = true;
							dismissed = false;
						}}
						onblur={() => (focused = false)}
						oninput={() => (dismissed = false)}
						onkeydown={key}
					/>
					{#if typed}
						<button
							type="button"
							class="clear"
							aria-label="Clear"
							onmousedown={(event) => event.preventDefault()}
							onclick={() => {
								typed = '';
								query = '';
								dismissed = false;
							}}
						>
							<Icon name="x" size={14} />
						</button>
					{/if}
				</div>
				{#if panel}
					<div
						class="offers"
						id="search-offers"
						role="listbox"
						aria-label={typed.trim() ? 'Results' : 'Recent searches'}
						tabindex="-1"
						onmousedown={(event) => event.preventDefault()}
					>
						{#each offers as offer, at (offer.hit?.id ?? `past-${offer.past}`)}
							<div
								class="offer"
								class:chosen={at === pick}
								role="option"
								tabindex="-1"
								aria-selected={at === pick}
								onmouseenter={() => (pick = at)}
								onclick={() => take(offer)}
								onkeydown={() => {}}
							>
								{#if offer.hit}
									<span class="thumb" class:round={offer.hit.circle}>
										{#if offer.hit.cover}
											<img src={offer.hit.cover} alt="" />
										{:else}
											<Icon name={offer.hit.fallback} size={14} />
										{/if}
									</span>
									<span class="words">
										<span class="title">{offer.hit.title}</span>
										<span class="tag">{offer.hit.kind} · {offer.hit.meta}</span>
									</span>
								{:else}
									<span class="thumb plain"><Icon name="rotate-ccw-clock" size={14} /></span>
									<span class="words"><span class="title">{offer.past}</span></span>
									<button
										type="button"
										class="forget"
										title="Remove from history"
										aria-label="Remove from history"
										onclick={(event) => {
											event.stopPropagation();
											recent = recent.filter((past) => past !== offer.past);
										}}><Icon name="x" size={14} /></button
									>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
			<button
				type="button"
				class="submit"
				disabled={!typed.trim()}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => run(typed)}
			>
				<Icon name="search" />
				<span>Search</span>
			</button>
		</div>
	</div>

	{#if !asked}
		<div class="browse">
			<span class="gutter eyebrow">Browse all</span>
			<div class="scroll">
				<div class="lanes">
					{#each { length: LANES } as _, lane (lane)}
						<div class="lane">
							{#each plates(lane) as genre (genre.id)}
								<Card
									title={genre.name}
									cover={genre.cover}
									weight={600}
									surface
									onpress={() => run(genre.name)}
								/>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else if wide}
		{#if best}
			<div class="gutter">{@render spotlight()}</div>
		{/if}
		<div class="columns">
			{#each COLUMNS as column, at (column.title)}
				{#if at > 0}
					<span class="split"></span>
				{/if}
				<div class="shell">
					<span class="head"><span class="eyebrow pad">{column.title}</span></span>
					<div class="scroll rail">
						<div class="rows">
							{#each rest.filter((hit) => column.kinds.includes(hit.kind)) as hit (hit.id)}
								<HitRow {hit} compact={column.kinds.length > 1} onopen={open} />
							{/each}
							{#if !rest.some((hit) => column.kinds.includes(hit.kind))}
								<span class="vacant">No matches</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="scroll results">
			{#if best}
				<div class="prelude">
					{@render spotlight()}
					<span class="eyebrow pad">Results</span>
				</div>
			{/if}
			<div class="rows">
				{#each rest as hit (hit.id)}
					<HitRow {hit} compact onopen={open} />
				{/each}
				{#if !hits.length}
					<span class="vacant">No matches</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.screen {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 21px;
		padding-top: 24px;
		overflow: hidden;
		background: var(--m-background);
	}

	.gutter {
		padding: 0 24px;
	}

	.line {
		display: flex;
		align-items: center;
		gap: 7px;
	}

	.drop {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	.submit {
		display: inline-flex;
		flex: none;
		align-items: center;
		gap: 6px;
		height: 40px;
		padding: 0 14px;
		border: 0;
		border-radius: var(--m-radius);
		background: var(--m-primary);
		color: var(--m-primary-foreground);
		font: inherit;
		cursor: pointer;
	}

	.submit:hover:not(:disabled) {
		background: var(--m-primary-hover);
	}

	.submit:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.offers {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 6;
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: 3.5px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: var(--m-popover);
		color: var(--m-popover-foreground);
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		animation: rise 250ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: scale(0.99);
			filter: blur(1.5px);
		}
	}

	.offer {
		display: flex;
		align-items: center;
		gap: 10.5px;
		height: 44px;
		padding: 0 7px;
		border-radius: max(calc(var(--m-radius) - 3.5px), 0px);
		cursor: pointer;
	}

	.offer.chosen {
		background: var(--m-secondary-hover);
	}

	.thumb {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		overflow: hidden;
		border-radius: min(var(--m-radius), 4px);
		background: var(--m-secondary);
		color: var(--m-muted-foreground);
	}

	.thumb.round {
		border-radius: 50%;
	}

	.thumb.plain {
		background: none;
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.words {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		line-height: 1.3;
	}

	.title,
	.tag {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tag {
		font-size: 12px;
		color: var(--m-muted-foreground);
	}

	.forget {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border: 0;
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-muted-foreground);
		cursor: pointer;
	}

	.forget:hover {
		background: var(--m-secondary-active);
		color: var(--m-foreground);
	}

	.field {
		display: flex;
		align-items: center;
		gap: 7px;
		height: 40px;
		padding: 0 10.5px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: var(--m-secondary);
		color: var(--m-muted-foreground);
	}

	.field input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		color: var(--m-foreground);
		font: inherit;
		outline: none;
	}

	.field input::placeholder {
		color: var(--m-muted-foreground);
	}

	.clear {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 26px;
		border: 0;
		border-radius: var(--m-radius);
		background: none;
		color: inherit;
		cursor: pointer;
	}

	.browse {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		gap: 10.5px;
	}

	.eyebrow {
		flex: none;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--m-muted-foreground);
	}

	.eyebrow.pad {
		padding-bottom: 3.5px;
	}

	.scroll {
		flex: 1;
		min-height: 0;
		margin-top: -12px;
		padding: 12px 24px 24px;
		mask-image: linear-gradient(to bottom, transparent 0, #000 12px);

		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--m-muted-foreground) 45%, transparent) transparent;
	}

	.lanes {
		display: flex;
		gap: 7px;
		flex: none;
	}

	.lane {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 8px;
	}

	.columns {
		display: flex;
		width: 100%;
		flex: 1;
		min-height: 0;
		padding: 0 24px;
	}

	.split {
		flex: none;
		width: 1px;
		background: var(--m-border);
	}

	.shell {
		display: flex;
		flex: 1;
		min-width: 0;
		min-height: 0;
		flex-direction: column;
		gap: 3.5px;
	}

	.head {
		display: flex;
		flex: none;
		padding-left: 12px;
	}

	.scroll.rail {
		padding: 12px 12px 24px;
	}

	.results {
		display: flex;
		flex-direction: column;
		gap: 3.5px;
	}

	.prelude {
		display: flex;
		flex-direction: column;
		gap: 21px;
		flex: none;
	}

	.best {
		display: flex;
		flex: none;
		flex-direction: column;
		gap: 7px;
	}

	.rows {
		display: flex;
		flex-direction: column;
		gap: 3.5px;
		flex: none;
	}

	.vacant {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		padding: 16px;
		color: var(--m-muted-foreground);
	}
</style>
