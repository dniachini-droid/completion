/* The one job menu (D-131, step 3): a press and hold on any job, anywhere (Today, the Satchel, the Week), opens it:
   Delve · Edit · Put on a day · Delete. Shown over the screen by App.svelte. */
import type { Go } from './nav';

/** `on`: the day of the row held, when it is a done record (Today's or the Week's): Delete then takes only that day's
    record of a recurring job, as the row's own Delete does (D-125; review of D-131). */
export const menu = $state<{ job: string | null; go: Go | null; on: string | null }>({ job: null, go: null, on: null });
export function openMenu(job: string, go: Go, on: string | null = null) { menu.job = job; menu.go = go; menu.on = on; }
export function closeMenu() { menu.job = null; menu.go = null; menu.on = null; }
