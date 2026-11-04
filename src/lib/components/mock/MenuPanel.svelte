<script lang="ts">
	import { menu, type Item, type Tile } from '$lib/mock/menu.svelte';
	import Face from './Face.svelte';
	import Icon from './Icon.svelte';
	import MenuPanel from './MenuPanel.svelte';
	import Ring from './Ring.svelte';

	let {
		items,
		tiles = [],
		width = 196,
		flip = false,
		footer = []
	}: {
		items: Item[];
		tiles?: Tile[];
		width?: number;
		flip?: boolean;
		footer?: string[];
	} = $props();

	let hovered = $state('');
	let leave = 0;

	function enter(item: Item) {
		clearTimeout(leave);
		hovered = item.id;
	}

	function exit() {
		clearTimeout(leave);
		leave = setTimeout(() => (hovered = ''), 160);
	}

	function pick(item: Item) {
		if (item.disabled || item.submenu) return;
		item.onclick?.();
		if (!item.stays) menu.close();
	}
</script>

<div class="panel" role="menu" style:width="{width}px">
	{#if tiles.length}
		<div class="tiles">
			{#each tiles as tile (tile.id)}
				<button
					type="button"
					class="tile"
					class:active={tile.active}
					title={tile.title}
					aria-label={tile.title}
					aria-pressed={tile.active}
					disabled={!tile.onclick}
					onclick={() => tile.onclick?.()}
				>
					{#if tile.ring !== undefined}
						<Ring done={tile.ring} />
					{:else}
						<Icon name={tile.icon} />
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	{#each items as item (item.id)}
		{#if item.separator}
			<span class="separator"></span>
		{:else}
			<div
				class="row"
				class:selected={item.selected || hovered === item.id}
				class:disabled={item.disabled}
				class:heading={item.heading}
				role="menuitem"
				tabindex="-1"
				aria-disabled={item.disabled}
				aria-haspopup={item.submenu ? 'menu' : undefined}
				aria-expanded={item.submenu ? hovered === item.id : undefined}
				onmouseenter={() => enter(item)}
				onmouseleave={exit}
				onclick={() => pick(item)}
				onkeydown={(event) => event.key === 'Enter' && pick(item)}
			>
				<span class="main">
					{#if item.cover}
						<img class="cover" class:round={item.round} src={item.cover} alt="" />
					{:else if item.icon}
						<Icon name={item.icon} size={14} />
					{/if}
					<span class="text">
						<span class="label">{item.label}</span>
						{#if item.detail}<span class="detail">{item.detail}</span>{/if}
					</span>
				</span>
				{#if item.faces?.length}
					<span class="faces">
						{#each item.faces as person (person.id)}<Face {person} size={18} ring />{/each}
					</span>
				{/if}
				{#if item.action}
					{@const action = item.action}
					<button
						type="button"
						class="action"
						title={action.title}
						aria-label={action.title}
						onclick={(event) => {
							event.stopPropagation();
							action.onclick();
						}}><Icon name={action.icon} size={14} /></button
					>
				{/if}
				{#if item.selected || item.checked}<span class="mark">✓</span>{/if}
				{#if item.submenu}<span class="mark">›</span>{/if}

				{#if item.submenu && hovered === item.id}
					<div class="nested" class:flip>
						<MenuPanel items={item.submenu} width={item.width ?? 200} {flip} />
					</div>
				{/if}
			</div>
		{/if}
	{/each}

	{#if footer.length}
		<div class="footer">
			{#each footer as note (note)}<span>{note}</span>{/each}
		</div>
	{/if}
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 3.5px;
		padding: 3.5px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: var(--m-popover);
		color: var(--m-popover-foreground);
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		font-size: 14px;
		line-height: 1.25;
		animation: rise 250ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: scale(0.99);
			filter: blur(1.5px);
		}
	}

	.tiles {
		display: flex;
		gap: 3.5px;
	}

	.tile {
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: center;
		justify-content: center;
		height: 32px;
		border: 0;
		border-radius: max(calc(var(--m-radius) - 3.5px), 0px);
		background: none;
		color: var(--m-popover-foreground);
		cursor: pointer;
	}

	.tile:hover:not(:disabled) {
		background: var(--m-secondary-hover);
	}

	.tile.active {
		background: var(--m-secondary-active);
		color: var(--m-primary);
	}

	.tile:disabled {
		color: var(--m-muted-foreground);
		cursor: default;
	}

	.separator {
		height: 1px;
		margin: 3.5px 7px;
		background: var(--m-border);
	}

	.row {
		position: relative;
		display: flex;
		min-width: 0;
		align-items: center;
		justify-content: space-between;
		gap: 10.5px;
		padding: 3.5px 10.5px;
		border-radius: max(calc(var(--m-radius) - 3.5px), 0px);
		cursor: pointer;
		white-space: nowrap;
	}

	.row.selected:not(.disabled) {
		background: var(--m-secondary-hover);
	}

	.row.disabled {
		color: var(--m-muted-foreground);
		cursor: default;
	}

	.main {
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: center;
		gap: 7px;
	}

	.text {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 3.5px;
	}

	.label,
	.detail {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.detail {
		font-size: 12px;
		white-space: normal;
		color: var(--m-muted-foreground);
	}

	.cover {
		flex: none;
		width: 20px;
		height: 20px;
		border-radius: 3px;
		object-fit: cover;
	}

	.cover.round {
		border-radius: 50%;
	}

	.faces {
		display: flex;
		flex: none;
	}

	.faces > :global(* + *) {
		margin-left: -5px;
	}

	.mark {
		flex: none;
	}

	.row.heading {
		font-size: 12px;
		font-weight: 600;
		color: var(--m-muted-foreground);
	}

	.action {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		margin-right: -6px;
		border: 0;
		border-radius: max(calc(var(--m-radius) - 3.5px), 0px);
		background: none;
		color: var(--m-muted-foreground);
		cursor: pointer;
	}

	.action:hover {
		background: var(--m-secondary-active);
		color: var(--m-foreground);
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 7px;
		padding: 7px 7px 3.5px;
		border-top: 1px solid var(--m-border);
		font-size: 12px;
		color: var(--m-muted-foreground);
	}

	.nested {
		position: absolute;
		top: -4.5px;
		left: 100%;
		z-index: 1;
		padding-left: 6px;
		cursor: default;
	}

	.nested.flip {
		right: 100%;
		left: auto;
		padding-right: 6px;
		padding-left: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}
	}
</style>
