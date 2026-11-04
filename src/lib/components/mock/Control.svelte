<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		icon = '',
		label = '',
		title = '',
		variant = 'ghost',
		small = false,
		tint = '',
		selected = false,
		disabled = false,
		size = 0,
		trailing = '',
		wide = false,
		onclick = undefined
	}: {
		icon?: string;
		label?: string;
		title?: string;
		variant?: string;
		small?: boolean;
		tint?: string;
		selected?: boolean;
		disabled?: boolean;
		size?: number;
		trailing?: string;
		wide?: boolean;
		onclick?: (event: MouseEvent) => void;
	} = $props();
</script>

<button
	type="button"
	class="{variant} {tint}"
	class:small
	class:selected
	class:squared={!label}
	class:wide
	style:width={size ? `${size}px` : undefined}
	style:padding={size ? '0' : undefined}
	aria-label={title}
	aria-pressed={selected || undefined}
	{disabled}
	{onclick}
>
	{#if icon}<Icon name={icon} />{/if}
	{#if label}<span>{label}</span>{/if}
	{#if trailing}<Icon name={trailing} />{/if}
</button>

<style>
	button {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		gap: 6px;
		height: 32px;
		padding: 0 12px;
		border: 0;
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-foreground);
		font: inherit;
		cursor: pointer;
	}

	.small {
		height: 26px;
		gap: 4px;
		padding: 0 8px;
		font-size: 13px;
	}

	.squared {
		width: 40px;
	}

	.wide {
		min-width: 96px;
	}

	.small.squared {
		width: 32px;
	}

	.muted {
		color: var(--m-muted-foreground);
	}

	.primary {
		color: var(--m-primary);
	}

	button:disabled {
		color: color-mix(in srgb, var(--m-muted-foreground) 55%, transparent);
		cursor: default;
	}

	.ghost:hover:not(:disabled),
	.outline:hover:not(:disabled) {
		background: var(--m-secondary-hover);
	}

	.ghost:active:not(:disabled),
	.outline:active:not(:disabled) {
		background: var(--m-secondary-active);
	}

	.selected {
		background: var(--m-secondary-active);
	}

	.outline {
		border: 1px solid var(--m-border);
	}

	.filled {
		background: var(--m-primary);
		color: var(--m-primary-foreground);
	}

	.filled:hover {
		background: var(--m-primary-hover);
	}
</style>
