<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title = '',
		detail = '',
		width = 336,
		ondismiss,
		body,
		actions
	}: {
		title?: string;
		detail?: string;
		width?: number;
		ondismiss?: () => void;
		body?: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<div class="scrim">
	<button type="button" class="shield" aria-label="Dismiss" onclick={() => ondismiss?.()}></button>
	<div class="panel" style:width="{width}px">
		<div class="head">
			<span class="title">{title}</span>
			{#if detail}<span class="detail">{detail}</span>{/if}
		</div>
		{#if body}
			<div class="body">{@render body()}</div>
		{/if}
		{#if actions}
			<div class="actions">{@render actions()}</div>
		{/if}
	</div>
</div>

<style>
	.scrim {
		position: absolute;
		inset: 0;
		/* over a page's floating header, under the menus a dialog may open */
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.shield {
		position: absolute;
		inset: 0;
		border: 0;
		padding: 0;
		background: color-mix(in srgb, var(--m-background) 80%, transparent);
		cursor: default;
	}

	.panel {
		position: relative;
		display: flex;
		max-width: 100%;
		max-height: 100%;
		flex-direction: column;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: var(--m-popover);
		box-shadow:
			0 4px 6px -1px hsl(0 0% 0% / 0.1),
			0 2px 4px -2px hsl(0 0% 0% / 0.1);
		overflow: hidden;
		animation: rise 250ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.head {
		display: flex;
		flex: none;
		flex-direction: column;
		gap: 3.5px;
		padding: 16px 16px 8px;
	}

	.title {
		font-size: 19px;
		font-weight: 600;
	}

	.detail {
		font-size: 12px;
		color: var(--m-muted-foreground);
	}

	.body {
		display: flex;
		flex: 1;
		min-height: 0;
		flex-direction: column;
		gap: 8px;
		padding: 8px 16px;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--m-muted-foreground) 45%, transparent) transparent;
		color: var(--m-muted-foreground);
	}

	.actions {
		display: flex;
		flex: none;
		justify-content: flex-end;
		gap: 7px;
		padding: 8px 16px 16px;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: scale(0.99);
			filter: blur(1.5px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}
	}
</style>
