/** The mock's parametric equalizer: filters, a preamp, undo, and the curve they draw. */

export type Kind =
	| 'Peak'
	| 'Low shelf'
	| 'High shelf'
	| 'Low pass'
	| 'High pass'
	| 'Notch'
	| 'Band pass'
	| 'All pass';

export type Filter = { id: number; on: boolean; kind: Kind; hz: number; db: number; q: number };

export const kinds: Kind[] = [
	'Peak',
	'Low shelf',
	'High shelf',
	'Low pass',
	'High pass',
	'Notch',
	'Band pass',
	'All pass'
];

const RATE = 48000;
const MAX_FILTERS = 20;
export const LOW = 20;
export const HIGH = 20000;
export const RANGE = 15;

type Shape = Omit<Filter, 'id' | 'on'>;

const peak = (hz: number, db: number, q = 1): Shape => ({ kind: 'Peak', hz, db, q });
const low = (hz: number, db: number): Shape => ({ kind: 'Low shelf', hz, db, q: 0.71 });
const high = (hz: number, db: number): Shape => ({ kind: 'High shelf', hz, db, q: 0.71 });

/** The built-in sounds, each a few filters, as the desktop's presets draw them. */
export const presets: Record<string, Shape[]> = {
	Flat: [],
	'Bass boost': [low(105, 6)],
	'Bass reducer': [low(105, -6)],
	'Treble boost': [high(6000, 5)],
	Vocal: [peak(250, -2, 0.9), peak(2500, 3, 1.1), peak(5000, 2, 1.4)],
	Rock: [low(90, 4), peak(800, -2, 1), high(5000, 4)],
	Pop: [peak(120, 2), peak(1500, 2.5, 0.8), high(8000, 1.5)],
	Jazz: [low(100, 3), peak(1000, -1.5), high(6000, 2.5)],
	Classical: [low(80, 2), high(8000, 3)],
	Electronic: [low(60, 5), peak(400, -2), high(10000, 4)],
	Acoustic: [peak(200, 2), peak(3000, 2.5, 1.2), high(9000, 1)],
	Loudness: [low(60, 6), high(9000, 5)]
};

export const profiles = ['Default', 'Headphones', 'Desk speakers'];

const AUTO_EQ: Shape[] = [
	low(105, 5.5),
	peak(180, -2.4, 0.7),
	peak(1450, 1.8, 1.6),
	peak(3200, -3.1, 2.2),
	peak(5600, 2.6, 3),
	high(10000, -1.5)
];

let next = 1;
const make = (shapes: Shape[]): Filter[] =>
	shapes.map((shape) => ({ id: next++, on: true, ...shape }));

let sound = $state('Flat');
let filters = $state<Filter[]>([]);
let enabled = $state(true);
let advanced = $state(false);
let bass = $state(0);
let treble = $state(0);
let preamp = $state<number | null>(null);
let past = $state<string[]>([]);
let ahead = $state<string[]>([]);

function snapshot() {
	return JSON.stringify({ sound, filters, bass, treble, preamp });
}

function restore(saved: string) {
	const state = JSON.parse(saved);
	sound = state.sound;
	filters = state.filters;
	bass = state.bass;
	treble = state.treble;
	preamp = state.preamp;
}

function remember() {
	past = [...past.slice(-49), snapshot()];
	ahead = [];
}

/** How loud one filter makes `hz`, in dB, from the RBJ cookbook biquads at 48 kHz. */
function response(filter: Filter, hz: number): number {
	const w0 = (2 * Math.PI * filter.hz) / RATE;
	const cos = Math.cos(w0);
	const alpha = Math.sin(w0) / (2 * Math.max(filter.q, 0.05));
	const a = Math.pow(10, filter.db / 40);
	let b0 = 1;
	let b1 = 0;
	let b2 = 0;
	let a0 = 1;
	let a1 = 0;
	let a2 = 0;
	switch (filter.kind) {
		case 'Peak':
			[b0, b1, b2, a0, a1, a2] = [
				1 + alpha * a,
				-2 * cos,
				1 - alpha * a,
				1 + alpha / a,
				-2 * cos,
				1 - alpha / a
			];
			break;
		case 'Low shelf': {
			const root = 2 * Math.sqrt(a) * alpha;
			[b0, b1, b2] = [
				a * (a + 1 - (a - 1) * cos + root),
				2 * a * (a - 1 - (a + 1) * cos),
				a * (a + 1 - (a - 1) * cos - root)
			];
			[a0, a1, a2] = [
				a + 1 + (a - 1) * cos + root,
				-2 * (a - 1 + (a + 1) * cos),
				a + 1 + (a - 1) * cos - root
			];
			break;
		}
		case 'High shelf': {
			const root = 2 * Math.sqrt(a) * alpha;
			[b0, b1, b2] = [
				a * (a + 1 + (a - 1) * cos + root),
				-2 * a * (a - 1 + (a + 1) * cos),
				a * (a + 1 + (a - 1) * cos - root)
			];
			[a0, a1, a2] = [
				a + 1 - (a - 1) * cos + root,
				2 * (a - 1 - (a + 1) * cos),
				a + 1 - (a - 1) * cos - root
			];
			break;
		}
		case 'Low pass':
			[b0, b1, b2, a0, a1, a2] = [
				(1 - cos) / 2,
				1 - cos,
				(1 - cos) / 2,
				1 + alpha,
				-2 * cos,
				1 - alpha
			];
			break;
		case 'High pass':
			[b0, b1, b2, a0, a1, a2] = [
				(1 + cos) / 2,
				-(1 + cos),
				(1 + cos) / 2,
				1 + alpha,
				-2 * cos,
				1 - alpha
			];
			break;
		case 'Notch':
			[b0, b1, b2, a0, a1, a2] = [1, -2 * cos, 1, 1 + alpha, -2 * cos, 1 - alpha];
			break;
		case 'Band pass':
			[b0, b1, b2, a0, a1, a2] = [alpha, 0, -alpha, 1 + alpha, -2 * cos, 1 - alpha];
			break;
		default:
			return 0;
	}
	const w = (2 * Math.PI * hz) / RATE;
	const [c1, s1, c2, s2] = [Math.cos(w), Math.sin(w), Math.cos(2 * w), Math.sin(2 * w)];
	const top = Math.hypot(b0 + b1 * c1 + b2 * c2, b1 * s1 + b2 * s2);
	const bottom = Math.hypot(a0 + a1 * c1 + a2 * c2, a1 * s1 + a2 * s2);
	return 20 * Math.log10(top / bottom);
}

