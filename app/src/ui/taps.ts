/* One tap, one decision (D-120). When a tap changes the screen (or the delve's phase), the next screen's buttons can sit
   under the same finger: a quick second tap, or the phone snapping a tap to the nearest button, made a second decision
   nobody chose (Begin twice ended the delve at once; Done twice skipped the job's return). Just after such a change, a
   second tap where the last one landed is let go by; a tap anywhere else is a new choice and counts. */

/** How long after a change a tap where the last one landed is let go by: longer than a double tap, shorter than a
    deliberate second tap. */
export const STEADY_MS = 500;
/** How near the last tap a tap must be to count as the same finger again (a thumb's width). */
const NEAR_PX = 48;
let until = 0, last: { x: number; y: number } | null = null;

/** The screen (or the delve's phase) just changed under Dan's finger. Called again once the new screen is drawn, so a
    tap that waited while it drew still counts as the same finger. */
export function steady(ms = STEADY_MS) { until = Math.max(until, performance.now() + ms); }

export function watchTaps() {
  document.addEventListener('click', e => {
    /* typing isn't a tap: Return in a box still puts its line in */
    if (e.detail === 0) return;
    const again = performance.now() < until && last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < NEAR_PX;
    if (again) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    last = { x: e.clientX, y: e.clientY };
  }, true);
}
