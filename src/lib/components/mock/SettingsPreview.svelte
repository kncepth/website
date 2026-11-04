<script lang="ts">
	import { shelf } from '$lib/mock/album';
	import { accounts } from '$lib/mock/accounts.svelte';
	import { player } from '$lib/mock/player.svelte';
	import { settings } from '$lib/mock/settings.svelte';
	import Icon from './Icon.svelte';

	let { kind }: { kind: 'now-playing' | 'lyrics' | 'sound' | 'discord' } = $props();

	const BARS = 28;
	const LINES = [
		'I leaned my back against an oak',
		'Thinking it was a trusty tree',
		'But first it bent and then it broke'
	];

	const tint = $derived(shelf.get(player.track.album)?.tint);
	const wash = $derived(
		tint
			? `radial-gradient(120% 140% at 20% 20%, hsl(${tint.hue} 45% 32%), transparent 60%), radial-gradient(120% 140% at 90% 90%, hsl(${tint.second?.hue ?? tint.hue} 40% 26%), transparent 60%), #0b0b0b`
			: '#0b0b0b'
	);

	let tick = $state(0);
	$effect(() => {
		if (!player.playing) return;
		const timer = setInterval(() => (tick += 1), 120);
		return () => clearInterval(timer);
	});

	const levels = $derived(
		Array.from({ length: BARS }, (_, at) => {
			const swing = Math.sin(at * 0.9 + tick * 0.7) * 0.5 + Math.sin(at * 0.37 - tick * 0.45) * 0.5;
			const shape = 1 - Math.abs(at - BARS * 0.3) / BARS;
			const loud = settings.visualizerAbsolute ? 1 : 0.4 + player.volume * 0.6;
			return Math.max(0.08, (0.35 + swing * 0.3) * shape * loud * (player.playing ? 1 : 0.25));
		})
	);
	const wave = $derived(
		levels.map((level, at) => `${(at / (BARS - 1)) * 100},${40 - level * 34}`).join(' ')
	);

	const status = $derived.by(() => {
		const name = String(settings.discordName);
		if (name === 'Title') return player.track.title;
		if (name === 'Artist') return player.track.artist;
		if (name === 'Artist - Title') return `${player.track.artist} - ${player.track.title}`;
		if (name === 'Provider') return accounts.current?.name ?? 'Sonora';
		if (name === 'Music') return 'music';
		return 'Sonora';
	});
</script>

