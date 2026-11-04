<script lang="ts">
	import type { Snippet } from 'svelte';
	import Cover from './Cover.svelte';
	import Icon from './Icon.svelte';

	let {
		title = '',
		eyebrow = '',
		meta = '',
		trailing = '',
		cover = '',
		fallback = 'music',
		accent = false,
		circle = false,
		tile = 0,
		art = 0,
		size = 14,
		weight = 400,
		tint = '',
		flat = false,
		filled = false,
		surface = false,
		playing = false,
		underline = false,
		onplay = undefined,
		onpress = undefined,
		oncontext = undefined,
		action = undefined
	}: {
		title?: string;
		eyebrow?: string;
		meta?: string;
		trailing?: string;
		cover?: string;
		fallback?: string;
		accent?: boolean;
		circle?: boolean;
		tile?: number;
		art?: number;
		size?: number;
		weight?: number;
		tint?: string;
		flat?: boolean;
		filled?: boolean;
		surface?: boolean;
		playing?: boolean;
		underline?: boolean;
		onplay?: (event: Event) => void;
		onpress?: (event: Event) => void;
		oncontext?: (event: MouseEvent) => void;
		action?: Snippet;
	} = $props();

	const ROW = 52;
	const PAD = 8;
	const listed = $derived(!art && !tile);
	const edge = $derived(tile || art || ROW - PAD * 2);
	const radius = $derived(circle ? '50%' : tile ? 'var(--m-radius)' : 'min(var(--m-radius), 4px)');
	const knob = $derived(Math.min(Math.max(Math.round(edge * 0.24), 20), 40));
	const glyph = $derived(Math.max(Math.round(edge * 0.45), 14));
</script>

<div
	class="card"
	class:tile={!!tile}
	class:listed
	class:flat
	class:filled
	class:surface
	style:width={tile ? `${tile}px` : undefined}
	role="button"
	tabindex="0"
	onclick={onpress}
	oncontextmenu={oncontext}
	onkeydown={(event) => {
		if (!onpress) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onpress(event);
		}
	}}
>
	<span class="art" style:width="{edge}px" style:height="{edge}px">
		<Cover src={cover} size={edge} {radius} {fallback} {circle} {accent} />
		{#if onplay}
			{#if tile}
				<button
					type="button"
					class="knob"
					class:shown={playing}
					style:width="{knob}px"
					style:height="{knob}px"
					aria-label={playing ? 'Pause' : 'Play'}
					onclick={(event) => {
						event.stopPropagation();
						onplay(event);
					}}
				>
					<Icon name={playing ? 'pause-filled' : 'play-filled'} size={Math.round(knob * 0.5)} />
				</button>
			{:else}
				<button
					type="button"
					class="scrim"
					class:shown={playing}
					style:border-radius={radius}
					aria-label={playing ? 'Pause' : 'Play'}
					onclick={(event) => {
						event.stopPropagation();
						onplay(event);
					}}
				>
					<Icon name={playing ? 'pause-filled' : 'play-filled'} size={glyph} />
				</button>
			{/if}
		{/if}
	</span>

	<span class="text" class:eyebrowed={!!eyebrow}>
		{#if eyebrow}
			<span class="eyebrow">{eyebrow}</span>
		{/if}
		<span class="stack">
			<span
				class="title"
				class:underline
				style:font-size="{size}px"
				style:font-weight={weight}
				style:color={tint || undefined}>{title}</span
			>
			{#if meta}<span class="meta">{meta}</span>{/if}
		</span>
	</span>

	{#if trailing}<span class="trailing">{trailing}</span>{/if}
	{#if action}<span class="action">{@render action()}</span>{/if}
</div>

<style>
	.card {
		display: flex;
		align-items: center;
		gap: 10.5px;
		min-width: 0;
		padding: 0 8px;
		border-radius: var(--m-radius);
		cursor: pointer;
	}

	.card.listed {
		flex: none;
		width: 100%;
		height: 52px;
		padding: 8px;
	}

	.card.tile {
		flex: none;
		flex-direction: column;
		align-items: stretch;
		gap: 7px;
		padding: 0;
	}

	.card:not(.flat):hover {
		background: var(--m-table-hover);
	}

	.card.surface {
		background: var(--m-secondary);
	}

	.card.filled {
		background: var(--m-secondary);
		gap: 14px;
		padding: 10.5px;
	}

	.art {
		position: relative;
		display: flex;
		flex: none;
	}

	.knob,
	.scrim {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		visibility: hidden;
		cursor: pointer;
	}

	.knob {
		right: 8px;
		bottom: 8px;
		border-radius: 50%;
		background: var(--m-primary);
		color: var(--m-primary-foreground);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
	}

	.scrim {
		inset: 0;
		background: light-dark(rgb(0 0 0 / 0.549), rgb(0 0 0 / 0.549));
		color: #fafafa;
	}

	.card:hover .knob,
	.card:hover .scrim,
	.knob.shown,
	.scrim.shown {
		visibility: visible;
	}

	.text {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 2px;
		overflow: hidden;
		line-height: 1.25;
	}

	.card.tile .text {
		width: 100%;
		flex: none;
	}

	.card.tile .text.eyebrowed {
		gap: 3.5px;
	}

	.stack {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 2px;
	}

	.eyebrow {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--m-muted-foreground);
	}

	.title,
	.meta {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card:hover .title.underline {
		text-decoration: underline;
	}

	.meta {
		font-size: 12px;
		color: var(--m-muted-foreground);
	}

	.action {
		display: flex;
		flex: none;
		visibility: hidden;
	}

	.card:hover .action {
		visibility: visible;
	}

	.trailing {
		flex: none;
		font-size: 12px;
		color: var(--m-muted-foreground);
	}
</style>
