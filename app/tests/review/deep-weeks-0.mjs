// Explore: a fresh save's first screens.
import { open, look, foot, L, done, keep } from './deep-weeks-lib.mjs';
const R = await open({ at: '2026-10-01T08:30:00+01:00' });
await look(R, 'x00-first');
for (const b of ['Satchel', 'Week', 'Daybook']) { await L.toToday(R); await L.tap(R, foot(R, b), b); await look(R, 'x00-' + b, { full: true }); }
await done(R, 'x0');
