/** The right-click and More menus of songs, albums, playlists and artists, as the desktop builds them. */
import { records, shelf, type Track } from '$lib/mock/album';
import { downloads } from '$lib/mock/downloads.svelte';
import { library, pinOf } from '$lib/mock/library.svelte';
import type { Item, Sheet, Tile } from '$lib/mock/menu.svelte';
import { player } from '$lib/mock/player.svelte';
import { route } from '$lib/mock/route.svelte';
import { artists, playlists, popularOf } from '$lib/mock/screens';

const ITEM_WIDTH = 196;

const artistOf = (name: string) => artists.find((artist) => artist.name === name);

/** Joins the non-empty groups of a menu with a separator between each. */
function sections(groups: Item[][]): Item[] {
	return groups
		.filter((group) => group.length)
		.flatMap((group, at) => (at ? [{ id: `section-${at}`, separator: true }, ...group] : group));
}

const copyLink = (id: string): Item => ({ id: `copy-${id}`, label: 'Copy link', icon: 'link' });

function heartTile(id: string, saved: boolean, onclick: () => void): Tile {
	return {
		id: `tile-favorite-${id}`,
		icon: saved ? 'heart-filled' : 'heart',
		title: saved ? 'Remove from Favorites' : 'Add to Favorites',
		active: saved,
		onclick
	};
}

function downloadTile(
	key: string,
	ids: string[],
	job: Parameters<typeof downloads.toggle>[0]
): Tile {
	const state = downloads.holds(ids);
	const share = ids.reduce((sum, id) => sum + (downloads.of(id) ?? 0), 0) / Math.max(ids.length, 1);
	return {
		id: `tile-download-${key}`,
		icon: 'download',
		title: state === null ? 'Downloading. Click to stop' : state ? 'Remove download' : 'Download',
		active: state === true,
		ring: state === false ? undefined : share,
		onclick: () => downloads.toggle(job, ids)
	};
}

function pinTile(kind: 'Album' | 'Playlist' | 'Artist', id: string): Tile {
	const pinned = library.pinned(id);
	return {
		id: `tile-pin-${id}`,
		icon: 'pin',
		title: pinned ? 'Unpin' : 'Pin',
		active: pinned,
		onclick: () => library.pin(pinOf(kind, id))
	};
}

/** The Add to playlist submenu: a new playlist, then the listener's own with a tick where it is. */
function playlistRows(ids: string[]): Item[] {
	return [
		{ id: 'new-playlist', label: 'New playlist', icon: 'plus' },
		{ id: 'playlist-separator', separator: true },
		...playlists.map((list) => ({
			id: `playlist-${list.id}`,
			label: list.name,
			cover: list.cover,
			checked: ids.length > 0 && ids.every((id) => library.holds(list.id, id)),
			stays: true,
			onclick: () => library.file(list.id, ids)
		}))
	];
}

