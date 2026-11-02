<script lang="ts">
	import AppButton from '$lib/components/docs/AppButton.svelte';
	import MenuPath from '$lib/components/docs/MenuPath.svelte';
</script>

<svelte:head>
	<title>Downloads and offline · Sonora docs</title>
</svelte:head>

<h1>Downloads and offline</h1>
<p class="summary">
	Downloads, offline mode and the cache of played tracks. All of it is encrypted and opens only in
	Sonora on this computer.
</p>

<h2 id="downloading">Downloading</h2>
<p>
	Press the download button on an album or playlist page, or right-click songs and choose
	<strong>Download</strong>. Works with Spotify, YouTube Music, Tidal, Deezer, Apple Music and
	Subsonic.
</p>
<p>
	While songs download, the title bar shows how many are left. Click the count to see them, grouped
	under the album, playlist or pick they came from, and cancel any one of them. The cross next to
	the count cancels every download. A song the service won't serve is skipped.
</p>
<p>
	To delete a download, right-click it and choose <strong>Remove download</strong>. The
	<strong>Downloaded</strong> filter on library pages lists only downloaded music.
</p>
<p class="note">Apple Music downloads need an internet connection to play.</p>

<h2 id="offline">Offline mode</h2>
<p>
	Turn on <MenuPath steps={['Settings', 'Playback', 'Storage', 'Offline mode']} /> to see and play only
	downloaded music. Streaming, downloads and lyrics lookups stay off until you press
	<AppButton>Go online</AppButton> or turn the setting off. The mode stays on after a restart.
</p>

<h2 id="kept-tracks">Played tracks</h2>
<p>
	Tracks you play are cached, so the next play needs no download. The limit is
	<MenuPath steps={['Settings', 'Playback', 'Storage', 'Cache size']} />, 2 GB by default, plus a
	separate 1 GB for Spotify. The oldest tracks are removed first. Downloads don't count toward the
	limit.
</p>
<p>
	Turn off <strong>Keep played tracks</strong> on the same page to disable the cache and delete it. For
	Spotify, the change applies after a restart.
</p>

<h2 id="space">Disk space</h2>
<p>
	<MenuPath steps={['Settings', 'Playback', 'Storage']} /> shows how much space both take.
	<AppButton>Clear</AppButton> deletes cached tracks. <AppButton>Remove all</AppButton> deletes every
	download.
</p>
<table>
	<tbody>
		<tr>
			<td>Downloads</td>
			<td>
				<code>~/.local/share/sonora/downloads</code>,
				<code>~/Library/Application Support/sonora/downloads</code> or
				<code>%LOCALAPPDATA%\sonora\downloads</code>
			</td>
		</tr>
		<tr>
			<td>Played tracks</td>
			<td>
				<code>~/.cache/sonora/vault</code>, <code>~/Library/Caches/sonora/vault</code> or
				<code>%LOCALAPPDATA%\sonora\vault</code>
			</td>
		</tr>
	</tbody>
</table>
<p>
	The encryption key is in your system keychain. On Linux without a keychain service, it's
	<code>vault.key</code> next to the <code>downloads</code> folder. Without the key, downloads can't be
	played.
</p>
