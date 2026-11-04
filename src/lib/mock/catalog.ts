/** The version the mock reports when GitHub cannot be reached at build time. */
export const version = '0.47.0';

export const startups = [
	'Home',
	'Search',
	'History',
	'Songs',
	'Albums',
	'Playlists',
	'Artists',
	'Local Music'
];

export const visualizers = ['Off', 'Bars', 'Wave', 'Bars and wave'];

export const autohides = ['Automatic', 'Always hidden', 'Always shown'];

export const paces = ['Slow', 'Standard', 'Quick'];

export const savers = ['Off', '30 FPS', '20 FPS', '10 FPS'];

export const stillness = ['System', 'Always', 'Never'];

export const corners = ['Square', 'Subtle', 'Rounded', 'Round'];

export const presets = [
	'Custom',
	'Flat',
	'Bass boost',
	'Bass reducer',
	'Treble boost',
	'Vocal',
	'Rock',
	'Pop',
	'Jazz',
	'Classical',
	'Electronic',
	'Acoustic',
	'Loudness'
];

export const statuses = ['Sonora', 'Provider', 'Music', 'Title', 'Artist', 'Artist - Title'];

export const bands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const providers = [
	{
		glyph: 'spotify',
		brand: '#1ed760',
		name: 'Spotify',
		status: 'Playing from this service',
		stored: true,
		active: true
	},
	{
		glyph: 'applemusic',
		brand: '#fa2d48',
		name: 'Apple Music',
		status: 'Not connected',
		stored: false,
		active: false
	},
	{
		glyph: 'youtubemusic',
		brand: '#ff0033',
		name: 'YouTube Music',
		status: 'Connected',
		stored: true,
		active: false
	},
	{
		glyph: 'subsonic',
		brand: '#ffa31a',
		name: 'Subsonic',
		status: 'Not connected',
		stored: false,
		active: false
	},
	{
		glyph: 'deezer',
		brand: '#a238ff',
		name: 'Deezer',
		status: 'Not connected',
		stored: false,
		active: false
	},
	{
		glyph: 'tidal',
		brand: '',
		name: 'Tidal',
		status: 'Not connected',
		stored: false,
		active: false
	}
];

export const scrobblers = [
	{
		id: 'lastfm',
		name: 'Last.fm',
		detail:
			'Sonora scrobbles through your own Last.fm API account. Create one, then paste the key and the secret here.',
		status: 'Scrobbling as makakashan',
		linked: true
	},
	{ id: 'librefm', name: 'Libre.fm', detail: '', status: 'Not connected', linked: false },
	{
		id: 'listenbrainz',
		name: 'ListenBrainz',
		detail: 'Paste a user token from your ListenBrainz settings page.',
		status: 'Not connected',
		linked: false
	},
	{
		id: 'maloja',
		name: 'Maloja',
		detail: 'Point Sonora at your Maloja server and paste one of its API keys.',
		status: 'Not connected',
		linked: false
	}
];

export const team = [
	{ login: 'nolight132', role: 'Lead Maintainer' },
	{ login: 'zxsleebu', role: 'Maintainer' },
	{ login: 'fx-got', role: 'Maintainer' },
	{ login: 'Makakashan', role: 'Contributor' },
	{ login: 'imizgun', role: 'Contributor' }
];

export const notice =
	'Copyright © 2026 Sonora Contributors. Sonora comes with absolutely no warranty. It is free software, and you are welcome to redistribute it under the terms of the GNU General Public License version 3 or later. Sonora is unofficial and is not affiliated with Spotify AB.';

export type Row = {
	key: string;
	title: string;
	detail?: string;
	control:
		| 'switch'
		| 'picker'
		| 'slider'
		| 'button'
		| 'plain'
		| 'stepper'
		| 'drill'
		| 'segmented'
		| 'toggles'
		| 'equalizer'
		| 'field';
	/** A text field's hint, for a `field` row. */
	hint?: string;
	options?: string[];
	label?: string;
	value?: string;
	extra?: string;
	needs?: string;
	href?: string;
	/** The drill-in page a row opens. */
	opens?: string;
};

/** What a group draws above its rows: a row of option cards, or a block of its own. */
export type Block =
	| 'theme'
	| 'icons'
	| 'corners'
	| 'visualizer'
	| 'layout'
	| 'quality'
	| 'accounts'
	| 'scrobbling'
	| 'priority'
	| 'about';

export type Group = { title?: string; icon?: string; block?: Block; rows: Row[] };

