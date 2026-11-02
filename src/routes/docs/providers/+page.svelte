<script lang="ts">
	import AppButton from '$lib/components/docs/AppButton.svelte';
	import MenuPath from '$lib/components/docs/MenuPath.svelte';

	/** The levels each service offers under Streaming quality, best first, as the app labels them. */
	const qualities = [
		{ provider: 'Spotify', levels: 'High: Vorbis 320 kbps. Normal: 160 kbps. Low: 96 kbps.' },
		{
			provider: 'YouTube Music',
			levels: 'High: AAC up to 256 kbps with Premium. Normal: 128 kbps. Low: 48 kbps.'
		},
		{ provider: 'Apple Music', levels: 'High: AAC 256 kbps. Low: 64 kbps.' },
		{
			provider: 'Deezer',
			levels: 'Lossless: FLAC 16-bit 44.1 kHz. High: MP3 320 kbps. Normal: MP3 128 kbps.'
		},
		{
			provider: 'Tidal',
			levels:
				'Hi-res: FLAC up to 24-bit 192 kHz. Lossless: FLAC 16-bit 44.1 kHz. High: AAC 320 kbps. Low: AAC 96 kbps.'
		}
	];
</script>

<svelte:head>
	<title>Providers · Sonora docs</title>
</svelte:head>

<h1>Providers</h1>
<p class="summary">
	Sonora signs in to one streaming service at a time, and your local files are always there next to
	it. Switching services clears the queue, so finish what you're listening to first.
</p>

<h2 id="spotify">Spotify</h2>
<p>
	Signing in opens Spotify's login page in your browser. Once you approve, the browser hands the
	session back to Sonora through <code>127.0.0.1:8989</code>, so nothing else can be using that
	port.
</p>
<ul>
	<li>You need Premium. Spotify turns free accounts away at sign-in.</li>
	<li>
		If you are getting a "Spotify is not granting this account playback keys" error each time you
		try playing a track, Spotify won't work for you in Sonora. See <a
			href="https://github.com/librespot-org/librespot/issues/1649">issue 1649</a
		> in librespot.
	</li>
	<li>A region error means Spotify won't serve your account from where you're connecting.</li>
</ul>

<h3 id="spotify-connect">Spotify Connect and Jams</h3>
<p>
	Sonora appears as a device in Spotify's other apps, so you can control it from your phone. To turn
	this off, use <MenuPath steps={['Settings', 'Playback', 'Show as a Spotify device']} />.
</p>
<p>
	The Sessions button in the player bar switches playback to another Spotify device and back. While
	another device plays, the button shows that device's icon. Jams are in its
	<strong>Spotify Jams</strong> submenu, see <a href="/docs/sessions#spotify-jams">Sessions</a>. To
	hide Sonora's Discord status while Spotify Connect plays, turn on
	<MenuPath steps={['Settings', 'Integrations', 'Discord', 'Hide during Spotify Connect']} />.
</p>

<h2 id="youtube">YouTube Music</h2>
<p>
	There are three ways to log in: a Google login window, pasting your cookies manually, or guest
	mode. None of them needs Premium.
</p>

<h2 id="apple-music">Apple Music</h2>
<p>
	Sign in through the Apple Music window, or paste the <code>media-user-token</code> cookie from
	music.apple.com. Playback needs the <a href="#widevine">Widevine module</a>.
</p>

<h2 id="deezer">Deezer</h2>
<p>
	Sign in through the Deezer window or paste your <code>arl</code> cookie.
</p>

<h2 id="tidal">Tidal</h2>
<p>
	Signing in opens <code>link.tidal.com</code> in your browser with a code. Approve it there.
</p>

<h2 id="subsonic">Subsonic and Navidrome</h2>
<p>
	Enter the server address, your user name and password. Leave out the scheme and Sonora assumes
	<code>http://</code>, so type <code>https://</code> yourself if your server has TLS.
</p>
<p>Lyrics stored on the server, such as ones embedded in your files, are used too.</p>

