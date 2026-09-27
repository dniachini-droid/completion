/* The one job menu (D-131, step 3): a press and hold on any job, anywhere (Today, the Satchel, the Week), opens it:
   Delve · Edit · Put on a day · Delete. Shown over the screen by App.svelte. */
import type { Go } from './nav';

export const menu = $state<{ job: string | null; go: Go | null }>({ job: null, go: null });
export function openMenu(job: string, go: Go) { menu.job = job; menu.go = go; }
export function closeMenu() { menu.job = null; menu.go = null; }
