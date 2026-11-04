<script lang="ts">
	import { shelf } from '$lib/mock/album';
	import { accounts } from '$lib/mock/accounts.svelte';
	import { player } from '$lib/mock/player.svelte';
	import { settings } from '$lib/mock/settings.svelte';
	import Logo from '../Logo.svelte';
	import { palette } from '$lib/mock/theme';
	import Ambient from './Ambient.svelte';
	import Icon from './Icon.svelte';
	import Visualizer from './Visualizer.svelte';

	let { kind }: { kind: 'now-playing' | 'lyrics' | 'sound' | 'discord' } = $props();

	/** The desktop's sample verses, the Japanese one sung with its romanization under it. */
	const SAMPLE = [
		'Arbitrary data',
		'Insert funny text right here',
		'ここに面白い文章を入れてください',
		'I hope this Japanese checks out',
		'The fifth line'
	];
	const ROMANIZED = 'koko ni omoshiroi bunshou o irete kudasai';

	const tint = $derived(shelf.get(player.track.album)?.tint);
	/** The visualizer's colour, the accent Now playing takes from the cover. */
	const accent = $derived(palette(tint, true, 'Dark')['--m-primary']);
	const wash = $derived(
		tint
			? `radial-gradient(120% 140% at 20% 20%, hsl(${tint.hue} 45% 32%), transparent 60%), radial-gradient(120% 140% at 90% 90%, hsl(${tint.second?.hue ?? tint.hue} 40% 26%), transparent 60%), #0b0b0b`
			: '#0b0b0b'
	);

	let tick = $state(0);
	$effect(() => {
		if (!player.playing) return;
		let frame = 0;
		const run = () => {
			tick += 0.25;
			frame = requestAnimationFrame(run);
		};
		frame = requestAnimationFrame(run);
		return () => cancelAnimationFrame(frame);
	});

	const album = $derived(shelf.get(player.track.album)?.title ?? '');
	/** The buttons under the status: the track on its service unless details are hidden, and
	 *  Sonora's own, in that order. */
	const buttons = $derived([
		...(settings.discordShown.includes('Provider') && !settings.discordAnonymous && accounts.current
			? [`Listen on ${accounts.current.name}`]
			: []),
		...(settings.discordShown.includes('Sonora') ? ['Get Sonora'] : [])
	]);

	/** Time the way Discord counts it, minutes and seconds both padded. */
	function discordClock(seconds: number) {
		const whole = Math.floor(seconds);
		const pad = (value: number) => String(value).padStart(2, '0');
		const hours = Math.floor(whole / 3600);
		return hours
			? `${pad(hours)}:${pad(Math.floor((whole % 3600) / 60))}:${pad(whole % 60)}`
			: `${pad(Math.floor(whole / 60))}:${pad(whole % 60)}`;
	}

	const status = $derived.by(() => {
		const name = String(settings.discordName);
		if (name === 'Title') return player.track.title;
		if (name === 'Artist') return player.track.artist;
		if (name === 'Artist - Title') return `${player.track.artist} - ${player.track.title}`;
		if (name === 'Provider') return accounts.current?.name ?? 'Sonora';
		if (name === 'Music') return 'Music';
		return 'Sonora';
	});
</script>

