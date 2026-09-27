/* A press and hold on a job's row that doesn't slide (the Week): after a moment it opens the job menu (D-131, step 3),
   and the lift that follows is not a tap. A finger that moves is a scroll, never a hold. Nothing moves on a press. */
export function hold(node: HTMLElement, fire: () => void) {
  let timer = 0, x = 0, y = 0, fired = false;
  const stop = () => { clearTimeout(timer); removeEventListener('pointermove', move); removeEventListener('pointerup', stop); removeEventListener('pointercancel', stop); };
  const move = (e: PointerEvent) => { if (Math.hypot(e.clientX - x, e.clientY - y) > 10) stop(); };
  const down = (e: PointerEvent) => {
    if (e.button > 0) return;
    fired = false; x = e.clientX; y = e.clientY;
    timer = window.setTimeout(() => { fired = true; stop(); fire(); }, 480);
    addEventListener('pointermove', move); addEventListener('pointerup', stop); addEventListener('pointercancel', stop);
  };
  const click = (e: MouseEvent) => { if (fired) { fired = false; e.preventDefault(); e.stopImmediatePropagation(); } };
  const menu = (e: Event) => e.preventDefault();
  node.addEventListener('pointerdown', down);
  node.addEventListener('click', click, true);
  node.addEventListener('contextmenu', menu);
  return {
    update(f: () => void) { fire = f; },
    destroy() { stop(); node.removeEventListener('pointerdown', down); node.removeEventListener('click', click, true); node.removeEventListener('contextmenu', menu); },
  };
}
