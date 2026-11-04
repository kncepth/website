<script lang="ts">
	import { menu } from '$lib/mock/menu.svelte';
	import { trackMenu } from '$lib/mock/menus';
	import { untrack } from 'svelte';
	import { catalogue } from '$lib/mock/album';
	import { lyricsFor } from '$lib/mock/lyrics';
	import { player } from '$lib/mock/player.svelte';
	import { settings } from '$lib/mock/settings.svelte';
	import Card from './Card.svelte';
	import Control from './Control.svelte';
	import Icon from './Icon.svelte';

	let { tab, stripped = false }: { tab: string; stripped?: boolean } = $props();

	const look = (ids: string[]) =>
		ids.map((id) => catalogue.get(id)).filter((track) => track !== undefined);

	const ROOM = 6;
	const PAST = 2;

	const played = $derived(look(player.past).slice(-PAST));
	const upcoming = $derived(look(player.queued).slice(0, ROOM));
	const suggested = $derived(look(player.suggested).slice(0, ROOM));

	const PIN = 0.3;
	const EDGE_FADE = 11.4;
	const SWEEP_STRETCH = 1.4;
	const SWEEP_LEAST = 0.18;
	const SWEPT = 0.98;
	const BLUR = 0.13;
	const HAZE = 0.45;
	const VEIL = 0.3;
	const HAZE_LEAST = 0.05;

	const VERSE = $derived(stripped ? 27 : 19);

	const song = $derived(lyricsFor(player.id));
	const verses = $derived(song.lines);

	const sung = (line: { words?: unknown[] }) => settings.karaoke && !!line.words;
	const at = $derived(player.elapsed);
	const active = $derived(
		verses.reduce((found, line, index) => (at >= line.start ? index : found), -1)
	);

	let roll = $state<HTMLElement | null>(null);
	/** The lyrics' width, which a resized panel changes, so the lines rewrap and the pin moves. */
	let span = $state(0);
	let sheet = $state<HTMLElement | null>(null);
	let lift = $state(0);
	let veils = $state<number[]>([]);

	$effect(() => {
		void active;
		void span;
		void settings.blur;
		if (!roll || !sheet) return;
		const line = sheet.children[Math.max(active, 0)];
		if (!(line instanceof HTMLElement)) return;
		const height = roll.clientHeight;
		const rise = height * PIN - line.offsetTop;
		lift = rise;

		const hazed: number[] = [];
		for (let index = 0; index < verses.length; index += 1) {
			const row = sheet.children[index];
			if (!settings.blur || index === active || !(row instanceof HTMLElement)) {
				hazed.push(0);
				continue;
			}
			const travel = row.offsetTop + rise - height * PIN;
			const span = height * (travel >= 0 ? 1 - PIN : PIN);
			const along = Math.min(Math.max(travel / Math.max(span, 1), -1), 1);
			hazed.push(Math.abs(along) ** HAZE);
		}
		veils = hazed;
	});

	let spans = $state<(HTMLElement | null)[]>([]);
	let body = $state<HTMLElement | null>(null);
	let plan = $state<
		{
			word: number;
			row: number;
			x: number;
			width: number;
			before: number;
			whole: number;
			evenly: boolean;
		}[]
	>([]);
	let rows = $state<{ top: number; left: number; height: number; width: number }[]>([]);
	let reach = $state(0);

	function measure() {
		const words = verses[active]?.words ?? [];
		const boxes = words.map((_, spot) => spans[spot]).filter((span) => span !== null);
		if (!body || boxes.length !== words.length || !boxes.length) return;

		const frame = body.getBoundingClientRect();
		const zoom = body.clientWidth ? frame.width / body.clientWidth : 1;
		if (!zoom) return;

		const box = (rect: DOMRect) => ({
			top: (rect.top - frame.top) / zoom,
			left: (rect.left - frame.left) / zoom,
			width: rect.width / zoom,
			height: rect.height / zoom
		});

		const pieces = boxes.map((span) => [...span.getClientRects()].map(box));
		const tops = [...new Set(pieces.flat().map((rect) => Math.round(rect.top)))].sort(
			(a, b) => a - b
		);
		const seats = tops.map((top) => pieces.flat().filter((rect) => Math.round(rect.top) === top));
		const shape = tops.map((top, row) => {
			const left = Math.min(...seats[row].map((rect) => rect.left));
			return {
				top,
				left,
				height: Math.max(...seats[row].map((rect) => rect.height)),
				width: Math.max(...seats[row].map((rect) => rect.left + rect.width)) - left
			};
		});

		const cut: {
			word: number;
			row: number;
			x: number;
			width: number;
			before: number;
			whole: number;
			evenly: boolean;
		}[] = [];
		pieces.forEach((rects, word) => {
			const whole = rects.reduce((sum, rect) => sum + rect.width, 0);
			let before = 0;
			for (const rect of rects) {
				const row = tops.indexOf(Math.round(rect.top));
				cut.push({
					word,
					row,
					x: rect.left - shape[row].left,
					width: rect.width,
					before,
					whole,
					evenly: rects.length > 1
				});
				before += rect.width;
			}
		});

		reach = body.clientWidth;
		rows = shape;
		plan = cut;
	}

	let settled = false;

	$effect(() => {
		void active;
		void tab;
		void span;
		untrack(measure);
		if (settled) return;
		settled = true;
		document.fonts?.ready.then(() => untrack(measure));
	});

	const swept = (word: { start: number; end: number }, last: boolean) => {
		const span = word.end - word.start;
		const travel = Math.max(last ? span : span * SWEEP_STRETCH, SWEEP_LEAST);
		const along = Math.min(Math.max((at - word.start) / travel, 0), 1);
		const eased = 1 - (1 - along) ** 3;
		return eased >= SWEPT ? 1 : eased;
	};

	const evenly = (word: { start: number; end: number }) => {
		const span = word.end - word.start;
		if (span <= 0) return at >= word.end ? 1 : 0;
		return Math.min(Math.max((at - word.start) / span, 0), 1);
	};

	const edges = $derived.by(() => {
		const words = verses[active]?.words ?? [];
		const front = rows.map(() => 0);
		for (const piece of plan) {
			const word = words[piece.word];
			if (!word) continue;
			const share = piece.evenly ? evenly(word) : swept(word, piece.word + 1 === words.length);
			if (share <= 0) continue;
			const part = piece.width > 0 ? (piece.whole * share - piece.before) / piece.width : 0;
			if (part <= 0) continue;
			const front_ = piece.x + piece.width * Math.min(part, 1);
			if (front_ > front[piece.row]) front[piece.row] = front_;
		}
		return front;
	});

	const trail = (row: number) => Math.min(Math.max(rows[row].width - edges[row], 0), EDGE_FADE);
