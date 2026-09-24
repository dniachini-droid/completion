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
/* sound may play only after a tap */
document.addEventListener('pointerdown', () => platform.sound.unlock(), { once: true });

/* the save is read before the game starts (the game is made when App is first loaded) */
await platform.ready();
const { default: App } = await import('./App.svelte');
mount(App, { target: document.getElementById('app')! });
