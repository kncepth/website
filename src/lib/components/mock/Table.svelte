<script lang="ts">
	import { TRAIL, clock, shelf, type Track } from '$lib/mock/album';
	import { player } from '$lib/mock/player.svelte';
	import Cover from './Cover.svelte';
	import Icon from './Icon.svelte';
	import Like from './Like.svelte';
	import Ring from './Ring.svelte';
	import { downloads } from '$lib/mock/downloads.svelte';
	import { menu } from '$lib/mock/menu.svelte';
	import { trackMenu } from '$lib/mock/menus';

	type Column = { key: string; label: string; width: number; align?: string; sortable?: boolean };

	let {
		columns = [],
		rows = [],
		framed = false,
		album = ''
	}: { columns?: Column[]; rows?: Track[]; framed?: boolean; album?: string } = $props();

	const span = $derived(columns.reduce((sum, column) => sum + column.width, 0));
	/** Text columns share what the page has and give way down to a floor, as the desktop's do. */
	const FLEXIBLE = new Set(['title', 'artist', 'album']);
	const FLOOR = 64;
	const track = (column: Column, trim: number) =>
		FLEXIBLE.has(column.key) ? `minmax(${FLOOR}px, ${column.width}fr)` : `${column.width - trim}px`;
	const head = $derived(columns.map((column) => track(column, 0)).join(' '));
	const body = $derived(
		columns.map((column, at) => track(column, at + 1 === columns.length ? TRAIL : 0)).join(' ')
	);
</script>

<div class="table" class:framed style:max-width={framed ? `${span + 2}px` : undefined}>
	<div class="head" style:grid-template-columns={head}>
		{#each columns as column (column.key)}
			<span class="cell">
				<span class="frame {column.align ?? ''}">{column.label}</span>
				{#if column.sortable}<Icon name="chevrons-up-down" size={12} />{/if}
			</span>
		{/each}
	</div>

	{#each rows as row, at (row.id)}
		{@const active = row.id === player.id}
		<div
			class="row"
			class:active
			style:grid-template-columns={body}
			role="button"
			tabindex="0"
			class:held={menu.owner === `track-${row.id}`}
			onclick={() => player.select(row.id)}
			oncontextmenu={(event) => menu.at(event, `track-${row.id}`, () => trackMenu(row, { album }))}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					player.select(row.id);
				}
			}}
		>
			{#each columns as column (column.key)}
				{#if column.key === 'index'}
					<span class="cell center index">
						<span class="resting" class:muted={!(active && player.playing)}>
							{#if active}
								<Icon name={player.playing ? 'music-2' : 'pause'} size={10} />
							{:else}
								{at + 1}
							{/if}
						</span>
						<span class="hit"
							><Icon name={active && player.playing ? 'pause' : 'play'} size={10} /></span
						>
					</span>
				{:else if column.key === 'cover'}
					<span class="cell"><Cover src={row.cover} size={34} /></span>
				{:else if column.key === 'title'}
					{@const saving = downloads.of(row.id)}
					<span class="cell title">
						<span class="name">{row.title}</span>
						<span class="like" class:kept={player.likes(row.id)}><Like id={row.id} small /></span>
						{#if saving !== undefined}
							<span
								class="saving"
								class:landed={saving === 1}
								title={saving === 1 ? 'Downloaded' : 'Downloading'}
							>
								<Ring done={saving} size={14} />
							</span>
						{/if}
					</span>
				{:else if column.key === 'album'}
					<span class="cell muted">{shelf.get(row.album)?.title ?? ''}</span>
				{:else if column.key === 'length'}
					<span class="cell right muted clock">{clock(row.length)}</span>
				{:else}
					<span class="cell {column.align ?? ''} muted">{row[column.key as keyof Track] ?? ''}</span
					>
				{/if}
			{/each}
		</div>
	{/each}
</div>

<style>
	.table {
		flex: none;
	}

	.table.framed {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		overflow: hidden;
	}

	.table.framed .row:last-child {
		border-bottom: 0;
	}

	.head,
	.row {
		display: grid;
		align-items: center;
		width: 100%;
		border-bottom: 1px solid var(--m-table-row-border);
		text-align: left;
	}

	.head {
		height: 32px;
		background: var(--m-table-head);
		color: var(--m-table-head-foreground);
	}

	.row {
		height: 42px;
		cursor: pointer;
	}

	.row:hover {
		background: var(--m-table-hover);
	}

	.row.active {
		background: var(--m-muted);
	}

	.row.held {
		background: var(--m-table-hover);
	}

	.saving {
		display: flex;
		flex: none;
		border-radius: 50%;
		background: color-mix(in srgb, var(--m-primary) 14%, transparent);
	}

	.saving.landed {
		background: var(--m-primary);
		color: var(--m-primary-foreground);
	}

	.saving.landed :global(.ring) {
		color: var(--m-primary-foreground);
	}

	.saving.landed :global(.track),
	.saving.landed :global(.fill) {
		opacity: 0;
		transition: opacity 600ms ease;
	}

	.cell {
		display: flex;
		align-items: center;
		gap: 3.5px;
		min-width: 0;
		padding: 0 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.frame {
		flex: 1;
		display: flex;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.center,
	.frame.center {
		justify-content: center;
	}

	.right,
	.frame.right {
		justify-content: flex-end;
	}

	.muted {
		color: var(--m-muted-foreground);
	}

	.index {
		position: relative;
	}

	.title {
		gap: 5.25px;
	}

	.name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.like {
		display: flex;
		visibility: hidden;
	}

	.row:hover .like,
	.like.kept {
		visibility: visible;
	}

	.resting,
	.hit {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
	}

	.hit {
		position: absolute;
		visibility: hidden;
	}

	.row:hover .resting {
		visibility: hidden;
	}

	.row:hover .hit {
		visibility: visible;
	}

	.clock {
		font-variant-numeric: tabular-nums;
	}
</style>