</script>

{#snippet remove()}
	<span class="shove"><Control icon="x" title="Remove from queue" small tint="muted" /></span>
{/snippet}

<aside class="aside" class:stripped style:--m-verse="{VERSE}px">
	{#if !stripped}
		<header class="head">
			<span class="eyebrow">{tab === 'lyrics' ? 'Lyrics' : 'Queue'}</span>
			{#if tab === 'queue'}
				<div class="tools">
					<Control
						icon="radio"
						title="Autoplay similar tracks"
						small
						tint={player.radio ? 'primary' : 'muted'}
						onclick={() => player.toggleRadio()}
					/>
					<Control
						label="Reset"
						title="Reset"
						small
						tint="muted"
						disabled={!player.reordered}
						onclick={() => player.resetQueue()}
					/>
					<Control
						label="Clear"
						title="Clear"
						small
						tint="muted"
						disabled={upcoming.length === 0}
						onclick={() => player.clearQueue()}
					/>
				</div>
			{/if}
		</header>
	{/if}

	{#if tab === 'lyrics' && verses.length}
		<div class="verses" bind:this={roll} bind:clientWidth={span}>
			<div class="sheet" bind:this={sheet} style:transform="translateY({lift}px)">
				{#each verses as line, index (line.start)}
					<p
						class="verse"
						class:sung={index === active}
						class:karaoke={index === active && sung(line)}
						class:past={index < active}
						class:ahead={index > active}
						style:opacity={1 - VEIL * (veils[index] ?? 0)}
						style:filter={VERSE * BLUR * (veils[index] ?? 0) > HAZE_LEAST
							? `blur(${VERSE * BLUR * (veils[index] ?? 0)}px)`
							: undefined}
					>
						{#if index === active && sung(line)}
							<span class="body" bind:this={body}>
								{#each line.words as word, spot (spot)}<span class="word" bind:this={spans[spot]}
										>{word.word}</span
									>{/each}

								{#each rows as row, slot (slot)}
									{#if edges[slot] > 0}
										<span
											class="lit"
											style:left="{row.left}px"
											style:top="{row.top}px"
											style:width="{row.width}px"
											style:height="{row.height}px"
											style:--m-solid="{Math.max(edges[slot] - trail(slot), 0)}px"
											style:--m-edge="{edges[slot]}px"
										>
											<span
												class="copy"
												style:left="{-row.left}px"
												style:top="{-row.top}px"
												style:width="{reach}px"
											>
												{#each line.words as word, spot (spot)}<span class="word">{word.word}</span
													>{/each}
											</span>
										</span>
									{/if}
								{/each}
							</span>
						{:else}
							{line.text}
						{/if}
					</p>
				{/each}

				<div class="credit">
					<span>Lyrics from {song.source}</span>
					<span>Written by {song.by}</span>
				</div>
			</div>
		</div>
	{:else if tab === 'lyrics'}
		<div class="vacancy">
			<Icon name="mic-off" size={70} />
			<p>No lyrics found, sorry!</p>
		</div>
	{:else}
		<div class="list">
			{#if played.length}
				<span class="group"><span class="eyebrow">History</span></span>
				{#each played as track (track.id)}
					<Card
						title={track.title}
						meta={track.artist}
						cover={track.cover}
						tint="var(--m-muted-foreground)"
						onplay={() => player.select(track.id)}
						onpress={() => player.select(track.id)}
						oncontext={(event: MouseEvent) =>
							menu.at(event, `track-${track.id}`, () => trackMenu(track))}
					/>
				{/each}
			{/if}

			<span class="group">
				<span class="eyebrow">Now playing</span>
				{#if player.from}
					<span class="dot">&middot;</span>
					<span class="faint">From</span>
					<span class="source">{player.from.name}</span>
				{/if}
			</span>
			<Card
				title={player.track.title}
				meta={player.track.artist}
				cover={player.track.cover}
				tint="var(--m-primary)"
				playing={player.playing}
				onplay={() => player.toggle()}
			/>

			{#if upcoming.length}
				<span class="group"><span class="eyebrow">Up next</span></span>
				{#each upcoming as track (track.id)}
					<Card
						title={track.title}
						meta={track.artist}
						cover={track.cover}
						onplay={() => player.select(track.id)}
						onpress={() => player.select(track.id)}
						oncontext={(event: MouseEvent) =>
							menu.at(event, `track-${track.id}`, () => trackMenu(track))}
						action={remove}
					/>
				{/each}
			{/if}

			{#if suggested.length}
				<span class="group"><span class="eyebrow">Similar tracks</span></span>
				{#each suggested as track (track.id)}
					<Card
						title={track.title}
						meta={track.artist}
						cover={track.cover}
						onplay={() => player.select(track.id)}
						onpress={() => player.select(track.id)}
						oncontext={(event: MouseEvent) =>
							menu.at(event, `track-${track.id}`, () => trackMenu(track))}
						action={remove}
					/>
				{/each}
			{/if}
		</div>
	{/if}
</aside>

<style>
	.aside {
		display: flex;
		flex: none;
		flex-direction: column;
		width: var(--m-right, 254px);
		overflow: hidden;
		background: var(--m-background);
		border-left: 1px solid var(--m-border);
	}

	.aside.stripped {
		flex: 1;
		width: auto;
		min-width: 0;
		min-height: 0;
		height: 100%;
		background: none;
		border-left: 0;
	}

	.head {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: space-between;
		gap: 7px;
		height: 32px;
		padding: 0 7px;
		border-bottom: 1px solid var(--m-border);
	}

	.eyebrow {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--m-muted-foreground);
	}

	.tools {
		display: flex;
		align-items: center;
		gap: 3.5px;
	}

	.vacancy {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: var(--m-muted-foreground);
	}

	.verses {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: hidden;
		padding: 0 3.5px;
		mask-image: linear-gradient(
			to bottom,
			transparent 0,
			#000 23.75px,
			#000 calc(100% - 23.75px),
			transparent 100%
		);
	}

	.sheet {
		position: absolute;
		left: 3.5px;
		right: 3.5px;
		top: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
		will-change: transform;
		transition: transform 520ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.verse {
		margin: 0;
		padding: 3.5px 7px;
		border-radius: var(--m-radius);
		font-size: calc(var(--m-verse) * 21 / 19);
		font-weight: 600;
		line-height: calc(var(--m-verse) * 21 / 19 * 1.25);
		transform: scale(0.904762);
		transform-origin: left center;
		transition: transform 200ms cubic-bezier(0.455, 0.03, 0.515, 0.955);
	}

	.verse:hover {
		background: var(--m-table-hover);
	}

	.past {
		color: color-mix(in srgb, var(--m-muted-foreground) 40%, transparent);
	}

	.ahead {
		color: color-mix(in srgb, var(--m-muted-foreground) 60%, transparent);
	}

	.sung {
		transform: none;
		color: var(--m-foreground);
	}

	.karaoke {
		color: var(--m-muted-foreground);
	}

	.body {
		position: relative;
		display: block;
	}

	.word {
		white-space: pre-wrap;
	}

	.lit {
		position: absolute;
		color: var(--m-foreground);
		mask-image: linear-gradient(
			to right,
			#000 var(--m-solid),
			transparent var(--m-edge),
			transparent 100%
		);
	}

	.copy {
		position: absolute;
		display: block;
	}

	.credit {
		display: flex;
		flex-direction: column;
		padding: 7px 7px 0;
		font-size: 12px;
		font-weight: 400;
		color: var(--m-muted-foreground);
	}

	@media (prefers-reduced-motion: reduce) {
		.sheet,
		.verse {
			transition: none;
		}
	}

	.vacancy :global(svg) {
		margin-top: 24px;
		opacity: 0.35;
	}

	.vacancy p {
		margin: 0;
		padding: 16px;
	}

	.list {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		padding: 48px 7px 0;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--m-muted-foreground) 45%, transparent) transparent;
		mask-image: linear-gradient(
			to bottom,
			transparent 0,
			#000 48px,
			#000 calc(100% - 96px),
			transparent 100%
		);
	}

	.shove {
		display: flex;
		margin-right: 3.5px;
	}

	.group {
		display: flex;
		flex: none;
		align-items: flex-end;
		gap: 3.5px;
		height: 52px;
		min-width: 0;
		padding: 0 7px 3.5px;
		overflow: hidden;
		font-size: 12px;
		font-weight: 600;
		color: var(--m-muted-foreground);
	}

	.group .eyebrow {
		text-transform: uppercase;
	}

	.dot,
	.faint {
		flex: none;
	}

	.source {
		min-width: 0;
		flex-shrink: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: pointer;
	}

	.source:hover {
		color: var(--m-foreground);
		text-decoration: underline;
	}
</style>
