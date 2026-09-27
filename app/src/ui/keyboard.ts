/* The phone's keyboard (Dan, 2026-09-27, D-120). On the iPhone the keyboard covers the page rather than shrinking it, and
   the phone slides the whole page up to show the box being typed in. The app never scrolls as a page, so that slide
   drew Today's words over the "+ Add" box, and it could stay behind once the keyboard went: the page looked back in
   place but a tap landed a slide away from where it was aimed, so Done did nothing. Now, while the keyboard is up, the
   phone frame is exactly the part of the screen above it (`--vvh`), and the page is always put back at the top. */

const root = document.documentElement;
const vv = window.visualViewport;

/** Put the page back where it belongs: the app's screens never scroll as a whole. */
function home() {
  if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
  const s = document.scrollingElement;
  if (s && s.scrollTop) s.scrollTop = 0;
}

let last = '';
/* The phone's date picker is not a keyboard: while one is open the screen is left exactly as it is. Resizing or
   scrolling under it moved the box it was opened from, and the phone closed the calendar at once (Dan, D-125). */
const picking = () => { const a = document.activeElement; return a instanceof HTMLInputElement && /^(date|month|week|datetime-local)$/.test(a.type); };
function fit() {
  if (!vv || picking()) return;
  /* the keyboard is up when the visible part is clearly shorter than the page (not a few points of browser bar) */
  const up = window.innerHeight - vv.height > 80;
  const h = up ? `${Math.round(vv.height)}px` : '';
  if (h !== last) {
    last = h;
    if (h) root.style.setProperty('--vvh', h); else root.style.removeProperty('--vvh');
    root.classList.toggle('kb', up);
  }
  home();
}

/* Nor does a screen sit scrolled sideways (Dan, review 2): a box that clips its sides can still be scrolled by the
   browser to bring something into view, and the whole screen then sat shifted with its words cut off (seen on a delve's
   end, D-120). Put straight whenever the screen changes, not by watching every scroll (Linux's WebKit crashed on that). */
export function unslide() {
  requestAnimationFrame(() => { for (const el of document.querySelectorAll<HTMLElement>('.ui, .ui .scroll, .ui .body')) if (el.scrollLeft) el.scrollLeft = 0; });
}

export function watchKeyboard() {
  if (vv) { vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }
  /* the keyboard going: once it has finished closing, the page is put back again (the slide can come late) */
  document.addEventListener('focusout', () => { setTimeout(fit, 50); setTimeout(fit, 350); });
  document.addEventListener('focusin', () => { setTimeout(fit, 350); });
  fit();
}