export type Section = {
	id: string;
	title: string;
	preview?: 'now-playing' | 'lyrics' | 'sound' | 'discord';
	groups: Group[];
};

/** The settings tabs in the order the header shows them, with the icon of each. */
export const tabs = [
	{ id: 'General', icon: 'settings' },
	{ id: 'Providers', icon: 'user-round' },
	{ id: 'Appearance', icon: 'palette' },
	{ id: 'Lyrics', icon: 'mic-vocal' },
	{ id: 'Playback', icon: 'play' },
	{ id: 'Integrations', icon: 'link' }
];

export const layouts = ['Classic', 'Compact', 'Centered'];

export const qualities = [
	{ id: 'Low', detail: 'Vorbis, 96 kbps' },
	{ id: 'Normal', detail: 'Vorbis, 160 kbps' },
	{ id: 'High', detail: 'Vorbis, 320 kbps' }
];

export const lyricsSources = ['Spotify', 'LRCLIB', 'Musixmatch', 'NetEase', 'Genius'];

const general: Section = {
	id: 'general',
	title: 'General',
	groups: [
		{
			title: 'Startup',
			icon: 'house',
			rows: [
				{
					key: 'startup',
					title: 'Start on',
					detail: 'The screen Sonora opens on launch',
					control: 'picker',
					options: startups
				},
				{
					key: 'entries',
					title: 'Sidebar entries',
					detail: 'The sections listed in the sidebar',
					control: 'button',
					label: 'Choose entries'
				},
				{
					key: 'language',
					title: 'Language',
					detail: 'The language Sonora uses across the interface',
					control: 'picker'
				}
			]
		},
		{
			title: 'Window',
			icon: 'panel-left-open',
			rows: [
				{
					key: 'tray',
					title: 'Keep running in the background',
					detail: 'Keep Sonora running and playing after its window closes',
					control: 'switch'
				},
				{
					key: 'trayIcon',
					title: 'Show in the system tray',
					detail: 'Put an icon with playback controls in the system tray',
					control: 'switch'
				},
				{
					key: 'serverDecorations',
					title: 'Server-side decorations',
					detail: 'Let the compositor draw the title bar, border and shadow',
					control: 'switch'
				},
				{
					key: 'windowCorners',
					title: 'Window corners',
					detail: "How rounded the window's own corners are",
					control: 'picker',
					options: corners,
					needs: 'clientDecorations'
				}
			]
		},
		{
			title: 'Motion',
			icon: 'loader-circle',
			rows: [
				{
					key: 'motion',
					title: 'Reduce motion',
					detail: 'Skip interface animations and transitions',
					control: 'segmented',
					options: stillness
				},
				{
					key: 'pace',
					title: 'Animation speed',
					detail: 'How fast interface animations play',
					control: 'segmented',
					options: paces
				},
				{
					key: 'saver',
					title: 'Throttle inactive window',
					detail: 'Changes apply after restarting Sonora.',
					control: 'segmented',
					options: savers
				}
			]
		},
		{
			title: 'Context menus',
			icon: 'list',
			rows: [
				{
					key: 'adaptiveMenu',
					title: 'Adaptive context menu',
					detail: 'Leaves out entries the row already shows, such as the album or the artist',
					control: 'switch'
				}
			]
		}
	]
};

const about: Section = {
	id: 'about',
	title: 'About',
	groups: [
		{
			block: 'about',
			rows: [
				{
					key: 'version',
					title: 'Version',
					detail: 'The build of Sonora you are running',
					control: 'plain'
				},
				{
					key: 'updates',
					title: 'Check for updates',
					detail: 'Ask GitHub once at startup whether a newer version is out',
					control: 'switch'
				},
				{
					key: 'channel',
					title: 'Release channel',
					detail:
						'Stable follows releases. Nightly follows the build of main made every night, which gets changes first',
					control: 'picker',
					options: ['Stable', 'Nightly']
				},
				{
					key: 'log',
					title: 'Log file',
					detail: 'What Sonora wrote while running. Attach it to a bug report',
					control: 'button',
					label: 'Open'
				},
				{
					key: 'license',
					title: 'License',
					detail: 'GNU General Public License version 3 or later',
					control: 'button',
					label: 'View',
					href: 'https://www.gnu.org/licenses/gpl-3.0.html'
				},
				{
					key: 'source',
					title: 'Source code',
					detail: 'The corresponding source for this build',
					control: 'button',
					label: 'GitHub',
					href: 'https://github.com/sonorahq/sonora'
				}
			]
		}
	]
};

