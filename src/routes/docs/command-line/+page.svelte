<script lang="ts">
	import Code from '$lib/components/docs/Code.svelte';

	/** One row of the command table, the command as typed and what it does. */
	type Command = { command: string; action: string };

	const playback: Command[] = [
		{ command: 'sonora play / pause / toggle', action: 'Resume, pause, or switch between the two' },
		{ command: 'sonora next / prev', action: 'Skip to the next song, or go back' },
		{
			command: 'sonora seek 50 | 1:30 | +10',
			action: 'Jump to a percent, to a time, or by a number of seconds'
		},
		{
			command: 'sonora volume [N | +N | -N]',
			action: 'Print the volume, set it from 0 to 100, or step it'
		},
		{ command: 'sonora shuffle [on | off | toggle]', action: 'Print or switch shuffle' },
		{ command: 'sonora repeat [off | all | one]', action: 'Print or set repeat' }
	];

	const queue: Command[] = [
		{ command: 'sonora play <file or link>...', action: 'Play now, then carry on with the queue' },
		{ command: 'sonora play -s <query>', action: 'Play the best search hit now' },
		{ command: 'sonora add <file or link>...', action: 'Queue after the songs you queued by hand' },
		{ command: 'sonora play-next <file or link>...', action: 'Queue right after the current song' },
		{ command: 'sonora add -s <query>', action: 'Queue the best search hit' },
		{ command: 'sonora search <query> [-n N]', action: 'Search the current provider' }
	];

	const status: Command[] = [
		{ command: 'sonora current', action: 'Print what plays now as JSON' },
		{ command: 'sonora watch [--position]', action: 'Print a line of JSON on every change' },
		{ command: 'sonora providers', action: 'List the providers and which one is current' },
		{ command: 'sonora provider [slug]', action: 'Print the current provider, or switch' },
		{
			command: 'sonora session [start | join CODE | leave]',
			action: 'Print, start, join or leave a Session'
		},
		{ command: 'sonora completions <shell>', action: 'Print a completion script' },
		{ command: 'sonora --version', action: 'Print the version' }
	];

	const sections = [
		{ id: 'playback', title: 'Playback', rows: playback },
		{ id: 'queue', title: 'Queue and search', rows: queue },
		{ id: 'status', title: 'Status and the rest', rows: status }
	];

	const examples = `sonora toggle
sonora current | jq -r .track.title
sonora play -s "What's Up?"
sonora search daft punk --json | jq -r '.[0].link'`;

	const hyprland = `bind = SUPER, right, exec, sonora seek +10
bind = SUPER, left, exec, sonora seek -10`;

	const watch = `sonora watch | jq --unbuffered -r '.track.title // ""'`;

	const completions = `sonora completions bash > ~/.local/share/bash-completion/completions/sonora
sonora completions zsh > "\${fpath[1]}/_sonora"
sonora completions fish > ~/.config/fish/completions/sonora.fish`;
</script>

<svelte:head>
	<title>Command line · Sonora docs</title>
</svelte:head>

<h1>Command line</h1>
<p class="summary">
	Control a running Sonora from a terminal, a script or a key binding. The commands are part of the
	<code>sonora</code> binary, so there is nothing else to install.
</p>

<Code text={examples} />
<p>
	A command never starts Sonora. With none running it exits with code 3. Run
	<code>sonora --help</code> for the full list, or <code>sonora &lt;command&gt; --help</code> for one
	command.
</p>
<p class="note">
	With Flatpak, run commands through the sandbox: <code
		>flatpak run io.github.nolight132.sonora next</code
	>.
</p>

{#each sections as section (section.id)}
	<h2 id={section.id}>{section.title}</h2>
	<table>
		<tbody>
			{#each section.rows as row (row.command)}
				<tr>
					<td><code>{row.command}</code></td>
					<td>{row.action}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/each}

<h2 id="details">Details</h2>
<p>
	<code>-s</code> picks a song. Add <code>-t album</code>, <code>-t artist</code> or
	<code>-t playlist</code> for another kind. Quote a query only when it has characters your shell
	reads, such as <code>'</code>, <code>?</code> or <code>&amp;</code>.
</p>
<p>
	Links have to belong to the current provider. Switch first with <code>sonora provider</code>.
	Relative file paths start from the folder you run the command in. If one item fails, nothing is
	queued.
</p>
<p>While Sonora controls another Spotify device, playback commands go to that device.</p>
<p>A step with <code>seek</code> fits a key binding, for example in Hyprland:</p>
<Code label="hyprland.conf" text={hyprland} />

<h2 id="scripts">Scripts and status bars</h2>
<p>
	Add <code>--json</code> to any command for one line of JSON. <code>current</code> always prints
	JSON, or <code>null</code> when nothing is loaded. It has the state, the song, the position in seconds,
	the volume as a percent, shuffle, repeat, the provider, whether the song is liked and what it plays
	from.
</p>
<p>
	<code>watch</code> prints the same JSON again whenever the song, state, volume, shuffle or repeat
	changes. <code>--position</code> adds a line every second while a song plays.
</p>
<Code text={watch} />
<table>
	<thead>
		<tr><th>Exit code</th><th>Meaning</th></tr>
	</thead>
	<tbody>
		<tr><td>0</td><td>Done</td></tr>
		<tr><td>1</td><td>Sonora refused the command or didn't answer</td></tr>
		<tr><td>2</td><td>The command line is wrong. Nothing was sent.</td></tr>
		<tr><td>3</td><td>Sonora isn't running</td></tr>
	</tbody>
</table>

<h2 id="completions">Shell completions</h2>
<p>Completions exist for bash, zsh, fish, elvish and PowerShell.</p>
<Code text={completions} />
