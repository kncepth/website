import type { Track } from './album';
import { albums, catalogue, shelf, tracks, upcoming, similar } from './album';

const one = (id: string) => catalogue.get(id);

const pick = (ids: string[]) => ids.map(one).filter((track) => track !== undefined);

export const listenAgain = [...upcoming, ...similar.slice(0, 2)];

export const quickPicks = [...tracks.slice(0, 5), ...upcoming.slice(0, 5), ...similar.slice(0, 5)];

export const genres = (
	[
		['Classical', '/cover-pictures.webp'],
		['Folk', '/cover-airs.webp'],
		['Baroque', '/cover-seasons.webp'],
		['Piano', '/cover-nocturnes.webp'],
		['Ambient', '/mosaic-rainy-windows.webp'],
		['Romantic', '/cover-peer-gynt.webp'],
		['Chamber', '/mosaic-evening-studies.webp'],
		['Opera', '/mosaic-long-drives.webp'],
		['Minimalism', '/cover-gymnopedies.webp'],
		['Choral', '/mosaic-morning-light.webp']
	] as const
).map(([name, cover]) => ({ id: name.toLowerCase(), name, cover }));

export const favorites = [
	...pick(['t1', 't2', 't5']),
	...upcoming.slice(0, 4),
	...similar.slice(0, 3)
].map((track, at) => ({
	...track,
	added: ['Sep 4, 2026', 'Sep 2, 2026', 'Aug 29, 2026', 'Aug 24, 2026', 'Aug 20, 2026'][at % 5]
}));

export type Hit = {
	kind: string;
	id: string;
	title: string;
	meta: string;
	cover: string;
	fallback: string;
	circle: boolean;
	track?: Track;
	to?: { screen: string; id: string };
};

export const ABOUT_FALLBACK = "Explore the artist's popular songs and releases.";

export const artists = [
	{
		id: 'traditional',
		image: '',
		name: 'Traditional',
		listeners: '2,410,338',
		biography: ''
	},
	{
		id: 'chopin',
		image: '/artist-chopin.webp',
		name: 'Frédéric Chopin',
		listeners: '8,924,715',
		biography:
			'Frédéric Chopin (1810-1849) was a Polish composer and pianist of the Romantic period, and one of the very few major composers to write almost exclusively for his own instrument. He left Warsaw at twenty and spent the rest of his life in Paris, where he taught, published, and played mostly in salons rather than concert halls. The nocturnes, ballades, mazurkas and preludes he wrote there treat the piano as a singing instrument, and the rubato they ask for is still the hardest thing about them.'
	},
	{
		id: 'debussy',
		image: '/artist-debussy.webp',
		name: 'Claude Debussy',
		listeners: '6,142,908',
		biography:
			'Claude Debussy (1862-1918) trained at the Paris Conservatoire and spent a decade pulling away from what he had been taught there. Whole-tone scales, unresolved sevenths and modes borrowed from the Javanese gamelan he heard at the 1889 Exposition gave his music a sense of colour standing in for harmonic argument. He disliked the label Impressionist, but Suite bergamasque and La mer have carried it ever since.'
	},
	{
		id: 'satie',
		image: '/artist-satie.webp',
		name: 'Erik Satie',
		listeners: '5,308,441',
		biography:
			"Erik Satie (1866-1925) worked as a cabaret pianist in Montmartre and wrote music that refused almost everything the conservatoire valued: development, climax, weight. The three Gymnopédies of 1888 are built from a handful of chords and a melody that never raises its voice. Late in life he coined the term musique d'ameublement, furniture music meant to be present without being listened to."
	},
	{
		id: 'vivaldi',
		image: '/artist-vivaldi.webp',
		name: 'Antonio Vivaldi',
		listeners: '9,776,120',
		biography:
			'Antonio Vivaldi (1678-1741) was a Venetian priest and violinist who spent most of his career teaching at the Ospedale della Pietà, an orphanage whose all-female orchestra premiered much of his work. He wrote around five hundred concertos, and The Four Seasons, published in 1725 with a sonnet attached to each concerto, is among the earliest programme music to survive in the repertoire.'
	},
	{
		id: 'grieg',
		image: '/artist-grieg.webp',
		name: 'Edvard Grieg',
		listeners: '4,015,663',
		biography:
			"Edvard Grieg (1843-1907) studied in Leipzig and returned to Norway determined to write music that sounded like the country he came from, drawing on folk dance rhythms and the sharp intervals of the Hardanger fiddle. The incidental music he wrote for Ibsen's Peer Gynt in 1875 outlived the play in the concert hall, largely on the strength of two orchestral suites he assembled from it."
	},
	{
		id: 'mussorgsky',
		image: '/artist-mussorgsky.webp',
		name: 'Modest Mussorgsky',
		listeners: '3,229,504',
		biography:
			"Modest Mussorgsky (1839-1881) was a member of The Five, the circle of Russian composers who set out to write without German models. He kept a civil service post for most of his life and left much of his music unfinished or unorchestrated. Pictures at an Exhibition, written for piano in 1874 after a memorial show of his friend Viktor Hartmann's drawings, is now heard mostly in Ravel's orchestration."
	}
];

