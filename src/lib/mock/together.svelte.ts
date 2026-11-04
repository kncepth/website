/** A Sonora Session or Spotify Jam in the mock, and the Spotify devices playback can move to. */

export type Person = { id: string; name: string; hue: number; host?: boolean; you?: boolean };
export type Device = { id: string; name: string; icon: string };

const YOU: Person = { id: 'you', name: 'You', hue: 210, you: true };
const GUESTS: Person[] = [
	{ id: 'mira', name: 'Mira', hue: 330 },
	{ id: 'jonas', name: 'Jonas', hue: 150 },
	{ id: 'ava', name: 'Ava', hue: 35 }
];
const ARRIVAL = 1800;

export const devices: Device[] = [
	{ id: 'phone', name: 'Pixel 8', icon: 'smartphone' },
	{ id: 'speaker', name: 'Living room', icon: 'speaker' }
];

let kind = $state<'session' | 'jam' | null>(null);
let code = $state('');
let people = $state<Person[]>([]);
let device = $state<string | null>(null);
let showing = $state(false);
let joining = $state(false);
let arrivals: ReturnType<typeof setTimeout>[] = [];

function settle() {
	for (const timer of arrivals) clearTimeout(timer);
	arrivals = [];
}

function gather(what: 'session' | 'jam') {
	settle();
	kind = what;
	code = String(Math.floor(100000 + Math.random() * 900000));
	people = [{ ...YOU, host: true }];
	GUESTS.forEach((guest, at) => {
		arrivals.push(
			setTimeout(
				() => {
					if (kind === what) people = [...people, guest];
				},
				ARRIVAL * (at + 1)
			)
		);
	});
}

export const together = {
	get kind() {
		return kind;
	},
	get code() {
		return code;
	},
	get people() {
		return people;
	},
	get device() {
		return devices.find((entry) => entry.id === device) ?? null;
	},
	get showing() {
		return showing;
	},
	/** A session, a Jam or another device playing marks the Sessions button. */
	get busy() {
		return kind !== null || device !== null;
	},
	get hosting() {
		return people.some((person) => person.you && person.host);
	},
	get joining() {
		return joining;
	},
	start() {
		gather('session');
	},
	/** Opens or closes the dialog that asks for a friend's code. */
	ask(open: boolean) {
		joining = open;
	},
	/** Joins a friend's session as a guest, with the host and one more already in it. */
	join(entered: string) {
		settle();
		joining = false;
		kind = 'session';
		code = entered;
		people = [{ ...GUESTS[0], host: true }, GUESTS[1], YOU];
	},
	startJam() {
		gather('jam');
	},
	leave() {
		settle();
		kind = null;
		people = [];
		showing = false;
	},
	remove(id: string) {
		people = people.filter((person) => person.id !== id);
	},
	show(open: boolean) {
		showing = open;
	},
	transfer(id: string | null) {
		device = id;
	},
	release() {
		settle();
	}
};

export const initial = (person: Person) => person.name.slice(0, 1).toUpperCase();
