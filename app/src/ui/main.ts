import { mount } from 'svelte';
import './fonts.css';
import './direction.css';
import './base.css';
import { platform } from '../platform';
import type { Saves } from '../platform/saves';
import { readSave } from '../core/save';
import { watchKeyboard } from './keyboard';
import { watchTaps } from './taps';
import { startRest } from './rest';

/* the light blooms where you tap (direction D; motion only) */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('pointerdown', e => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('.btn, .btn-quiet, .seg > button');
    if (!el) return;
    const r = el.getBoundingClientRect(), b = document.createElement('span');
    b.className = 'bloom'; b.style.left = `${e.clientX - r.left}px`; b.style.top = `${e.clientY - r.top}px`;
    el.style.overflow = 'hidden'; el.appendChild(b);
    setTimeout(() => { b.remove(); el.style.overflow = ''; }, 950);
  });
}
/* the page never zooms (Dan, D-105): the phone's own pinch is refused everywhere; only a painting being looked at
   zooms, by its own sums (Look.svelte) */
for (const g of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(g, e => e.preventDefault(), { passive: false });

/* the keyboard never slides the page, nor leaves it slid (D-120) */
watchKeyboard();
/* a tap that changes the screen never lands a second time on what replaces it (D-120) */
watchTaps();

/* the world moves while Dan is with it, then rests: a settled, untouched screen draws nothing (D-132) */
startRest();

/* sound may play only after a tap, and again after each return from the background */
document.addEventListener('pointerdown', () => platform.sound.unlock());   /* every tap: iOS suspends sound after the background */

/* the save is read before the game starts (the game is made when App is first loaded) */
await platform.ready();
try {
  const { default: App } = await import('./App.svelte');
  mount(App, { target: document.getElementById('app')! });
} catch (e) {
  /* never a blank phone: say so, keep the save, offer to try again (review finding, D-080); and a way out that needs no
     screen of the game: a copy of the save, and the save from before a restore (deep review B14, P#17) */
  console.error(e);
  const el = document.getElementById('app')!;
  const key = 'save.v1', saves = platform.saves as Saves & { all?: () => [string, string][] };
  const keys = saves.all ? saves.all().map(([k]) => k) : (() => { try { return Object.keys(localStorage); } catch { return []; } })();
  const before = keys.filter(k => k.startsWith(`${key}.before-restore.`)).sort((a, b) => +a.split('.').pop()! - +b.split('.').pop()!).pop() ?? null;
  const button = (id: string, label: string) => `<button id="${id}" style="font:inherit;padding:10px 20px;margin:6px">${label}</button>`;
  el.innerHTML = '<div style="padding:80px 24px;color:#ddd;font:18px Georgia,serif;text-align:center">Something went wrong starting up. Your save is safe.<br><br>'
    + button('again', 'Try again') + '<br>' + button('copy', 'Save a copy of my save') + (before ? '<br>' + button('undo', 'Undo the restore') : '') + '<p id="said"></p></div>';
  const said = (s: string) => { el.querySelector('#said')!.textContent = s; };
  el.querySelector('#again')!.addEventListener('click', () => location.reload());
  el.querySelector('#copy')!.addEventListener('click', async () => {
    const raw = platform.saves.get(key);
    try { if (raw) { await platform.copies.share(`Long Answer save ${new Date().toISOString().slice(0, 10)}.json`, raw); said('A copy was made.'); } } catch { said('The copy could not be made.'); }
  });
  el.querySelector('#undo')?.addEventListener('click', async () => {
    const raw = before ? platform.saves.get(before) : null, read = raw ? readSave(raw) : null;
    if (!read) { said('The save from before the restore could not be read.'); return; }
    const now = platform.saves.get(key);
    if (now) platform.saves.keep(`${key}.undone.${Date.now()}`, now);
    platform.saves.write(key, read.save);
    await (platform.saves as { flush?: () => Promise<void> }).flush?.().catch(() => {});
    location.reload();
  });
}
