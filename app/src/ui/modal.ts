/* A sheet over the screen (the job menu, the tick sheet) takes VoiceOver with it (deep review A#34): its first choice is
   focused, never scrolling anything (D-111); what lies under it is inert while it is open; and focus goes back where it
   was when it closes. Used as `use:modal` on the sheet. */
const back = new WeakMap<HTMLElement, HTMLElement | null>();
/* how many open sheets hold each thing under them inert: one closing never wakes the screen under another (re-review) */
const holds = new WeakMap<HTMLElement, number>();
const hold = (e: HTMLElement, d: number) => { const n = Math.max(0, (holds.get(e) ?? 0) + d); holds.set(e, n); e.inert = n > 0; };
/* a sheet that closed a moment ago, opening another (the tick sheet from the job menu): focus goes back to where the
   first was opened from, whichever of the two the page tears down or builds first */
let lastClosed: { was: HTMLElement | null; at: number } | null = null;
export function modal(node: HTMLElement) {
  const now = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
  const from = now?.closest<HTMLElement>('[role="dialog"]');
  const was = from && back.has(from) ? back.get(from)!
    : !now && lastClosed && performance.now() - lastClosed.at < 400 ? lastClosed.was : now;
  back.set(node, was);
  const under = [...(node.parentElement?.children ?? [])].filter((e): e is HTMLElement => e !== node && e instanceof HTMLElement && !e.classList.contains('scrim'));
  for (const e of under) hold(e, 1);
  queueMicrotask(() => node.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true }));
  return {
    destroy() {
      for (const e of under) hold(e, -1);
      lastClosed = { was, at: performance.now() };
      if (was?.isConnected) was.focus({ preventScroll: true });
    },
  };
}
