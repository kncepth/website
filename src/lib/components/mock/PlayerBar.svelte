<script lang="ts">
	import { clock } from '$lib/mock/album';
	import { accounts } from '$lib/mock/accounts.svelte';
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

{#snippet transport()}
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
{/snippet}

{#snippet seek()}
	<div class="seek">
		<span class="clock end">{clock(player.elapsed)}</span>
		<div class="rail">
			<Scrubber fraction={player.progress} label="Seek" onseek={(to: number) => player.seek(to)} />
		</div>
		<span class="clock">{clock(player.track.length)}</span>
	</div>
{/snippet}

{#snippet now(centered: boolean)}
	<span class="text" class:centered>
		<span class="line">
			<span class="title">{player.track.title}</span>
			<Like id={player.id} small />
		</span>
		<span class="caption">{player.track.artist}</span>
	</span>
{/snippet}

{#snippet side()}
	<div class="tabs">
		{#if settings.sessionsButton && accounts.active}
			<Sessions onmembers={() => (tab = 'members')} />
		{/if}
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

	<Control icon="maximize" title="Now playing" small onclick={onfullscreen} />
{/snippet}

<div class="bar {settings.playerBar.toLowerCase()}" class:frosted={settings.playerBarTransparent}>
	{#if settings.playerBar === 'Centered'}
		<div class="wing">
			<Cover src={player.track.cover} size={58} />
			{@render transport()}
		</div>
		<div class="middle">
			{@render now(true)}
			{@render seek()}
		</div>
		<div class="wing end">{@render side()}</div>
	{:else if settings.playerBar === 'Compact'}
		<div class="now compact">
			<Cover src={player.track.cover} size={32} />
			{@render now(false)}
		</div>
		{@render transport()}
		<div class="stretch">{@render seek()}</div>
		{@render side()}
	{:else}
		<div class="now">
			<Cover src={player.track.cover} size={42} />
			{@render now(false)}
		</div>
		<div class="center">
			{@render transport()}
			{@render seek()}
		</div>
		<div class="right">{@render side()}</div>
	{/if}
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

	.right {
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: center;
		justify-content: flex-end;
		gap: 7px;
	}

	.frosted {
		background: color-mix(in srgb, var(--m-secondary) 72%, transparent);
		backdrop-filter: blur(24px) saturate(1.4);
	}

	.bar.compact {
		height: 52px;
		gap: 10.5px;
	}

	.now.compact {
		flex: 0 1 224px;
	}

	.stretch {
		flex: 1;
		min-width: 0;
	}

	.text.centered {
		align-items: center;
		text-align: center;
	}

	.text.centered .line {
		justify-content: center;
	}

	.bar.centered {
		gap: 10.5px;
		padding-top: 8px;
		padding-bottom: 8px;
	}

	.wing {
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: center;
		gap: 10.5px;
	}

	.wing.end {
		justify-content: flex-end;
		gap: 7px;
	}

	.middle {
		display: flex;
		flex: 1;
		min-width: 0;
		max-width: 420px;
		flex-direction: column;
		justify-content: center;
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
