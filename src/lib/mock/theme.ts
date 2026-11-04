const SURFACE_TINT = 0.5;
const BORDER_TINT = 0.4;
const TEXT_TINT = 0.12;
const MAX_WASH_SATURATION = 0.7;
const MIN_ACCENT_SATURATION = 0.6;
const MAX_ACCENT_SATURATION = 0.85;

/** Every colour token a Sonora theme sets, in the order the palettes below list them. */
export const FIELDS = [
	'background',
	'foreground',
	'border',
	'muted',
	'overlay',
	'overlay_foreground',
	'muted_foreground',
	'secondary',
	'secondary_hover',
	'secondary_active',
	'primary',
	'primary_foreground',
	'primary_hover',
	'danger',
	'danger_foreground',
	'danger_hover',
	'popover',
	'popover_foreground',
	'progress_bar',
	'selection',
	'sidebar',
	'sidebar_accent',
	'sidebar_border',
	'title_bar_border',
	'table_head',
	'table_head_foreground',
	'table_row_border',
	'table_hover',
	'table_active',
	'table_active_border'
];

const SURFACES = new Set([
	'background',
	'secondary',
	'secondary_hover',
	'secondary_active',
	'muted',
	'popover',
	'sidebar',
	'sidebar_accent',
	'table_head',
	'table_hover'
]);

const BORDERS = new Set(['border', 'sidebar_border', 'title_bar_border', 'table_row_border']);

const TEXTS = new Set([
	'foreground',
	'popover_foreground',
	'muted_foreground',
	'table_head_foreground'
]);

