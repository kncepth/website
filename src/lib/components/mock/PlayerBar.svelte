<script lang="ts">
	import { clock } from '$lib/mock/album';
	import { player } from '$lib/mock/player.svelte';
	import { settings } from '$lib/mock/settings.svelte';
	import Control from './Control.svelte';
	import Cover from './Cover.svelte';
	import Like from './Like.svelte';
	import Scrubber from './Scrubber.svelte';
	import Sessions from './Sessions.svelte';

	let { tab = $bindable(), onfullscreen }: { tab: string; onfullscreen?: () => void } = $props();

	const level = $derived(
		player.volume <= 0.0001
			? 'volume-x'
			: player.volume < 0.25
				? 'volume'
				: player.volume < 0.5
					? 'volume-1'
					: 'volume-2'
	);
</script>

<div class="bar">
	<div class="now">
		<Cover src={player.track.cover} size={42} />
		<span class="text">
			<span class="line">
				<span class="title">{player.track.title}</span>
				<Like id={player.id} small />
			</span>
			<span class="caption">{player.track.artist}</span>
		</span>
	</div>

	<div class="center">
		<div class="transport">
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
				small
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
	</div>

	<div class="side">
		<div class="tabs">
			<Sessions onmembers={() => (tab = 'members')} />
			<Control
				icon="mic-vocal"
				title="Lyrics"
				small
				tint={tab === 'lyrics' ? '' : 'muted'}
				selected={tab === 'lyrics'}
				onclick={() => (tab = 'lyrics')}
			/>
			<Control
				icon="list-music"
				title="Queue"
				small
				tint={tab === 'queue' ? '' : 'muted'}
				selected={tab === 'queue'}
				onclick={() => (tab = 'queue')}
			/>
			{#if settings.sleep}
				<Control icon="moon" title="Sleep timer" small tint="muted" />
			{/if}
		</div>

		<div class="sound">
			<Control icon={level} title="Volume" small tint="muted" />
			<div class="volume">
				<Scrubber
					fraction={player.volume}
					label="Volume"
					onseek={(to: number) => player.setVolume(to)}
				/>
			</div>
		</div>

		<Control icon="maximize" title="Fullscreen" small onclick={onfullscreen} />
	</div>
</div>

<style>
	.bar {
		display: flex;
		flex: none;
		align-items: center;
		gap: 14px;
		height: 76px;
		padding: 0 17.5px;
		background: var(--m-secondary);
		border-top: 1px solid var(--m-border);
	}

	.now {
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: center;
		gap: 10.5px;
	}

	.text {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		justify-content: center;
	}

	.line {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 3.5px;
	}

	.title,
	.caption {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.caption {
		font-size: 12px;
		color: var(--m-muted-foreground);
	}

	.center {
		display: flex;
		flex: 1;
		min-width: 0;
		max-width: 560px;
		flex-direction: column;
		align-items: center;
		gap: 3.5px;
	}

	.transport {
		display: flex;
		align-items: center;
		gap: 7px;
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
		font-variant-numeric: tabular-nums;
		flex: none;
		width: 37.4px;
		font-size: 11px;
		color: var(--m-muted-foreground);
		white-space: nowrap;
	}

	.end {
		text-align: right;
	}

	.side {
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: center;
		justify-content: flex-end;
		gap: 7px;
	}

	.tabs,
	.sound {
		display: flex;
		flex: none;
		align-items: center;
		gap: 3.5px;
	}

	.volume {
		width: 110px;
		flex: none;
	}
</style>
