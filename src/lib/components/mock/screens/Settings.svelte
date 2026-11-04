<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		corners,
		drills,
		layouts,
		notice,
		providers,
		qualities,
		scrobblers,
		sections,
		tabs,
		team,
		version,
		visualizers,
		type Block,
		type Row,
		type Section
	} from '$lib/mock/catalog';
	import { accounts } from '$lib/mock/accounts.svelte';
	import { menu } from '$lib/mock/menu.svelte';
	import { reach } from '$lib/mock/packs.svelte';
	import { settings } from '$lib/mock/settings.svelte';
	import { colorsOf, families } from '$lib/mock/theme';
	import Logo from '../../Logo.svelte';
	import ThemeMiniature from '../../ThemeMiniature.svelte';
	import Control from '../Control.svelte';
	import Icon from '../Icon.svelte';
	import OptionCards from '../OptionCards.svelte';
	import Picker from '../Picker.svelte';
	import Scrubber from '../Scrubber.svelte';
	import SettingsPreview from '../SettingsPreview.svelte';
	import Switch from '../Switch.svelte';

	let {
		tab = $bindable('General'),
		room = 640,
		onequalizer = undefined
	}: { tab?: string; room?: number; onequalizer?: () => void } = $props();

	/** The desktop's column: the content less its margins, up to 640px. Tabs keep their
	 *  names only while it is at least as wide as ROOMY, and show icons with tooltips below. */
	const COLUMN = 640;
	const ROOMY = 620;
	const MARGIN = 24;
	const named = $derived(Math.min(room - MARGIN * 2, COLUMN) >= ROOMY);

	function press(glyph: string) {
		if (accounts.waiting) return;
		if (accounts.stored(glyph)) accounts.use(glyph);
		else accounts.signIn(glyph);
	}
	const initials = (name: string) =>
		name
			.split(/\s+/)
			.map((part) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();

	let query = $state('');
	let top = $state(125);
	let drill = $state<string | null>(null);

	const PACKS = ['Lucide', 'Remix', 'Solar', 'Iconoir'];
	const SAMPLE = ['house', 'search', 'heart', 'play'];
	const RATES = [44.1, 48, 88.2, 96, 176.4, 192];
	const BUFFERS = [128, 256, 512, 1024, 2048, 4096];

	const listener = { name: 'Alex Rivera', id: '31mfqtv7xk2dwrbn4hpz8ecajlyu' };

	const store = settings as unknown as Record<string, string | number | boolean>;

	const running = $derived(page.data.version?.replace(/^v/, '') ?? version);
	const locales = $derived(['System', ...(page.data.locales ?? [])]);

	onMount(() => {
		for (const pack of PACKS) reach(pack);
	});

	function options(row: Row): string[] {
		if (row.key === 'language') return locales;
		return row.options ?? [];
	}

	const searching = $derived(query.trim().length > 0);

	function shown(row: Row) {
		if (row.needs === 'ambient') return settings.ambient;
		if (row.needs === 'visualizer') return settings.visualizer !== 'Off';
		if (row.needs === 'discord') return settings.discord;
		if (row.needs === 'keepTracks') return settings.keepTracks;
		if (row.needs === 'spotifyConnect') return settings.spotifyConnect;
		if (row.needs === 'clientDecorations') return !settings.serverDecorations;
		return true;
	}

	/** Every row of every tab that answers the query, with the section it lives in. */
	const found = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return [];
		const hits: { row: Row; where: string }[] = [];
		for (const list of Object.values(sections)) {
			for (const section of list) {
				for (const group of section.groups) {
					for (const row of group.rows) {
						if (!shown(row)) continue;
						const text = `${row.title} ${row.detail ?? ''}`.toLowerCase();
						if (text.includes(needle)) hits.push({ row, where: section.title });
					}
				}
			}
		}
		return hits;
	});

	const pages: Section[] = $derived(
		drill ? [drills[drill].section] : (sections[tab] ?? sections.General)
	);

	function pick(next: string) {
		query = '';
		drill = null;
		tab = next;
	}

	function open(row: Row) {
		if (row.opens === 'equalizer') return onequalizer?.();
		if (row.opens && drills[row.opens]) drill = row.opens;
	}

	function reading(key: string): string {
		if (key === 'opacity') return `${Math.round(settings.opacity * 100)}%`;
		if (key === 'fontSize') return `${settings.fontSize} px`;
		if (key === 'panelLyrics') return `${Math.round(settings.panelLyrics * 100)}%`;
		if (key === 'fullscreenLyrics') return `${Math.round(settings.fullscreenLyrics * 100)}%`;
		return '';
	}

	function fraction(key: string): number {
		if (key === 'opacity') return Number(settings.opacity);
		if (key === 'fontSize') return (Number(settings.fontSize) - 10) / 14;
		return (Number(store[key]) - 0.5) / 1.5;
	}

	function seek(key: string, to: number) {
		if (key === 'opacity') settings.opacity = Math.round(Math.max(to, 0.3) * 100) / 100;
		else if (key === 'fontSize') settings.fontSize = Math.round(10 + to * 14);
		else store[key] = Math.round((0.5 + to * 1.5) * 20) / 20;
	}

	function step(key: string, by: number) {
		const steps = key === 'sampleRate' ? RATES : BUFFERS;
		const at = steps.indexOf(Number(store[key]));
		store[key] = steps[Math.min(Math.max(at + by, 0), steps.length - 1)];
	}

	const stepped = (key: string) =>
		key === 'sampleRate' ? `${settings.sampleRate} kHz` : `${settings.buffer} frames`;

	/** The variant of a theme family on show: the chosen one, or its first. */
	const variantOf = (family: (typeof families)[number]) =>
		family.variants.includes(String(settings.theme)) ? String(settings.theme) : family.variants[0];

	const themeCards = $derived(
		families.map((family) => ({ id: family.id, label: family.label, family }))
	);

	function variants(option: (typeof themeCards)[number], trigger: Element) {
		menu.from(
			trigger,
			`variants-${option.id}`,
			() => ({
				width: 200,
				items: option.family.variants.map((name) => ({
					id: name,
					label: name,
					selected: settings.theme === name,
					onclick: () => (settings.theme = name)
				}))
			}),
			{ align: 'start' }
		);
	}

	function move(source: string, by: number) {
		const order = [...settings.lyricsOrder];
		const at = order.indexOf(source);
		const to = at + by;
		if (to < 0 || to >= order.length) return;
		[order[at], order[to]] = [order[to], order[at]];
		settings.lyricsOrder = order;
	}

	function toggleSource(source: string) {
		settings.lyricsOff = settings.lyricsOff.includes(source)
			? settings.lyricsOff.filter((one) => one !== source)
			: [...settings.lyricsOff, source];
	}
