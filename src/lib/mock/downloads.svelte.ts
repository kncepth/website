/** Downloads in the mock: a job per album, playlist or song, filled one song at a time. */
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { catalogue } from '$lib/mock/album';

export type Job = {
	key: string;
	subject: 'Album' | 'Playlist' | 'Song';
	name: string;
	cover: string;
	left: string[];
};

const STEP = 90;
const PER_SONG = 1400;

let jobs = $state<Job[]>([]);
const progress = new SvelteMap<string, number>();
const landed = new SvelteSet<string>();
let total = $state(0);
let ticker: ReturnType<typeof setInterval> | 0 = 0;

function run() {
	if (ticker) return;
	ticker = setInterval(() => {
		const job = jobs[0];
		if (!job) {
			clearInterval(ticker);
			ticker = 0;
			total = 0;
			return;
		}
		const id = job.left[0];
		if (!id) {
			jobs = jobs.slice(1);
			return;
		}
		const done = (progress.get(id) ?? 0) + STEP / PER_SONG;
		if (done < 1) {
			progress.set(id, done);
			return;
		}
		progress.delete(id);
		landed.add(id);
		jobs = jobs
			.map((entry) => ({ ...entry, left: entry.left.filter((song) => song !== id) }))
			.filter((entry) => entry.left.length);
	}, STEP);
}

function drop(ids: string[]) {
	for (const id of ids) progress.delete(id);
}

export const downloads = {
	get jobs() {
		return jobs;
	},
	/** How many songs are left and how far the whole batch has got, or `null` while idle. */
	get remaining() {
		const songs = new Set(jobs.flatMap((job) => job.left)).size;
		if (!songs) return null;
		const partial = [...progress.values()].reduce((sum, value) => sum + value, 0);
		const share = total ? Math.min((total - songs + partial) / total, 1) : 0;
		return { songs, share, minutes: Math.max(1, Math.ceil((songs * PER_SONG) / 60000)) };
	},
	/** Where a song's download stands: queued behind others, on its way, or saved. */
	state(id: string): 'waiting' | 'running' | 'done' | undefined {
		if (landed.has(id)) return 'done';
		if (progress.has(id) || jobs[0]?.left[0] === id) return 'running';
		if (jobs.some((job) => job.left.includes(id))) return 'waiting';
		return undefined;
	},
	/** How far a song has got, 1 once it is saved, or `undefined` while it is not asked for. */
	of(id: string) {
		if (landed.has(id)) return 1;
		if (progress.has(id)) return progress.get(id);
		if (jobs.some((job) => job.left.includes(id))) return 0;
		return undefined;
	},
	/** Whether every song of a set is saved, or `null` while some are still coming. */
	holds(ids: string[]) {
		if (ids.every((id) => landed.has(id))) return true;
		if (ids.some((id) => this.of(id) !== undefined && !landed.has(id))) return null;
		return false;
	},
	start(job: Omit<Job, 'left'>, ids: string[]) {
		const left = ids.filter((id) => !landed.has(id) && catalogue.has(id));
		if (!left.length || jobs.some((entry) => entry.key === job.key)) return;
		jobs = [...jobs, { ...job, left }];
		total += left.length;
		run();
	},
	/** Saves what is not saved yet, or stops what is still coming, or removes what landed. */
	toggle(job: Omit<Job, 'left'>, ids: string[]) {
		const state = this.holds(ids);
		if (state === null) return this.cancel(job.key);
		if (state) {
			for (const id of ids) landed.delete(id);
			return;
		}
		this.start(job, ids);
	},
	cancel(key: string) {
		const job = jobs.find((entry) => entry.key === key);
		if (!job) return;
		drop(job.left);
		total = Math.max(total - job.left.length, 0);
		jobs = jobs.filter((entry) => entry.key !== key);
	},
	cancelSong(id: string) {
		drop([id]);
		total = Math.max(total - 1, 0);
		jobs = jobs
			.map((entry) => ({ ...entry, left: entry.left.filter((song) => song !== id) }))
			.filter((entry) => entry.left.length);
	},
	cancelAll() {
		drop(jobs.flatMap((job) => job.left));
		jobs = [];
		total = 0;
	},
	release() {
		if (ticker) clearInterval(ticker);
		ticker = 0;
	}
};
