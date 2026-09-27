/**
 * The world moves while Dan is with it, then rests (D-132, Dan: "my phone still gets warm when using the app … not even
 * on a delve"). Every screen's ambient motion (the drifting scene, the mist and fog, flames, motes, the tunnel, the
 * button's breath) plays when a screen opens and while Dan touches it; once nothing has been touched for REST_AFTER, the
 * looping animations are paused exactly where they are, so nothing jumps and the phone draws nothing more. A touch, a
 * key, a scroll, a new screen or coming back to the app wakes them where they left off. The app hidden: at rest at once.
 * Only never-ending animations rest: an entrance, the cut, the stair's reveal and a delve's end always play through.
 * Canvases drawn by script (the stair's dust) listen with onRest.
 */
export const REST_AFTER = 15_000;

let resting = false;
let timer = 0;
let armed = -Infinity;
let paused: Animation[] = [];
const listeners = new Set<(resting: boolean) => void>();

const endless = (a: Animation) => a.effect?.getComputedTiming().iterations === Infinity;

function rest() {
  if (resting) return;
  resting = true;
  clearTimeout(timer);
  paused = document.getAnimations().filter(a => a.playState === 'running' && endless(a));
  for (const a of paused) a.pause();
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
  for (const a of paused) { try { a.play(); } catch { /* its element is gone */ } }
  paused = [];
  for (const f of listeners) f(false);
}

/** A script-drawn loop stops at rest and starts again on waking; returns the unsubscribe. */
export function onRest(f: (resting: boolean) => void): () => void {
  listeners.add(f);
  if (resting) f(true);
  return () => listeners.delete(f);
}
export const isResting = () => resting;

/** Started once, from main.ts. */
export function startRest() {
  if (typeof document === 'undefined' || typeof document.getAnimations !== 'function') return;
  const opt = { capture: true, passive: true } as const;
  for (const e of ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll', 'focusin']) document.addEventListener(e, wake, opt);
  document.addEventListener('visibilitychange', () => (document.hidden ? rest() : wake()));
  window.addEventListener('pageshow', wake);
  /* a looping animation that begins while at rest (a class changed by the clock) rests too */
  document.addEventListener('animationstart', (e) => {
    if (!resting) return;
    const t = e.target as Element | null;
    for (const a of t?.getAnimations?.({ subtree: true }) ?? []) {
      if ((a as CSSAnimation).animationName === e.animationName && a.playState === 'running' && endless(a)) { a.pause(); paused.push(a); }
    }
  }, true);
  wake();
}