<h2 id="local-files">Local files</h2>
<p>
	Add folders under <MenuPath steps={['Settings', 'Providers', 'Music folders']} />. Sonora scans
	them, subfolders and symlinks included. After the first read it only checks files whose size or
	date changed, so later scans are quick. It doesn't watch the folders while it runs, though. Hit <AppButton
		>Rescan</AppButton
	> after you add music.
</p>
<ul>
	<li>MP3, FLAC, M4A, MP4, AAC, OGG, Opus, WAV, AIFF, WavPack, APE, WebM and MKA are supported.</li>
	<li>
		A track with several artist tags shows each artist separately. Sonora never splits a single tag
		on commas, ampersands or "feat.", and artist names that differ only in capitalization count as
		one artist.
	</li>
	<li>
		Covers are loaded from the embedded art, or from <code>cover.*</code> or <code>folder.*</code>
		in the same folder. Use JPG, JPEG, PNG or WebP. Artist pictures come from a scanned folder whose name
		matches the artist, using <code>artist.*</code>, <code>folder.*</code> or
		<code>cover.*</code> in those formats.
	</li>
	<li>
		Lyrics come from a <code>.ttml</code> or <code>.lrc</code> file next to the track, or from the tags.
	</li>
</ul>

<h3 id="local-playlists">Importing and exporting playlists</h3>
<p>
	Import an M3U or M3U8 file with <strong>Import playlist…</strong> on your local Playlists page,
	from its button or right-click menu. Songs that aren't in your library are left out. To export a
	local playlist, right-click it and choose <strong>Export playlist…</strong>. An export saved next
	to your music lists songs by relative path.
</p>

<h3 id="local-tags">Editing tags</h3>
<p>
	Right-click one local track and choose <strong>Edit tags</strong>. Saving writes the changes to
	the audio file and updates the library. The album artist tag controls album grouping. If it is
	missing, tracks with the same album name in the same folder stay together even when their track
	artists differ.
</p>

<h3 id="local-lyrics">Local lyrics</h3>
<p>
	Enable <strong>Local</strong> under <MenuPath steps={['Settings', 'Lyrics', 'Lyrics sources']} /> to
	use lyrics from a track's tags or a matching <code>.ttml</code> or <code>.lrc</code> file. TTML files
	and TTML in the lyrics tag can be timed word by word. Drag the sources to rank them. Synced lyrics beat
	plain text, and among synced lyrics the higher source wins, even when a lower one has them word by word.
</p>
<p>
	To keep your local track metadata off online lyrics services, turn off
	<MenuPath steps={['Settings', 'Lyrics', 'Look up lyrics for local files']} />. Lyrics from your
	files still work.
</p>

<h2 id="quality">Audio quality</h2>
<p>
	Pick a level in <MenuPath steps={['Settings', 'Playback', 'Streaming quality']} />. If your plan
	or the track doesn't have it, the next level down plays.
</p>
<table>
	<thead>
		<tr><th>Provider</th><th>Levels</th></tr>
	</thead>
	<tbody>
		{#each qualities as row (row.provider)}
			<tr><td>{row.provider}</td><td>{row.levels}</td></tr>
		{/each}
		<tr><td>Local files</td><td>The file as it is</td></tr>
	</tbody>
</table>
<p>
	For Subsonic and Navidrome, set <strong>Stream format</strong> to MP3, Opus or AAC and a
	<strong>Maximum bitrate</strong> to have the server convert tracks. To keep music for offline use,
	see
	<a href="/docs/downloads">Downloads and offline</a>.
</p>

<h2 id="widevine">Widevine</h2>
<p>
	Apple Music streams are encrypted and need Google's Widevine module. A copy downloaded from Google
	is used first, then one from a browser such as Chrome, Edge, Brave, Vivaldi, Chromium or Firefox.
</p>
<p>
	To download Google's copy, use <MenuPath steps={['Settings', 'Playback', 'Widevine module']} />.
	Do this if no browser has the module or if Apple Music tracks fail because the browser's copy is
	out of date. Widevine only exists for x86_64 and arm64.
</p>
