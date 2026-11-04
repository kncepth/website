<script lang="ts">
	import { menu } from '$lib/mock/menu.svelte';
	import MenuPanel from './MenuPanel.svelte';

	let { width: room, height: tall }: { width: number; height: number } = $props();

	const MARGIN = 8;
	const GAP = 4;

	const open = $derived(menu.open);
	const sheet = $derived(open?.build());

	let panel = $state<HTMLElement | null>(null);
	let size = $state({ width: 0, height: 0 });

	$effect(() => {
		void open;
		size = { width: 0, height: 0 };
	});

	$effect(() => {
		if (!panel) return;
		const watch = new ResizeObserver(() => {
			if (panel) size = { width: panel.offsetWidth, height: panel.offsetHeight };
		});
		watch.observe(panel);
		return () => watch.disconnect();
	});

	const place = $derived.by(() => {
		if (!open) return { left: 0, top: 0 };
		const width = size.width || (sheet?.width ?? 196);
		let left = open.align === 'end' ? open.x - width : open.x;
		left = Math.min(Math.max(left, MARGIN), room - width - MARGIN);
		const below = open.above ? open.y - GAP - size.height : open.y + GAP;
		const flipped = open.above ? open.y + open.span + GAP : open.y - open.span - GAP - size.height;
		let top = below;
		if (!open.above && below + size.height > tall - MARGIN && open.span) top = flipped;
		if (open.above && below < MARGIN && open.span) top = flipped;
		top = Math.min(Math.max(top, MARGIN), tall - size.height - MARGIN);
		return { left, top };
	});

	const flip = $derived(place.left + (size.width || 196) * 2 + 12 > room);

	function dismiss(event: Event) {
		event.preventDefault();
		menu.close();
	}
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && menu.close()} />

{#if open && sheet}
	<div
		class="shield"
		role="presentation"
		onmousedown={dismiss}
		oncontextmenu={dismiss}
		onwheel={() => menu.close()}
	></div>
	<div
		class="anchor"
		bind:this={panel}
		style:left="{place.left}px"
		style:top="{place.top}px"
		style:visibility={size.height ? 'visible' : 'hidden'}
	>
		<MenuPanel
			items={sheet.items}
			tiles={sheet.tiles}
			width={sheet.width}
			footer={sheet.footer}
			{flip}
		/>
	</div>
{/if}

<style>
	.shield {
		position: absolute;
		inset: 0;
		z-index: 40;
	}

	.anchor {
		position: absolute;
		z-index: 41;
	}
</style>