const stamped = (ids: string[]) =>
	pick(ids).map((track, at) => ({
		...track,
		added: ['Sep 4, 2026', 'Sep 2, 2026', 'Aug 29, 2026', 'Aug 24, 2026', 'Aug 20, 2026'][at % 5]
	}));

export const playlists = [
	{
		id: 'quiet-hours',
		name: 'Quiet Hours',
		owner: 'You',
		cover: '/mosaic-quiet-hours.webp',
		tracks: stamped(['t2', 'n2', 'b3', 'g1', 't5', 'p1', 's1', 'x1', 'b4', 'p4'])
	},
	{
		id: 'evening-studies',
		name: 'Evening Studies',
		owner: 'You',
		cover: '/mosaic-evening-studies.webp',
		tracks: stamped(['n1', 'b1', 'x2', 's6', 'n3', 'g2', 'b2', 'p2', 'x5', 'n4'])
	},
	{
		id: 'rainy-windows',
		name: 'Rainy Windows',
		owner: 'You',
		cover: '/mosaic-rainy-windows.webp',
		tracks: stamped(['g2', 't3', 'b2', 'p3', 'g3', 't6', 'n5', 'b1'])
	},
	{
		id: 'morning-light',
		name: 'Morning Light',
		owner: 'You',
		cover: '/mosaic-morning-light.webp',
		tracks: stamped(['s1', 'p1', 'b1', 'n4', 's2', 'p2', 'g1', 's3', 'x3'])
	},
	{
		id: 'long-drives',
		name: 'Long Drives',
		owner: 'You',
		cover: '/mosaic-long-drives.webp',
		tracks: stamped(['x1', 's6', 'p2', 't1', 'x5', 's11', 'n6', 't7', 'x7', 'p3', 's9'])
	}
];

export const played = [
	...pick(['t2', 't1']),
	...upcoming.slice(0, 3),
	...pick(['t5', 't7']),
	...similar.slice(0, 3)
].map((track, at) => ({
	...track,
	at: [
		'Just now',
		'Today at 14:02',
		'Today at 13:48',
		'Today at 13:41',
		'Today at 13:35',
		'Yesterday at 22:10',
		'Yesterday at 21:54',
		'Sep 7, 2026',
		'Sep 7, 2026',
		'Sep 6, 2026'
	][at]
}));

export const localTracks = pick(['g3', 'g2', 'b1', 'b2', 'x2']).map((track, at) => ({
	...track,
	added: ['Sep 6, 2026', 'Sep 6, 2026', 'Aug 31, 2026', 'Aug 31, 2026', 'Aug 12, 2026'][at]
}));

export function albumsOf(id: string) {
	const name = artists.find((artist) => artist.id === id)?.name;
	return albums.filter((entry) => entry.artist === name);
}

export function popularOf(id: string) {
	const name = artists.find((artist) => artist.id === id)?.name;
	const owned = albums.filter((entry) => entry.artist === name).map((entry) => entry.id);
	return [...catalogue.values()].filter((track) => owned.includes(track.album));
}

const localIds = [...new Set(localTracks.map((track) => track.album))];

export const localAlbums = albums.filter((entry) => localIds.includes(entry.id));

export const localArtists = artists.filter((artist) =>
	localAlbums.some((entry) => entry.artist === artist.name)
);

export const libraryColumns = [
	{ key: 'index', label: '#', width: 44, align: 'center' },
	{ key: 'cover', label: '', width: 50 },
	{ key: 'title', label: 'Title', width: 309.567, sortable: true },
	{ key: 'artist', label: 'Artist', width: 127.433, sortable: true },
	{ key: 'added', label: 'Date added', width: 112, sortable: true },
	{ key: 'length', label: 'Length', width: 84, align: 'right', sortable: true }
];

export const artistColumns = [
	{ key: 'index', label: '#', width: 44, align: 'center' },
	{ key: 'cover', label: '', width: 50 },
	{ key: 'title', label: 'Title', width: 252.925, sortable: true },
	{ key: 'album', label: 'Album', width: 134.075, sortable: true },
	{ key: 'plays', label: 'Plays', width: 112, sortable: true },
	{ key: 'length', label: 'Length', width: 84, align: 'right', sortable: true }
];

export const historyColumns = [
	{ key: 'index', label: '#', width: 44, align: 'center' },
	{ key: 'cover', label: '', width: 50 },
	{ key: 'title', label: 'Title', width: 269.897, sortable: true },
	{ key: 'artist', label: 'Artist', width: 111.103, sortable: true },
	{ key: 'at', label: 'Played', width: 168, sortable: true },
	{ key: 'length', label: 'Length', width: 84, align: 'right', sortable: true }
];

export { shelf };
