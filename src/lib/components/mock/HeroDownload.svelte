<script lang="ts">
	import { downloads, type Job } from '$lib/mock/downloads.svelte';
	import Icon from './Icon.svelte';
	import Ring from './Ring.svelte';

	let { job, ids }: { job: Omit<Job, 'left'>; ids: string[] } = $props();

	const state = $derived(downloads.holds(ids));
	const share = $derived(
		ids.reduce((sum, id) => sum + (downloads.of(id) ?? 0), 0) / Math.max(ids.length, 1)
	);
	const title = $derived(
		state === null ? 'Downloading. Click to stop' : state ? 'Remove download' : 'Download'
	);
</script>

<button
	type="button"
	class="download"
	{title}
	aria-label={title}
	onclick={() => downloads.toggle(job, ids)}
>
	{#if state === false}
		<Icon name="download" />
	{:else}
		<Ring done={share} />
	{/if}
</button>

<style>
	.download {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 32px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-foreground);
		cursor: pointer;
	}

	.download:hover {
		background: var(--m-secondary-hover);
	}
</style>
