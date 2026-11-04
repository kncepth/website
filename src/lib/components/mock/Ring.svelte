<script lang="ts">
	let {
		done = null,
		size = 16,
		failed = false
	}: { done?: number | null; size?: number; failed?: boolean } = $props();

	const RADIUS = 9;
	const ROUND = 2 * Math.PI * RADIUS;
</script>

<svg
	class="ring"
	class:turning={done === null}
	class:failed
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2.4"
	stroke-linecap="round"
	aria-hidden="true"
>
	<circle class="track" cx="12" cy="12" r={RADIUS} />
	<circle
		class="fill"
		cx="12"
		cy="12"
		r={RADIUS}
		stroke-dasharray={ROUND}
		stroke-dashoffset={ROUND * (1 - (done ?? 0.25))}
		transform="rotate(-90 12 12)"
	/>
	<path d="M12 8v7m-3-3 3 3 3-3" stroke-width="2" stroke-linejoin="round" />
</svg>

<style>
	.ring {
		flex: none;
		color: var(--m-primary);
	}

	.failed {
		color: #e5484d;
	}

	.track {
		opacity: 0.25;
	}

	.fill {
		transition: stroke-dashoffset 300ms ease;
	}

	.turning .fill {
		transform-origin: 12px 12px;
		animation: turn 1s linear infinite;
	}

	@keyframes turn {
		to {
			transform: rotate(270deg);
		}
	}
</style>
