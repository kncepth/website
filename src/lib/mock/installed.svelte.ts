/**
 * The community themes the listener installed into the mock, and the dialogs on the way: the
 * gallery, the question before installing, and the one before deleting.
 */
import { themes, type CommunityTheme } from '$lib/data/themes';
import { settings } from '$lib/mock/settings.svelte';
import { addPalette, dim, removePalette } from '$lib/mock/theme';

export type Family = { id: string; label: string; variants: string[]; installed: true };

let families = $state<Family[]>([]);
let browsing = $state(false);
let offer = $state<CommunityTheme | null>(null);
let doomed = $state<Family | null>(null);

export const installed = {
	get families() {
		return families;
	},
	get browsing() {
		return browsing;
	},
	get offer() {
		return offer;
	},
	get doomed() {
		return doomed;
	},
	has(id: string) {
		return families.some((family) => family.id === id);
	},
	browse(open: boolean) {
		browsing = open;
	},
	/** Asks before installing, the way a theme link does in Sonora. */
	ask(theme: CommunityTheme | null) {
		offer = theme;
	},
	/** Adds the offered theme to the themes folder and switches to it, as the desktop does: the
	 *  variant matching the dark appearance, else the first. */
	install() {
		const theme = offer;
		if (!theme) return;
		offer = null;
		browsing = false;
		for (const variant of theme.variants) addPalette(variant.title, variant.colors);
		if (!this.has(theme.id)) {
			families = [
				...families,
				{
					id: theme.id,
					label: theme.name,
					variants: theme.variants.map((variant) => variant.title),
					installed: true
				}
			];
		}
		settings.adaptive = false;
		settings.theme =
			theme.variants.find((variant) => dim(variant.title))?.title ?? theme.variants[0].title;
	},
	/** Asks before deleting an installed family. */
	confirmDelete(id: string | null) {
		doomed = families.find((family) => family.id === id) ?? null;
	},
	/** Deletes the family asked about. When it was the theme in use the mock falls back to Dark. */
	remove() {
		const family = doomed;
		if (!family) return;
		doomed = null;
		if (family.variants.includes(String(settings.theme))) settings.theme = 'Dark';
		for (const title of family.variants) removePalette(title);
		families = families.filter((one) => one.id !== family.id);
	}
};

export { themes as community };
