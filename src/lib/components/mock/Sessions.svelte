<script lang="ts">
	import { menu, type Item } from '$lib/mock/menu.svelte';
	import { devices, together } from '$lib/mock/together.svelte';
	import Icon from './Icon.svelte';

	let { onmembers }: { onmembers: () => void } = $props();

	const glyph = $derived(together.device?.icon ?? 'monitor-speaker');

	function sheet() {
		const here = together.device;
		const items: Item[] = [
			{
				id: 'device-here',
				label: 'This computer',
				icon: 'monitor',
				selected: !here,
				onclick: () => together.transfer(null)
			},
			...devices.map((device) => ({
				id: `device-${device.id}`,
				label: device.name,
				icon: device.icon,
				selected: here?.id === device.id,
				onclick: () => together.transfer(device.id)
			})),
			{ id: 'session-separator', separator: true },
			{
				id: 'spotify-jams',
				label: 'Spotify Jams',
				icon: 'spotify',
				width: 200,
				submenu:
					together.kind === 'jam'
						? [
								{ id: 'jam-code', label: 'Show QR code', icon: 'qr-code' },
								{ id: 'jam-copy', label: 'Copy Jam link', icon: 'link' },
								{
									id: 'jam-end',
									label: 'End Jam',
									icon: 'log-out',
									onclick: () => together.leave()
								}
							]
						: [
								{
									id: 'jam-start',
									label: 'Start a Jam',
									icon: 'users-round-collaboration',
									disabled: together.kind === 'session',
									onclick: () => together.startJam()
								},
								{
									id: 'jam-join',
									label: 'Join a Jam…',
									icon: 'link',
									disabled: together.kind === 'session'
								}
							]
			}
		];
		if (together.kind) {
			items.push({
				id: 'members',
				label: 'Members',
				icon: 'user',
				faces: together.people.slice(0, 3),
				onclick: onmembers
			});
		}
		if (together.kind === 'session') {
			items.push(
				{
					id: 'session-code',
					label: 'Show Session code',
					icon: 'rectangle-ellipsis',
					onclick: () => together.show(true)
				},
				{
					id: 'session-leave',
					label: together.hosting ? 'End Session' : 'Leave Session',
					icon: 'log-out',
					onclick: () => together.leave()
				}
			);
		} else if (!together.kind) {
			items.push(
				{
					id: 'session-start',
					label: 'Start a Session',
					icon: 'users-round-collaboration',
					onclick: () => {
						together.start();
						together.show(true);
					}
				},
				{
					id: 'session-join',
					label: 'Join a Session…',
					icon: 'rectangle-ellipsis',
					onclick: () => together.ask(true)
				}
			);
		}
		return { items, width: 260 };
	}
</script>

<button
	type="button"
	class="sessions"
	class:busy={together.busy}
	class:open={menu.owner === 'sessions'}
	title="Sessions"
	aria-label="Sessions"
	aria-haspopup="menu"
	onclick={(event) =>
		menu.from(event.currentTarget, 'sessions', sheet, { align: 'end', above: true })}
>
	<span class="glyph">
		<Icon name={glyph} />
		{#if together.busy}<span class="dot"></span>{/if}
	</span>
</button>

<style>
	.sessions {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 26px;
		border: 0;
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-muted-foreground);
		cursor: pointer;
	}

	.sessions.busy {
		color: var(--m-foreground);
	}

	.sessions:hover,
	.sessions.open {
		background: var(--m-secondary-hover);
	}

	.glyph {
		position: relative;
		display: flex;
	}

	.dot {
		position: absolute;
		top: -2px;
		left: -2px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--m-primary);
		box-shadow: 0 0 0 1.5px var(--m-secondary);
	}
</style>
