<script lang="ts">
	import { onMount } from 'svelte';

	let {
		color,
		style = 'Bars and wave',
		playing = false,
		gain = 1,
		max = 160,
		wander = false
	}: {
		color: string;
		style?: string;
		playing?: boolean;
		gain?: number;
		max?: number;
		/** Draws random levels instead of the spectrum, so it moves whether or not anything
		 *  plays, as the desktop's Now playing preview does. */
		wander?: boolean;
	} = $props();

	const BANDS = 32;
	const GAP = 3;
	const OPACITY = 0.32;
	const FLOOR = 0.03;
	const STROKE = 2;
	const CHANNELS = [0.62, 1];
	const GLOW = 10;
	const GLOW_STROKE = 2.4;
	const GLOW_OPACITY = 0.9;
	const BEDDED = 0.55;
	const RIDE = 0.4;
	const FILL = 0.22;
	const FILL_BASE = 0.05;
	const LINE_BLUR = 0.7;
	const RATE = 48000 / 2048;
	const DECAY = 0.12;
	const SETTLE = 0.04;
	const SOURCE = '/spectrum.bin';
	/** The desktop preview's `Wander`: how often it picks new heights, how fast it eases to
	 *  them, the lean from the lowest band to the highest, and how alike the channels move. */
	const PICK = 0.14;
	const WANDER_SETTLE = 0.09;
	const TILT = [1, 0.6];
	const LOW = 0.08;
	const SWELL = 0.8;
	const SHARED = 0.75;

	/** Random heights under each band's lean, the channels sharing most of their randomness,
	 *  each smoothed across its neighbours so the wave rolls rather than spikes. */
	function pick(): number[][] {
		const swell = SWELL + (1 - SWELL) * Math.random();
		const channels: number[][] = [[], []];
		for (let band = 0; band < BANDS; band += 1) {
			const lean = TILT[0] + ((TILT[1] - TILT[0]) * band) / (BANDS - 1);
			const shared = Math.random();
			for (const channel of channels) {
				const own = Math.random();
				channel.push(lean * swell * (LOW + (1 - LOW) * (shared * SHARED + own * (1 - SHARED))));
			}
		}
		return channels.map((bands) =>
			bands.map(
				(level, at) =>
					(bands[Math.max(at - 1, 0)] + level * 4 + bands[Math.min(at + 1, BANDS - 1)]) / 6
			)
		);
	}

	let canvas = $state<HTMLCanvasElement | null>(null);

	const bars = $derived(style === 'Bars' || style === 'Bars and wave');
	const waves = $derived(style === 'Wave' || style === 'Bars and wave');

	let levels: number[][] = [new Array(BANDS).fill(0), new Array(BANDS).fill(0)];
	let heard: number[][] = [new Array(BANDS).fill(0), new Array(BANDS).fill(0)];

	let recording: Promise<Uint8Array[]> | null = null;

	function load(): Promise<Uint8Array[]> {
		recording ??= fetch(SOURCE)
			.then((response) => response.body!.pipeThrough(new DecompressionStream('gzip')))
			.then((stream) => new Response(stream).arrayBuffer())
			.then((buffer) => {
				const deltas = new Uint8Array(buffer);
				const width = BANDS * 2;
				const frames: Uint8Array[] = [];
				let previous = new Uint8Array(width);
				for (let at = 0; at + width <= deltas.length; at += width) {
					const frame = new Uint8Array(width);
					for (let band = 0; band < width; band += 1) {
						frame[band] = (previous[band] + deltas[at + band]) & 255;
					}
					frames.push(frame);
					previous = frame;
				}
				return frames;
			});
		return recording;
	}

	function trace(context: CanvasRenderingContext2D, points: [number, number][]) {
		context.moveTo(points[0][0], points[0][1]);
		for (let index = 0; index < points.length - 1; index += 1) {
			const before = points[Math.max(index - 1, 0)];
			const from = points[index];
			const to = points[index + 1];
			const after = points[Math.min(index + 2, points.length - 1)];
			context.bezierCurveTo(
				from[0] + (to[0] - before[0]) / 6,
				from[1] + (to[1] - before[1]) / 6,
				to[0] - (after[0] - from[0]) / 6,
				to[1] - (after[1] - from[1]) / 6,
				to[0],
				to[1]
			);
		}
	}

	function wave(context: CanvasRenderingContext2D, wide: number, high: number, blurred: boolean) {
		const width = blurred ? STROKE * GLOW_STROKE : STROKE;
		const inset = width / 2;
		const span = Math.max(high - inset * 2, 0);

		levels.forEach((bands, channel) => {
			const step = wide / bands.length;
			const crest = (band: number) => high - inset - span * Math.min(Math.max(band, FLOOR), 1);
			const points: [number, number][] = [[0, crest(bands[0])]];
			bands.forEach((band, index) => points.push([step * (index + 0.5), crest(band)]));
			points.push([wide, crest(bands[bands.length - 1])]);

			const weight = CHANNELS[channel] * (blurred ? GLOW_OPACITY : 1);

			if (!blurred) {
				const gradient = context.createLinearGradient(0, 0, 0, high);
				gradient.addColorStop(0, tone(FILL * weight));
				gradient.addColorStop(1, tone(FILL * FILL_BASE * weight));
				context.beginPath();
				trace(context, points);
				context.lineTo(wide, high);
				context.lineTo(0, high);
				context.closePath();
				context.fillStyle = gradient;
				context.fill();
			}

			context.beginPath();
			trace(context, points);
			context.lineWidth = width;
			context.strokeStyle = tone(OPACITY * 2 * weight);
			context.stroke();
		});
	}

	const tone = (alpha: number) => color.replace(/\s*\/[^)]*\)$|\)$/, ` / ${Math.min(alpha, 1)})`);

	function draw() {
		if (!canvas) return;
		const context = canvas.getContext('2d');
		if (!context) return;

		const ratio = window.devicePixelRatio || 1;
		const wide = canvas.width / ratio;
		const high = canvas.height / ratio;
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.clearRect(0, 0, wide, high);

		if (bars) {
			const ride = waves ? RIDE : 0;
			const mixed = levels[0].map((level, band) => Math.max(level, levels[1][band]));
			const column = (wide - GAP * (BANDS - 1)) / BANDS;
			context.filter = 'none';
			context.fillStyle = tone(waves ? OPACITY * BEDDED : OPACITY);
			mixed.forEach((level, band) => {
				const tall = (high * Math.min(Math.max(level, FLOOR), 1)) / (1 + ride);
				context.fillRect(band * (column + GAP), high - tall, column, tall);
			});
		}

		if (waves) {
			context.filter = `blur(${GLOW}px)`;
			wave(context, wide, high, true);
			context.filter = `blur(${LINE_BLUR}px)`;
			wave(context, wide, high, false);
			context.filter = 'none';
		}
	}

	onMount(() => {
		if (!canvas) return;
		const host = canvas;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		let frame = 0;

		const size = () => {
			const ratio = window.devicePixelRatio || 1;
			const bounds = host.getBoundingClientRect();
			host.width = Math.max(1, Math.round(bounds.width * ratio));
			host.height = Math.max(1, Math.round(bounds.height * ratio));
		};

		let last = 0;
		let clock = 0;
		let beat = 0;
		let picked = 0;
		let frames: Uint8Array[] = [];
		load().then((loaded) => (frames = loaded));

		const tick = (now: number) => {
			const step = last ? Math.min((now - last) / 1000, 0.25) : 0;
			last = now;
			const live = playing && !still && frames.length > 0;

			if (wander) {
				picked -= step;
				if (picked <= 0 || still) {
					heard = pick();
					picked = PICK;
				}
			} else if (live) {
				clock += step;
				const index = Math.floor(clock * RATE) % frames.length;
				const loud = Math.sqrt(gain);
				heard = [0, 1].map((channel) =>
					Array.from({ length: BANDS }, (_, band) =>
						Math.min((frames[index][channel * BANDS + band] / 255) * loud, 1)
					)
				);
			} else {
				beat += step;
				while (beat >= 1 / RATE) {
					beat -= 1 / RATE;
					heard = heard.map((bands) => bands.map((level) => level * (1 - DECAY)));
				}
			}

			const ease = still && wander ? 1 : 1 - Math.exp(-step / (wander ? WANDER_SETTLE : SETTLE));
			levels = levels.map((bands, channel) =>
				bands.map((level, band) => level + (heard[channel][band] - level) * ease)
			);
			draw();
			frame = requestAnimationFrame(tick);
		};

		const watch = new ResizeObserver(size);
		watch.observe(host);
		size();
		frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			watch.disconnect();
		};
	});
</script>

<canvas class="visualizer" style:height="{max}px" bind:this={canvas}></canvas>

<style>
	.visualizer {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		width: 100%;
		pointer-events: none;
	}
</style>