const providersPage: Section = {
	id: 'providers',
	title: 'Providers',
	groups: [
		{ title: 'Streaming services', icon: 'music', block: 'accounts', rows: [] },
		{
			title: 'Local files',
			icon: 'file-music',
			rows: [
				{
					key: 'folders',
					title: 'Music folders',
					detail: 'Not configured',
					control: 'button',
					label: 'Add folder…'
				}
			]
		}
	]
};

const appearance: Section = {
	id: 'appearance',
	title: 'Appearance',
	groups: [
		{
			title: 'Theme',
			icon: 'palette',
			block: 'theme',
			rows: [
				{
					key: 'adaptive',
					title: 'Adaptive theme',
					detail: 'Tint the palette with the artwork of the playing album',
					control: 'switch'
				},
				{
					key: 'community',
					title: 'Explore community themes',
					detail: 'Find themes other people made and install them in one click',
					control: 'button',
					label: 'Open',
					href: '/themes'
				}
			]
		},
		{ title: 'Icon pack', icon: 'layout-grid', block: 'icons', rows: [] },
		{ title: 'Corners', icon: 'maximize', block: 'corners', rows: [] },
		{
			title: 'Text',
			icon: 'text-select',
			rows: [
				{
					key: 'typeface',
					title: 'Font',
					detail: 'The typeface Sonora uses across the interface',
					control: 'picker',
					options: ['Default', 'Inter', 'JetBrains Mono', 'Noto Sans']
				},
				{
					key: 'fontSize',
					title: 'Font size',
					detail: 'Base text size, everything else scales with it',
					control: 'stepper'
				}
			]
		},
		{
			title: 'Window',
			icon: 'panel-left-open',
			rows: [
				{
					key: 'opacity',
					title: 'Opacity',
					detail: 'Adjust the app background opacity',
					control: 'slider'
				},
				{
					key: 'blurWindow',
					title: 'Blur window',
					detail: 'Draw the window over a blurred desktop. Needs an opacity below 100%',
					control: 'switch'
				},
				{
					key: 'blur',
					title: 'Blur UI',
					detail: 'Frost the menus and floating controls over whatever they cover',
					control: 'switch'
				}
			]
		}
	]
};

const playerBar: Section = {
	id: 'player-bar',
	title: 'Player bar',
	groups: [
		{ title: 'Layout', icon: 'layout-grid', block: 'layout', rows: [] },
		{
			title: 'Surface',
			icon: 'blend',
			rows: [
				{
					key: 'playerBarTransparent',
					title: 'Transparent player bar',
					detail: 'Let pages and sidebars scroll underneath a frosted player bar',
					control: 'switch'
				}
			]
		}
	]
};

const nowPlaying: Section = {
	id: 'now-playing',
	title: 'Now playing',
	preview: 'now-playing',
	groups: [
		{
			title: 'Background',
			icon: 'blend',
			rows: [
				{
					key: 'ambient',
					title: 'Ambient background',
					detail: 'Fill Now playing with colours drawn from the cover',
					control: 'switch'
				},
				{
					key: 'ambientMotion',
					title: 'Ambient motion',
					detail: 'Drift the ambient colours instead of holding them still',
					control: 'switch',
					needs: 'ambient'
				}
			]
		},
		{
			title: 'Visualizer',
			icon: 'music-2',
			block: 'visualizer',
			rows: [
				{
					key: 'visualizerAbsolute',
					title: 'Ignore volume',
					detail: "Draw the spectrum at the track's own level, however loud Sonora plays it",
					control: 'switch',
					needs: 'visualizer'
				}
			]
		},
		{
			title: 'Controls',
			icon: 'sliders-horizontal',
			rows: [
				{
					key: 'fullscreenControls',
					title: 'Hide controls',
					detail: 'Fade out the playback controls in Now playing while the pointer rests',
					control: 'segmented',
					options: autohides
				},
				{
					key: 'osFullscreen',
					title: 'Use OS fullscreen',
					detail: 'Make Now playing fill the whole screen, the way F11 does',
					control: 'switch'
				}
			]
		}
	]
};

