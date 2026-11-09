/** `summary` is the one line the introduction shows for the page. */
export type DocPage = { slug: string; title: string; summary: string };

/** The docs pages in reading order, grouped for the sidebar. The first page is where /docs lands. */
export const groups: { label: string; pages: DocPage[] }[] = [
	{
		label: 'Start here',
		pages: [
			{
				slug: 'introduction',
				title: 'Introduction',
				summary: 'What the docs cover and where to start.'
			}
		]
	},
	{
		label: 'Using Sonora',
		pages: [
			{
				slug: 'links',
				title: 'Opening links',
				summary: 'Opening music links from search, your browser or another app.'
			},
			{
				slug: 'providers',
				title: 'Providers',
				summary:
					'How signing in works for each service, their quirks, and the audio quality you get.'
			},
			{
				slug: 'downloads',
				title: 'Downloads and offline',
				summary:
					'Saving songs to play without a connection, offline mode, and the played-track cache.'
			},
			{
				slug: 'sound',
				title: 'Sound',
				summary: 'Output device, sample rate and buffer, and the parametric equalizer.'
			},
			{
				slug: 'sessions',
				title: 'Sessions',
				summary: 'Listening with friends through Sonora Sessions and Spotify Jams.'
			},
			{
				slug: 'shortcuts',
				title: 'Shortcuts',
				summary: 'Every keyboard shortcut, including the ones that only exist on macOS.'
			},
			{
				slug: 'command-line',
				title: 'Command line',
				summary: 'Controlling Sonora from a terminal, a script or a status bar.'
			},
			{
				slug: 'scrobbling',
				title: 'Scrobbling',
				summary: 'Linking Last.fm, Libre.fm, ListenBrainz and Maloja, and when a play counts.'
			}
		]
	},
	{
		label: 'Customizing',
		pages: [
			{
				slug: 'settings',
				title: 'Settings file',
				summary: 'Where settings.json is, editing it by hand, and the Home Manager module.'
			},
			{
				slug: 'themes',
				title: 'Themes',
				summary: 'Installing community themes, and writing your own as a JSON file.'
			}
		]
	},
	{
		label: 'When something breaks',
		pages: [
			{
				slug: 'logs',
				title: 'Logs',
				summary: 'Where the log file is and how to get more detail for a bug report.'
			},
			{
				slug: 'help',
				title: 'Getting help',
				summary: 'Where to ask questions and what a good bug report needs.'
			}
		]
	},
	{
		label: 'About',
		pages: [
			{
				slug: 'vision',
				title: 'Vision',
				summary: 'What Sonora is for, and what it will never be.'
			},
			{
				slug: 'roadmap',
				title: 'Roadmap',
				summary: "What's planned, and what has already shipped."
			}
		]
	}
];

export const pages = groups.flatMap((group) => group.pages);
