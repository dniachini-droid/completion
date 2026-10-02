/* A small struck-bell sound, made in the browser (no file, no network). Placeholder until the delve's own
   sound exists (PROTOTYPE_NOTES.md). Browsers only play sound after a tap, so the first tap unlocks it. */
import type { Sound } from './types';

let ctx: AudioContext | null = null;
/* the sound engine rests a few seconds after it was last needed, rather than rendering silence all session (D-132,
   deep review P#20); it wakes on the next tap or chime */
let restTimer: ReturnType<typeof setTimeout> | undefined;
const REST_MS = 5000;
function restSoon() { clearTimeout(restTimer); restTimer = setTimeout(() => { if (ctx?.state === 'running') void ctx.suspend().catch(() => {}); }, REST_MS); }
/* resumed from any state but running: WebKit says 'interrupted' after a call or Siri, which left chimes silent */
const awake = () => ctx && ctx.state !== 'running' && ctx.state !== 'closed' ? ctx.resume().catch(() => {}) : Promise.resolve();

export const sound: Sound = {
  unlock() {
    try {
      ctx ??= new AudioContext();
      void awake();
      restSoon();
    } catch { /* no audio: the ring still shows the end */ }
  },
  chime(kind) {
    if (!ctx) return;
    void awake().then(() => { if (ctx?.state === 'running') ring(ctx, kind); restSoon(); });
  },
};

function ring(ctx: AudioContext, kind: 'delveEnd' | 'breatherEnd') {
  {
    const t = ctx.currentTime, base = kind === 'delveEnd' ? 523.25 : 659.25;
    const out = ctx.createGain(); out.gain.value = kind === 'delveEnd' ? .22 : .12; out.connect(ctx.destination);
    for (const [ratio, level, decay] of [[1, 1, 2.6], [2.01, .45, 1.6], [3.02, .2, 1.1], [4.17, .1, .7]] as const) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = base * ratio;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + decay);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + decay + .05);
    }
  }
}