const lyrics: Section = {
	id: 'lyrics',
	title: 'Lyrics',
	preview: 'lyrics',
	groups: [
		{
			title: 'Display',
			icon: 'mic-vocal',
			rows: [
				{
					key: 'karaoke',
					title: 'Karaoke',
					detail: 'Highlight lyrics word by word when timing is available',
					control: 'switch'
				},
				{
					key: 'blurLyrics',
					title: 'Blur inactive lines',
					detail: 'Blur upcoming and previous lines in the lyrics panel',
					control: 'switch'
				},
				{
					key: 'romanized',
					title: 'Romanized lyrics',
					detail: 'Show locally generated pronunciation for selected writing systems',
					control: 'switch',
					extra: 'Writing systems'
				},
				{
					key: 'panelLyrics',
					title: 'Text size in the panel',
					detail: 'Size of the lyrics text in the side panel, on top of the base font size',
					control: 'stepper'
				},
				{
					key: 'fullscreenLyrics',
					title: 'Text size in Now playing',
					detail: 'Size of the lyrics text in Now playing, on top of the base font size',
					control: 'stepper'
				}
			]
		},
		{
			title: 'Sources',
			icon: 'list-music',
			rows: [
				{
					key: 'lyricsSources',
					title: 'Lyrics sources',
					detail: 'Choose which services to search for lyrics',
					control: 'drill',
					opens: 'lyrics-sources'
				},
				{
					key: 'lyricsForLocal',
					title: 'Look up lyrics for local files',
					detail: 'Use metadata from local files to fetch lyrics from the internet',
					control: 'switch'
				}
			]
		}
	]
};

const lyricsSourcesPage: Section = {
	id: 'lyrics-sources',
	title: 'Lyrics sources',
	groups: [
		{
			title: 'Order',
			icon: 'arrow-up-down',
			block: 'priority',
			rows: [
				{
					key: 'lyricsPriority',
					title: 'Provider priority',
					detail: 'Sonora shows synced lyrics from the highest source that has them',
					control: 'plain',
					value: ' '
				}
			]
		}
	]
};

const playback: Section = {
	id: 'playback',
	title: 'Playback',
	groups: [
		{
			title: 'Playing',
			icon: 'play',
			rows: [
				{
					key: 'normalisation',
					title: 'Normalize loudness',
					detail: 'Keeps tracks at a consistent volume',
					control: 'switch'
				},
				{
					key: 'gapless',
					title: 'Gapless playback',
					detail: 'Runs one track into the next without a pause, the way an album was sequenced',
					control: 'switch'
				},
				{
					key: 'sleep',
					title: 'Sleep timer',
					detail: 'Lets the music stop on its own after a set time, so it can play you to sleep',
					control: 'slider'
				},
				{
					key: 'stayAwake',
					title: 'Stay awake while playing',
					detail: 'Prevent sleep while playing and keep the display on while Now playing is open',
					control: 'switch'
				}
			]
		},
		{
			title: 'Streaming quality',
			icon: 'disc-3',
			block: 'quality',
			rows: []
		},
		{
			title: 'Sessions',
			icon: 'users-round-collaboration',
			rows: [
				{
					key: 'sessionsButton',
					title: 'Show the Sessions button',
					control: 'switch'
				},
				{
					key: 'sessionsOfficial',
					title: 'Use the official Sonora Sessions server',
					control: 'switch'
				},
				{
					key: 'sessionsServer',
					title: 'Server address',
					control: 'field',
					hint: 'wss://sessions.example.com',
					label: 'Save',
					needs: 'customSessions'
				}
			]
		},
		{
			title: 'Spotify Connect',
			icon: 'speaker',
			rows: [
				{
					key: 'spotifyConnect',
					title: 'Show as a Spotify device',
					detail:
						"List Sonora in the device picker of Spotify's apps, so you can control it from your phone and Spotify shows what you play",
					control: 'switch'
				},
				{
					key: 'connectName',
					title: 'Device name',
					detail: "How Sonora is named in the device list of Spotify's apps",
					control: 'picker',
					options: ['Sonora', 'Sonora on this computer', 'Custom'],
					needs: 'spotifyConnect'
				},
				{
					key: 'connectCustom',
					title: 'Custom name',
					control: 'field',
					hint: 'Sonora',
					needs: 'customConnect'
				}
			]
		}
	]
};

const sound: Section = {
	id: 'sound',
	title: 'Sound',
	preview: 'sound',
	groups: [
		{
			title: 'Output',
			icon: 'volume-2',
			rows: [
				{
					key: 'outputDevice',
					title: 'Output device',
					detail: 'Audio device where Sonora plays',
					control: 'picker',
					options: ['System default', 'Built-in Audio', 'USB DAC', 'USB DAC (Direct to hardware)']
				},
				{
					key: 'sampleRate',
					title: 'Sample rate',
					detail: 'What the device runs at. Sonora converts every track to it',
					control: 'stepper'
				},
				{
					key: 'matchRate',
					title: 'Match sample rate',
					detail: 'Plays each track at its own sample rate',
					control: 'switch'
				},
				{
					key: 'buffer',
					title: 'Buffer size',
					detail: 'How much audio Sonora hands the device at a time',
					control: 'stepper'
				}
			]
		},
		{
			title: 'Equalizer',
			icon: 'sliders-horizontal',
			rows: [
				{
					key: 'equalizer',
					title: 'Equalizer',
					detail: 'Shapes the sound with a preset or a curve of your own',
					control: 'equalizer',
					opens: 'equalizer'
				}
			]
		}
	]
};

