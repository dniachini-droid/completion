/* The one job menu (D-131, step 3): a press and hold on any job, anywhere (Today, the Satchel, the Week), opens it:
   Delve · Edit · Put on a day · Delete. Shown over the screen by App.svelte. */
import type { Go } from './nav';

/** `on`: the day of the row held, when it is a done record (Today's or the Week's): Delete then takes only that day's
    record of a recurring job, as the row's own Delete does (D-125; review of D-131). */
/** `entry`: the Week's session held, so "Put on a day" moves that one (second review of D-131). `at`: when it opened: the
    finger's lift after the hold is never a choice in it (on the iPhone the lift's click can land on what is now under it). */
/** `from`: Today or the Satchel, where a wait just set is said (D-137); elsewhere (the Week) nothing is said. */
export const menu = $state<{ job: string | null; go: Go | null; on: string | null; entry: string | null; from: 'today' | 'satchel' | null; at: number }>({ job: null, go: null, on: null, entry: null, from: null, at: 0 });
export function openMenu(job: string, go: Go, on: string | null = null, entry: string | null = null, from: 'today' | 'satchel' | null = null) {
  menu.job = job; menu.go = go; menu.on = on; menu.entry = entry; menu.from = from; menu.at = performance.now(); sayWaited(null);
}
export function closeMenu() { menu.job = null; menu.go = null; menu.on = null; menu.entry = null; menu.from = null; }
/** Just opened: a tap now is the finger lifting from the hold. */
export const settling = () => performance.now() - menu.at < 450;

/** "How long did it take?" for a job ticked off without a delve (D-134), shown over the screen by App.svelte. */
export const ticking = $state<{ job: string | null; go: Go | null; at: number }>({ job: null, go: null, at: 0 });
export function openTick(job: string, go: Go) { ticking.job = job; ticking.go = go; ticking.at = performance.now(); }
export function closeTick() { ticking.job = null; ticking.go = null; }

/** The job just set waiting on a reply (D-137): Today and the Satchel say where it went, with "Back to it" at hand;
    `today`: it was on today's list, so taking the wait back puts it there again. */
export const waited = $state<{ job: string | null; until: string; today: boolean }>({ job: null, until: '', today: false });
export function sayWaited(job: string | null, until = '', today = false) { waited.job = job; waited.until = until; waited.today = today; }
