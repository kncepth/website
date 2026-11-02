<script lang="ts">
	import MenuPath from '$lib/components/docs/MenuPath.svelte';

	/** One row of a shortcut table. `keys` are shown as separate key caps and read left to right. */
	type Shortcut = { keys: string[]; action: string };

	const playback: Shortcut[] = [
		{ keys: ['Space'], action: 'Play or pause' },
		{ keys: ['Ctrl', '←'], action: 'Previous song' },
		{ keys: ['Ctrl', '→'], action: 'Next song' },
		{ keys: ['F'], action: 'Open or close the fullscreen player' }
	];

	const navigation: Shortcut[] = [
		{ keys: ['Ctrl', 'F'], action: 'Filter the current view' },
		{ keys: ['Ctrl', 'Shift', 'F'], action: 'Open search' },
		{ keys: ['Ctrl', ','], action: 'Open settings' },
		{ keys: ['Ctrl', 'R'], action: 'Reload the current page' },
		{ keys: ['Alt', '←'], action: 'Go back' },
		{ keys: ['Alt', '→'], action: 'Go forward' },
		{ keys: ['Esc'], action: 'Close the open sheet or menu' },
		{ keys: ['Ctrl', 'Q'], action: 'Quit' }
	];

	const display: Shortcut[] = [
		{ keys: ['F11'], action: 'Make the window fill the screen, or go back' },
		{ keys: ['Ctrl', '+'], action: 'Make the text bigger' },
		{ keys: ['Ctrl', '-'], action: 'Make the text smaller' },
		{ keys: ['Ctrl', '0'], action: 'Put the text back to its default size' }
	];

	const lists: Shortcut[] = [
		{ keys: ['↑'], action: 'Select the previous row' },
		{ keys: ['↓'], action: 'Select the next row' },
		{ keys: ['Shift', '↑'], action: 'Extend the selection up' },
		{ keys: ['Shift', '↓'], action: 'Extend the selection down' },
		{ keys: ['Enter'], action: 'Play or open the selected row' },
		{ keys: ['Delete'], action: 'Remove the selected rows, after a confirmation' },
		{ keys: ['Esc'], action: 'Clear the selection' }
	];

	const equalizer: Shortcut[] = [
		{ keys: ['Ctrl', 'Z'], action: 'Undo' },
		{ keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
		{ keys: ['Ctrl', 'Y'], action: 'Redo' }
	];

	const macos: Shortcut[] = [
		{ keys: ['⌘', 'W'], action: 'Close the window' },
		{ keys: ['⌘', 'M'], action: 'Minimize' },
		{ keys: ['⌘', 'H'], action: 'Hide Sonora' },
		{ keys: ['⌥', '⌘', 'H'], action: 'Hide other apps' },
		{ keys: ['⌃', '⌘', 'F'], action: 'Enter or leave full screen' },
		{ keys: ['⌘', '['], action: 'Go back' },
		{ keys: ['⌘', ']'], action: 'Go forward' }
	];

	const sections = [
		{ id: 'playback', title: 'Playback', rows: playback },
		{ id: 'navigation', title: 'Navigation', rows: navigation },
		{ id: 'window', title: 'Window and text size', rows: display },
		{ id: 'lists', title: 'Lists and tables', rows: lists },
		{ id: 'equalizer', title: 'Equalizer', rows: equalizer },
		{ id: 'macos', title: 'macOS window', rows: macos }
	];
</script>

<svelte:head>
	<title>Shortcuts · Sonora docs</title>
</svelte:head>

<h1>Shortcuts</h1>
<p class="summary">
	On macOS the navigation and text size shortcuts take <kbd>⌘</kbd> as well as <kbd>Ctrl</kbd>, and
	<kbd>Alt</kbd> is <kbd>⌥</kbd>.
</p>

<p class="note">
	You can't rebind anything yet. Custom shortcuts are on the way. For keys that work outside Sonora,
	bind <a href="/docs/command-line">command line</a> commands in your desktop's settings.
</p>
<p>
	Playback shortcuts work while the app has focus and you aren't typing in a text field. In a text
	field, <kbd>Space</kbd> types a space, <kbd>Ctrl</kbd> with the arrow keys moves through words and
	<kbd>Esc</kbd> leaves the field. List shortcuts act on the focused list or table.
</p>
<p>
	In Search, <kbd>↓</kbd> in the empty field lists your recent searches and <kbd>Enter</kbd> opens
	the full results. The first <kbd>Esc</kbd> closes the suggestions and the second leaves the field.
</p>
<p>
	Double-clicking the fullscreen player does the same as <kbd>F11</kbd>. To have every way into the
	fullscreen player fill the screen, turn on
	<MenuPath steps={['Settings', 'Appearance', 'Now playing', 'Use OS fullscreen']} />. Text size you
	change from the keyboard is saved like the one in settings.
</p>
<p>Equalizer shortcuts work only on the equalizer screen.</p>

{#each sections as section (section.id)}
	<h2 id={section.id}>{section.title}</h2>
	<table>
		<tbody>
			{#each section.rows as row (row.keys.join('+'))}
				<tr>
					<td>
						<span class="keys">
							{#each row.keys as key (key)}<kbd>{key}</kbd>{/each}
						</span>
					</td>
					<td>{row.action}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/each}
