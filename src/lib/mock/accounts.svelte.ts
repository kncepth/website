/** The streaming accounts in the mock: which are signed in, which plays, and a sign-in under way. */
import { SvelteSet } from 'svelte/reactivity';
import { providers } from '$lib/mock/catalog';

/** How long the pretend browser sign-in takes before the account lands. */
const SIGN_IN = 1600;

const stored = new SvelteSet(providers.filter((one) => one.stored).map((one) => one.glyph));
let active = $state<string | null>(providers.find((one) => one.active)?.glyph ?? null);
let waiting = $state<string | null>(null);
let timer: ReturnType<typeof setTimeout> | 0 = 0;

export const accounts = {
	get active() {
		return active;
	},
	get waiting() {
		return waiting;
	},
	/** The provider in use, or `null` while signed out of every one. */
	get current() {
		return providers.find((one) => one.glyph === active) ?? null;
	},
	stored(glyph: string) {
		return stored.has(glyph);
	},
	/** Plays from an account already signed in. */
	use(glyph: string) {
		if (stored.has(glyph) && !waiting) active = glyph;
	},
	/** Opens the provider's sign-in, and once it answers keeps the account and plays from it. */
	signIn(glyph: string) {
		if (waiting) return;
		waiting = glyph;
		timer = setTimeout(() => {
			stored.add(glyph);
			active = glyph;
			waiting = null;
		}, SIGN_IN);
	},
	cancel() {
		clearTimeout(timer);
		waiting = null;
	},
	/** Forgets an account. Leaving the one in use moves to another kept account, if any. */
	signOut(glyph: string) {
		stored.delete(glyph);
		if (active !== glyph) return;
		active = providers.find((one) => stored.has(one.glyph))?.glyph ?? null;
	}
};
