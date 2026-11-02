<script lang="ts">
	import Code from '$lib/components/docs/Code.svelte';

	const example = `{
  "gapless": true,
  "normalisation": false,
  "close_to_tray": true,
  "startup": "home",
  "local_folders": ["/home/me/Music"],
  "lyrics_providers": ["Local", "Spotify", "LrcLib"],
  "appearance": {
    "theme": "catppuccin/mocha",
    "adaptive_theme": false,
    "icons": "lucide",
    "rounding": "rounded",
    "font_size": 14
  }
}`;

	const homeManager = `{
  imports = [ inputs.sonora.homeManagerModules.default ];
  programs.sonora = {
    enable = true;
    settings = {
      gapless = true;
      appearance = {
        theme = "catppuccin/mocha";
        adaptive_theme = false;
      };
    };
  };
}`;
</script>

<svelte:head>
	<title>Settings file · Sonora docs</title>
</svelte:head>

<h1>Settings file</h1>
<p class="summary">
	Your preferences live in one JSON file. Just like <a href="/docs/themes">themes</a>, it's picked
	up on the fly.
</p>

<h2 id="location">Location</h2>
<table>
	<tbody>
		<tr><td>Linux</td><td><code>~/.config/sonora/settings.json</code></td></tr>
		<tr>
			<td>Flatpak</td>
			<td><code>~/.var/app/io.github.nolight132.sonora/config/sonora/settings.json</code></td>
		</tr>
		<tr>
			<td>macOS</td>
			<td><code>~/Library/Application Support/sonora/settings.json</code></td>
		</tr>
		<tr><td>Windows</td><td><code>%APPDATA%\sonora\settings.json</code></td></tr>
	</tbody>
</table>

<h2 id="editing">Editing by hand</h2>
<p>
	Missing keys use their defaults. Unknown keys are ignored, and they disappear the next time Sonora
	saves, because it rewrites the whole file. Here is an example of a valid settings.json:
</p>
<Code label="settings.json" lang="json" text={example} />
<p>
	Break the formatting and Sonora shows <strong>Fix line N of settings.json to save changes</strong
	>. It won't save anything until you do. It also won't overwrite the file if something else changed
	it since Sonora last read it.
</p>

<p>
	Save as UTF-8. Since v0.42.0, a UTF-8 byte order mark, which some Windows editors add, is accepted
	too.
</p>

<h2 id="backup">Backup</h2>
<p>
	The previous valid version of your settings is in <code>sonora.backup.json</code> next to settings.json.
	To restore it, quit Sonora and copy it over settings.json.
</p>

<h2 id="not-here">What isn't in the file</h2>
<p>
	The selected provider, volume, queue resume position, window layout and other runtime state are
	saved in <code>state.sqlite</code>. Provider sign-ins live in the <code>accounts</code> folder in
	the data folder. Linked scrobbling accounts, including their tokens and secrets, are stored in
	<code>settings.json</code>.
</p>

<h2 id="other-files">Other files</h2>
<table>
	<thead>
		<tr><th>Folder</th><th>What's in it</th></tr>
	</thead>
	<tbody>
		<tr>
			<td>Data</td>
			<td>
				<code>state.sqlite</code>, <a href="/docs/downloads">downloads</a> and provider sign-ins in
				<code>accounts</code>, in
				<code>~/.local/share/sonora</code>,
				<code>~/Library/Application Support/sonora</code> or <code>%LOCALAPPDATA%\sonora</code>.
				Deleting a provider's folder in <code>accounts</code> signs you out of it.
			</td>
		</tr>
		<tr>
			<td>Cache</td>
			<td>
				The Widevine module, cached lyrics, artwork and played tracks, and the local scan index, in
				<code>~/.cache/sonora</code>, <code>~/Library/Caches/sonora</code> or
				<code>%LOCALAPPDATA%\sonora</code>. Emptying it doesn't sign you out.
			</td>
		</tr>
	</tbody>
</table>

<p class="note">
	On Windows, data and cache share the same folder. Deleting the whole folder also removes
	<code>state.sqlite</code>, including local playlists and favorites, every song you downloaded and
	your sign-ins.
</p>

<h2 id="home-manager">Home Manager</h2>
<p>
	The flake has a Home Manager module. Anything under <code>settings</code> gets merged into settings.json
	on every switch and every launch. Keys you don't set keep whatever you picked in the app.
</p>
<Code label="home.nix" text={homeManager} />
<p>
	Use the same preference keys as settings.json. A <code>provider</code> key does not switch services,
	because the selected provider belongs to runtime state.
</p>