</script>

{#snippet row(entry: Row)}
	<div class="row">
		<div class="text">
			<span class="title">{entry.title}</span>
			{#if entry.detail}<span class="detail">{entry.detail}</span>{/if}
		</div>
		<div class="control">
			{#if entry.control === 'switch'}
				<Switch
					checked={Boolean(store[entry.key])}
					label={entry.title}
					onchange={(value) => (store[entry.key] = value)}
				/>
			{:else if entry.control === 'picker'}
				<Picker
					value={String(store[entry.key] ?? options(entry)[0] ?? '')}
					options={options(entry)}
					onpick={(value) => (store[entry.key] = value)}
				/>
			{:else if entry.control === 'slider'}
				<div class="slider">
					<Scrubber
						fraction={fraction(entry.key)}
						label={entry.title}
						onseek={(to: number) => seek(entry.key, to)}
					/>
					<span class="reading">{reading(entry.key)}</span>
				</div>
			{:else if entry.control === 'stepper'}
				<span class="reading">{stepped(entry.key)}</span>
				<Control icon="minus" title="Lower" small onclick={() => step(entry.key, -1)} />
				<Control icon="plus" title="Raise" small onclick={() => step(entry.key, 1)} />
			{:else if entry.control === 'drill'}
				<button type="button" class="drill" aria-label={entry.title} onclick={() => open(entry)}>
					<Icon name="chevron-right" size={14} />
				</button>
			{:else if entry.control === 'button'}
				{#if entry.value}<span class="reading">{entry.value}</span>{/if}
				{#if entry.href}
					<a
						class="action"
						href={entry.href}
						target={entry.href.startsWith('/') ? undefined : '_blank'}
						rel="noreferrer">{entry.label}</a
					>
				{:else}
					<button type="button" class="action">{entry.label}</button>
				{/if}
			{:else if entry.key === 'version'}
				<span class="reading">{running}</span>
			{:else if entry.value}
				<span class="reading">{entry.value}</span>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet block(kind: Block)}
	{#if kind === 'theme'}
		<OptionCards
			options={themeCards}
			height={86}
			chosen={(option) => option.family.variants.includes(String(settings.theme))}
			onpick={(option) => (settings.theme = variantOf(option.family))}
			variants={(option) => option.family.variants.length > 1}
			onvariants={variants}
		>
			{#snippet thumb(option)}
				<span class="mini"><ThemeMiniature colors={colorsOf(variantOf(option.family))} /></span>
			{/snippet}
		</OptionCards>
	{:else if kind === 'icons'}
		<OptionCards
			options={PACKS.map((id) => ({ id, label: id }))}
			height={56}
			chosen={(option) => settings.icons === option.id}
			onpick={(option) => (settings.icons = option.id)}
		>
			{#snippet thumb(option)}
				<span class="glyphs">
					{#each SAMPLE as name (name)}<Icon {name} pack={option.id} size={18} />{/each}
				</span>
			{/snippet}
		</OptionCards>
	{:else if kind === 'corners'}
		<OptionCards
			options={corners.map((id) => ({ id, label: id }))}
			height={56}
			chosen={(option) => settings.corners === option.id}
			onpick={(option) => (settings.corners = option.id)}
		>
			{#snippet thumb(option)}
				<span
					class="corner"
					style:border-radius="{{ Square: 0, Subtle: 6, Rounded: 10, Round: 20 }[option.id] ?? 6}px
					0 0 0"
				></span>
			{/snippet}
		</OptionCards>
	{:else if kind === 'visualizer'}
		<OptionCards
			options={visualizers.map((id) => ({ id, label: id }))}
			height={56}
			chosen={(option) => settings.visualizer === option.id}
			onpick={(option) => (settings.visualizer = option.id)}
		>
			{#snippet thumb(option)}
				<svg class="sketch" viewBox="0 0 60 28">
					{#if option.id === 'Bars' || option.id === 'Bars and wave'}
						{#each [10, 16, 22, 18, 12, 15, 9, 6] as height, at (at)}
							<rect x={4 + at * 6.6} y={26 - height} width="4.4" {height} rx="1" />
						{/each}
					{/if}
					{#if option.id === 'Wave' || option.id === 'Bars and wave'}
						<path d="M2 20 C 12 4, 20 6, 28 14 S 46 26, 58 8" />
					{/if}
					{#if option.id === 'Off'}
						<line x1="6" y1="14" x2="54" y2="14" />
					{/if}
				</svg>
			{/snippet}
		</OptionCards>
	{:else if kind === 'layout'}
		<OptionCards
			options={layouts.map((id) => ({ id, label: id }))}
			height={64}
			chosen={(option) => settings.playerBar === option.id}
			onpick={(option) => (settings.playerBar = option.id)}
		>
			{#snippet thumb(option)}
				<span
					class="bar-sketch {option.id.toLowerCase()}"
					class:frosted={settings.playerBarTransparent}
				>
					<span class="art"></span>
					<span class="lines"><i></i><i></i></span>
					<span class="keys"><i></i><i></i><i></i></span>
					<span class="seek"></span>
				</span>
			{/snippet}
		</OptionCards>
	{:else if kind === 'quality'}
		<OptionCards
			options={qualities.map((one) => ({ id: one.id, label: one.id, detail: one.detail }))}
			height={48}
			chosen={(option) => settings.streamQuality === option.id}
			onpick={(option) => (settings.streamQuality = option.id)}
		>
			{#snippet thumb(option)}
				<span class="levels">
					{#each [0, 1, 2] as at (at)}
						<i class:lit={at <= qualities.findIndex((one) => one.id === option.id)}></i>
					{/each}
				</span>
			{/snippet}
		</OptionCards>
	{:else if kind === 'accounts'}
		<div class="services" role="radiogroup" aria-label="Streaming services">
			{#each providers as account (account.glyph)}
				{@const active = account.glyph === accounts.active}
				{@const kept = accounts.stored(account.glyph)}
				{@const waiting = accounts.waiting === account.glyph}
				<!-- the role is a radio for a kept account and a button for one to sign in to -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="service"
					class:active
					class:pressable={!active && !waiting}
					style:--brand={account.brand || 'var(--m-foreground)'}
					role={kept ? 'radio' : 'button'}
					aria-checked={kept ? active : undefined}
					aria-label={account.name}
					tabindex="0"
					onclick={() => press(account.glyph)}
					onkeydown={(event) => event.key === 'Enter' && press(account.glyph)}
				>
					<span class="mark"><Icon name={account.glyph} size={22} /></span>
					<span class="text">
						<span class="name">{account.name}</span>
						{#if active}<span class="detail">In use</span>{/if}
					</span>
					{#if waiting}
						<button
							type="button"
							class="action"
							onclick={(event) => {
								event.stopPropagation();
								accounts.cancel();
							}}>Cancel</button
						>
					{:else if kept}
						<span class="leave">
							<Control
								icon="log-out"
								title="Sign out"
								small
								tint="muted"
								onclick={(event: MouseEvent) => {
									event.stopPropagation();
									accounts.signOut(account.glyph);
								}}
							/>
						</span>
						<span class="radio" class:on={active}><span class="hole"></span></span>
					{:else}
						<span class="sign">Sign in</span>
					{/if}
				</div>
			{/each}
		</div>
	{:else if kind === 'scrobbling'}
		<div class="deck">
			{#each scrobblers as service (service.id)}
				<div class="account">
					<div class="text">
						<span class="title">{service.name}</span>
						<span class="detail">{service.detail || service.status}</span>
					</div>
					{#if service.linked}
						<Switch checked onchange={() => {}} />
					{/if}
					<button type="button" class="action">
						{service.linked ? 'Disconnect' : 'Connect'}
					</button>
				</div>
			{/each}
		</div>
	{:else if kind === 'priority'}
		<div class="sources">
			{#each settings.lyricsOrder as source, at (source)}
				<div class="source" class:off={settings.lyricsOff.includes(source)}>
					<Icon name="grip-vertical" size={14} />
					<span class="rank">{at + 1}</span>
					<span class="name">{source}</span>
					<Control
						icon="chevron-up"
						title="Move up"
						small
						disabled={at === 0}
						onclick={() => move(source, -1)}
					/>
					<Control
						icon="chevron-down"
						title="Move down"
						small
						disabled={at === settings.lyricsOrder.length - 1}
						onclick={() => move(source, 1)}
					/>
					<Switch
						checked={!settings.lyricsOff.includes(source)}
						label={source}
						onchange={() => toggleSource(source)}
					/>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}

<div class="settings">
	<div class="screen" style:--m-top="{top}px">
		{#key `${tab}-${drill}-${searching}`}
			<div class="sheet entering" style:padding-top="{top}px">
				{#if searching}
					{#each found as hit (hit.row.key)}
						<span class="where">{hit.where}</span>
						{@render row(hit.row)}
					{/each}
					{#if !found.length}
						<p class="notice">Nothing here</p>
					{/if}
				{:else}
					{#if drill}
						<button type="button" class="back" onclick={() => (drill = null)}>
							<Icon name="chevron-left" size={14} />
							{drills[drill].tab}
						</button>
					{/if}

					{#each pages as section, at (section.id)}
						<h2 class="headline" class:later={at > 0}>
							{section.title}
						</h2>
						{#if section.id === 'providers'}
							<div class="profile">
								{#if accounts.current}
									<span class="face">{initials(listener.name)}</span>
									<div class="who">
										<span class="display">{listener.name}</span>
										<span class="handle">{accounts.current.name} · {listener.id}</span>
									</div>
								{:else}
									<span class="face blank"></span>
									<div class="who">
										<span class="display">Not signed in</span>
										<span class="handle">Sign in to a streaming service below</span>
									</div>
								{/if}
							</div>
						{:else if section.id === 'about'}
							<div class="mark-row">
								<span class="app"><Logo size={56} /></span>
								<span class="display">Sonora</span>
							</div>
						{/if}
						{#if section.preview}
							<SettingsPreview kind={section.preview} />
						{/if}
						{#each section.groups as group, index (index)}
							{@const rows = group.rows.filter(shown)}
							<div class="group">
								{#if group.title}
									<div class="eyebrow">
										{#if group.icon}<Icon name={group.icon} size={12} />{/if}
										{group.title}
									</div>
								{/if}
								{#if group.block && group.block !== 'priority'}{@render block(group.block)}{/if}
								{#each rows as entry (entry.key)}
									{@render row(entry)}
								{/each}
								{#if group.block === 'priority'}{@render block(group.block)}{/if}
							</div>
						{/each}
						{#if section.id === 'about'}
							<div class="team">
								<div class="cap">
									<span class="eyebrow">Team</span>
									<span class="rule"></span>
								</div>
								<div class="members">
									{#each team as member (member.login)}
										<a
											class="member"
											href="https://github.com/{member.login}"
											target="_blank"
											rel="noreferrer"
										>
											<img
												class="avatar"
												src="https://github.com/{member.login}.png"
												width="34"
												height="34"
												alt=""
											/>
											<span class="ident">
												<span class="login">{member.login}</span>
												<span class="hint">GitHub</span>
											</span>
											<span class="role">{member.role}</span>
										</a>
									{/each}
								</div>
							</div>
							<p class="notice">{notice}</p>
						{/if}
					{/each}
				{/if}
			</div>
		{/key}
	</div>

	<header class="masthead" bind:clientHeight={top}>
		<div class="haze"></div>
		<div class="column">
			<label class="field">
				<Icon name="search" />
				<input placeholder="Search settings" bind:value={query} />
				<span class="keys" aria-hidden="true"><kbd>Ctrl</kbd><kbd>F</kbd></span>
			</label>
			<div class="categories">
				{#each tabs as entry (entry.id)}
					<button
						type="button"
						class="chip"
						class:on={!searching && tab === entry.id}
						class:bare={!named}
						title={named ? undefined : entry.id}
						aria-label={entry.id}
						onclick={() => pick(entry.id)}
					>
						<Icon name={entry.icon} />
						{#if named}{entry.id}{/if}
					</button>
				{/each}
			</div>
		</div>
	</header>
</div>

<style>
	.settings {
		position: relative;
		display: flex;
		flex: 1;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}

	.screen {
		position: absolute;
		inset: 0;
		overflow-y: auto;
		mask-image: linear-gradient(to bottom, transparent 0, #000 calc(var(--m-top) + 48px));
	}

	.masthead {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		z-index: 2;
		display: flex;
		justify-content: center;
		padding: 0 21px;
		pointer-events: none;
	}

	.haze {
		position: absolute;
		inset: 0;
		backdrop-filter: blur(1px);
		mask-image: linear-gradient(to bottom, #000, transparent);
	}

	.profile {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.face {
		display: flex;
		width: 64px;
		height: 64px;
		flex: none;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--m-secondary);
		color: var(--m-muted-foreground);
		font-size: 21.76px;
	}

	.who {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 3.5px;
	}

	.display {
		font-size: 19px;
		font-weight: 600;
	}

	.handle {
		font-size: 12px;
		color: var(--m-muted-foreground);
	}

	.split {
		margin: 21px 0 0;
		border: 0;
		border-top: 1px solid var(--m-border);
	}

	.column {
		position: relative;
		pointer-events: auto;
		display: flex;
		flex-direction: column;
		gap: 7px;
		width: 100%;
		max-width: 640px;
		padding: 21px 0;
	}

	.field {
		display: flex;
		align-items: center;
		gap: 7px;
		height: 40px;
		padding: 0 10.5px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: color-mix(in srgb, var(--m-popover) 20%, transparent);
		backdrop-filter: blur(8px);
		color: var(--m-muted-foreground);
	}

	.field input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		color: var(--m-foreground);
		font: inherit;
		outline: none;
	}

	.keys {
		display: flex;
		gap: 3px;
		flex: none;
	}

	kbd {
		display: inline-flex;
		align-items: center;
		height: 20px;
		padding: 0 5px;
		border: 1px solid var(--m-border);
		border-radius: 4px;
		background: var(--m-secondary);
		color: var(--m-muted-foreground);
		font: inherit;
		font-size: 11px;
	}

	.chip.bare {
		width: 32px;
		justify-content: center;
		padding: 0;
	}

	.profile {
		margin: 7px 0 3.5px;
	}

	.face.blank {
		background: var(--m-secondary);
		animation: pulse 1.4s ease-in-out infinite;
	}

	@keyframes pulse {
		50% {
			opacity: 0.55;
		}
	}

	.mark-row {
		display: flex;
		align-items: center;
		gap: 14px;
		margin: 7px 0 3.5px;
	}

	.app {
		display: flex;
		overflow: hidden;
		border-radius: 14px;
	}

	.services {
		display: flex;
		flex-direction: column;
		padding-bottom: 7px;
	}

	.service {
		display: flex;
		height: 52px;
		align-items: center;
		gap: 10.5px;
		margin: 0 -10.5px;
		padding: 0 10.5px;
		border-radius: var(--m-radius);
		transition: background-color 160ms ease;
	}

	.service.pressable {
		cursor: pointer;
	}

	.service.pressable:hover {
		background: var(--m-secondary-hover);
	}

	.service.active {
		background: var(--m-secondary-active);
	}

	.service .mark {
		display: flex;
		flex: none;
		color: var(--m-muted-foreground);
		transition: color 160ms ease;
	}

	.service.active .mark,
	.service:hover .mark {
		color: var(--brand);
	}

	.service .name {
		font-weight: 500;
	}

	.leave {
		display: flex;
		opacity: 0;
		transition: opacity 160ms ease;
	}

	.service.active .leave,
	.service:hover .leave {
		opacity: 1;
	}

	.sign {
		font-size: 13px;
		color: var(--m-muted-foreground);
	}

	.service:hover .sign {
		color: var(--m-foreground);
	}

	.categories {
		display: flex;
		align-self: center;
		max-width: 100%;
		gap: 3.5px;
		padding: 3.5px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: color-mix(in srgb, var(--m-popover) 20%, transparent);
		backdrop-filter: blur(8px);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
	}

	.chip {
		display: flex;
		align-items: center;
		gap: 4px;
		height: 26px;
		padding: 0 8px;
		border: 0;
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-foreground);
		font: inherit;
		font-size: 13px;
		white-space: nowrap;
		cursor: pointer;
	}

	.chip:hover {
		background: var(--m-secondary-hover);
		color: var(--m-foreground);
	}

	.chip.on {
		background: var(--m-secondary-active);
		color: var(--m-foreground);
	}

	.sheet {
		width: 100%;
		max-width: 682px;
		margin: 0 auto;
		padding: 0 21px 28px;
	}

	.eyebrow {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--m-muted-foreground);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 10.5px 0;
		border-bottom: 1px solid var(--m-table-row-border);
	}

	.text {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 3.5px;
	}

	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.detail {
		min-width: 0;
		font-size: 12px;
		line-height: 1.45;
		color: var(--m-muted-foreground);
	}

	.control {
		display: flex;
		flex: none;
		align-items: center;
		gap: 7px;
	}

	.action {
		display: inline-flex;
		align-items: center;
		height: 26px;
		text-decoration: none;
		padding: 0 8.75px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-foreground);
		font: inherit;
		font-size: 12px;
		white-space: nowrap;
		cursor: pointer;
	}

	.action:hover {
		background: var(--m-secondary-hover);
	}

	.reading {
		font-size: 12px;
		color: var(--m-muted-foreground);
		white-space: nowrap;
	}

	.slider {
		display: flex;
		align-items: center;
		gap: 10.5px;
		width: 180px;
	}

	.deck {
		display: flex;
		flex-direction: column;
		gap: 7px;
		padding: 3.5px 0 10.5px;
	}

	.bands {
		display: flex;
		justify-content: space-between;
		gap: 3.5px;
		padding: 10.5px 0 14px;
	}

	.band {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		gap: 7px;
	}

	.db,
	.hz {
		font-size: 11px;
		color: var(--m-muted-foreground);
		white-space: nowrap;
	}

	.slot {
		position: relative;
		width: 4px;
		height: 96px;
		border-radius: 2px;
		background: var(--m-muted);
	}

	.knob {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 12px;
		height: 12px;
		transform: translate(-50%, -50%);
		border-radius: 999px;
		background: var(--m-primary);
	}

	.notice {
		margin: 14px 0 0;
		font-size: 12px;
		line-height: 1.6;
		color: var(--m-muted-foreground);
	}

	.accounts {
		display: flex;
		flex-direction: column;
		gap: 10.5px;
		padding: 10.5px 0;
		border-bottom: 1px solid var(--m-table-row-border);
	}

	.account {
		display: flex;
		min-height: 35px;
		align-items: center;
		gap: 10.5px;
		padding: 8px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
	}

	.account.pressable {
		cursor: pointer;
	}

	.account.pressable:hover {
		background: var(--m-secondary);
	}

	.radio {
		display: flex;
		width: 16px;
		height: 16px;
		flex: none;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--m-border);
		border-radius: 999px;
	}

	.radio.on {
		border-color: var(--m-primary);
		background: var(--m-primary);
	}

	.hole {
		width: 5px;
		height: 5px;
		border-radius: 999px;
	}

	.radio.on .hole {
		background: var(--m-primary-foreground);
	}

	.logo {
		display: flex;
		flex: none;
		color: var(--m-foreground);
	}

	.name {
		overflow: hidden;
		font-weight: 500;
		line-height: 1.25;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.arrow {
		display: flex;
		width: 32px;
		height: 32px;
		flex: none;
		align-items: center;
		justify-content: center;
		color: var(--m-muted-foreground);
	}

	.team {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin-top: 17.5px;
		padding: 17.5px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		background: color-mix(in srgb, var(--m-secondary) 45%, transparent);
	}

	.cap {
		display: flex;
		align-items: center;
		gap: 10.5px;
	}

	.rule {
		flex: 1;
		height: 1px;
		background: var(--m-border);
	}

	.members {
		display: flex;
		flex-direction: column;
		gap: 10.5px;
	}

	.member {
		display: flex;
		align-items: center;
		gap: 10.5px;
		padding: 4px 8px;
		border-radius: var(--m-radius);
		color: inherit;
		text-decoration: none;
	}

	.member:hover {
		background: var(--m-secondary-hover);
	}

	.avatar {
		flex: none;
		border-radius: 50%;
		object-fit: cover;
	}

	.ident {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 1.75px;
	}

	.login {
		overflow: hidden;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.hint,
	.role {
		font-size: 12px;
		color: var(--m-muted-foreground);
	}

	.role {
		flex: none;
		font-weight: 500;
	}

	.entering {
		animation: page 320ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes page {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.entering {
			animation: none;
		}
	}

	.headline {
		display: flex;
		align-items: center;
		height: 40px;
		margin: 0 0 10.5px;
		font-size: 24px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.headline.later {
		margin-top: 40px;
	}

	.group {
		padding: 17.5px 0 3.5px;
	}

	.group .eyebrow {
		display: flex;
		align-items: center;
		gap: 7px;
		margin-bottom: 8px;
	}

	.where {
		display: block;
		margin-top: 14px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--m-muted-foreground);
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-bottom: 7px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--m-muted-foreground);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}

	.back:hover {
		color: var(--m-foreground);
	}

	.drill {
		display: flex;
		width: 32px;
		height: 32px;
		align-items: center;
		justify-content: center;
		border: 0;
		border-radius: var(--m-radius);
		background: none;
		color: var(--m-muted-foreground);
		cursor: pointer;
	}

	.drill:hover {
		background: var(--m-secondary-hover);
		color: var(--m-foreground);
	}

	.mini {
		display: block;
		width: 100%;
	}

	.glyphs {
		display: flex;
		gap: 9px;
	}

	.corner {
		width: 34px;
		height: 34px;
		margin: 14px 0 0 14px;
		border-top: 2px solid var(--m-foreground);
		border-left: 2px solid var(--m-foreground);
	}

	.sketch {
		width: 70%;
		height: 60%;
		fill: var(--m-primary);
		stroke: var(--m-foreground);
		stroke-width: 1.6;
		stroke-linecap: round;
	}

	.sketch path,
	.sketch line {
		fill: none;
	}

	.sketch rect {
		stroke: none;
		opacity: 0.85;
	}

	.bar-sketch {
		position: absolute;
		right: 6px;
		bottom: 6px;
		left: 6px;
		display: grid;
		height: 22px;
		grid-template-columns: 16px 1fr auto 1fr;
		align-items: center;
		gap: 5px;
		padding: 0 5px;
		border-radius: 4px;
		background: var(--m-secondary);
	}

	.bar-sketch.frosted {
		background: color-mix(in srgb, var(--m-secondary) 60%, transparent);
	}

	.bar-sketch .art {
		width: 14px;
		height: 14px;
		border-radius: 2px;
		background: var(--m-primary);
	}

	.bar-sketch .lines {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.bar-sketch i {
		display: block;
		height: 3px;
		border-radius: 2px;
		background: var(--m-muted-foreground);
	}

	.bar-sketch .lines i:first-child {
		width: 80%;
		background: var(--m-foreground);
	}

	.bar-sketch .lines i:last-child {
		width: 50%;
	}

	.bar-sketch .keys {
		display: flex;
		gap: 3px;
	}

	.bar-sketch .keys i {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--m-foreground);
	}

	.bar-sketch .seek {
		height: 2px;
		border-radius: 1px;
		background: var(--m-muted-foreground);
	}

	.bar-sketch.compact {
		height: 14px;
	}

	.bar-sketch.compact .art {
		width: 9px;
		height: 9px;
	}

	.bar-sketch.compact .lines i:last-child {
		display: none;
	}

	.bar-sketch.centered {
		grid-template-columns: 16px auto 1fr;
		height: 26px;
	}

	.bar-sketch.centered .lines {
		grid-column: 3;
		grid-row: 1;
		align-items: center;
	}

	.bar-sketch.centered .keys {
		grid-column: 2;
		grid-row: 1;
	}

	.bar-sketch.centered .seek {
		grid-column: 3;
		grid-row: 1;
		align-self: end;
		margin: 0 25% 3px;
	}

	.levels {
		display: flex;
		align-items: flex-end;
		gap: 3px;
		height: 18px;
	}

	.levels i {
		display: block;
		width: 5px;
		border-radius: 1px;
		background: var(--m-muted-foreground);
		opacity: 0.35;
	}

	.levels i:nth-child(1) {
		height: 33%;
	}

	.levels i:nth-child(2) {
		height: 66%;
	}

	.levels i:nth-child(3) {
		height: 100%;
	}

	.levels i.lit {
		background: var(--m-primary);
		opacity: 1;
	}

	.sources {
		display: flex;
		flex-direction: column;
		gap: 3.5px;
		padding-bottom: 7px;
	}

	.source {
		display: flex;
		align-items: center;
		gap: 10.5px;
		padding: 5px 8px;
		border: 1px solid var(--m-border);
		border-radius: var(--m-radius);
		color: var(--m-muted-foreground);
	}

	.source .name {
		flex: 1;
		color: var(--m-foreground);
	}

	.source.off .name {
		color: var(--m-muted-foreground);
	}

	.rank {
		width: 14px;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}
</style>