const palettes: Record<string, string> = {
	dark: '0a0a0a fafafa 50505066 262626 0000008c fafafa 909090 171717 36363666 4d4d4d66 fafafa 171717 e5e5e5b3 7f1d1d fef2f2 8b2020b3 141414 fafafa f5f5f5 1d4ed8 0a0a0a 50505066 262626 262626 171717cc 8a8a8a 262626b3 3b3b3b66 1e40af33 1d4ed8',
	light:
		'fafafa 171717 9b9b9b66 e5e5e5 0000008c fafafa 606060 f5f5f5 d5d5d566 b7b7b766 171717 fafafa 262626b3 b91c1c fef2f2 991b1bb3 ffffff 171717 262626 2563eb f5f5f5 cdcdcd66 d4d4d4 d4d4d4 f5f5f5e6 666666 d4d4d4b3 e8e8e866 2563eb1f 2563eb',
	'catppuccin-latte':
		'eff1f5 4c4f69 acb0be66 ccd0da 0000008c eff1f5 6c6f85 e6e9ef ccd0da66 bcc0cc66 8839ef eff1f5 7430cbb3 d20f39 eff1f5 b20d30b3 eff1f5 4c4f69 8839ef 8839ef eff1f5 bcc0cc66 ccd0da ccd0da e6e9efe6 6c6f85 ccd0dab3 ccd0da66 8839ef33 8839ef',
	'catppuccin-frappe':
		'303446 c6d0f5 62688066 51576d 0000008c c6d0f5 a5adce 414559 51576d66 62688066 ca9ee6 232634 d7b6ecb3 e78284 232634 eda1a3b3 292c3c c6d0f5 ca9ee6 ca9ee6 303446 62688066 414559 414559 292c3ce6 949cbb 414559b3 51576d66 ca9ee633 ca9ee6',
	'catppuccin-macchiato':
		'24273a cad3f5 5b607866 494d64 0000008c cad3f5 a5adcb 363a4f 494d6466 5b607866 c6a0f6 181926 d4b8f8b3 ed8796 181926 f2a5b0b3 1e2030 cad3f5 c6a0f6 c6a0f6 24273a 5b607866 363a4f 363a4f 1e2030e6 939ab7 363a4fb3 494d6466 c6a0f633 c6a0f6',
	'catppuccin-mocha':
		'1e1e2e cdd6f4 585b7066 45475a 0000008c cdd6f4 a6adc8 313244 45475a66 585b7066 cba6f7 11111b d8bcf9b3 f38ba8 11111b f6a8beb3 181825 cdd6f4 cba6f7 cba6f7 1e1e2e 585b7066 313244 313244 181825e6 9399b2 313244b3 45475a66 cba6f733 cba6f7',
	dracula:
		'282a36 f8f8f2 6272a466 44475a 0000008c f8f8f2 b4bccf 343746 44475a66 6272a466 bd93f9 282a36 ceaefab3 ff5555 282a36 ff8080b3 21222c f8f8f2 bd93f9 bd93f9 282a36 6272a466 343746 343746 21222ce6 b4bccf 343746b3 44475a66 bd93f933 bd93f9',
	'gruvbox-dark':
		'282828 ebdbb2 665c5466 3c3836 0000008c ebdbb2 a89984 32302f 50494566 665c5466 fe8019 282828 fea052b3 fb4934 282828 fc7667b3 32302f ebdbb2 fe8019 fe8019 282828 665c5466 3c3836 3c3836 282828e6 928374 3c3836b3 50494566 fe801933 fe8019',
	'gruvbox-dark-hard':
		'1d2021 ebdbb2 665c5466 3c3836 0000008c ebdbb2 a89984 282828 50494566 665c5466 fe8019 1d2021 fea052b3 fb4934 1d2021 fc7667b3 282828 ebdbb2 fe8019 fe8019 1d2021 665c5466 3c3836 3c3836 1d2021e6 928374 3c3836b3 50494566 fe801933 fe8019',
	'gruvbox-light':
		'fbf1c7 3c3836 a8998466 ebdbb2 0000008c ebdbb2 7c6f64 f2e5bc d5c4a166 bdae9366 af3a03 fbf1c7 953103b3 9d0006 fbf1c7 850005b3 fbf1c7 3c3836 af3a03 af3a03 fbf1c7 bdae9366 d5c4a1 d5c4a1 f2e5bce6 7c6f64 d5c4a1b3 d5c4a166 af3a0333 af3a03',
	'gruvbox-light-hard':
		'f9f5d7 3c3836 a8998466 ebdbb2 0000008c ebdbb2 7c6f64 f2e5bc d5c4a166 bdae9366 af3a03 f9f5d7 953103b3 9d0006 f9f5d7 850005b3 f9f5d7 3c3836 af3a03 af3a03 f9f5d7 bdae9366 d5c4a1 d5c4a1 f2e5bce6 7c6f64 d5c4a1b3 d5c4a166 af3a0333 af3a03',
	nord: '2e3440 d8dee9 4c566a66 434c5e 0000008c eceff4 a0a8b6 3b4252 4c566a66 616a7d66 88c0d0 2e3440 a6d0dcb3 bf616a eceff4 cf888fb3 3b4252 d8dee9 88c0d0 88c0d0 2e3440 4c566a66 3b4252 3b4252 2e3440e6 a0a8b6 3b4252b3 4c566a66 88c0d033 88c0d0',
	'rose-pine-main':
		'191724 e0def4 524f6766 403d52 0000008c e0def4 908caa 1f1d2e 403d5266 524f6766 c4a7e7 191724 d3bdedb3 eb6f92 191724 f093adb3 26233a e0def4 c4a7e7 c4a7e7 191724 524f6766 403d52 403d52 1f1d2ee6 908caa 403d52b3 403d5266 c4a7e733 c4a7e7',
	'rose-pine-moon':
		'232136 e0def4 56526e66 44415a 0000008c e0def4 908caa 2a273f 44415a66 56526e66 c4a7e7 232136 d3bdedb3 eb6f92 232136 f093adb3 393552 e0def4 c4a7e7 c4a7e7 232136 56526e66 44415a 44415a 2a273fe6 908caa 44415ab3 44415a66 c4a7e733 c4a7e7',
	'rose-pine-dawn':
		'faf4ed 575279 cecacd66 dfdad9 0000008c faf4ed 797593 fffaf3 dfdad966 cecacd66 907aa9 fffaf3 7a6890b3 b4637a fffaf3 995468b3 f2e9e1 575279 907aa9 907aa9 faf4ed cecacd66 dfdad9 dfdad9 fffaf3e6 797593 dfdad9b3 dfdad966 907aa933 907aa9',
	'solarized-dark':
		'002b36 93a1a1 586e7566 1f4751 0000008c eee8d5 839496 073642 586e7566 657b8366 268bd2 002b36 5ca8ddb3 dc322f fdf6e3 e56563b3 073642 93a1a1 268bd2 268bd2 002b36 586e7566 073642 073642 002b36e6 839496 073642b3 586e7566 268bd233 268bd2',
	'solarized-light':
		'fdf6e3 586e75 93a1a166 d3d3c5 0000008c fdf6e3 657b83 eee8d5 93a1a166 83949666 268bd2 fdf6e3 2076b2b3 dc322f fdf6e3 bb2a28b3 fdf6e3 586e75 268bd2 268bd2 fdf6e3 93a1a166 eee8d5 eee8d5 eee8d5e6 657b83 eee8d5b3 93a1a166 268bd233 268bd2'
};

