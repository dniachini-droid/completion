/* One tap, one decision (D-120). When a tap changes the screen (or the delve's phase), the next screen's buttons can sit
   under the same finger: a quick second tap, or the phone snapping a tap to the nearest button, made a second decision
   nobody chose (Begin twice ended the delve at once; Done twice skipped the job's return). For a moment after such a
   change, taps are let go by. */

/** How long after a change a tap is let go by: shorter than a deliberate second tap, longer than a double tap. */
export const STEADY_MS = 500;
let until = 0;

/** The screen just changed under Dan's finger. */
export function steady(ms = STEADY_MS) { until = Math.max(until, performance.now() + ms); }

export function watchTaps() {
  document.addEventListener('click', e => {
    if (performance.now() >= until) return;
    /* typing isn't a tap: Return in a box still puts its line in */
    if (e.detail === 0) return;
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);
}
