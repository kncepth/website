<script lang="ts">
	import Code from '$lib/components/docs/Code.svelte';
	import MenuPath from '$lib/components/docs/MenuPath.svelte';

	const cli = `sonora session start
sonora session join 123456
sonora session leave`;
</script>

<svelte:head>
	<title>Sessions · Sonora docs</title>
</svelte:head>

<h1>Sessions</h1>
<p class="summary">
	Listen to the same music with friends, in step. Sonora Sessions work on every streaming service,
	and Spotify Jams are there too.
</p>

<h2 id="sonora-session">Sonora Session</h2>
<p>
	Press the Sessions button in the player bar and choose <strong>Start a Session</strong>. Share the
	six-digit code. Friends join with <strong>Join a Session…</strong> and type it in.
</p>
<p>
	When anyone in the Session plays a song, pauses or seeks, it happens for everyone. Everyone has to
	be signed in to the service the Session started on. Local files are never shared.
</p>
<p>
	<strong>Leave Session</strong> takes you out. When the host leaves, the Session ends for everyone. An
	accent dot on the Sessions button means you're in one.
</p>

<h2 id="members">Members</h2>
<p>
	Open <strong>Members</strong> from the Sessions button to see who is listening with you, in a Sonora
	Session or a Spotify Jam. The host can remove people from there.
</p>

<h2 id="spotify-jams">Spotify Jams</h2>
<p>
	With Spotify, the <strong>Spotify Jams</strong> submenu of the Sessions button starts, joins,
	leaves or ends a Jam. Joining takes the Jam link a friend shared. Jams need
	<MenuPath steps={['Settings', 'Playback', 'Show as a Spotify device']} /> turned on.
</p>
<p>
	The same button switches playback to your other Spotify devices. See
	<a href="/docs/providers#spotify-connect">Spotify Connect</a>.
</p>

<h2 id="settings">Settings</h2>
<p>
	Turn off <MenuPath steps={['Settings', 'Playback', 'Sessions', 'Show the Sessions button']} /> to hide
	the button.
</p>
<p>
	To run Sessions through your own server, turn off <strong
		>Use the official Sonora Sessions server</strong
	>, type the address and press <strong>Save</strong>. The address is saved only once the server
	answers. A bare host name means <code>wss://</code> and the <code>/ws</code> path.
</p>

<h2 id="command-line">From the command line</h2>
<p>
	<code>sonora session</code> prints the Session you're in. <code>join</code> without a code opens
	the dialog to type one. See <a href="/docs/command-line">Command line</a>.
</p>
<Code text={cli} />
