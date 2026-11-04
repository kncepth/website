<script lang="ts" generics="T extends { id: string; label: string; detail?: string }">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		options,
		chosen,
		onpick,
		thumb,
		height = 72,
		variants = () => false,
		onvariants = undefined
	}: {
		options: T[];
		chosen: (option: T) => boolean;
		onpick: (option: T) => void;
		thumb: Snippet<[T]>;
		height?: number;
		/** Whether an option comes in variants, which its name opens behind a chevron. */
		variants?: (option: T) => boolean;
		onvariants?: (option: T, trigger: Element) => void;
	} = $props();
</script>

<div class="cards" role="radiogroup">
	{#each options as option (option.id)}
		<div class="card" class:chosen={chosen(option)}>
			<button
				type="button"
				class="thumb"
				role="radio"
				aria-checked={chosen(option)}
				aria-label={option.label}
				style:height="{height}px"
				onclick={() => onpick(option)}
			>
				{@render thumb(option)}
			</button>
			<button
				type="button"
				class="name"
				onclick={(event) => {
					if (variants(option) && onvariants) onvariants(option, event.currentTarget);
					else onpick(option);
				}}
			>
				<span>{option.label}</span>
				{#if variants(option)}<Icon name="chevron-down" size={12} />{/if}
			</button>
			{#if option.detail}<span class="detail">{option.detail}</span>{/if}
		</div>
	{/each}
</div>

<style>
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
		gap: 14px 10.5px;
		padding: 3.5px 0 10.5px;
	}

	.card {
		display: flex;
		min-width: 0;
		flex-direction: column;
		align-items: center;
		gap: 5.25px;
	}

	.thumb {
		position: relative;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 0;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: color-mix(in srgb, var(--m-secondary) 45%, transparent);
		color: var(--m-foreground);
		cursor: pointer;
		transition: background-color 140ms ease;
	}

	.thumb:hover {
		background: var(--m-secondary);
	}

	.chosen .thumb {
		outline: 2px solid var(--m-primary);
		outline-offset: 2px;
	}

	.name {
		display: inline-flex;
		max-width: 100%;
		align-items: center;
		gap: 4px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--m-muted-foreground);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}

	.name span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chosen .name {
		color: var(--m-foreground);
	}

	.detail {
		margin-top: -3px;
		font-size: 11px;
		color: var(--m-muted-foreground);
		white-space: nowrap;
	}
</style>
