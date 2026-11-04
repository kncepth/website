<script lang="ts">
	import { library } from '$lib/mock/library.svelte';
	import { clock, shelf } from '$lib/mock/album';
	import { player } from '$lib/mock/player.svelte';
	import { settings } from '$lib/mock/settings.svelte';
	import { palette } from '$lib/mock/theme';
	import Ambient from './Ambient.svelte';
	import Aside from './Aside.svelte';
	import Control from './Control.svelte';
	import Scrubber from './Scrubber.svelte';
	import Visualizer from './Visualizer.svelte';

	let { panel = $bindable('lyrics'), onleave }: { panel?: string | null; onleave?: () => void } =
		$props();

	const WIDTH = 1180;
	const HEIGHT = 730;
	const TITLE_BAR = 36;
	const PLAYER_BAR = 76;
	const COVER_TALL = 0.46;
	const COVER_WIDE = 0.34;
	const COVER_MAX = 520;
	const COVER_MIN = 96;
	const STACK = TITLE_BAR + 14 * (1.25 * 2 + 1.5) + (39 + 14 * 0.25 + 23);
	const DOCK = 1.15;
	const DOCK_FULL = 1.7;
	const VISUALIZER_MIN = 160;
	const VEIL = 0.34;
	const CONTRAST = 0.34;

	const split = $derived(panel !== null);
	const tint = $derived(shelf.get(player.track.album)?.tint);
	const ambient = $derived(settings.ambient);
	const tokens = $derived(
		palette(
			ambient || settings.adaptive ? tint : undefined,
			true,
			ambient ? 'Dark' : String(settings.theme)
		)
	);
	const style = $derived(
		Object.entries(tokens)
			.map(([name, value]) => `${name}:${value}`)
			.join(';')
	);

	const side = $derived(
		Math.round(
			Math.max(
				Math.min(
					HEIGHT * COVER_TALL,
					HEIGHT - STACK - PLAYER_BAR * (split ? DOCK : DOCK_FULL),
					WIDTH * COVER_WIDE,
					COVER_MAX
				),
				COVER_MIN
			)
		)
	);

	const showing = $derived(settings.visualizer !== 'Off' && !split);

	let root = $state<HTMLElement | null>(null);
	let cover = $state<HTMLElement | null>(null);
	let reach = $state(VISUALIZER_MIN);

	$effect(() => {
		void side;
		void showing;
		if (!root || !cover) return;
		const frame = root.getBoundingClientRect();
		const art = cover.getBoundingClientRect();
		const scale = frame.height / HEIGHT || 1;
		reach = Math.max((frame.bottom - art.bottom) / scale, VISUALIZER_MIN);
	});

	function legible(color: string): string {
		const match = color.match(/hsl\((\S+) (\S+)% (\S+)%/);
		if (!match) return color;
		const lightness = Number(match[3]) / 100;
		const behind = 10 / 255;
		if (Math.abs(lightness - behind) >= CONTRAST) return color;
		const lifted = behind + CONTRAST <= 1 ? behind + CONTRAST : Math.max(behind - CONTRAST, 0);
		return `hsl(${match[1]} ${match[2]}% ${Math.round(lifted * 1000) / 10}%)`;
	}

	const accent = $derived(legible(tokens['--m-primary']));
	const level = $derived(
		player.volume === 0 ? 'volume-x' : player.volume < 0.5 ? 'volume-1' : 'volume-2'
	);
</script>

{#snippet pill()}
	<div class="pill" class:frosted={ambient}>
		<Control
			icon="disc-3"
			title="Artwork"
			small
			selected={panel === null}
			tint={panel === null ? '' : 'muted'}
			onclick={() => (panel = null)}
		/>
		<Control
			icon="mic-vocal"
			title="Lyrics"
			small
			selected={panel === 'lyrics'}
			tint={panel === 'lyrics' ? '' : 'muted'}
			onclick={() => (panel = 'lyrics')}
		/>
		<Control
			icon="list-music"
			title="Queue"
			small
			selected={panel === 'queue'}
			tint={panel === 'queue' ? '' : 'muted'}
			onclick={() => (panel = 'queue')}
		/>
	</div>
{/snippet}

{#snippet controls()}
	<div class="controls">
		{#if !split}
			{@render pill()}
		{/if}
		<div class="seek">
			<span class="clock end">{clock(player.elapsed)}</span>
			<div class="rail">
				<Scrubber
					fraction={player.progress}
					label="Seek"
					onseek={(to: number) => player.seek(to)}
				/>
			</div>
			<span class="clock">{clock(player.track.length)}</span>
		</div>
		<div class="transport">
			<div class="keys">
				<Control
					icon="shuffle"
					title="Shuffle"
					small
					tint={player.shuffle ? 'primary' : 'muted'}
					onclick={() => player.toggleShuffle()}
				/>
				<Control icon="skip-back" title="Previous track" small onclick={() => player.previous()} />
				<Control
					icon={player.playing ? 'pause' : 'play'}
					title={player.playing ? 'Pause' : 'Play'}
					onclick={() => player.toggle()}
				/>
				<Control icon="skip-forward" title="Next track" small onclick={() => player.next()} />
				<Control
					icon={player.repeat === 2 ? 'repeat-one' : 'repeat'}
					title="Repeat"
					small
					tint={player.repeat === 0 ? 'muted' : 'primary'}
					onclick={() => player.cycleRepeat()}
				/>
			</div>
			<span class="volume"><Control icon={level} title="Volume" small tint="muted" /></span>
		</div>
	</div>
{/snippet}

<div class="fullscreen" {style} class:dark={ambient} bind:this={root}>
	{#if ambient}
		<Ambient {tint} moving={settings.ambientMotion} />
	{/if}

	<div class="band"></div>

	<div class="scene">
		{#if showing}
			<Visualizer
				color={accent}
				style={String(settings.visualizer)}
				playing={player.playing}
				gain={settings.visualizerAbsolute ? 1 : player.volume}
				max={reach}
			/>
			<div class="veil" style:height="{HEIGHT * VEIL}px"></div>
		{/if}

		<div class="row" class:split>
			<div class="column" class:half={split}>
				<button
					type="button"
					class="cover"
					bind:this={cover}
					style:width="{side}px"
					style:height="{side}px"
					aria-label="Open the album"
				>
					<img src={player.track.cover} alt="" />
				</button>

				<div class="meta">
					<div class="line">
						<span class="flank"></span>
						<span class="title">{player.track.title}</span>
						<span class="flank end">
							<Control
								icon={library.saved(player.track.album) ? 'heart-filled' : 'heart'}
								title={library.saved(player.track.album)
									? 'Remove from Favorites'
									: 'Add to Favorites'}
								small
								tint={library.saved(player.track.album) ? 'primary' : 'muted'}
								onclick={() => library.toggle(player.track.album)}
							/>
						</span>
					</div>
					<span class="artist">{player.track.artist}</span>
				</div>

				{#if split}
					<div class="dock">{@render controls()}</div>
				{/if}
			</div>

			{#if split}
				<div class="panel">
					<Aside tab={panel ?? 'lyrics'} stripped />
					<div class="floating">{@render pill()}</div>
				</div>
			{/if}
		</div>

		{#if !split}
			<div class="dock">{@render controls()}</div>
		{/if}
	</div>

	<span class="leave">
		<Control icon="chevron-down" title="Leave fullscreen" small tint="muted" onclick={onleave} />
	</span>
</div>

<style>
	.fullscreen {
		position: relative;
		display: flex;
		width: 1180px;
		height: 730px;
		flex-direction: column;
		overflow: hidden;
		background: var(--m-background);
		color: var(--m-foreground);
	}

	.fullscreen.dark {
		color-scheme: dark;
	}

	.band {
		height: 36px;
		flex: none;
	}

	.scene {
		position: relative;
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		gap: 17.5px;
		padding: 0 28px 21px;
	}

	.veil {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		pointer-events: none;
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--m-background) 70%, transparent),
			transparent
		);
		backdrop-filter: blur(12px);
		mask-image: linear-gradient(to top, #000 40%, transparent);
	}

	.row {
		position: relative;
		display: flex;
		flex: 1;
		min-height: 0;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		gap: 28px;
	}

	.column {
		display: flex;
		width: 100%;
		min-width: 0;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 17.5px;
	}

	.column.half {
		flex: 1;
		height: 100%;
	}

	.cover {
		flex: none;
		padding: 0;
		border: 0;
		border-radius: calc(var(--m-radius) * 2);
		overflow: hidden;
		background: var(--m-muted);
		cursor: pointer;
	}

	.cover img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.meta {
		display: flex;
		width: 100%;
		min-width: 0;
		flex-direction: column;
		align-items: center;
		gap: 3.5px;
	}

	.line {
		display: flex;
		width: 100%;
		min-width: 0;
		align-items: center;
		gap: 7px;
	}

	.flank {
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: center;
	}

	.title {
		min-width: 0;
		overflow: hidden;
		font-size: 24px;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.artist {
		max-width: 100%;
		overflow: hidden;
		color: var(--m-muted-foreground);
		font-size: 14px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dock {
		position: relative;
		display: flex;
		width: 100%;
		flex: none;
		justify-content: center;
	}

	.controls {
		display: flex;
		width: 100%;
		max-width: 420px;
		flex: none;
		flex-direction: column;
		align-items: center;
		gap: 10.5px;
	}

	.seek {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 7px;
	}

	.rail {
		flex: 1;
		min-width: 0;
	}

	.clock {
		width: 37.4px;
		flex: none;
		color: var(--m-muted-foreground);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.clock.end {
		text-align: right;
	}

	.transport {
		position: relative;
		display: flex;
		width: 100%;
		justify-content: center;
	}

	.keys {
		display: flex;
		align-items: center;
		gap: 7px;
	}

	.volume {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
	}

	.panel {
		position: relative;
		display: flex;
		flex: 1;
		min-width: 0;
		min-height: 0;
		height: 100%;
		flex-direction: column;
	}

	.floating {
		position: absolute;
		bottom: 10.5px;
		display: flex;
		width: 100%;
		justify-content: center;
	}

	.pill {
		display: flex;
		gap: 2px;
		padding: 2px;
		border: 1px solid var(--m-border);
		border-radius: calc(var(--m-radius) + 2px);
		background: var(--m-secondary);
	}

	.pill.frosted {
		background: color-mix(in srgb, var(--m-secondary) 55%, transparent);
		backdrop-filter: blur(16px);
	}

	.leave {
		position: absolute;
		right: 17.5px;
		bottom: -2px;
		display: flex;
		height: 76px;
		align-items: center;
	}
</style>
