import { mount } from 'svelte';
import './fonts.css';
import './direction.css';
import './base.css';
import { platform } from '../platform';

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

/* sound may play only after a tap, and again after each return from the background */
document.addEventListener('pointerdown', () => platform.sound.unlock());   /* every tap: iOS suspends sound after the background */

/* the save is read before the game starts (the game is made when App is first loaded) */
await platform.ready();
try {
  const { default: App } = await import('./App.svelte');
  mount(App, { target: document.getElementById('app')! });
} catch (e) {
  /* never a blank phone: say so, keep the save, offer to try again (review finding, D-080) */
  console.error(e);
  const el = document.getElementById('app')!;
  el.innerHTML = '<div style="padding:80px 24px;color:#ddd;font:18px Georgia,serif;text-align:center">Something went wrong starting up. Your save is safe.<br><br><button style="font:inherit;padding:10px 20px" onclick="location.reload()">Try again</button></div>';
}
