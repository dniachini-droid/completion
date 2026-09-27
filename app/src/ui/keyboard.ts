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
function fit() {
  if (!vv) return;
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

/* Nor does anything on a screen slide sideways (Dan, review 2): a box that clips its sides can still be scrolled by the
   browser itself, to bring a caret or a button that overhangs the edge into view, and the whole screen then sat shifted
   with its words cut off (seen on a delve's end, D-120). Any such sideways scroll is put straight back; the map, which
   is dragged around on purpose, is left alone. */
function unslide(e: Event) {
  const el = e.target;
  if (!(el instanceof HTMLElement) || !el.scrollLeft || el.dataset.pan === 'map') return;
  el.scrollLeft = 0;
}

export function watchKeyboard() {
  if (vv) { vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }
  /* the keyboard going: once it has finished closing, the page is put back again (the slide can come late) */
  document.addEventListener('focusout', () => { setTimeout(fit, 50); setTimeout(fit, 350); });
  document.addEventListener('focusin', () => { setTimeout(fit, 350); });
  document.addEventListener('scroll', unslide, true);
  fit();
}