/** A song's menu. `album` leaves out Go to Album on that album's own page. */
export function trackMenu(track: Track, { album = '' }: { album?: string } = {}): Sheet {
	const artist = artistOf(track.artist);
	const destinations: Item[] = [
		{
			id: 'go-to-artist',
			label: 'Artist',
			icon: 'user',
			disabled: !artist,
			onclick: () => artist && route.go({ screen: 'artist', id: artist.id })
		},
		...(album === track.album
			? []
			: [
					{
						id: 'go-to-album',
						label: 'Album',
						icon: 'disc-3',
						onclick: () => route.go({ screen: 'album', id: track.album })
					}
				]),
		{ id: 'song-radio', label: 'Radio', icon: 'radio', onclick: () => player.select(track.id) },
		{ id: 'view-details', label: 'Details', icon: 'info', disabled: true }
	];
	const liked = player.likes(track.id);
	return {
		width: ITEM_WIDTH,
		tiles: [
			heartTile(track.id, liked, () => player.toggleLike(track.id)),
			downloadTile(`song-${track.id}`, [track.id], {
				key: `song-${track.id}`,
				subject: 'Song',
				name: track.title,
				cover: track.cover
			})
		],
		items: sections([
			[
				{
					id: 'add-to-playlist',
					label: 'Add to playlist',
					icon: 'square-plus',
					width: 220,
					submenu: playlistRows([track.id])
				}
			],
			[
				{
					id: 'play-next',
					label: 'Play next',
					icon: 'list-start',
					onclick: () => player.enqueue([track.id], 'next')
				},
				{
					id: 'add-to-queue',
					label: 'Add to queue',
					icon: 'list-plus',
					onclick: () => player.enqueue([track.id], 'end')
				},
				{
					id: 'play-last',
					label: 'Play last',
					icon: 'list-end',
					onclick: () => player.enqueue([track.id], 'last')
				}
			],
			[
				{
					id: 'go-to',
					label: 'Go to',
					icon: 'square-arrow-out-up-right',
					width: 200,
					submenu: destinations
				},
				copyLink(track.id)
			]
		])
	};
}

export function albumMenu(id: string): Sheet {
	const album = shelf.get(id);
	const ids = (records.get(id) ?? []).map((track) => track.id);
	const saved = library.saved(id);
	return {
		width: ITEM_WIDTH,
		tiles: [
			heartTile(id, saved, () => library.toggle(id)),
			downloadTile(`album-${id}`, ids, {
				key: `album-${id}`,
				subject: 'Album',
				name: album?.title ?? '',
				cover: album?.cover ?? ''
			}),
			pinTile('Album', id)
		],
		items: sections([
			[
				{
					id: 'add-album-to-playlist',
					label: 'Add to playlist',
					icon: 'square-plus',
					width: 220,
					submenu: playlistRows(ids)
				}
			],
			[
				{
					id: 'album-next',
					label: 'Play next',
					icon: 'list-start',
					onclick: () => player.enqueue(ids, 'next')
				},
				{
					id: 'album-queue',
					label: 'Add to queue',
					icon: 'list-plus',
					onclick: () => player.enqueue(ids, 'end')
				}
			],
			[copyLink(id)]
		])
	};
}

export function playlistMenu(id: string): Sheet {
	const list = playlists.find((entry) => entry.id === id);
	const ids = (list?.tracks ?? []).map((track) => track.id);
	return {
		width: ITEM_WIDTH,
		tiles: [
			downloadTile(`playlist-${id}`, ids, {
				key: `playlist-${id}`,
				subject: 'Playlist',
				name: list?.name ?? '',
				cover: list?.cover ?? ''
			}),
			pinTile('Playlist', id)
		],
		items: sections([
			[{ id: 'playlist-owner', label: list?.owner ?? 'You', icon: 'user' }],
			[
				{ id: 'edit-playlist', label: 'Edit playlist', icon: 'pencil' },
				{ id: 'delete-playlist', label: 'Delete playlist', icon: 'trash-2' }
			],
			[copyLink(id)]
		])
	};
}

/** An artist's menu. `here` leaves out Go to artist on the artist's own page. */
export function artistMenu(id: string, { here = false }: { here?: boolean } = {}): Sheet {
	const followed = library.saved(id);
	return {
		width: ITEM_WIDTH,
		tiles: [heartTile(id, followed, () => library.toggle(id)), pinTile('Artist', id)],
		items: sections([
			here
				? []
				: [
						{
							id: 'open-artist',
							label: 'Go to artist',
							icon: 'info',
							onclick: () => route.go({ screen: 'artist', id })
						}
					],
			[
				{
					id: 'play-artist',
					label: 'Play artist',
					icon: 'play',
					onclick: () =>
						player.play(
							popularOf(id).map((track) => track.id),
							artists.find((entry) => entry.id === id)?.name ?? '',
							'Artist'
						)
				}
			],
			[copyLink(id)]
		])
	};
}
