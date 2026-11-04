import type { Person } from '$lib/mock/together.svelte';

export type Tile = {
	id: string;
	icon: string;
	title: string;
	active?: boolean;
	/** Draws a download ring in place of the icon, this far round, or turning while `null`. */
	ring?: number | null;
	onclick?: () => void;
};

export type Item = {
	id: string;
	label?: string;
	icon?: string;
	cover?: string;
	round?: boolean;
	detail?: string;
	faces?: Person[];
	selected?: boolean;
	checked?: boolean;
	disabled?: boolean;
	separator?: boolean;
	/** Keeps the menu open after a click, for a toggle such as a playlist row. */
	stays?: boolean;
	submenu?: Item[];
	width?: number;
	/** A small button at the end of the row, such as the cross that cancels one download. */
	action?: { icon: string; title: string; onclick: () => void };
	/** Draws the row as a quiet heading over the rows under it. */
	heading?: boolean;
	onclick?: () => void;
};

export type Sheet = { items: Item[]; tiles?: Tile[]; width?: number; footer?: string[] };

type Open = {
	x: number;
	y: number;
	/** The height of the trigger a menu opens from, so it can flip above it. */
	span: number;
	align: 'start' | 'end';
	above: boolean;
	build: () => Sheet;
	owner: string;
};

let open = $state<Open | null>(null);
let host: HTMLElement | null = null;

/** Turns a point on the page into one inside the mock app, which is scaled down to fit. */
function inside(x: number, y: number) {
	if (!host) return { x, y, scale: 1 };
	const rect = host.getBoundingClientRect();
	const scale = rect.width / host.offsetWidth || 1;
	return { x: (x - rect.left) / scale, y: (y - rect.top) / scale, scale };
}

export const menu = {
	get open() {
		return open;
	},
	get owner() {
		return open?.owner ?? '';
	},
	bind(element: HTMLElement | null) {
		host = element;
	},
	/** Opens a right-click menu where the pointer is. */
	at(event: MouseEvent, owner: string, build: () => Sheet) {
		event.preventDefault();
		event.stopPropagation();
		const at = inside(event.clientX, event.clientY);
		open = { x: at.x, y: at.y, span: 0, align: 'start', above: false, build, owner };
	},
	/** Opens a menu under its trigger, or above it with `above`, lined up with its `align` edge. */
	from(
		trigger: Element,
		owner: string,
		build: () => Sheet,
		{ align = 'start', above = false }: { align?: 'start' | 'end'; above?: boolean } = {}
	) {
		if (open?.owner === owner) {
			open = null;
			return;
		}
		const rect = trigger.getBoundingClientRect();
		const corner = inside(align === 'end' ? rect.right : rect.left, above ? rect.top : rect.bottom);
		const span = rect.height / corner.scale;
		open = { x: corner.x, y: corner.y, span, align, above, build, owner };
	},
	close() {
		open = null;
	}
};
