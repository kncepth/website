<script lang="ts">
	import { initial, type Person } from '$lib/mock/together.svelte';

	let {
		person,
		size = 26,
		ring = false
	}: { person: Person; size?: number; ring?: boolean } = $props();
</script>

<span
	class="face"
	class:ring
	style:width="{size}px"
	style:height="{size}px"
	style:font-size="{Math.round(size * 0.44)}px"
	style:--hue={person.hue}
	aria-hidden="true">{initial(person)}</span
>

<style>
	.face {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: hsl(var(--hue) 45% 46%);
		color: #fff;
		font-weight: 600;
		line-height: 1;
	}

	.ring {
		box-shadow: 0 0 0 1.5px var(--m-popover);
	}
</style>