const kinds: Record<string, string> = {
	System: 'system',
	Dark: 'dark',
	Light: 'light',
	'Catppuccin Latte': 'catppuccin-latte',
	'Catppuccin Frappé': 'catppuccin-frappe',
	'Catppuccin Macchiato': 'catppuccin-macchiato',
	'Catppuccin Mocha': 'catppuccin-mocha',
	Dracula: 'dracula',
	'Gruvbox Dark': 'gruvbox-dark',
	'Gruvbox Dark Hard': 'gruvbox-dark-hard',
	'Gruvbox Light': 'gruvbox-light',
	'Gruvbox Light Hard': 'gruvbox-light-hard',
	Nord: 'nord',
	'Rosé Pine Main': 'rose-pine-main',
	'Rosé Pine Moon': 'rose-pine-moon',
	'Rosé Pine Dawn': 'rose-pine-dawn',
	'Solarized Dark': 'solarized-dark',
	'Solarized Light': 'solarized-light'
};

/** The theme cards in Settings: the built-in palettes, then each theme file family with its variants. */
export const families: { id: string; label: string; variants: string[] }[] = [
	{ id: 'system', label: 'System', variants: ['System'] },
	{ id: 'dark', label: 'Dark', variants: ['Dark'] },
	{ id: 'light', label: 'Light', variants: ['Light'] },
	{
		id: 'catppuccin',
		label: 'Catppuccin',
		variants: ['Catppuccin Latte', 'Catppuccin Frappé', 'Catppuccin Macchiato', 'Catppuccin Mocha']
	},
	{ id: 'dracula', label: 'Dracula', variants: ['Dracula'] },
	{
		id: 'gruvbox',
		label: 'Gruvbox',
		variants: ['Gruvbox Dark', 'Gruvbox Dark Hard', 'Gruvbox Light', 'Gruvbox Light Hard']
	},
	{ id: 'nord', label: 'Nord', variants: ['Nord'] },
	{
		id: 'rose-pine',
		label: 'Rosé Pine',
		variants: ['Rosé Pine Main', 'Rosé Pine Moon', 'Rosé Pine Dawn']
	},
	{ id: 'solarized', label: 'Solarized', variants: ['Solarized Dark', 'Solarized Light'] }
];

export const themes = Object.keys(kinds);

/** The Dark theme's colours by token, which a theme file's missing tokens fall back to in Sonora. */
export const darkColors: Record<string, string> = Object.fromEntries(
	palettes.dark.split(' ').map((color, at) => [FIELDS[at], `#${color}`])
);

export type Shade = [number, number, number, number];

export type Tint = { hue: number; saturation: number };

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

const round = (value: number) => Math.round(value * 1000) / 1000;

