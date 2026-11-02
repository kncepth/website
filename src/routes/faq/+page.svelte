<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount, setContext, tick } from 'svelte';
	import EditLink from '$lib/components/EditLink.svelte';
	import Code from '$lib/components/docs/Code.svelte';
	import MenuPath from '$lib/components/docs/MenuPath.svelte';
	import Search from '$lib/components/docs/Search.svelte';
	import Question, { type Accordion } from '$lib/components/faq/Question.svelte';
	import '$lib/prose.css';

	const accordion: Accordion = $state({ open: null });
	setContext('faq', accordion);

	/** Opens the question the URL points at, so links and search results land on an expanded answer. */
	async function reveal() {
		const target = document.getElementById(location.hash.slice(1));
		if (!target?.classList.contains('question')) return;
		accordion.open = target.id;
		await tick();
		target.scrollIntoView({ block: 'start' });
	}

	onMount(() => {
		addEventListener('hashchange', reveal);
		return () => removeEventListener('hashchange', reveal);
	});

	afterNavigate(reveal);
</script>

<svelte:head>
	<title>FAQ · Sonora</title>
	<meta
		name="description"
		content="Fixes for the problems people run into most with Sonora on macOS, Windows and Linux."
	/>
</svelte:head>

<section class="section">
	<span class="cross start"></span>
	<span class="cross end"></span>

	<div class="page faq">
		<article class="prose">
			<span class="kicker">FAQ</span>
			<h1>Something's not working</h1>
			<p class="summary">
				The problems people run into most, and what fixes them. If yours isn't here, check the
				<a href="/docs/logs">log</a>. It usually names the culprit.
			</p>

			<div class="search"><Search /></div>

			<h2>Installing</h2>
			<div class="questions">
				<Question id="macos-damaged" question="Why does macOS say Sonora is damaged?">
					<p>
						It isn't. Sonora isn't signed with an Apple developer certificate yet, so macOS
						quarantines it. Clear the flag once after installing.
					</p>
					<Code text="xattr -dr com.apple.quarantine /Applications/Sonora.app" />
					<p>
						Once in a while, macOS may show this dialog again even after whitelisting the app. Run
						this command again to get rid of it.
					</p>
				</Question>

				<Question id="windows-warning" question="Why does Windows warn about an unknown publisher?">
					<p>
						The Windows builds aren't code-signed yet. We've applied to the SignPath Foundation for
						that. Until it comes through, click
						<MenuPath steps={['More info', 'Run anyway']} /> the first time.
					</p>
				</Question>

				<Question id="blank-window" question="Why is the window blank, or why won't Sonora start?">
					<p>
						On Linux, Sonora draws with Vulkan, and the Vulkan loader alone isn't enough. You need a
						driver for your GPU, such as <code>mesa-vulkan-drivers</code>,
						<code>vulkan-radeon</code>,
						<code>vulkan-intel</code> or the proprietary NVIDIA driver. Run
						<code>vulkaninfo --summary</code> to see whether one works.
					</p>
					<p>
						If Sonora starts but feels sluggish, <code>SONORA_BLUR=0</code> turns off the lyric blur,
						edge fades and visualizer.
					</p>
				</Question>

				<Question id="linux-no-sound" question="Why is there no sound on Linux?">
					<p>
						Sonora plays through ALSA. If it says <strong
							>Sonora cannot reach your sound server</strong
						>, you're missing the ALSA bridge to your sound server. Install
						<code>pipewire-alsa</code> on PipeWire or <code>pulseaudio-alsa</code> on PulseAudio, then
						restart Sonora. The AppImage doesn't bundle it either.
					</p>
					<p>
						<strong>No sound output</strong> means the bridge is there but your audio device didn't open.
						Check that it's connected and that no other app holds it.
					</p>
				</Question>

				<Question id="nightly" question="Can I try changes before the next release?">
					<p>
						Yes. Every night <code>main</code> is built into the
						<a href="https://github.com/sonorahq/sonora/releases/tag/nightly">nightly prerelease</a
						>, with the same installers, AppImages and binaries as a release. On Arch, install
						<code>sonora-nightly-bin</code>.
					</p>
					<Code text="yay -S sonora-nightly-bin" />
					<p>With Nix, run the flake at its <code>nightly</code> tag.</p>
					<Code text="nix run github:sonorahq/sonora/nightly" />
					<p>
						If Sonora updates itself, as the Windows installer, the macOS disk image and the
						AppImage do, switch between releases and nightlies with
						<MenuPath steps={['Settings', 'About', 'Release channel']} />. Nightlies skip the
						testing a release gets, so say you're on one when you report a bug.
					</p>
				</Question>
			</div>

			<h2>Signing in</h2>
			<div class="questions">
				<Question id="spotify-sign-in" question="Why does Spotify sign-in fail?">
					<ul>
						<li>Free accounts don't get in. You need Premium.</li>
						<li>
							The sign-in window hands the session back to Sonora on <code>127.0.0.1:8989</code>.
							Close whatever else holds that port and try again.
						</li>
						<li>
							A region error means Spotify won't serve your account from where you're connecting.
						</li>
					</ul>
				</Question>

				<Question id="sign-in-window" question="Why doesn't the sign-in window open on Linux?">
					<p>
						The login windows for YouTube Music, Apple Music and Deezer need WebKitGTK, either
						<code>webkit2gtk-4.1</code> or <code>4.0</code>. Without it Sonora shows
						<strong>Browser sign-in is unavailable</strong> and offers cookie pasting instead. That works
						just as well.
					</p>
				</Question>

				<Question id="lastfm" question="Why won't Last.fm link?">
					<p>
						Sonora waits five minutes for Last.fm on <code>127.0.0.1:8990</code>. Make sure that
						port is free, then approve Sonora in the browser before the time runs out. Last.fm also
						needs your own API key and secret; see <a href="/docs/scrobbling">Scrobbling</a>.
					</p>
				</Question>
			</div>

			<h2>Playback</h2>
			<div class="questions">
				<Question id="spotify-playback-keys" question="Why won't Spotify play anything?">
					<p>
						If every track fails with <strong
							>Spotify is not granting this account playback keys</strong
						>, Spotify won't work for your account in Sonora. Sonora plays Spotify through
						librespot, and
						<a href="https://github.com/librespot-org/librespot/issues/1649">librespot issue 1649</a
						> tracks the problem.
					</p>
				</Question>

				<Question id="widevine" question="Why won't Apple Music play?">
					<p>
						Apple Music needs the Widevine module. When none of your browsers has a copy, Sonora
						offers to download it from Google. If you dismissed that or it never showed up, get it
						from <MenuPath steps={['Settings', 'Playback', 'Widevine module']} />.
					</p>
					<p>
						If tracks fail because your browser's copy is out of date, download Google's copy in the
						same place.
					</p>
				</Question>

				<Question
					id="apple-music-offline"
					question="Why won't my Apple Music downloads play offline?"
				>
					<p>
						Apple Music downloads need an internet connection to play. Downloads from other services
						play offline. See <a href="/docs/downloads">Downloads and offline</a>.
					</p>
				</Question>
			</div>

			<h2>Settings</h2>
			<div class="questions">
				<Question id="settings-not-saved" question="Why don't my settings changes stick?">
					<p>
						You probably broke the formatting of settings.json. Sonora shows
						<strong>Fix line N of settings.json to save changes</strong> and won't save anything
						until you fix it. See <a href="/docs/settings">Settings file</a>.
					</p>
					<p>
						If your settings are lost, the previous version is in <code>sonora.backup.json</code> next
						to settings.json.
					</p>
				</Question>
			</div>

			<p class="more">
				Still stuck? See <a href="/docs/help">Getting help</a>.
			</p>
		</article>

		<div class="source">
			<EditLink path="src/routes/faq/+page.svelte" />
		</div>
	</div>
</section>

<style>
	.faq {
		max-width: 800px;
		padding-top: 72px;
		padding-bottom: 96px;
	}

	.search {
		max-width: 320px;
		margin-bottom: 8px;
	}

	.questions {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.more {
		margin-top: 24px;
	}

	.source {
		margin-top: 48px;
	}

	@media (max-width: 900px) {
		.faq {
			padding-top: 48px;
			padding-bottom: 64px;
		}
	}
</style>
