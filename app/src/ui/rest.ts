/**
 * The world moves while Dan is with it, then rests (D-132, Dan: "my phone still gets warm when using the app … not even
 * on a delve"). Every screen's ambient motion (the drifting scene, the mist and fog, flames, motes, the tunnel, the
 * button's breath) plays when a screen opens and while Dan touches it; once nothing has been touched for REST_AFTER, the
 * looping animations are paused exactly where they are, so nothing jumps and the phone draws nothing more. A touch, a
 * key, a scroll, a new screen or coming back to the app wakes them where they left off. The app hidden: at rest at once.
 * Only never-ending animations rest: an entrance, the cut, the stair's reveal and a delve's end always play through.
 *
 * How: a looping style animation is paused by marking its element (data-rest, or data-rest-before / -after for its
 * ::before / ::after), which direction.css reads as animation-play-state: paused; the style keeps charge of it, so an
 * element removed or restyled while at rest simply ends as it would. A looping script animation (the motes, the dust,
 * the ring's tip) is paused, and made paused while at rest (light.js, live.js read data-resting); on waking, only those
 * still on the page and still paused are played again. Script-drawn canvases (the stair's dust) listen with onRest.
 */
export const REST_AFTER = 15_000;

let resting = false;
let timer = 0;
let armed = -Infinity;
const listeners = new Set<(resting: boolean) => void>();
const MARKS = ['data-rest', 'data-rest-before', 'data-rest-after'];

/** The drawings that move by SMIL (an <animate…> inside): only their own clocks can pause them. A drawing mounted while at
    rest is paused by its screen through onRest. */
const smil = () => [...document.querySelectorAll('svg')].filter(s => s.querySelector('animateMotion, animate, animateTransform'));
const endless = (a: Animation) => a.effect?.getComputedTiming().iterations === Infinity;
const styled = (a: Animation) => typeof (a as CSSAnimation).animationName === 'string';
function mark(target: Element | null | undefined, pseudo: string | null | undefined) {
  target?.setAttribute(pseudo === '::before' ? 'data-rest-before' : pseudo === '::after' ? 'data-rest-after' : 'data-rest', '');
}

function rest() {
  if (resting) return;
  resting = true;
  document.documentElement.setAttribute('data-resting', '');
  clearTimeout(timer);
  for (const a of document.getAnimations()) {
    if (a.playState !== 'running' || !endless(a)) continue;
    const fx = a.effect as KeyframeEffect | null;
    if (styled(a)) mark(fx?.target, fx?.pseudoElement);
    else a.pause();
  }
  /* SMIL (the Map's sparks) is in no getAnimations(): each drawing's own clock is paused (deep review F#2) */
  for (const svg of smil()) svg.pauseAnimations();
  for (const f of listeners) f(true);
}

/** Motion again, from where it rested; and the countdown to the next rest started again. */
export function wake() {
  if (document.hidden) { rest(); return; }
  const now = performance.now();
  if (!resting && now - armed < 1000) return;   /* a burst of touches arms the timer once a second, not on every one */
  armed = now;
  clearTimeout(timer);
  timer = window.setTimeout(rest, REST_AFTER);
  if (!resting) return;
  resting = false;
  document.documentElement.removeAttribute('data-resting');
  for (const m of MARKS) for (const e of document.querySelectorAll(`[${m}]`)) e.removeAttribute(m);
  /* only script animations still on the page (getAnimations lists no others) and still paused */
  for (const a of document.getAnimations()) if (!styled(a) && a.playState === 'paused' && endless(a)) { try { a.play(); } catch { /* */ } }
  for (const svg of smil()) svg.unpauseAnimations();
  for (const f of listeners) f(false);
}

/** A script-drawn loop stops at rest and starts again on waking; returns the unsubscribe. */
export function onRest(f: (resting: boolean) => void): () => void {
  listeners.add(f);
  if (resting) f(true);
  return () => listeners.delete(f);
}

/** Started once, from main.ts. */
export function startRest() {
  if (typeof document === 'undefined' || typeof document.getAnimations !== 'function') return;
  const opt = { capture: true, passive: true } as const;
  for (const e of ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll', 'focusin']) document.addEventListener(e, wake, opt);
  document.addEventListener('visibilitychange', () => (document.hidden ? rest() : wake()));
  window.addEventListener('pageshow', wake);
  /* a looping style animation that begins while at rest (a class changed by the clock) rests too */
  document.addEventListener('animationstart', (e) => {
    if (!resting) return;
    const t = e.target as Element | null, pseudo = e.pseudoElement ?? '';
    const a = document.getAnimations().find(x => styled(x) && (x as CSSAnimation).animationName === e.animationName
      && (x.effect as KeyframeEffect | null)?.target === t && ((x.effect as KeyframeEffect).pseudoElement ?? '') === pseudo);
    if (a && endless(a)) mark(t, pseudo);
  }, true);
  wake();
}
