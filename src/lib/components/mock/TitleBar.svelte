<script lang="ts">
	import { route } from '$lib/mock/route.svelte';
	import Control from './Control.svelte';
	import Downloads from './Downloads.svelte';

	let {
		left,
		docked = left,
		ontoggle,
		right = $bindable()
	}: {
		/** Whether the left sidebar shows, docked beside the page or laid over it. */
		left: boolean;
		/** Whether it shows docked, which gives the title bar's leading part its width. */
		docked?: boolean;
		ontoggle: () => void;
		right: boolean;
	} = $props();

	const at = $derived(route.now);
	const listing = $derived(
		at.screen === 'album' ||
			at.screen === 'playlist' ||
			at.screen === 'history' ||
			((at.screen === 'library' || at.screen === 'local') && at.tab === 'Songs')
	);
	const carded = $derived((at.screen === 'library' || at.screen === 'local') && at.tab !== 'Songs');
	const filed = $derived(listing || carded);
	const refreshes = $derived(
		at.screen !== 'search' && at.screen !== 'settings' && at.screen !== 'equalizer'
	);

	let turning = $state(false);
	let settle = 0;

	function refresh() {
		clearTimeout(settle);
		turning = true;
		settle = setTimeout(() => (turning = false), 900);
	}
</script>

<div class="bar">
	<div class="leading" style:width={docked ? 'var(--m-left)' : undefined}>
		<Control
			icon={left ? 'panel-left-close' : 'panel-left-open'}
			title="Toggle sidebar"
			small
			onclick={ontoggle}
		/>
	</div>

	<div class="middle">
		<div class="history">
			<Control
				icon="chevron-left"
				title="Back"
				size={28}
				disabled={!route.behind}
				onclick={() => route.back()}
			/>
			<Control
				icon="chevron-right"
				title="Forward"
				size={28}
				disabled={!route.ahead}
				onclick={() => route.forward()}
			/>
			{#if refreshes}
				<span class="refresh" class:turning>
					<Control icon="refresh-cw" title="Refresh" size={28} onclick={refresh} />
				</span>
			{/if}
		</div>

		<Downloads />

		<div class="tools">
			{#if carded && at.tab === 'Playlists'}
				<Control icon="plus" title="New playlist" small />
			{/if}
			{#if filed}
				<Control icon="funnel" title="Filters" small tint="muted" />
				<Control icon="arrow-up-down" title="Sort" small tint="muted" />
			{/if}
			{#if carded}
				<Control icon="list" title="List view" small />
			{/if}
			{#if filed}
				<Control icon="search" title="Search" small />
			{/if}
		</div>
	</div>

	<div class="trail">
		<Control
			icon={right ? 'panel-right-close' : 'panel-right-open'}
			title="Show or hide lyrics and queue"
			small
			onclick={() => (right = !right)}
		/>
	</div>
</div>

<style>
	.bar {
		display: flex;
		flex: none;
		align-items: center;
		height: 36px;
		background: var(--m-background);
		border-bottom: 1px solid var(--m-title-bar-border);
	}

	.leading {
		display: flex;
		flex: none;
		align-items: center;
		gap: 3.5px;
		padding-left: 12px;
		padding-right: 10.5px;
	}

	.middle {
		display: flex;
		flex: 1;
		min-width: 0;
		align-items: center;
		gap: 3.5px;
		padding-right: 10.5px;
	}

	.history,
	.tools {
		display: flex;
		align-items: center;
		gap: 3.5px;
	}

	.refresh {
		display: flex;
	}

	.refresh.turning :global(svg) {
		animation: turn 900ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	@keyframes turn {
		to {
			transform: rotate(360deg);
		}
	}

	.history {
		flex: 1;
		min-width: 0;
	}

	.tools {
		flex: none;
		min-width: 0;
		justify-content: flex-end;
	}

	.trail {
		display: flex;
		flex: none;
		align-items: center;
		padding-right: 10.5px;
	}
</style>