<div class="preview" aria-hidden="true">
	{#if kind === 'now-playing'}
		<!-- a frame of Now playing: the cover over its ambient field, with the visualizer the
		     page's style picks drawn from the same spectrum as the real one -->
		<div class="stage" class:plain={!settings.ambient}>
			{#if settings.ambient}<Ambient {tint} moving={settings.ambientMotion} />{/if}
			<img class="cover" src={player.track.cover} alt="" />
			<div class="words">
				<span class="title">{player.track.title}</span>
				<span class="artist">{player.track.artist}</span>
			</div>
			{#if settings.visualizer !== 'Off'}
				<Visualizer
					color={accent}
					style={String(settings.visualizer)}
					playing={player.playing}
					gain={settings.visualizerAbsolute ? 1 : player.volume}
					max={70}
				/>
			{/if}
		</div>
	{:else if kind === 'lyrics'}
		<div
			class="sheet"
			style:background={wash}
			style:font-size="{Math.round(30 * Number(settings.panelLyrics))}px"
		>
			<p class="line gone" class:hazy={settings.blurLyrics}>{SAMPLE[1]}</p>
			<div class="sung">
				<p class="line now" class:swept={settings.karaoke}>
					<span class="base">{SAMPLE[2]}</span>
					{#if settings.karaoke}<span class="lit" aria-hidden="true">{SAMPLE[2]}</span>{/if}
				</p>
				{#if settings.romanized}<p class="roman">{ROMANIZED}</p>{/if}
			</div>
			<p class="line next" class:hazy={settings.blurLyrics}>{SAMPLE[3]}</p>
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
		<div class="surface">
			<div
				class="discord"
				class:off={!settings.discord}
				role="group"
				aria-label="Discord status preview"
			>
				<span class="header">Listening to {status}</span>
				<div class="activity">
					<span class="art">
						{#if settings.discordAnonymous}
							<span class="app"><Logo size={68} /></span>
						{:else}
							<img src={player.track.cover} alt="" />
						{/if}
						{#if settings.discordBadge && accounts.current}
							<span class="badge" style:--brand={accounts.current.brand || '#5865f2'}>
								<span class="disc"><Icon name={accounts.current.glyph} size={16} /></span>
							</span>
						{/if}
					</span>
					<span class="lines">
						<span class="title"
							>{settings.discordAnonymous ? 'Listening to music' : player.track.title}</span
						>
						{#if !settings.discordAnonymous}
							<span class="text">{player.track.artist}</span>
							{#if album}<span class="text">{album}</span>{/if}
						{/if}
						{#if player.playing && settings.discordAnonymous}
							<span class="time lone">{discordClock(player.elapsed)} elapsed</span>
						{:else if player.playing}
							<span class="timing">
								<span class="time">{discordClock(player.elapsed)}</span>
								<span class="bar"><span style:width="{player.progress * 100}%"></span></span>
								<span class="time">{discordClock(player.track.length)}</span>
							</span>
						{/if}
					</span>
				</div>
				{#if buttons.length}
					<div class="buttons">
						{#each buttons as label (label)}<span class="button">{label}</span>{/each}
					</div>
				{/if}
			</div>
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
		overflow: hidden;
		background: #0b0b0b;
		color: #fafafa;
	}

	.stage.plain {
		background: var(--m-background);
		color: var(--m-foreground);
	}

	.stage.plain .artist {
		color: var(--m-muted-foreground);
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

	.sheet {
		position: relative;
		display: flex;
		aspect-ratio: 1 / 0.4;
		flex-direction: column;
		justify-content: center;
		gap: 0.3em;
		overflow: hidden;
		padding: 0 1.1em;
		color: #fafafa;
		transition: background 320ms ease;
	}

	.line,
	.roman {
		margin: 0;
		font-weight: 700;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gone,
	.next {
		font-size: 0.8em;
		color: rgb(255 255 255 / 0.32);
		transition: filter 200ms ease;
	}

	.hazy {
		filter: blur(2.5px);
	}

	.now {
		position: relative;
		white-space: normal;
		color: rgb(255 255 255 / 0.5);
	}

	.now:not(.swept) {
		color: #fff;
	}

	.lit {
		position: absolute;
		inset: 0;
		color: #fff;
		clip-path: inset(0 100% 0 0);
		animation: sweep 3.2s linear infinite;
	}

	@keyframes sweep {
		0% {
			clip-path: inset(0 100% 0 0);
		}
		80%,
		100% {
			clip-path: inset(0 0 0 0);
		}
	}

	.roman {
		font-size: 0.6em;
		font-weight: 600;
		color: rgb(255 255 255 / 0.6);
	}

	@media (prefers-reduced-motion: reduce) {
		.lit {
			animation: none;
			clip-path: inset(0 45% 0 0);
		}
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

	/* the card Discord shows for the status, in Discord's own colours and sizes */
	.surface {
		display: flex;
		justify-content: center;
		padding: 20px;
		background: var(--m-background);
	}

	.discord {
		display: flex;
		width: 372px;
		max-width: 100%;
		flex-direction: column;
		gap: 12px;
		padding: 12px;
		border-radius: 8px;
		background: #2b2d31;
		font-family: 'Inter', sans-serif;
		line-height: 1.3;
		transition: opacity 200ms ease;
	}

	.discord.off {
		opacity: 0.4;
	}

	.header {
		overflow: hidden;
		font-size: 14px;
		color: #dbdee1;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.activity {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.art {
		position: relative;
		flex: none;
		width: 120px;
		height: 120px;
	}

	.art img {
		width: 100%;
		height: 100%;
		border-radius: 8px;
		object-fit: cover;
	}

	.app {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border-radius: 8px;
		background: #fff;
	}

	.badge {
		position: absolute;
		right: -4px;
		bottom: -4px;
		display: flex;
		padding: 4px;
		border-radius: 50%;
		background: #2b2d31;
	}

	.disc {
		display: flex;
		width: 32px;
		height: 32px;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--brand);
		color: #fff;
	}

	.lines {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
	}

	.lines .title,
	.lines .text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.lines .title {
		font-size: 16px;
		font-weight: 600;
		color: #f2f3f5;
	}

	.lines .text {
		font-size: 14px;
		color: #dbdee1;
	}

	.timing {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 8px;
	}

	.time {
		flex: none;
		font-size: 14px;
		font-variant-numeric: tabular-nums;
		color: #949ba4;
	}

	.time.lone {
		margin-top: 4px;
	}

	.bar {
		flex: 1;
		height: 4px;
		overflow: hidden;
		border-radius: 2px;
		background: #4e5058;
	}

	.bar span {
		display: block;
		height: 100%;
		border-radius: 2px;
		background: #dbdee1;
	}

	.buttons {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.button {
		display: flex;
		height: 32px;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: #4e5058;
		font-size: 14px;
		font-weight: 500;
		color: #fff;
		cursor: default;
	}

	.button:hover {
		background: #6d6f78;
	}
</style>