<div class="preview" aria-hidden="true">
	{#if kind === 'now-playing'}
		<div class="stage" style:background={settings.ambient ? wash : 'var(--m-background)'}>
			<img class="cover" src={player.track.cover} alt="" />
			<div class="words">
				<span class="title">{player.track.title}</span>
				<span class="artist">{player.track.artist}</span>
			</div>
			{#if settings.visualizer !== 'Off'}
				<svg class="spectrum" viewBox="0 0 100 40" preserveAspectRatio="none">
					{#if settings.visualizer === 'Bars' || settings.visualizer === 'Bars and wave'}
						{#each levels as level, at (at)}
							<rect
								x={(at / BARS) * 100 + 0.6}
								y={40 - level * 34}
								width={100 / BARS - 1.2}
								height={level * 34}
								rx="0.6"
							/>
						{/each}
					{/if}
					{#if settings.visualizer === 'Wave' || settings.visualizer === 'Bars and wave'}
						<polyline points={wave} vector-effect="non-scaling-stroke" />
					{/if}
				</svg>
			{/if}
		</div>
	{:else if kind === 'lyrics'}
		<div class="sheet">
			{#each LINES as line, at (line)}
				<p
					class="line"
					class:now={at === 1}
					class:hazy={at !== 1 && settings.blurLyrics}
					style:font-size="{Math.round(17 * Number(settings.panelLyrics))}px"
				>
					{#if at === 1 && settings.karaoke}
						<span class="lit">Thinking it was</span> a trusty tree
					{:else}
						{line}
					{/if}
				</p>
			{/each}
		</div>
	{:else if kind === 'sound'}
		<div class="path">
			<span class="step"><Icon name="music" size={14} /> Vorbis · 44.1 kHz</span>
			<Icon name="chevron-right" size={12} />
			<span class="step"
				><Icon name="sliders-horizontal" size={14} />
				{settings.equalizer ? 'Equalizer' : 'Volume'}</span
			>
			<Icon name="chevron-right" size={12} />
			<span class="step"
				><Icon name="volume-2" size={14} />
				{settings.outputDevice} · {settings.sampleRate} kHz · {settings.buffer} frames</span
			>
			<div class="meter">
				{#each [0, 1] as side (side)}
					<span class="channel">
						<span
							class="level"
							style:width="{player.playing
								? 45 + 30 * Math.abs(Math.sin(tick * 0.6 + side)) * player.volume
								: 0}%"
						></span>
					</span>
				{/each}
			</div>
		</div>
	{:else}
		<div class="discord" class:off={!settings.discord}>
			<span class="eyebrow">Listening to {settings.discordAnonymous ? 'music' : status}</span>
			<div class="activity">
				<span class="art">
					{#if settings.discordAnonymous}
						<span class="blank"><Icon name="music" size={22} /></span>
					{:else}
						<img src={player.track.cover} alt="" />
					{/if}
					{#if settings.discordBadge}<span
							class="badge"
							style:background={accounts.current?.brand || '#fff'}
							><Icon name={accounts.current?.glyph ?? 'music'} size={12} /></span
						>{/if}
				</span>
				<span class="lines">
					<span class="strong">{settings.discordAnonymous ? 'Music' : player.track.title}</span>
					{#if !settings.discordAnonymous}
						<span>{player.track.artist}</span>
						<span class="faint">{player.playing ? '0:56 elapsed' : 'Paused'}</span>
					{/if}
				</span>
			</div>
			{#if settings.discordButtons && !settings.discordAnonymous}
				<div class="buttons">
					<span>Play on {accounts.current?.name ?? 'Sonora'}</span>
					<span>Get Sonora</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.preview {
		margin: 3.5px 0 21px;
		overflow: hidden;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: color-mix(in srgb, var(--m-secondary) 45%, transparent);
	}

	.stage {
		position: relative;
		display: flex;
		height: 150px;
		align-items: center;
		gap: 14px;
		padding: 0 21px;
		color: #fafafa;
		transition: background 320ms ease;
	}

	.cover {
		position: relative;
		z-index: 1;
		width: 84px;
		height: 84px;
		border-radius: 8px;
		object-fit: cover;
	}

	.words {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
	}

	.title {
		font-size: 17px;
		font-weight: 600;
	}

	.artist {
		font-size: 13px;
		color: rgb(255 255 255 / 0.62);
	}

	.spectrum {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 70px;
		fill: color-mix(in srgb, var(--m-primary) 45%, transparent);
		stroke: var(--m-primary);
		stroke-width: 1.5;
	}

	.spectrum rect {
		stroke: none;
	}

	.spectrum polyline {
		fill: none;
	}

	.sheet {
		padding: 14px 21px;
	}

	.line {
		margin: 0;
		padding: 3px 0;
		font-weight: 600;
		color: color-mix(in srgb, var(--m-muted-foreground) 60%, transparent);
		transition: filter 200ms ease;
	}

	.line.now {
		color: var(--m-muted-foreground);
	}

	.line.now:not(:has(.lit)) {
		color: var(--m-foreground);
	}

	.hazy {
		filter: blur(1.5px);
	}

	.lit {
		color: var(--m-foreground);
	}

	.path {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 7px;
		padding: 14px 17.5px;
		font-size: 12px;
		color: var(--m-muted-foreground);
	}

	.step {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3.5px 8px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		color: var(--m-foreground);
	}

	.meter {
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: 4px;
		margin-top: 7px;
	}

	.channel {
		height: 4px;
		border-radius: 2px;
		background: color-mix(in srgb, var(--m-muted-foreground) 25%, transparent);
	}

	.level {
		display: block;
		height: 100%;
		border-radius: 2px;
		background: var(--m-primary);
		transition: width 120ms linear;
	}

	.discord {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 14px;
		padding: 12px;
		border-radius: 8px;
		background: #232428;
		color: #dbdee1;
		font-size: 12px;
		transition: opacity 200ms ease;
	}

	.discord.off {
		opacity: 0.4;
	}

	.discord .eyebrow {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		color: #b5bac1;
	}

	.activity {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.art {
		position: relative;
		flex: none;
		width: 56px;
		height: 56px;
	}

	.art img,
	.blank {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		background: #313338;
		object-fit: cover;
	}

	.badge {
		position: absolute;
		right: -4px;
		bottom: -4px;
		display: flex;
		padding: 2px;
		border: 2px solid #232428;
		border-radius: 50%;
		background: #1db954;
		color: #000;
	}

	.lines {
		display: flex;
		min-width: 0;
		flex-direction: column;
	}

	.strong {
		font-weight: 600;
		color: #f2f3f5;
	}

	.faint {
		color: #949ba4;
	}

	.buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}

	.buttons span {
		padding: 5px;
		border-radius: 4px;
		background: #4e5058;
		text-align: center;
		color: #fff;
	}
</style>
