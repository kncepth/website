<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		value = '',
		options = [],
		width = 190,
		start = false,
		onpick = undefined
	}: {
		value?: string;
		options?: string[];
		width?: number;
		/** Opens the menu from the left edge, for a picker at the start of its row. */
		start?: boolean;
		onpick?: (value: string) => void;
	} = $props();

	let open = $state(false);
</script>

<div class="picker">
	<button type="button" class="face" onclick={() => (open = !open)} aria-expanded={open}>
		<span class="label">{value}</span>
		<Icon name="chevron-down" />
	</button>

	{#if open}
		<div class="menu" class:start style:width="{width}px">
			{#each options as option (option)}
				<button
					type="button"
					class="item"
					class:chosen={option === value}
					onclick={() => {
						onpick?.(option);
						open = false;
					}}
				>
					<span class="text">{option}</span>
					{#if option === value}<span class="tick">✓</span>{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.picker {
		position: relative;
		display: flex;
		flex: none;
	}

	.face {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 26px;
		padding: 0 8px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-foreground);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}

	.face:hover {
		background: var(--m-secondary-hover);
	}

	.menu {
		position: absolute;
		top: 30px;
		right: 0;
		z-index: 5;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 3.5px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		max-height: 300px;
		overflow-y: auto;
		scrollbar-width: thin;
		background: var(--m-popover);
		color: var(--m-popover-foreground);
		animation: rise 250ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: scale(0.99);
			filter: blur(1.5px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.menu {
			animation: none;
		}
	}

	.menu.start {
		right: auto;
		left: 0;
	}

	.item {
		display: flex;
		width: 100%;
		min-width: 0;
		align-items: center;
		justify-content: space-between;
		gap: 7px;
		padding: 3.5px 10.5px;
		border: 0;
		border-radius: 5.5px;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.item:hover {
		background: var(--m-secondary-hover);
	}

	.item.chosen {
		background: var(--m-secondary-active);
	}

	.text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tick {
		flex: none;
	}
</style>
