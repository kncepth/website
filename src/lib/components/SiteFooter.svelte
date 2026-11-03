<script lang="ts">
	import { page } from '$app/state';
	import { discord, matrix, repo } from '$lib/data/links';
	import Logo from './Logo.svelte';

	/** Prefix for the home page anchors, so they still resolve from other routes. */
	const home = $derived(page.url.pathname === '/' ? '' : '/');
</script>

<footer class="section">
	<span class="cross start"></span>
	<span class="cross end"></span>

	<div class="page">
		<div class="cols">
			<div class="about">
				<a href="{home}#top" class="brand">
					<Logo size={18} />
					<span>Sonora</span>
				</a>
				<p>A native, familiar music streaming client.</p>
			</div>

			<div class="links">
				<div>
					<h3>Site</h3>
					<a href="{home}#steps">Install</a>
					<a href="{home}#about">What it does</a>
					<a href="{home}#community">Community</a>
					<a href="/docs">Docs</a>
					<a href="/faq">FAQ</a>
				</div>
				<div>
					<h3>Project</h3>
					<a href={repo}>GitHub</a>
					<a href="/changelog">Changelog</a>
					<a href="{repo}/blob/main/CONTRIBUTING.md">Contributing</a>
					<a href="{repo}/blob/main/README.md#translations">Translations</a>
				</div>
				<div>
					<h3>Talk</h3>
					<a href={discord}>Discord</a>
					<a href={matrix}>Matrix</a>
					<a href="{repo}/issues">Issues</a>
				</div>
				<div>
					<h3>Legal</h3>
					<a href="{repo}/blob/main/COPYING">License</a>
					<a href="{repo}/blob/main/PRIVACY.md">Privacy</a>
					<a href="{repo}/blob/main/THIRD-PARTY.md">Third-party notices</a>
				</div>
			</div>
		</div>

		<div class="legal">
			<p>
				Sonora is free software under the GNU General Public License, version 3 or later. It is an
				unofficial client and is not affiliated with, endorsed by or sponsored by Spotify AB.
			</p>
			{#if !home}
				<p>
					The preview on this page plays public domain recordings with public domain lyrics. Its
					covers are public domain paintings from Wikimedia Commons.
				</p>
			{/if}
		</div>
	</div>
</footer>

<style>
	.page {
		padding-top: 48px;
		padding-bottom: 40px;
	}

	.cols {
		display: flex;
		justify-content: space-between;
		gap: 48px;
		flex-wrap: wrap;
	}

	.about {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 280px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 9px;
		font-size: 14px;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.about p {
		font-size: 13px;
		line-height: 1.6;
		color: var(--muted-fg);
	}

	.links {
		display: flex;
		gap: 56px;
		flex-wrap: wrap;
	}

	.links > div {
		display: flex;
		flex-direction: column;
		gap: 10px;
		font-size: 13px;
		color: var(--muted-fg);
	}

	.links a:hover {
		color: var(--fg);
	}

	h3 {
		margin: 0 0 4px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--muted-fg);
	}

	.legal {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 48px;
		padding-top: 20px;
		border-top: 1px solid var(--line);
	}

	.legal p {
		max-width: 72ch;
		font-size: 12.5px;
		line-height: 1.6;
		color: var(--dim);
		text-wrap: pretty;
	}

	@media (max-width: 900px) {
		.page {
			padding-top: 36px;
		}

		.links {
			gap: 32px;
		}

		.legal {
			margin-top: 36px;
		}
	}
</style>
