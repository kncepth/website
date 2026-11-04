<script lang="ts">
	let {
		value = '',
		length = 6,
		group = 3,
		active = -1
	}: { value?: string; length?: number; group?: number; active?: number } = $props();

	const groups = $derived(
		Array.from({ length: Math.ceil(length / group) }, (_, at) =>
			Array.from({ length: Math.min(group, length - at * group) }, (_, step) => at * group + step)
		)
	);
</script>

<div class="slots" aria-label={value.split('').join(' ')}>
	{#each groups as places, at (at)}
		{#if at}<span class="dash"></span>{/if}
		<span class="group">
			{#each places as place (place)}
				<span class="slot" class:active={place === active}>
					{value[place] ?? ''}
					{#if place === active}<span class="caret"></span>{/if}
				</span>
			{/each}
		</span>
	{/each}
</div>

<style>
	.slots {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.group {
		display: flex;
	}

	.slot {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 52px;
		height: 52px;
		border: 1px solid var(--m-border);
		border-left: 0;
		background: var(--m-secondary);
		color: var(--m-foreground);
		font-size: 19px;
		font-variant-numeric: tabular-nums;
	}

	.slot:first-child {
		border-left: 1px solid var(--m-border);
		border-radius: var(--m-radius) 0 0 var(--m-radius);
	}

	.slot:last-child {
		border-radius: 0 var(--m-radius) var(--m-radius) 0;
	}

	.slot.active {
		box-shadow: inset 0 0 0 2px var(--m-muted-foreground);
	}

	.caret {
		width: 1.5px;
		height: 20px;
		background: var(--m-foreground);
		animation: blink 1s steps(1) infinite;
	}

	.dash {
		width: 8px;
		height: 2px;
		border-radius: 1px;
		background: var(--m-border);
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
