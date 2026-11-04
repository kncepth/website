<script lang="ts">
	import { filled, icons, shared, solid } from '$lib/mock/icons';
	import { glyphs } from '$lib/mock/packs.svelte';
	import { settings } from '$lib/mock/settings.svelte';

	let { name, size = 16, pack = '' }: { name: string; size?: number; pack?: string } = $props();

	const picked = $derived(shared.has(name) ? undefined : glyphs(pack || settings.icons)?.get(name));
	const markup = $derived(picked ?? icons.get(name) ?? '');
	const painted = $derived(!picked && (filled.has(name) || solid.has(name)));
	const drawn = $derived(!picked && !solid.has(name));
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={painted ? 'currentColor' : 'none'}
	stroke={drawn ? 'currentColor' : 'none'}
	stroke-width={drawn ? 2 : undefined}
	stroke-linecap={drawn ? 'round' : undefined}
	stroke-linejoin={drawn ? 'round' : undefined}
	aria-hidden="true">{@html markup}</svg
>

<style>
	svg {
		flex: none;
	}
</style>
