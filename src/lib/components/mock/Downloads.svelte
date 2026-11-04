<script lang="ts">
	import { catalogue } from '$lib/mock/album';
	import { downloads } from '$lib/mock/downloads.svelte';
	import { menu, type Item } from '$lib/mock/menu.svelte';
	import Icon from './Icon.svelte';
	import Ring from './Ring.svelte';

	const remaining = $derived(downloads.remaining);

	function sheet() {
		const items: Item[] = [];
		for (const job of downloads.jobs) {
			if (job.subject !== 'Song') {
				items.push({
					id: `heading-${job.key}`,
					label: job.name,
					cover: job.cover,
					heading: true,
					action: { icon: 'x', title: 'Cancel download', onclick: () => downloads.cancel(job.key) }
				});
			}
			for (const id of job.left) {
				const track = catalogue.get(id);
				if (!track) continue;
				items.push({
					id: `song-${job.key}-${id}`,
					label: job.subject === 'Album' ? track.title : `${track.title} · ${track.artist}`,
					action: { icon: 'x', title: 'Cancel download', onclick: () => downloads.cancelSong(id) }
				});
			}
		}
		const left = downloads.remaining;
		return {
			items,
			width: 340,
			footer: left
				? [`${Math.floor(left.share * 100)}%`, `About ${left.minutes} min left`]
				: undefined
		};
	}
</script>

{#if remaining}
	<div class="downloads">
		<button
			type="button"
			class="face"
			class:open={menu.owner === 'downloads'}
			aria-label="Downloading"
			onclick={(event) => menu.from(event.currentTarget, 'downloads', sheet, { align: 'end' })}
		>
			<Ring done={remaining.share} size={14} />
			<span>{remaining.songs} {remaining.songs === 1 ? 'song' : 'songs'} left</span>
		</button>
		<button
			type="button"
			class="cancel"
			title="Cancel all downloads"
			aria-label="Cancel all downloads"
			onclick={() => {
				downloads.cancelAll();
				menu.close();
			}}><Icon name="x" size={14} /></button
		>
	</div>
{/if}

<style>
	.downloads {
		display: flex;
		flex: none;
		align-items: center;
		animation: arrive 250ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(-2px);
		}
	}

	.face,
	.cancel {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		height: 26px;
		padding: 0 8px;
		border: 0;
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-foreground);
		font: inherit;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
	}

	.cancel {
		width: 26px;
		padding: 0;
		justify-content: center;
		color: var(--m-muted-foreground);
	}

	.face:hover,
	.cancel:hover,
	.face.open {
		background: var(--m-secondary-hover);
	}
</style>
