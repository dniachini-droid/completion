/* A sheet over the screen (the job menu, the tick sheet) takes VoiceOver with it (deep review A#34): its first choice is
   focused, never scrolling anything (D-111); what lies under it is inert while it is open; and focus goes back where it
   was when it closes. Used as `use:modal` on the sheet. */
export function modal(node: HTMLElement) {
  const was = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
