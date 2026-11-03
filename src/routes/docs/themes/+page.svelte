<script lang="ts">
	import MenuPath from '$lib/components/docs/MenuPath.svelte';
	import Code from '$lib/components/docs/Code.svelte';
	import { repo } from '$lib/data/links';

	const example = `{
  "name": "Fjord",
  "author": "Your Name",
  "version": 1,
  "theme": {
    "background": "#2e3440",
    "foreground": "#eceff4",
    "sidebar": "#2b303b",
    "popover": "#3b4252",
    "secondary": "#3b4252",
    "muted": "#434c5e",
    "muted_foreground": "#a3acb9",
    "border": "#4c566a66",
    "primary": "#88c0d0",
    "primary_foreground": "#2e3440",
    "progress_bar": "#88c0d0",
    "selection": "#5e81ac",
    "table_active": "#5e81ac33",
    "table_active_border": "#88c0d0"
  }
}`;

	const variants = `themes/
  fjord/
    night.json    "name": "Fjord Night"
    day.json      "name": "Fjord Day"`;

	const overrides = `"appearance": {
  "theme": "catppuccin/mocha",
  "theme_overrides": {
    "primary": "#f5a97f",
    "primary_foreground": "#1e1e2e",
    "progress_bar": "#f5a97f"
  }
}`;

	/** The color tokens a theme file may set, grouped by the part of the window they paint. */
	const tokens = [
		{
			area: 'Surfaces and text',
			names: [
				'background',
				'foreground',
				'muted',
				'muted_foreground',
				'border',
				'secondary',
				'secondary_hover',
				'secondary_active',
				'popover',
				'popover_foreground',
				'overlay',
				'overlay_foreground'
			]
		},
		{
			area: 'Accents',
			names: [
				'primary',
				'primary_foreground',
				'primary_hover',
				'danger',
				'danger_foreground',
				'danger_hover',
				'progress_bar',
				'selection'
			]
		},
		{
			area: 'Sidebar and title bar',
			names: ['sidebar', 'sidebar_accent', 'sidebar_border', 'title_bar_border']
		},
		{
			area: 'Tables',
			names: [
				'table_head',
				'table_head_foreground',
				'table_row_border',
				'table_hover',
				'table_active',
				'table_active_border'
			]
		}
	];
</script>

<svelte:head>
	<title>Themes · Sonora docs</title>
</svelte:head>

<h1>Themes</h1>
<p class="summary">
	A theme is a JSON file in the themes folder. Changes to the file apply as soon as you save it.
</p>

<h2 id="choosing">Choosing a theme</h2>
<p>
	Pick a theme in <MenuPath steps={['Settings', 'Appearance', 'Theme']} />. For a theme with
	variants, such as Catppuccin, click its name to pick a variant. In settings.json, set
	<code>appearance.theme</code> to the theme's id.
</p>
<p class="note">
	With <strong>Adaptive theme</strong> on, only System, Dark and Light are available. It is off by default.
</p>

<h2 id="community">Community themes</h2>
<p>
	Browse themes people shared on the <a href="/themes">themes page</a>, or open it with
	<MenuPath steps={['Settings', 'Appearance', 'Theme', 'Explore community themes']} />. Press
	<strong>Install</strong> on a theme and Sonora shows a preview and asks before adding it to your
	themes folder. A theme with variants installs with all of them. <strong>Download</strong> saves the
	file, or a zip for a theme with variants, to put in the folder yourself.
</p>
<p>
	To remove a theme from your themes folder, press the trash button on its card in
	<MenuPath steps={['Settings', 'Appearance', 'Theme']} />. To share your own, see
	<a href="#format">Writing a theme</a> and <a href="/themes/submit">submit it</a>.
</p>

<h2 id="folder">The themes folder</h2>
<p>
	Open it with <MenuPath steps={['Settings', 'Appearance', 'Theme', 'Open folder']} />. It is next
	to the <a href="/docs/settings">settings file</a>.
</p>
<table>
	<tbody>
		<tr><td>Linux</td><td><code>~/.config/sonora/themes/</code></td></tr>
		<tr>
			<td>Flatpak</td>
			<td><code>~/.var/app/io.github.nolight132.sonora/config/sonora/themes/</code></td>
		</tr>
		<tr><td>macOS</td><td><code>~/Library/Application Support/sonora/themes/</code></td></tr>
		<tr><td>Windows</td><td><code>%APPDATA%\sonora\themes\</code></td></tr>
	</tbody>
</table>

<h2 id="format">Writing a theme</h2>
<p>
	The id is the file's path in the themes folder without <code>.json</code>:
	<code>fjord.json</code> is <code>fjord</code>, <code>catppuccin/mocha.json</code> is
	<code>catppuccin/mocha</code>. The ids <code>system</code>, <code>dark</code> and
	<code>light</code> are reserved.
</p>
<p>
	A theme file has four keys: <code>name</code>, <code>author</code>, <code>version</code> and
	<code>theme</code>. The version must be <code>1</code>.
</p>
<Code label="themes/fjord.json" lang="json" text={example} />
<p>
	Colors are hex, <code>RRGGBB</code> or <code>RRGGBBAA</code>, with or without the <code>#</code>.
	Tokens you leave out use the Dark theme's colors.
</p>
<p>
	An unknown key or an invalid color makes the file invalid. If an edit breaks a theme that was
	already loaded, its last valid version stays in use and the error goes to the
	<a href="/docs/logs">log</a>.
</p>

<h2 id="variants">Variants</h2>
<p>
	Files in a subfolder of the themes folder form one theme with a variant per file. Only one level
	of subfolders is read, and symlinks are skipped.
</p>
<Code label="Folder layout" text={variants} />
<p>
	The words all variant names start with become the theme's name, and the rest of each name becomes
	the variant's. The layout above is a theme called Fjord with the variants Night and Day.
</p>

<h2 id="replacing">Changing a built-in theme</h2>
<p>
	A theme file with a built-in theme's id replaces it. Copy a file from
	<a href="{repo}/tree/main/assets/themes"><code>assets/themes</code></a> in Sonora's repository,
	for example to <code>themes/catppuccin/mocha.json</code>, and edit it.
</p>

<h2 id="tokens">Color tokens</h2>
<table>
	<tbody>
		{#each tokens as group (group.area)}
			<tr>
				<td>{group.area}</td>
				<td>
					{#each group.names as name, index (name)}<code>{name}</code>{index <
						group.names.length - 1
							? ' '
							: ''}{/each}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<h2 id="overrides">Changing a single color</h2>
<p>
	To change a color or two, add <code>theme_overrides</code> to the appearance block in settings.json
	instead of writing a file. Overrides apply on top of any theme, including the adaptive tint.
</p>
<Code label="settings.json" lang="json" text={overrides} />
