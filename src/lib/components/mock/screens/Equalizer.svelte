<script lang="ts">
	import {
		equalizer,
		HIGH,
		kinds,
		LOW,
		presets,
		profiles,
		RANGE
	} from '$lib/mock/equalizer.svelte';
	import type { Filter, Kind } from '$lib/mock/equalizer.svelte';
	import { player } from '$lib/mock/player.svelte';
	import { route } from '$lib/mock/route.svelte';
	import Control from '../Control.svelte';
	import Icon from '../Icon.svelte';
	import Picker from '../Picker.svelte';
	import Scrubber from '../Scrubber.svelte';
	import Switch from '../Switch.svelte';

	const WIDTH = 640;
	const HEIGHT = 220;
	const STEPS = 160;
	const BARS = 48;
	const GRID_HZ = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
	const GRID_DB = [-12, -6, 0, 6, 12];

	const sounds = [...Object.keys(presets), ...profiles];

	const x = (hz: number) => (Math.log(hz / LOW) / Math.log(HIGH / LOW)) * WIDTH;
	const hzAt = (px: number) => LOW * Math.pow(HIGH / LOW, Math.min(Math.max(px / WIDTH, 0), 1));
	const y = (db: number) => HEIGHT / 2 - (db / RANGE) * (HEIGHT / 2);
	const dbAt = (py: number) => ((HEIGHT / 2 - py) / (HEIGHT / 2)) * RANGE;
	const label = (hz: number) => (hz >= 1000 ? `${hz / 1000}k` : `${hz}`);
	const figure = (db: number) => `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;

	const curve = $derived(
		Array.from({ length: STEPS + 1 }, (_, step) => {
			const hz = LOW * Math.pow(HIGH / LOW, step / STEPS);
			return `${step ? 'L' : 'M'}${x(hz).toFixed(1)} ${y(equalizer.gain(hz, false)).toFixed(1)}`;
		}).join(' ')
	);

	let tick = $state(0);
	$effect(() => {
		if (!player.playing) return;
		let frame = 0;
		const run = () => {
			tick += 1;
			frame = requestAnimationFrame(run);
		};
		frame = requestAnimationFrame(run);
		return () => cancelAnimationFrame(frame);
	});

	/** A spectrum of the music before the equalizer, the shape of a mix with some motion in it. */
	const spectrum = $derived(
		Array.from({ length: BARS }, (_, at) => {
			const share = at / BARS;
			const tilt = 0.85 - share * 0.55;
			const swing = player.playing
				? 0.12 * Math.sin(at * 1.7 + tick * 0.09) + 0.08 * Math.sin(at * 0.6 - tick * 0.05)
				: -0.25;
			return Math.max(0.04, (tilt + swing) * player.volume);
		})
	);

	const level = $derived(
		player.playing ? Math.min(0.62 + 0.1 * Math.sin(tick * 0.11) + equalizer.headroom / 40, 1) : 0
	);

	let svg = $state<SVGSVGElement | null>(null);
	let dragging = $state<number | null>(null);
	let hovered = $state<number | null>(null);

	function point(event: PointerEvent) {
		if (!svg) return { px: 0, py: 0 };
		const box = svg.getBoundingClientRect();
		return {
			px: ((event.clientX - box.left) / box.width) * WIDTH,
			py: ((event.clientY - box.top) / box.height) * HEIGHT
		};
	}

	function grab(event: PointerEvent, filter: Filter) {
		event.preventDefault();
		equalizer.begin();
		dragging = filter.id;
		(event.currentTarget as Element).setPointerCapture(event.pointerId);
	}

	function drag(event: PointerEvent) {
		if (dragging === null) return;
		const { px, py } = point(event);
		const filter = equalizer.filters.find((one) => one.id === dragging);
		const shaped =
			filter && !['Low pass', 'High pass', 'Notch', 'Band pass', 'All pass'].includes(filter.kind);
		equalizer.update(dragging, {
			hz: Math.round(hzAt(px)),
			...(shaped ? { db: Math.round(Math.min(Math.max(dbAt(py), -RANGE), RANGE) * 10) / 10 } : {})
		});
	}

	function widen(event: WheelEvent, filter: Filter) {
		event.preventDefault();
		equalizer.update(filter.id, {
			q:
				Math.round(Math.min(Math.max(filter.q * (event.deltaY > 0 ? 0.9 : 1.1), 0.1), 10) * 100) /
				100
		});
	}

	function add(event: MouseEvent) {
		if (!equalizer.advanced || equalizer.full) return;
		equalizer.add();
		const last = equalizer.filters.at(-1);
		if (!last || !svg) return;
		const box = svg.getBoundingClientRect();
		const px = ((event.clientX - box.left) / box.width) * WIDTH;
		const py = ((event.clientY - box.top) / box.height) * HEIGHT;
		equalizer.update(last.id, { hz: Math.round(hzAt(px)), db: Math.round(dbAt(py) * 10) / 10 });
	}

	function number(event: Event, id: number, key: 'hz' | 'db' | 'q') {
		const value = Number((event.currentTarget as HTMLInputElement).value);
		if (Number.isNaN(value)) return;
		equalizer.begin();
		equalizer.update(id, { [key]: value });
	}
</script>

<div class="screen">
	<div class="column">
		<button
			type="button"
			class="back"
			onclick={() => route.go({ screen: 'settings', tab: 'Playback' })}
		>
			<Icon name="chevron-left" size={14} /> Sound
		</button>
		<h2 class="headline">Equalizer</h2>

		<section class="group">
			<div class="heading">
				<span class="eyebrow"><Icon name="sliders-horizontal" size={12} /> Sound</span>
				<div class="mode" role="tablist" aria-label="Mode">
					<button
						type="button"
						role="tab"
						aria-selected={!equalizer.advanced}
						class:on={!equalizer.advanced}
						onclick={() => equalizer.mode(false)}>Simple</button
					>
					<button
						type="button"
						role="tab"
						aria-selected={equalizer.advanced}
						class:on={equalizer.advanced}
						onclick={() => equalizer.mode(true)}>Advanced</button
					>
				</div>
			</div>

			<div class="controls">
				<div class="sound">
					<Picker
						value={equalizer.sound}
						options={sounds}
						width={240}
						start
						onpick={(name) => equalizer.choose(name)}
					/>
				</div>
				<Switch checked={equalizer.enabled} label="Equalizer" onchange={() => equalizer.toggle()} />
				<Control
					icon="undo-2"
					title="Undo"
					disabled={!equalizer.undoable}
					onclick={() => equalizer.undo()}
				/>
				<Control
					icon="redo-2"
					title="Redo"
					disabled={!equalizer.redoable}
					onclick={() => equalizer.redo()}
				/>
				{#if equalizer.advanced}
					<span class="manage">
						<Control icon="plus" title="Save as profile" />
						<Control
							icon="pencil"
							title="Rename profile"
							disabled={!profiles.includes(equalizer.sound)}
						/>
						<Control
							icon="trash-2"
							title="Delete profile"
							disabled={!profiles.includes(equalizer.sound)}
						/>
					</span>
				{/if}
			</div>

			<svg
				class="graph"
				class:off={!equalizer.enabled}
				bind:this={svg}
				viewBox="0 0 {WIDTH} {HEIGHT}"
				role="img"
				aria-label="Frequency response, {equalizer.filters
					.length} filters, preamp at {equalizer.preamp} dB"
				onpointermove={drag}
				onpointerup={() => (dragging = null)}
				ondblclick={add}
			>
				{#each spectrum as bar, at (at)}
					<rect
						class="bar"
						x={(at / BARS) * WIDTH + 1}
						y={HEIGHT - bar * HEIGHT * 0.8}
						width={WIDTH / BARS - 2}
						height={bar * HEIGHT * 0.8}
					/>
				{/each}
				{#each GRID_HZ as hz (hz)}
					<line class="grid" x1={x(hz)} x2={x(hz)} y1="0" y2={HEIGHT} />
					<text class="tick" x={x(hz) + 3} y={HEIGHT - 5}>{label(hz)}</text>
				{/each}
				{#each GRID_DB as db (db)}
					<line class="grid" class:zero={db === 0} x1="0" x2={WIDTH} y1={y(db)} y2={y(db)} />
					<text class="tick" x="4" y={y(db) - 4}>{db > 0 ? `+${db}` : db}</text>
				{/each}
				<line class="preamp" x1="0" x2={WIDTH} y1={y(equalizer.preamp)} y2={y(equalizer.preamp)} />
				<path class="curve" d={curve} />
				{#if equalizer.advanced}
					{#each equalizer.filters as filter, at (filter.id)}
						<g
							class="dot"
							class:lit={hovered === filter.id || dragging === filter.id}
							class:muted={!filter.on}
							role="slider"
							tabindex="0"
							aria-label="Filter {at + 1}"
							aria-valuenow={filter.hz}
							onpointerdown={(event) => grab(event, filter)}
							onpointerenter={() => (hovered = filter.id)}
							onpointerleave={() => (hovered = null)}
							onwheel={(event) => widen(event, filter)}
							oncontextmenu={(event) => {
								event.preventDefault();
								equalizer.remove(filter.id);
							}}
						>
							<circle cx={x(filter.hz)} cy={y(filter.db)} r="11" class="halo" />
							<circle cx={x(filter.hz)} cy={y(filter.db)} r="7" />
							<text x={x(filter.hz)} y={y(filter.db) + 3.5}>{at + 1}</text>
						</g>
					{/each}
				{/if}
			</svg>

			<div class="meter">
				<span class="caption">Level</span>
				<span class="track"><span class="fill" style:width="{level * 100}%"></span></span>
				{#if equalizer.clipping > 0}
					<span class="clip">Clipping by {equalizer.clipping.toFixed(1)} dB</span>
					<button type="button" class="action" onclick={() => equalizer.setPreamp(null)}>
						Lower preamp
					</button>
				{/if}
			</div>

			{#if equalizer.advanced}
				<div class="row">
					<div class="text">
						<span class="title">Preamp</span>
						<span class="detail">{equalizer.manual ? 'Manual' : 'Automatic'}</span>
					</div>
					<div class="tone">
						<Scrubber
							fraction={(equalizer.preamp + RANGE) / (RANGE * 2)}
							label="Preamp level"
							onseek={(to: number) =>
								equalizer.setPreamp(Math.round((to * RANGE * 2 - RANGE) * 10) / 10)}
						/>
						<span class="reading">{figure(equalizer.preamp)}</span>
					</div>
				</div>
			{:else}
				{#each [['bass', 'Bass'], ['treble', 'Treble']] as const as [which, name] (which)}
					<div class="row">
						<div class="text"><span class="title">{name}</span></div>
						<div class="tone">
							<Scrubber
								fraction={(equalizer[which] + 12) / 24}
								label={name}
								onseek={(to: number) => equalizer.tone(which, to * 24 - 12)}
							/>
							<span class="reading">{figure(equalizer[which])}</span>
							<Control
								icon="rotate-ccw-clock"
								title="Reset to 0 dB"
								small
								disabled={equalizer[which] === 0}
								onclick={() => equalizer.tone(which, 0, true)}
							/>
						</div>
					</div>
				{/each}
			{/if}
		</section>

		{#if equalizer.advanced}
			<section class="group">
				<div class="heading">
					<span class="eyebrow"><Icon name="list" size={12} /> Filters</span>
					<Control
						icon="plus"
						label="Add filter"
						title="Add filter"
						small
						disabled={equalizer.full}
						onclick={() => equalizer.add()}
					/>
				</div>
				{#if !equalizer.filters.length}
					<p class="vacant">No filters yet. Add one, pick a preset above, or import a profile.</p>
				{/if}
				{#each equalizer.filters as filter, at (filter.id)}
					<div
						class="filter"
						class:lit={hovered === filter.id || dragging === filter.id}
						role="group"
						aria-label="Filter {at + 1}"
						onpointerenter={() => (hovered = filter.id)}
						onpointerleave={() => (hovered = null)}
					>
						<span class="index">{at + 1}</span>
						<Switch
							checked={filter.on}
							label="Filter {at + 1}"
							onchange={(on) => {
								equalizer.begin();
								equalizer.update(filter.id, { on });
							}}
						/>
						<Picker
							value={filter.kind}
							options={kinds}
							width={150}
							start
							onpick={(kind) => {
								equalizer.begin();
								equalizer.update(filter.id, { kind: kind as Kind });
							}}
						/>
						<label class="field"
							><input value={filter.hz} onchange={(event) => number(event, filter.id, 'hz')} /><span
								>Hz</span
							></label
						>
						<label class="field"
							><input value={filter.db} onchange={(event) => number(event, filter.id, 'db')} /><span
								>dB</span
							></label
						>
						<label class="field"
							><input value={filter.q} onchange={(event) => number(event, filter.id, 'q')} /><span
								>Q</span
							></label
						>
						<Control
							icon="x"
							title="Remove filter"
							small
							tint="muted"
							onclick={() => equalizer.remove(filter.id)}
						/>
					</div>
				{/each}
			</section>

			<section class="group">
				<div class="heading">
					<span class="eyebrow"><Icon name="headphones" size={12} /> Device rules</span>
				</div>
				<div class="rule">
					<Icon name="headphones" />
					<span class="text"
						><span class="title">USB DAC</span><span class="detail">Playing now</span></span
					>
					<span class="reading">Headphones</span>
				</div>
				<div class="rule">
					<Icon name="speaker" />
					<span class="text"><span class="title">Any other device</span></span>
					<span class="reading">Flat</span>
				</div>
			</section>

			<section class="group">
				<div class="heading">
					<span class="eyebrow"><Icon name="arrow-right-left" size={12} /> Import and export</span>
				</div>
				<div class="transfer">
					<Control
						icon="folder-plus"
						label="Import file…"
						title="Import file…"
						variant="outline"
						small
					/>
					<Control icon="clipboard-paste" label="Paste" title="Paste" variant="outline" small />
					<Control icon="copy" label="Copy" title="Copy" variant="outline" small />
					<Control
						icon="square-arrow-out-up-right"
						label="Export file…"
						title="Export file…"
						variant="outline"
						small
					/>
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	.screen {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--m-muted-foreground) 45%, transparent) transparent;
		background: var(--m-background);
	}

	.column {
		max-width: 682px;
		margin: 0 auto;
		padding: 24px 21px 40px;
		animation: page 320ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes page {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--m-muted-foreground);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}

	.back:hover {
		color: var(--m-foreground);
	}

	.headline {
		display: flex;
		align-items: center;
		height: 40px;
		margin: 0;
		font-size: 24px;
		font-weight: 600;
	}

	.group {
		margin-top: 21px;
	}

	.group + .group {
		margin-top: 40px;
	}

	.heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 7px;
		margin-bottom: 8px;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--m-muted-foreground);
	}

	.mode {
		display: flex;
		gap: 2px;
		padding: 2px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
	}

	.mode button {
		height: 24px;
		padding: 0 10px;
		border: 0;
		border-radius: max(calc(var(--m-radius) - 2px), 0px);
		background: none;
		color: var(--m-muted-foreground);
		font: inherit;
		font-size: 12px;
		cursor: pointer;
	}

	.mode button.on {
		background: var(--m-secondary-active);
		color: var(--m-foreground);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 7px;
	}

	.manage {
		display: flex;
		margin-left: auto;
		gap: 3.5px;
	}

	.graph {
		display: block;
		width: 100%;
		height: auto;
		margin-top: 10.5px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: color-mix(in srgb, var(--m-secondary) 45%, transparent);
		touch-action: none;
		user-select: none;
	}

	.graph.off .curve {
		stroke: var(--m-muted-foreground);
	}

	.bar {
		fill: color-mix(in srgb, var(--m-muted-foreground) 16%, transparent);
	}

	.grid {
		stroke: color-mix(in srgb, var(--m-border) 70%, transparent);
		stroke-width: 1;
	}

	.grid.zero {
		stroke: var(--m-border);
	}

	.tick {
		fill: var(--m-muted-foreground);
		font-size: 10px;
	}

	.preamp {
		stroke: var(--m-muted-foreground);
		stroke-width: 1;
		stroke-dasharray: 4 4;
	}

	.curve {
		fill: none;
		stroke: var(--m-primary);
		stroke-width: 2.5;
		stroke-linejoin: round;
	}

	.dot {
		cursor: grab;
	}

	.dot circle {
		fill: var(--m-primary);
		stroke: var(--m-background);
		stroke-width: 2;
	}

	.dot .halo {
		fill: color-mix(in srgb, var(--m-primary) 25%, transparent);
		stroke: none;
		opacity: 0;
		transition: opacity 140ms ease;
	}

	.dot.lit .halo {
		opacity: 1;
	}

	.dot.muted circle {
		fill: var(--m-muted-foreground);
	}

	.dot text {
		fill: var(--m-primary-foreground);
		font-size: 9px;
		font-weight: 700;
		text-anchor: middle;
		pointer-events: none;
	}

	.meter {
		display: flex;
		align-items: center;
		gap: 10.5px;
		height: 26px;
		margin-top: 10.5px;
	}

	.caption {
		flex: none;
		font-size: 12px;
		color: var(--m-muted-foreground);
	}

	.track {
		flex: 1;
		height: 4px;
		overflow: hidden;
		border-radius: 2px;
		background: color-mix(in srgb, var(--m-muted-foreground) 25%, transparent);
	}

	.fill {
		display: block;
		height: 100%;
		background: var(--m-primary);
		transition: width 80ms linear;
	}

	.clip {
		font-size: 12px;
		color: #e5484d;
	}

	.action {
		display: inline-flex;
		align-items: center;
		height: 26px;
		padding: 0 8.75px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-foreground);
		font: inherit;
		font-size: 12px;
		cursor: pointer;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 10.5px 0;
		border-bottom: 1px solid var(--m-table-row-border);
	}

	.text {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 2px;
	}

	.detail,
	.reading {
		font-size: 12px;
		color: var(--m-muted-foreground);
		white-space: nowrap;
	}

	.reading {
		min-width: 58px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.tone {
		display: flex;
		width: 300px;
		align-items: center;
		gap: 10.5px;
	}

	.tone :global(:first-child) {
		flex: 1;
	}

	.vacant {
		margin: 0;
		padding: 14px 0;
		font-size: 13px;
		color: var(--m-muted-foreground);
	}

	.filter {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 5px 7px;
		border-radius: var(--m-radius);
	}

	.filter.lit {
		background: var(--m-secondary-hover);
	}

	.index {
		width: 16px;
		font-size: 12px;
		font-weight: 600;
		color: var(--m-muted-foreground);
		text-align: center;
	}

	.field {
		display: flex;
		align-items: center;
		gap: 4px;
		height: 26px;
		padding: 0 7px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		font-size: 11px;
		color: var(--m-muted-foreground);
	}

	.field input {
		width: 44px;
		border: 0;
		background: none;
		color: var(--m-foreground);
		font: inherit;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		text-align: right;
		outline: none;
	}

	.rule {
		display: flex;
		align-items: center;
		gap: 10.5px;
		padding: 8px 10.5px;
		margin-bottom: 7px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
	}

	.transfer {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
	}

	@media (prefers-reduced-motion: reduce) {
		.column {
			animation: none;
		}
	}
</style>
