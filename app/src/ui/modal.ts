/* A sheet over the screen (the job menu, the tick sheet) takes VoiceOver with it (deep review A#34): its first choice is
   focused, never scrolling anything (D-111); what lies under it is inert while it is open; and focus goes back where it
   was when it closes. Used as `use:modal` on the sheet. */
const back = new WeakMap<HTMLElement, HTMLElement | null>();
export function modal(node: HTMLElement) {
  const now = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  /* opened from another sheet (the tick sheet from the job menu, which then closes): focus goes back where that one was
     opened from (fresh review of A#34) */
  const from = now?.closest<HTMLElement>('[role="dialog"]');
  const was = from && back.has(from) ? back.get(from)! : now;
  back.set(node, was);
  const under = [...(node.parentElement?.children ?? [])].filter((e): e is HTMLElement => e !== node && e instanceof HTMLElement && !e.classList.contains('scrim'));
  for (const e of under) e.inert = true;
  queueMicrotask(() => node.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true }));
  return {
    destroy() {
      for (const e of under) e.inert = false;
      if (was?.isConnected) was.focus({ preventScroll: true });
    },
  };
}
