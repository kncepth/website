<script lang="ts">
	import { menu } from '$lib/mock/menu.svelte';
	import { trackMenu } from '$lib/mock/menus';
	import { shelf } from '$lib/mock/album';
	import { listenAgain, quickPicks } from '$lib/mock/screens';
	import { player } from '$lib/mock/player.svelte';
	import Card from '../Card.svelte';
	import Control from '../Control.svelte';

	const CARD = 146;
	const GAP = 32;
	const LANES = 4;
	const COLUMNS = 2;
	const ROWS = 5;

	let again = $state(0);
	let picks = $state(0);

	const laps = Math.ceil(listenAgain.length / LANES);
	const pages = Math.ceil(quickPicks.length / (COLUMNS * ROWS));

	const shown = $derived(listenAgain.slice(again * LANES, again * LANES + LANES));
	const page = $derived(
		quickPicks.slice(picks * COLUMNS * ROWS, picks * COLUMNS * ROWS + COLUMNS * ROWS)
	);

	const lane = (column: number) => page.slice(column * ROWS, column * ROWS + ROWS);
</script>

<div class="screen">
	<section class="panel">
		<div class="bar head">
			<div class="titles">
				<span class="eyebrow">Alex Rivera</span>
				<h2>Quick picks</h2>
			</div>
			<div class="steps">
				<Control
					icon="chevron-left"
					title="Previous"
					variant="outline"
					small
					disabled={picks === 0}
					onclick={() => (picks -= 1)}
				/>
				<Control
					icon="chevron-right"
					title="Next"
					variant="outline"
					small
					disabled={picks + 1 >= pages}
					onclick={() => (picks += 1)}
				/>
			</div>
		</div>
		<div class="lanes">
			{#each { length: COLUMNS } as _, column (column)}
				<div class="lane">
					{#each lane(column) as track (track.id)}
						<Card
							title={track.title}
							meta={`Song · ${shelf.get(track.album)?.artist ?? track.artist}`}
							cover={track.cover}
							playing={player.id === track.id && player.playing}
							onplay={() => player.select(track.id)}
							onpress={() => player.select(track.id)}
							oncontext={(event: MouseEvent) =>
								menu.at(event, `track-${track.id}`, () => trackMenu(track))}
						/>
					{/each}
				</div>
			{/each}
		</div>
	</section>

	<section class="again">
		<div class="bar">
			<h2>Listen again</h2>
			<div class="steps">
				<Control
					icon="chevron-left"
					title="Previous"
					variant="outline"
					small
					disabled={again === 0}
					onclick={() => (again -= 1)}
				/>
				<Control
					icon="chevron-right"
					title="Next"
					variant="outline"
					small
					disabled={again + 1 >= laps}
					onclick={() => (again += 1)}
				/>
			</div>
		</div>
		<div class="grid" style:column-gap="{GAP}px">
			{#each shown as track (track.id)}
				<Card
					tile={CARD}
					flat
					weight={600}
					title={track.title}
					meta={track.artist}
					cover={track.cover}
					playing={player.id === track.id && player.playing}
					onplay={() => player.select(track.id)}
					onpress={() => player.select(track.id)}
					oncontext={(event: MouseEvent) =>
						menu.at(event, `track-${track.id}`, () => trackMenu(track))}
				/>
			{/each}
		</div>
	</section>
</div>

<style>
	.screen {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 28px;
		padding: 24px;
		background: var(--m-background);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--m-muted-foreground) 45%, transparent) transparent;
	}

	.again {
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: 10.5px;
		flex: none;
	}

	.bar {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 14px;
	}

	h2 {
		margin: 0;
		font-size: 24px;
		font-weight: 600;
		letter-spacing: normal;
		text-align: left;
	}

	.steps {
		display: flex;
		flex: none;
		align-items: center;
		gap: 3.5px;
	}

	.grid {
		display: flex;
		width: 100%;
	}

	.panel {
		display: flex;
		width: 100%;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		flex: none;
	}

	.head {
		padding: 7px 10.5px;
		border-bottom: 1px solid var(--m-border);
	}

	.titles {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 1.75px;
	}

	.eyebrow {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--m-muted-foreground);
	}

	.lanes {
		display: flex;
		gap: 7px;
		padding: 7px;
	}

	.lane {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 3.5px;
	}

	.lane + .lane {
		padding-left: 7px;
		border-left: 1px solid var(--m-border);
	}
</style>
