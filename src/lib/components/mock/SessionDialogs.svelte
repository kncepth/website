<script lang="ts">
	import { accounts } from '$lib/mock/accounts.svelte';
	import { together } from '$lib/mock/together.svelte';
	import Control from './Control.svelte';
	import Modal from './Modal.svelte';
	import Slots from './Slots.svelte';

	const LENGTH = 6;

	let typed = $state('');

	function key(event: KeyboardEvent) {
		if (!together.joining) return;
		if (event.key === 'Escape') return together.ask(false);
		if (event.key === 'Backspace') typed = typed.slice(0, -1);
		else if (event.key === 'Enter' && typed.length === LENGTH) join();
		else if (/^\d$/.test(event.key) && typed.length < LENGTH) typed += event.key;
		else return;
		event.preventDefault();
	}

	function join() {
		together.join(typed);
		typed = '';
	}
</script>

<svelte:window onkeydown={key} />

{#if together.showing && together.kind === 'session'}
	<Modal
		title="Your Session code"
		detail="Anyone signed in to {accounts.current?.name ?? 'Spotify'} can join with this code"
		width={420}
		ondismiss={() => together.show(false)}
	>
		{#snippet body()}
			<div class="center"><Slots value={together.code} /></div>
		{/snippet}
		{#snippet actions()}
			<Control icon="copy" label="Copy code" title="Copy code" />
			<Control variant="filled" label="Done" title="Done" onclick={() => together.show(false)} />
		{/snippet}
	</Modal>
{/if}

{#if together.joining}
	<Modal
		title="Join a Session"
		detail="Enter the code a friend shared with you"
		width={420}
		ondismiss={() => together.ask(false)}
	>
		{#snippet body()}
			<div class="center">
				<Slots value={typed} active={Math.min(typed.length, LENGTH - 1)} />
			</div>
			<button type="button" class="fill" onclick={() => (typed = '284519')}>
				Type any six digits, or use a sample code
			</button>
		{/snippet}
		{#snippet actions()}
			<Control label="Cancel" title="Cancel" onclick={() => together.ask(false)} />
			<Control
				variant="filled"
				label="Join"
				title="Join"
				disabled={typed.length < LENGTH}
				onclick={join}
			/>
		{/snippet}
	</Modal>
{/if}

<style>
	.center {
		display: flex;
		justify-content: center;
		padding: 8px 0;
	}

	.fill {
		align-self: center;
		border: 0;
		background: none;
		color: var(--m-muted-foreground);
		font: inherit;
		font-size: 12px;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}

	.fill:hover {
		color: var(--m-foreground);
	}
</style>
