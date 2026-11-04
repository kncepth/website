<script lang="ts">
	import { player } from '$lib/mock/player.svelte';
	import Control from './Control.svelte';

	let { frosted = false }: { frosted?: boolean } = $props();

	/** How tall the slider stands, and how far around the button the pointer may stray. */
	const RISE = 132;
	const ZONE = 14;
	const LEAVE = 160;

	let over = $state(false);
	let held = $state(false);
	let restore = 0.7;
	let track = $state<HTMLElement | null>(null);
	let leave = 0;

	const open = $derived(over || held);
	const level = $derived(player.volume);
	const icon = $derived(level <= 0.001 ? 'volume-x' : level < 0.5 ? 'volume-1' : 'volume-2');

	function enter() {
		clearTimeout(leave);
		over = true;
	}

	function exit() {
		clearTimeout(leave);
		leave = setTimeout(() => (over = false), LEAVE);
	}

	function slide(event: PointerEvent) {
		if (!track) return;
		const rect = track.getBoundingClientRect();
		player.setVolume(Math.min(Math.max((rect.bottom - event.clientY) / rect.height, 0), 1));
	}

	function grab(event: PointerEvent) {
		held = true;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		slide(event);
	}

	function wheel(event: WheelEvent) {
		event.preventDefault();
		player.setVolume(Math.min(Math.max(level - Math.sign(event.deltaY) * 0.05, 0), 1));
	}
</script>

<div
	class="sound"
	role="group"
	style:--zone="{ZONE}px"
	onmouseenter={enter}
	onmouseleave={exit}
	onwheel={wheel}
>
	{#if open}
		<div class="panel" class:frosted aria-label="Volume">
			<div
				class="track"
				bind:this={track}
				style:height="{RISE}px"
				role="slider"
				tabindex="0"
				aria-label="Volume"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(level * 100)}
				onpointerdown={grab}
				onpointermove={(event) => held && slide(event)}
				onpointerup={() => (held = false)}
				onkeydown={(event) => {
					if (event.key === 'ArrowUp') player.setVolume(Math.min(level + 0.05, 1));
					if (event.key === 'ArrowDown') player.setVolume(Math.max(level - 0.05, 0));
				}}
			>
				<span class="fill" style:height="{level * 100}%"></span>
				<span class="thumb" style:bottom="{level * 100}%">
					<span class="bubble">{Math.round(level * 100)}%</span>
				</span>
			</div>
		</div>
	{/if}
	<Control
		{icon}
		title={level <= 0.001 ? 'Unmute' : 'Mute'}
		small
		tint={open ? '' : 'muted'}
		onclick={() => {
			if (level <= 0.001) player.setVolume(restore);
			else {
				restore = level;
				player.setVolume(0);
			}
		}}
	/>
</div>

<style>
	.sound {
		position: relative;
		display: flex;
		padding: var(--zone);
		margin: calc(var(--zone) * -1);
	}

	.panel {
		position: absolute;
		bottom: calc(100% - var(--zone) + 4px);
		left: 50%;
		display: flex;
		justify-content: center;
		padding: 7px 3.5px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: var(--m-popover);
		transform: translateX(-50%);
		animation: rise 250ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.panel.frosted {
		background: color-mix(in srgb, var(--m-popover) 55%, transparent);
		backdrop-filter: blur(24px);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(4px) scale(0.98);
			filter: blur(1.5px);
		}
	}

	.track {
		position: relative;
		width: 26px;
		cursor: pointer;
		touch-action: none;
	}

	.track::before,
	.fill {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 0;
		width: 4px;
		border-radius: 2px;
		transform: translateX(-50%);
	}

	.track::before {
		top: 0;
		background: color-mix(in srgb, var(--m-muted-foreground) 30%, transparent);
	}

	.fill {
		background: var(--m-progress-bar, var(--m-foreground));
	}

	.thumb {
		position: absolute;
		left: 50%;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--m-foreground);
		transform: translate(-50%, 50%);
	}

	.bubble {
		position: absolute;
		top: 50%;
		left: calc(100% + 18px);
		padding: 1px 6px;
		border-radius: 4px;
		background: var(--m-popover);
		border: 1px solid var(--m-border);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		color: var(--m-popover-foreground);
		transform: translateY(-50%);
		white-space: nowrap;
	}

	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}
	}
</style>
