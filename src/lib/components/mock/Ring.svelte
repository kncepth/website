<script lang="ts">
	/**
	 * The desktop's `ArrowRing`: a down arrow in a ring that fills clockwise from the top, and
	 * closes into Lucide's `circle-arrow-down` when done. With the amount unknown a short arc
	 * turns. With `backdrop` the whole circle is filled behind the arrow, the empty part of the
	 * ring is left out, and the filled part fades once the work is done, leaving the disc alone.
	 */
	let {
		done = null,
		size = 16,
		failed = false,
		backdrop = false
	}: { done?: number | null; size?: number; failed?: boolean; backdrop?: boolean } = $props();

	const RADIUS = 10;
	const ROUND = 2 * Math.PI * RADIUS;
	/** How much of the ring turns while the amount done is unknown. */
	const SWEEP = 0.25;

	const closed = $derived(done !== null && done >= 1);
</script>

<svg
	class="ring"
	class:turning={done === null}
	class:failed
	class:backdrop
	class:closed
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if backdrop}
		<circle class="disc" cx="12" cy="12" r="12" />
	{:else}
		<circle class="track" cx="12" cy="12" r={RADIUS} />
	{/if}
	<circle
		class="fill"
		cx="12"
		cy="12"
		r={RADIUS}
		stroke-dasharray={ROUND}
		stroke-dashoffset={ROUND * (1 - Math.min(Math.max(done ?? SWEEP, 0), 1))}
		transform="rotate(-90 12 12)"
	/>
	<path class="arrow" d="M12 8v8m-4-4 4 4 4-4" />
</svg>

<style>
	.ring {
		flex: none;
		color: var(--m-primary);
	}

	.track {
		stroke: currentColor;
		opacity: 0.3;
	}

	.fill {
		stroke: currentColor;
		transition:
			stroke-dashoffset 220ms ease,
			opacity 300ms ease;
	}

	.arrow {
		stroke: currentColor;
	}

	.disc {
		fill: var(--m-muted);
		stroke: none;
	}

	.backdrop .arrow {
		stroke: var(--m-muted-foreground);
	}

	.backdrop.closed .fill {
		opacity: 0;
	}

	.failed .arrow {
		stroke: var(--m-danger);
	}

	.failed .fill {
		stroke: var(--m-danger);
	}

	.turning .fill {
		transform-origin: 12px 12px;
		animation: turn 900ms linear infinite;
	}

	@keyframes turn {
		to {
			transform: rotate(270deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.turning .fill {
			animation: none;
		}
	}
</style>