const storage: Section = {
	id: 'storage',
	title: 'Storage',
	groups: [
		{
			title: 'Played tracks',
			icon: 'rotate-ccw-clock',
			rows: [
				{
					key: 'keepTracks',
					title: 'Keep played tracks',
					detail:
						'Saves what you play, locked to this computer, so playing it again downloads nothing',
					control: 'switch'
				},
				{
					key: 'cacheSize',
					title: 'Cache size',
					detail: 'How much space the tracks you played may take',
					control: 'slider',
					options: ['1 GB', '2 GB', '5 GB', '10 GB'],
					needs: 'keepTracks'
				},
				{
					key: 'cacheUsed',
					title: 'Space used',
					detail: 'What the tracks kept after playing take on this computer',
					control: 'button',
					label: 'Clear',
					value: '812 MB'
				}
			]
		},
		{
			title: 'Downloads',
			icon: 'download',
			rows: [
				{
					key: 'offline',
					title: 'Offline mode',
					detail: 'Show and play only what you downloaded',
					control: 'switch'
				},
				{
					key: 'downloadsUsed',
					title: 'Space used',
					detail: 'What the songs you downloaded take on this computer',
					control: 'button',
					label: 'Remove all',
					value: '1.4 GB'
				}
			]
		}
	]
};

const discord: Section = {
	id: 'discord',
	title: 'Discord',
	preview: 'discord',
	groups: [
		{
			rows: [
				{
					key: 'discord',
					title: 'Show on Discord',
					detail: 'Put the track you are playing on your Discord profile',
					control: 'switch'
				}
			]
		},
		{
			title: 'Status',
			icon: 'radio',
			rows: [
				{
					key: 'discordName',
					title: 'Status name',
					detail: 'What the status is called after the "Listening to" that your friends see',
					control: 'picker',
					options: statuses,
					needs: 'discord'
				},
				{
					key: 'discordPaused',
					title: 'Show when paused',
					detail: 'Keep the status on your Discord profile while the track is paused',
					control: 'switch',
					needs: 'discord'
				},
				{
					key: 'discordBadge',
					title: 'Show the provider badge',
					detail: 'Mark the status with a small icon of the service the track came from',
					control: 'switch',
					needs: 'discord'
				},
				{
					key: 'discordAnonymous',
					title: 'Hide details',
					detail: 'Say only that music is playing, without the title, artist or artwork',
					control: 'switch',
					needs: 'discord'
				},
				{
					key: 'discordHideOnConnect',
					title: 'Hide during Spotify Connect',
					detail: "Leave the status to Spotify's own while another device plays",
					control: 'switch',
					needs: 'discord'
				}
			]
		},
		{
			title: 'Buttons',
			icon: 'link',
			rows: [
				{
					key: 'discordButtons',
					title: 'Buttons',
					detail:
						'Links under the status for your friends to open, one to the track on its service and one to Sonora',
					control: 'toggles',
					options: ['Provider', 'Sonora'],
					needs: 'discord'
				}
			]
		},
		{
			title: 'Local files',
			icon: 'file-music',
			rows: [
				{
					key: 'artworkForLocal',
					title: 'Artwork for local files',
					detail: 'Use metadata from local files to find a cover on Deezer for your Discord status',
					control: 'switch',
					needs: 'discord'
				}
			]
		}
	]
};

const scrobbling: Section = {
	id: 'scrobbling',
	title: 'Scrobbling',
	groups: [{ block: 'scrobbling', rows: [] }]
};

/** Each tab is one scrolling page of the sections that used to be pages of their own. */
export const sections: Record<string, Section[]> = {
	General: [general, about],
	Providers: [providersPage],
	Appearance: [appearance, playerBar, nowPlaying],
	Lyrics: [lyrics],
	Playback: [playback, sound, storage],
	Integrations: [discord, scrobbling]
};

/** The pages a row opens on their own, with the tab they belong to. */
export const drills: Record<string, { tab: string; section: Section }> = {
	'lyrics-sources': { tab: 'Lyrics', section: lyricsSourcesPage }
};
