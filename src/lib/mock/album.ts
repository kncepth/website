export const albums = [
	{
		id: 'airs',
		title: 'Airs and Ballads',
		artist: 'Traditional',
		released: '1912',
		eyebrow: 'Album',
		cover: '/cover-airs.webp',
		release: 'Album',
		label: 'Field Recordings',
		tint: { hue: 171.89, saturation: 0.371, second: { hue: 32, saturation: 0.45 } }
	},
	{
		id: 'nocturnes',
		title: 'Nocturnes',
		artist: 'Frédéric Chopin',
		released: '1846',
		cover: '/cover-nocturnes.webp',
		release: 'Album',
		tint: { hue: 218.72, saturation: 0.368, second: { hue: 48, saturation: 0.75 } }
	},
	{
		id: 'bergamasque',
		title: 'Suite bergamasque',
		artist: 'Claude Debussy',
		released: '1905',
		cover: '/cover-bergamasque.webp',
		release: 'Album',
		tint: { hue: 202.07, saturation: 0.299, second: { hue: 120, saturation: 0.35 } }
	},
	{
		id: 'gymnopedies',
		title: 'Gymnopédies',
		artist: 'Erik Satie',
		released: '1888',
		cover: '/cover-gymnopedies.webp',
		release: 'Album',
		tint: { hue: 94.64, saturation: 0.307, second: { hue: 330, saturation: 0.4 } }
	},
	{
		id: 'seasons',
		title: 'The Four Seasons',
		artist: 'Antonio Vivaldi',
		released: '1725',
		cover: '/cover-seasons.webp',
		release: 'Album',
		tint: { hue: 48.64, saturation: 0.722, second: { hue: 160, saturation: 0.45 } }
	},
	{
		id: 'peer-gynt',
		title: 'Peer Gynt, Op. 46',
		artist: 'Edvard Grieg',
		released: '1875',
		cover: '/cover-peer-gynt.webp',
		release: 'Album',
		tint: { hue: 22.62, saturation: 0.368, second: { hue: 215, saturation: 0.5 } }
	},
	{
		id: 'pictures',
		title: 'Pictures at an Exhibition',
		artist: 'Modest Mussorgsky',
		released: '1874',
		cover: '/cover-pictures.webp',
		release: 'Album',
		tint: { hue: 9.28, saturation: 0.622, second: { hue: 205, saturation: 0.55 } }
	}
];

export const shelf = new Map(albums.map((entry) => [entry.id, entry]));

export const album = albums[0];

export const origin = { name: 'Quiet Hours', kind: 'Playlist' };

export type Track = {
	id: string;
	album: string;
	title: string;
	length: number;
	plays: string;
	artist: string;
	cover: string;
};

const listing = (id: string, rows: [string, string, number, string][]) =>
	rows.map(([key, title, length, plays]) => ({
		id: key,
		album: id,
		title,
		length,
		plays,
		artist: shelf.get(id)?.artist ?? '',
		cover: shelf.get(id)?.cover ?? ''
	}));

export const records = new Map([
	[
		'airs',
		listing('airs', [
			['t1', 'The Water Is Wide', 224, '38,914,207'],
			['t2', 'The Wild Rover', 192, '164,772,530'],
			['t3', 'Wild Mountain Thyme', 241, '21,608,449'],
			['t4', 'She Moved Through the Fair', 267, '46,330,915'],
			['t5', 'Loch Lomond', 198, '29,447,186'],
			['t6', 'Down by the Sally Gardens', 212, '18,905,344'],
			['t7', 'The Lark in the Clear Air', 176, '9,662,801'],
			['t8', 'Black Is the Colour', 254, '24,118,673'],
			['t9', 'Scarborough Fair', 231, '87,504,962'],
			['t10', 'The Ash Grove', 189, '11,236,058'],
			['t11', 'Shenandoah', 246, '33,870,412'],
			['t12', 'The Snowy-Breasted Pearl', 208, '7,491,325']
		])
	],
	[
		'nocturnes',
		listing('nocturnes', [
			['n1', 'Nocturne in B-flat minor, Op. 9 No. 1', 340, '58,204,117'],
			['n2', 'Nocturne in E-flat major, Op. 9 No. 2', 273, '312,884,905'],
			['n3', 'Nocturne in B major, Op. 9 No. 3', 380, '27,441,690'],
			['n4', 'Nocturne in F major, Op. 15 No. 1', 290, '19,338,472'],
			['n5', 'Nocturne in F-sharp major, Op. 15 No. 2', 218, '44,905,318'],
			['n6', 'Nocturne in G minor, Op. 15 No. 3', 245, '15,772,046'],
			['n7', 'Nocturne in C-sharp minor, Op. 27 No. 1', 318, '31,660,529'],
			['n8', 'Nocturne in D-flat major, Op. 27 No. 2', 342, '96,118,734']
		])
	],
	[
		'bergamasque',
		listing('bergamasque', [
			['b1', 'Prélude', 252, '19,884,207'],
			['b2', 'Menuet', 269, '12,660,458'],
			['b3', 'Clair de Lune', 303, '204,338,061'],
			['b4', 'Passepied', 224, '28,715,440']
		])
	],
	[
		'gymnopedies',
		listing('gymnopedies', [
			['g1', 'Gymnopédie No. 1', 201, '188,470,552'],
			['g2', 'Gymnopédie No. 2', 167, '44,905,612'],
			['g3', 'Gymnopédie No. 3', 154, '52,013,905']
		])
	],
	[
		'seasons',
		listing('seasons', [
			['s1', 'Spring, I. Allegro', 198, '141,927,306'],
			['s2', 'Spring, II. Largo', 158, '38,204,915'],
			['s3', 'Spring, III. Allegro pastorale', 244, '29,118,660'],
			['s4', 'Summer, I. Allegro non molto', 320, '24,905,371'],
			['s5', 'Summer, II. Adagio', 133, '17,660,204'],
			['s6', 'Summer, III. Presto', 171, '129,447,318'],
			['s7', 'Autumn, I. Allegro', 300, '33,884,702'],
			['s8', 'Autumn, II. Adagio molto', 155, '14,338,905'],
			['s9', 'Autumn, III. Allegro', 194, '21,470,663'],
			['s10', 'Winter, I. Allegro non molto', 208, '47,913,228'],
			['s11', 'Winter, II. Largo', 132, '74,860,219'],
			['s12', 'Winter, III. Allegro', 202, '26,204,881']
		])
	],
	[
		'peer-gynt',
		listing('peer-gynt', [
			['p1', 'Morning Mood', 227, '96,215,884'],
			['p2', "Anitra's Dance", 192, '17,236,940'],
			['p3', 'Åse’s Death', 267, '13,905,472'],
			['p4', 'In the Hall of the Mountain King', 153, '112,504,733']
		])
	],
	[
		'pictures',
		listing('pictures', [
			['x1', 'Promenade', 94, '33,608,197'],
			['x2', 'The Old Castle', 278, '15,772,384'],
			['x3', 'Tuileries', 62, '8,204,915'],
			['x4', 'Bydło', 174, '11,338,206'],
			['x5', 'Ballet of the Unhatched Chicks', 74, '9,318,072'],
			['x6', 'Samuel Goldenberg and Schmuÿle', 128, '7,660,441'],
			['x7', 'The Market at Limoges', 82, '6,905,133'],
			['x8', 'Catacombae', 121, '5,884,720'],
			['x9', "The Hut on Fowl's Legs", 208, '18,447,905'],
			['x10', 'The Great Gate of Kiev', 341, '41,392,678']
		])
	]
]);