function shade(value: string): Shade {
	const bits = parseInt(value, 16);
	const wide = value.length === 8;
	const red = ((wide ? bits >>> 24 : bits >> 16) & 255) / 255;
	const green = ((wide ? bits >>> 16 : bits >> 8) & 255) / 255;
	const blue = ((wide ? bits >>> 8 : bits) & 255) / 255;
	const alpha = wide ? (bits & 255) / 255 : 1;

	const top = Math.max(red, green, blue);
	const low = Math.min(red, green, blue);
	const lightness = (top + low) / 2;
	const span = top - low;
	if (span === 0) return [0, 0, lightness * 100, alpha];

	const saturation = span / (lightness > 0.5 ? 2 - top - low : top + low);
	const hue =
		top === red
			? (green - blue) / span + (green < blue ? 6 : 0)
			: top === green
				? (blue - red) / span + 2
				: (red - green) / span + 4;

	return [hue * 60, saturation, lightness * 100, alpha];
}

const css = ([hue, saturation, lightness, alpha]: Shade) => {
	const parts = `${round(hue)} ${round(saturation * 100)}% ${round(lightness)}%`;
	return alpha === 1 ? `hsl(${parts})` : `hsl(${parts} / ${round(alpha)})`;
};

const wash = (base: Shade, tint: Tint, strength: number): Shade => [
	tint.hue,
	Math.min(base[1] + tint.saturation * strength, MAX_WASH_SATURATION),
	base[2],
	base[3]
];

function shades(source: string, tint: Tint | undefined): Record<string, string> {
	const raw = source.split(' ').map(shade);
	const out: Record<string, Shade> = {};
	FIELDS.forEach((name, at) => {
		out[name] = raw[at];
	});

	if (tint) {
		for (const name of FIELDS) {
			const strength = SURFACES.has(name)
				? SURFACE_TINT
				: BORDERS.has(name)
					? BORDER_TINT
					: TEXTS.has(name)
						? TEXT_TINT
						: 0;
			if (strength) out[name] = wash(out[name], tint, strength);
		}

		const dark = raw[0][2] < 50;
		const saturation = clamp(tint.saturation, MIN_ACCENT_SATURATION, MAX_ACCENT_SATURATION);
		const accent = (lightness: number, alpha = 1): Shade => [
			tint.hue,
			saturation,
			lightness,
			alpha
		];

		out.primary = accent(dark ? 72 : 42);
		out.primary_hover = accent(dark ? 82 : 34, 0.7);
		out.primary_foreground = [tint.hue, Math.min(tint.saturation, 0.25), dark ? 8 : 98, 1];
		out.progress_bar = out.primary;
		out.selection = accent(dark ? 44 : 50);
		out.table_active = accent(dark ? 44 : 50, 0.22);
		out.table_active_border = out.primary;
	}

	const tokens: Record<string, string> = {};
	for (const name of FIELDS) {
		tokens[`--m-${name.replaceAll('_', '-')}`] = css(out[name]);
	}
	return tokens;
}

export function palette(
	tint: Tint | undefined,
	adaptive = true,
	theme = 'Dark'
): Record<string, string> {
	const kind = kinds[theme] ?? 'dark';
	const washing =
		adaptive && (kind === 'dark' || kind === 'light' || kind === 'system') ? tint : undefined;
	if (kind !== 'system') return shades(palettes[kind], washing);

	const light = shades(palettes.light, washing);
	const dark = shades(palettes.dark, washing);
	const tokens: Record<string, string> = {};
	for (const name of Object.keys(dark)) {
		tokens[name] = `light-dark(${light[name]}, ${dark[name]})`;
	}
	return tokens;
}

/** Whether a theme draws light text on a dark page, which the mock's colour scheme follows. */
export function dim(theme: string): boolean {
	const kind = kinds[theme] ?? 'dark';
	if (kind === 'system') return false;
	return shade(palettes[kind].split(' ')[0])[2] < 50;
}

/** A theme's own colours by token name, for its miniature on a theme card. */
export function colorsOf(theme: string): Record<string, string> {
	const kind = kinds[theme] ?? 'dark';
	const source = palettes[kind === 'system' ? 'dark' : kind];
	return Object.fromEntries(source.split(' ').map((color, at) => [FIELDS[at], `#${color}`]));
}
