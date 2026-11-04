/** What the listener saved and pinned in the mock, shared by the pages, the menus and the sidebar. */
import { SvelteSet } from 'svelte/reactivity';
import { catalogue, pinned, shelf } from '$lib/mock/album';
import { artists, playlists } from '$lib/mock/screens';

export type Pin = (typeof pinned)[number];

const saved = new SvelteSet<string>(['bergamasque', 'seasons', 'chopin']);
let pins = $state<Pin[]>([...pinned]);
/** Songs added to or taken out of a playlist from a menu, over what the playlist starts with. */
const filed = new SvelteSet<string>();
const unfiled = new SvelteSet<string>();
const slot = (list: string, track: string) => `${list}:${track}`;

/** The pin an album, playlist or artist gets in the sidebar. */
export function pinOf(kind: 'Album' | 'Playlist' | 'Artist' | 'Song', id: string): Pin | null {
	if (kind === 'Song') {
		const track = catalogue.get(id);
		if (!track) return null;
		return {
			id,
			title: track.title,
			kind,
			icon: 'music',
			cover: track.cover,
			to: { screen: 'album', id: track.album }
		};
	}
	if (kind === 'Album') {
		const album = shelf.get(id);
		if (!album) return null;
		return {
			id,
			title: album.title,
			kind,
			icon: 'disc-3',
			cover: album.cover,
			release: 'Album',
			to: { screen: 'album', id }
		};
	}
	if (kind === 'Playlist') {
		const list = playlists.find((entry) => entry.id === id);
		if (!list) return null;
		return {
			id,
			title: list.name,
			kind,
			icon: 'list',
			cover: list.cover,
			to: { screen: 'playlist', id }
		};
	}
	const artist = artists.find((entry) => entry.id === id);
	if (!artist) return null;
	return {
		id,
		title: artist.name,
		kind,
		icon: 'user',
		cover: artist.image,
		round: true,
		to: { screen: 'artist', id }
	};
}

export const library = {
	get pins() {
		return pins;
	},
	saved(id: string) {
		return saved.has(id);
	},
	toggle(id: string) {
		if (saved.has(id)) saved.delete(id);
		else saved.add(id);
	},
	holds(list: string, track: string) {
		const key = slot(list, track);
		if (filed.has(key)) return true;
		if (unfiled.has(key)) return false;
		return (
			playlists.find((entry) => entry.id === list)?.tracks.some((one) => one.id === track) ?? false
		);
	},
	/** The ids of songs a menu added to a playlist past what it starts with, in the order added. */
	added(list: string) {
		return [...filed]
			.filter((key) => key.startsWith(`${list}:`))
			.map((key) => key.slice(list.length + 1));
	},
	/** Adds songs to a playlist, or takes them out when it already holds every one. */
	file(list: string, tracks: string[]) {
		const all = tracks.every((track) => this.holds(list, track));
		for (const track of tracks) {
			const key = slot(list, track);
			filed.delete(key);
			unfiled.delete(key);
			if (all) unfiled.add(key);
			else filed.add(key);
		}
	},
	pinned(id: string) {
		return pins.some((pin) => pin.id === id);
	},
	pin(pin: Pin | null) {
		if (!pin) return;
		pins = this.pinned(pin.id) ? pins.filter((entry) => entry.id !== pin.id) : [...pins, pin];
	}
};