export const catalogue = new Map([...records.values()].flat().map((track) => [track.id, track]));

const gather = (ids: string[]) =>
	ids.map((id) => catalogue.get(id)).filter((track) => track !== undefined);

export const tracks = records.get('airs') ?? [];

export const upcoming = gather([
	'n2',
	'b3',
	'g1',
	'p1',
	's1',
	'x1',
	'b4',
	'p4',
	's11',
	'x10',
	'g3'
]);

export const similar = gather(['b1', 'p2', 's6', 'g2', 'x2', 'b2', 'x5']);

export const pinned = [
	{
		id: 'quiet-hours',
		title: 'Quiet Hours',
		kind: 'Playlist',
		icon: 'list',
		cover: '/mosaic-quiet-hours.webp',
		to: { screen: 'playlist', id: 'quiet-hours' }
	},
	{
		id: 'bergamasque',
		title: 'Suite bergamasque',
		kind: 'Album',
		icon: 'disc-3',
		cover: '/cover-bergamasque.webp',
		release: 'Album',
		to: { screen: 'album', id: 'bergamasque' }
	},
	{
		id: 'chopin',
		title: 'Frédéric Chopin',
		kind: 'Artist',
		icon: 'user',
		cover: '/artist-chopin.webp',
		round: true,
		to: { screen: 'artist', id: 'chopin' }
	},
	{
		id: 'seasons',
		title: 'The Four Seasons',
		kind: 'Album',
		icon: 'disc-3',
		cover: '/cover-seasons.webp',
		release: 'Album',
		to: { screen: 'album', id: 'seasons' }
	}
];

export const nav = [
	{ id: 'home', label: 'Home', icon: 'house' },
	{ id: 'search', label: 'Search', icon: 'search' },
	{
		id: 'library',
		label: 'Your Library',
		icon: 'library-big',
		tabs: ['Songs', 'Albums', 'Artists', 'Playlists']
	},
	{
		id: 'local',
		label: 'Local Music',
		icon: 'file-music',
		tabs: ['Songs', 'Albums', 'Artists', 'Playlists']
	},
	{ id: 'history', label: 'History', icon: 'rotate-ccw-clock' },
	{ id: 'settings', label: 'Settings', icon: 'settings' }
];

export const columns = [
	{ key: 'index', label: '#', width: 44, align: 'center' },
	{ key: 'title', label: 'Title', width: 302.575, sortable: true },
	{ key: 'artist', label: 'Artist', width: 152.425, sortable: true },
	{ key: 'plays', label: 'Plays', width: 108, sortable: true },
	{ key: 'length', label: 'Length', width: 120, align: 'right', sortable: true }
];

export const TRAIL = 4;

export const total = tracks.reduce((sum, track) => sum + track.length, 0);

export function runtime(seconds: number): string {
	const whole = Math.max(0, Math.floor(seconds));
	const hours = Math.floor(whole / 3600);
	const minutes = Math.floor(whole / 60) % 60;
	const rest = whole % 60;
	if (hours) return `${hours}h ${minutes}m`;
	if (minutes) return `${minutes}m ${rest}s`;
	return `${rest}s`;
}

export function clock(seconds: number) {
	const whole = Math.max(0, Math.floor(seconds));
	const minutes = Math.floor(whole / 60) % 60;
	const rest = String(whole % 60).padStart(2, '0');
	const hours = Math.floor(whole / 3600);
	if (hours === 0) return `${minutes}:${rest}`;
	return `${hours}:${String(minutes).padStart(2, '0')}:${rest}`;
}
