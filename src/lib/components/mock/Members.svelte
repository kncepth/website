<script lang="ts">
	import { together } from '$lib/mock/together.svelte';
	import Control from './Control.svelte';
	import Face from './Face.svelte';

	const FACES = 6;

	const people = $derived(together.people);
	const session = $derived(together.kind === 'session');
	const summary = $derived(
		`${people.length} ${people.length === 1 ? 'person' : 'people'} in this ${session ? 'Session' : 'Jam'}`
	);
</script>

<aside class="members" aria-label="Members">
	<header class="head"><span class="eyebrow">Members</span></header>

	{#if !together.kind}
		<div class="vacancy">Start or join a Session to see who is listening with you</div>
	{:else}
		<div class="gathered">
			<span class="faces">
				{#each people.slice(0, FACES) as person (person.id)}
					<Face {person} size={30} ring />
				{/each}
			</span>
			<span class="count">{summary}</span>
			<div class="actions">
				<Control
					icon="copy"
					label={session ? 'Copy code' : 'Copy Jam link'}
					title={session ? 'Copy code' : 'Copy Jam link'}
					small
				/>
				<Control
					icon="log-out"
					label={together.hosting
						? session
							? 'End Session'
							: 'End Jam'
						: session
							? 'Leave Session'
							: 'Leave Jam'}
					title="Leave"
					small
					onclick={() => together.leave()}
				/>
			</div>
		</div>

		<div class="rows">
			{#each people as person (person.id)}
				<div class="row">
					<Face {person} size={26} />
					<span class="name">{person.name}</span>
					{#if person.host}<span class="badge">Host</span>{/if}
					{#if together.hosting && !person.you}
						<span class="remove">
							<Control
								icon="x"
								title="Remove {person.name}"
								small
								tint="muted"
								onclick={() => together.remove(person.id)}
							/>
						</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</aside>

<style>
	.members {
		display: flex;
		flex: none;
		flex-direction: column;
		width: 254px;
		overflow: hidden;
		background: var(--m-background);
		border-left: 1px solid var(--m-border);
	}

	.head {
		display: flex;
		flex: none;
		align-items: center;
		height: 32px;
		padding: 0 7px;
		border-bottom: 1px solid var(--m-border);
	}

	.eyebrow {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--m-muted-foreground);
	}

	.vacancy {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		padding: 0 24px;
		text-align: center;
		color: var(--m-muted-foreground);
	}

	.gathered {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 7px;
		padding: 16px 7px 10.5px;
		border-bottom: 1px solid var(--m-border);
	}

	.faces {
		display: flex;
	}

	.faces > :global(* + *) {
		margin-left: -8px;
	}

	.count {
		font-size: 13px;
		color: var(--m-muted-foreground);
	}

	.actions {
		display: flex;
		gap: 3.5px;
	}

	.rows {
		display: flex;
		flex-direction: column;
		padding: 3.5px;
		overflow-y: auto;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 10.5px;
		height: 40px;
		padding: 0 7px;
		border-radius: var(--m-radius);
		animation: arrive 300ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.row:hover {
		background: var(--m-secondary-hover);
	}

	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	.name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.badge {
		flex: none;
		padding: 0 6px;
		border-radius: 4px;
		background: var(--m-secondary-active);
		font-size: 11px;
		color: var(--m-muted-foreground);
	}

	.remove {
		opacity: 0;
	}

	.row:hover .remove {
		opacity: 1;
	}
</style>
