<script lang="ts">
	import Code from '$lib/components/docs/Code.svelte';

	const bookmark =
		"javascript:void(location.href='sonora://open?url='+encodeURIComponent(location.href))";
</script>

<svelte:head>
	<title>Opening links · Sonora docs</title>
</svelte:head>

<h1>Opening links</h1>
<p class="summary">
	Open a song, album, artist or playlist from its music service link, or send the current browser
	page to Sonora.
</p>
<p class="note">
	Search links, browser handoffs and YouTube handles are coming in the next release.
</p>

<h2 id="search">From search</h2>
<p>
	Paste a supported music link into Sonora's search field. Choose <strong
		>Open link in Sonora</strong
	>
	to open the linked page. Sonora switches to its provider if you have an account saved. Without a saved
	account, Sonora asks you to sign in first.
</p>
<p>
	For links to your active provider, suggestions show the linked item and matches for its title or
	artist name. Press <kbd>Enter</kbd>, click Search, or choose <strong>Search for …</strong> to see
	full results for that name. The <strong>Open link in Sonora</strong> action appears before the name
	search and remains available while metadata loads or for a different provider.
</p>
<p>
	YouTube Music links such as <code>https://music.youtube.com/channel/UC…</code> open an artist
	page. YouTube <code>/@handle</code> links also open artist pages after Sonora looks up the channel.
	That lookup needs an internet connection.
</p>

<h2 id="browser">From your browser</h2>
<p>
	Create a bookmark named <strong>Open in Sonora</strong> and paste the following into its URL field.
</p>
<Code text={bookmark} />
<p>
	Visit a supported music page and click the bookmark. Allow your browser to open Sonora when
	prompted. Sonora must be installed with its <code>sonora:</code> URL handler registered.
</p>
<p>
	Keep the bookmark on your bookmarks bar for quick access. Regular music links still open in your
	browser. Click the bookmark when you want to send that page to Sonora.
</p>

<h2 id="other-apps">From other apps</h2>
<p>
	Apps and websites can link to <code>sonora://open?url=&lt;encoded-url&gt;</code>. Encode the
	entire music URL with <code>encodeURIComponent</code>, including its query parameters.
</p>
<p>
	You can also pass a music URL directly to the <a href="/docs/command-line">command line</a>. This
	starts Sonora if needed or opens the link in the running app.
</p>
<Code text={'sonora "https://music.youtube.com/channel/UCJls2FMEbRYxi28jcuKe2vA"'} />
