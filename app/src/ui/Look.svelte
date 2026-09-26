<script lang="ts">
  /* Looking at the painting (Dan, D-103): the words, the buttons, the day's gold and the dark washes fade away and the
     place is seen as painted. Two fingers pinch to look closer and one finger moves about once closer; a tap anywhere
     comes back. Only the painting is zoomed, by this layer's own sums: the page never zooms or moves (the phone's own
     pinch is refused, here and in main.ts), so nothing else on the screen can be knocked out of place. */
  import { t } from '../content/copy/en';

  let { close }: { close: () => void } = $props();
  const MAX = 4;
  let layer: HTMLDivElement;

  $effect(() => {
    const phone = layer.closest('.phone') as HTMLElement;
    const pic = phone.querySelector<HTMLElement>('.paint.scene:not(.blur)');
    document.body.classList.add('looking');
    let s = 1, x = 0, y = 0;
    const pts = new Map<number, { x: number; y: number }>();
    let pinch: { d: number; s: number; mx: number; my: number; x: number; y: number } | null = null;
    let tap: { x: number; y: number; at: number } | null = null;

    const box = () => phone.getBoundingClientRect();
    /* the painting always covers the screen: never smaller than it is, never pulled away from an edge */
    function apply() {
      const { width: w, height: h } = box();
      s = Math.min(MAX, Math.max(1, s));
      x = Math.min(0, Math.max(w - w * s, x)); y = Math.min(0, Math.max(h - h * s, y));
      if (pic) pic.style.transform = s === 1 ? '' : `translate(${x}px, ${y}px) scale(${s})`;
    }
    if (pic) { pic.style.transformOrigin = '0 0'; pic.style.transition = 'none'; }
    const local = (e: PointerEvent) => { const b = box(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    const two = () => { const [a, b] = [...pts.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; };

    function down(e: PointerEvent) {
      e.preventDefault(); try { layer.setPointerCapture(e.pointerId); } catch { /* a pointer the phone has already let go */ }
      pts.set(e.pointerId, local(e));
      if (pts.size === 1) tap = { ...local(e), at: e.timeStamp };
      if (pts.size === 2) { tap = null; const g = two(); pinch = { d: g.d, s, mx: g.mx, my: g.my, x, y }; }
    }
    function move(e: PointerEvent) {
      if (!pts.has(e.pointerId)) return;
      e.preventDefault();
      const prev = pts.get(e.pointerId)!, now = local(e);
      pts.set(e.pointerId, now);
      if (tap && Math.hypot(now.x - tap.x, now.y - tap.y) > 10) tap = null;
      if (pts.size >= 2 && pinch) {
        const g = two(), k = Math.min(MAX, Math.max(1, pinch.s * g.d / pinch.d)) / pinch.s;
        /* the point under the fingers stays under them as they spread and move */
        s = pinch.s * k; x = g.mx - (pinch.mx - pinch.x) * k; y = g.my - (pinch.my - pinch.y) * k;
        apply();
      } else if (pts.size === 1 && s > 1) { x += now.x - prev.x; y += now.y - prev.y; apply(); }
    }
    function up(e: PointerEvent) {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (pts.size === 1) { /* the finger left behind carries on moving, not jumping */ }
      if (!pts.size && tap && e.type === 'pointerup' && e.timeStamp - tap.at < 400) close();
      if (!pts.size) tap = null;
    }
    /* the phone's own pinch and double-tap zoom never reach the page */
    const refuse = (e: Event) => e.preventDefault();
    const touch = (e: TouchEvent) => { e.preventDefault(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    layer.addEventListener('pointerdown', down);
    layer.addEventListener('pointermove', move);
    layer.addEventListener('pointerup', up);
    layer.addEventListener('pointercancel', up);
    layer.addEventListener('touchstart', touch, { passive: false });
    layer.addEventListener('touchmove', touch, { passive: false });
    layer.addEventListener('gesturestart', refuse);
    layer.addEventListener('gesturechange', refuse);
    addEventListener('keydown', key);
    return () => {
      document.body.classList.remove('looking');
      removeEventListener('keydown', key);
      if (pic) {
        /* the painting eases back to where it was, then is left exactly as the screen had it */
        pic.style.transition = 'transform .4s var(--ease)'; pic.style.transform = '';
        setTimeout(() => { pic.style.transition = ''; pic.style.transformOrigin = ''; }, 450);
      }
    };
  });
</script>

<div class="look" bind:this={layer} role="button" tabindex="-1" aria-label={t('look.back')}>
  <p class="hint">{t('look.hint')}</p>
</div>

<style>
  /* above the screen's words and buttons; it takes every touch, so nothing beneath can be pressed while looking */
  .look { position: absolute; inset: 0; z-index: 8; touch-action: none; -webkit-user-select: none; user-select: none;
    display: flex; align-items: flex-end; justify-content: center; padding-bottom: calc(var(--safe-b) + 28px); outline: none; }
  .hint { font-style: italic; font-size: 15px; color: var(--ink-2); text-shadow: 0 1px 10px rgba(6,5,16,.9);
    opacity: 0; animation: hint 3.4s .5s var(--ease) both; pointer-events: none; }
  @keyframes hint { 0% { opacity: 0; } 15%, 70% { opacity: 1; } 100% { opacity: 0; } }
</style>
