<script lang="ts">
	/**
	 * The resize grip on a sidebar's inner edge, as the desktop's panel draws it: an unseen strip
	 * 12px wide over the border that drags the panel wider or narrower between its limits.
	 */
	let {
		side,
		width = $bindable(),
		min,
		max,
		label
	}: { side: 'left' | 'right'; width: number; min: number; max: number; label: string } = $props();

	const GRIP = 12;
	const STEP = 16;

	let held = $state(false);
	let origin = 0;
	let start = 0;
	let scale = 1;

	function grab(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement;
		const host = target.offsetParent as HTMLElement | null;
		scale = host ? host.getBoundingClientRect().width / host.offsetWidth || 1 : 1;
		held = true;
		origin = event.clientX;
		start = width;
		target.setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	function drag(event: PointerEvent) {
		if (!held) return;
		const travel = (event.clientX - origin) / scale;
		const next = side === 'left' ? start + travel : start - travel;
		width = Math.round(Math.min(Math.max(next, min), max));
	}

	function key(event: KeyboardEvent) {
		const grow = side === 'left' ? 'ArrowRight' : 'ArrowLeft';
		const shrink = side === 'left' ? 'ArrowLeft' : 'ArrowRight';
		if (event.key !== grow && event.key !== shrink) return;
		event.preventDefault();
		const next = width + (event.key === grow ? STEP : -STEP);
		width = Math.min(Math.max(next, min), max);
	}
</script>

<!-- a focusable separator is a widget that takes the arrow keys, which the lint does not know -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
	class="grip"
	class:held
	role="separator"
	tabindex="0"
	aria-orientation="vertical"
	aria-label={label}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={width}
	style:left={side === 'left' ? `${width - GRIP / 2}px` : undefined}
	style:right={side === 'right' ? `${width - GRIP / 2}px` : undefined}
	style:width="{GRIP}px"
	onpointerdown={grab}
	onpointermove={drag}
	onpointerup={() => (held = false)}
	onpointercancel={() => (held = false)}
	onkeydown={key}
></div>

<style>
	.grip {
		position: absolute;
		top: 0;
		bottom: 0;
		z-index: 4;
		cursor: col-resize;
		touch-action: none;
		outline: none;
	}

	.grip::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		width: 2px;
		transform: translateX(-50%);
		background: var(--m-border);
		opacity: 0;
		transition: opacity 140ms ease;
	}

	.grip:hover::after,
	.grip.held::after,
	.grip:focus-visible::after {
		opacity: 1;
	}
</style>