/** The filters that shape the sound: the chosen ones, then bass and treble in simple mode. */
function active(): Filter[] {
	const tone = advanced
		? []
		: [
				{ id: -1, on: bass !== 0, kind: 'Low shelf' as Kind, hz: 105, db: bass, q: 0.71 },
				{ id: -2, on: treble !== 0, kind: 'High shelf' as Kind, hz: 6000, db: treble, q: 0.71 }
			];
	return [...filters, ...tone].filter((filter) => filter.on);
}

export const equalizer = {
	get sound() {
		return sound;
	},
	get filters() {
		return filters;
	},
	get enabled() {
		return enabled;
	},
	get advanced() {
		return advanced;
	},
	get bass() {
		return bass;
	},
	get treble() {
		return treble;
	},
	get undoable() {
		return past.length > 0;
	},
	get redoable() {
		return ahead.length > 0;
	},
	get full() {
		return filters.length >= MAX_FILTERS;
	},
	/** The curve's peak above 0 dB, which the automatic preamp lowers the level by. */
	get headroom() {
		let top = 0;
		for (let step = 0; step <= 120; step += 1)
			top = Math.max(top, this.gain(LOW * Math.pow(HIGH / LOW, step / 120), false));
		return top;
	},
	get preamp() {
		return preamp ?? -Math.round(this.headroom * 10) / 10;
	},
	get manual() {
		return preamp !== null;
	},
	/** How far the sound clips with a manual preamp that leaves too little room, in dB. */
	get clipping() {
		if (preamp === null) return 0;
		return Math.max(this.headroom + preamp, 0);
	},
	/** The curve at `hz`, with the preamp unless `level` is off. */
	gain(hz: number, level = true): number {
		if (!enabled) return 0;
		const shaped = active().reduce((sum, filter) => sum + response(filter, hz), 0);
		return level ? shaped + this.preamp : shaped;
	},
	choose(name: string) {
		remember();
		sound = name;
		if (presets[name]) filters = make(presets[name]);
		else if (name === 'Headphones') filters = make(AUTO_EQ);
		else if (name === 'Desk speakers')
			filters = make([low(80, -3), peak(240, -2.5, 1.4), high(9000, 2)]);
		else filters = [];
		bass = 0;
		treble = 0;
	},
	toggle() {
		enabled = !enabled;
	},
	mode(next: boolean) {
		advanced = next;
	},
	tone(which: 'bass' | 'treble', db: number, settle = false) {
		if (settle) remember();
		const snapped = Math.abs(db) < 0.3 ? 0 : Math.round(db * 2) / 2;
		if (which === 'bass') bass = snapped;
		else treble = snapped;
	},
	setPreamp(db: number | null) {
		remember();
		preamp = db;
	},
	/** Starts a change that may be dragged on, so undo takes it back in one step. */
	begin() {
		remember();
	},
	update(id: number, change: Partial<Filter>) {
		filters = filters.map((filter) => (filter.id === id ? { ...filter, ...change } : filter));
		// editing a built-in sound leaves it, while a profile keeps its name
		if (presets[sound]) sound = 'Custom';
	},
	add() {
		if (this.full) return;
		remember();
		filters = [...filters, ...make([peak(1000, 0, 1)])];
	},
	remove(id: number) {
		remember();
		filters = filters.filter((filter) => filter.id !== id);
	},
	undo() {
		const last = past.at(-1);
		if (!last) return;
		ahead = [snapshot(), ...ahead];
		past = past.slice(0, -1);
		restore(last);
	},
	redo() {
		const [first, ...rest] = ahead;
		if (!first) return;
		past = [...past, snapshot()];
		ahead = rest;
		restore(first);
	}
};
