import { SvelteSet } from 'svelte/reactivity';
import { album, catalogue, origin, similar, tracks, upcoming } from '$lib/mock/album';

const albumOrder = tracks.map((track) => track.id);
const playlistOrder = upcoming.map((track) => track.id);

function after(id: string) {
	const at = albumOrder.indexOf(id);
	return at < 0 ? [...albumOrder] : albumOrder.slice(at + 1);
}

function scramble(ids: string[]) {
	const out = [...ids];
	for (let i = out.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

let current = $state('t2');
let past = $state(['t5', 't1']);
let source = $state(playlistOrder);
let queued = $state([...playlistOrder]);
let from = $state(origin);
let suggested = $state(similar.map((track) => track.id));
let playing = $state(false);
let elapsed = $state(56);
let volume = $state(0.7);
let shuffle = $state(false);
let repeat = $state(0);
let radio = $state(true);
let rotation = 0;
let hand = 0;
const liked = new SvelteSet(['t2']);
let ticker = 0;
let anchor = 0;
let base = 0;

function replenish() {
	if (!radio || suggested.length >= 3) return;
	const more = [];
	while (suggested.length + more.length < similar.length) {
		more.push(similar[rotation % similar.length].id);
		rotation += 1;
	}
	suggested = [...suggested, ...more];
}

function stop() {
	if (ticker) cancelAnimationFrame(ticker);
	ticker = 0;
}

function wind() {
	anchor = performance.now();
	base = elapsed;
}

function remember() {
	past = [...past, current];
}

function land(value: number) {
	elapsed = value;
	wind();
}

function start(id: string) {
	remember();
	current = id;
	land(0);
	source = after(id);
	queued = shuffle ? scramble(source) : [...source];
	from = { name: album.title, kind: 'Album' };
}

function advance() {
	if (queued.length) {
		const [next, ...rest] = queued;
		remember();
		current = next;
		queued = rest;
		land(0);
		return true;
	}
	if (suggested.length) {
		const [next, ...rest] = suggested;
		remember();
		current = next;
		suggested = rest;
		land(0);
		replenish();
		return true;
	}
	return false;
}

function tick(now: number) {
	ticker = requestAnimationFrame(tick);

	const span = catalogue.get(current)?.length ?? 0;
	const along = base + (now - anchor) / 1000;
	if (along < span) {
		elapsed = along;
		return;
	}
	if (repeat === 2) {
		land(0);
		return;
	}
	if (advance()) return;
	if (repeat === 1) {
		start(albumOrder[0]);
		return;
	}
	land(span);
	playing = false;
	stop();
}

export const player = {
	get id() {
		return current;
	},
	get track() {
		return catalogue.get(current) ?? tracks[0];
	},
	get from() {
		return from;
	},
	get past() {
		return past;
	},
	get queued() {
		return queued;
	},
	get suggested() {
		return radio ? suggested : [];
	},
	get playing() {
		return playing;
	},
	get elapsed() {
		return Math.min(elapsed, this.track.length);
	},
	get progress() {
		return this.elapsed / this.track.length;
	},
	get volume() {
		return volume;
	},
	get shuffle() {
		return shuffle;
	},
	get repeat() {
		return repeat;
	},
	get radio() {
		return radio;
	},
	get reordered() {
		return queued.length !== source.length || queued.some((id, at) => id !== source[at]);
	},

	likes(id: string) {
		return liked.has(id);
	},
	toggleLike(id: string) {
		if (liked.has(id)) liked.delete(id);
		else liked.add(id);
	},

	resume() {
		if (playing) return;
		playing = true;
		wind();
		if (!ticker) ticker = requestAnimationFrame(tick);
	},
	pause() {
		playing = false;
		stop();
	},
	toggle() {
		if (playing) this.pause();
		else this.resume();
	},
	select(id: string) {
		if (id === current) {
			this.toggle();
			return;
		}
		const at = queued.indexOf(id);
		if (at >= 0) {
			remember();
			current = id;
			land(0);
			queued = queued.slice(at + 1);
			this.resume();
			return;
		}
		if (suggested.includes(id)) {
			remember();
			current = id;
			land(0);
			suggested = suggested.slice(suggested.indexOf(id) + 1);
			replenish();
			this.resume();
			return;
		}
		start(id);
		this.resume();
	},
	previous() {
		if (elapsed > 3) {
			land(0);
			return;
		}
		const at = albumOrder.indexOf(current);
		this.select(albumOrder[at <= 0 ? albumOrder.length - 1 : at - 1]);
	},
	next() {
		if (advance()) {
			this.resume();
			return;
		}
		this.select(albumOrder[0]);
	},
	seek(fraction: number) {
		land(fraction * this.track.length);
	},
	setVolume(level: number) {
		volume = level;
	},
	playShuffled() {
		shuffle = true;
		const rest = scramble(albumOrder);
		const [first, ...tail] = rest;
		remember();
		current = first;
		land(0);
		source = after(first);
		queued = tail;
		from = { name: album.title, kind: 'Album' };
		this.resume();
	},
	toggleShuffle() {
		shuffle = !shuffle;
		queued = shuffle ? scramble(queued) : [...source];
	},
	cycleRepeat() {
		repeat = (repeat + 1) % 3;
	},
	toggleRadio() {
		radio = !radio;
		if (radio) replenish();
	},
	resetQueue() {
		queued = [...source];
		shuffle = false;
	},
	clearQueue() {
		queued = [];
		hand = 0;
	},
	/** Puts songs at the front of the queue, after the ones queued by hand, or at its very end. */
	enqueue(ids: string[], where: 'next' | 'end' | 'last') {
		const fresh = ids.filter((id) => id !== current);
		if (!fresh.length) return;
		const rest = queued.filter((id) => !fresh.includes(id));
		if (where === 'last') {
			queued = [...rest, ...fresh];
			return;
		}
		const at = where === 'next' ? 0 : Math.min(hand, rest.length);
		queued = [...rest.slice(0, at), ...fresh, ...rest.slice(at)];
		hand += fresh.length;
	},
	/** Starts a list of songs from its first one, the way a page's Play button does. */
	play(ids: string[], name: string, kind: string) {
		const [first, ...rest] = shuffle ? scramble(ids) : ids;
		if (!first) return;
		remember();
		current = first;
		land(0);
		source = rest;
		queued = [...rest];
		hand = 0;
		from = { name, kind };
		this.resume();
	},
	release() {
		stop();
	}
};
