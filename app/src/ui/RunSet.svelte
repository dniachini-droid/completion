<script lang="ts">
  /* The run set-up, after Begin on a longer job (D-033 the dial, D-037 the run, D-047 enough).
     Stops 5 · 10 · 15 · 25 · 30 · 45 · 60 on a 60-minute face, and one long 90 under it (D-110); under it one route line where time is distance.
     Mock-up: design/directions/d-combined/delve-set.html (its CSS is ./scene/runset.css, scoped under .rs). */
  import { game, content } from './game.svelte';
  import { DIAL, presetRun, carriedOf } from '../core/game';
  import { t, delves, inSentence, minutesWords } from '../content/copy/en';
  import { platform } from '../platform';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { errandPick } from './errand-pick.svelte';
  import './scene/runset.css';

  /* `jobId` 'errands': the errand run's set-up (D-139), for the jobs ticked on its pick list */
  let { go, jobId }: { go: Go; jobId: string } = $props();
  const errands = jobId === 'errands' ? errandPick.jobs.slice() : null;
  const job = $derived(errands ? null : game.job(jobId)!);
  const v = $derived(game.whole);
  const preset = presetRun(errands ? undefined : game.job(jobId)!, game.whole.content);
  /* a one-off left "Not yet" carries on from its minutes (D-133): one quiet line says so */
  const carry = $derived(errands ? 0 : carriedOf(game.facts, v.content, jobId));
  /* the first three named, then "and N more": never cut with an ellipsis (deep review H#15) */
  const names = $derived.by(() => {
    const all = (errands ?? []).map(id => game.job(id)?.name).filter((x): x is string => !!x);
    return all.length > 3 ? `${all.slice(0, 3).join(' · ')} ${t('errand.andMore', { n: all.length - 3 })}` : all.join(' · ');
  });
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* the face holds an hour: a stop's angle is its minutes; 90 fills the ring and has its own button under it */
  const FACE = DIAL.filter(m => m <= 60), LONG = 90;
  const ANG: Record<number, number> = Object.fromEntries(DIAL.map(m => [m, Math.min(60, m) * 6]));
  const MAXN = 8, BREATH = 5;

  let val = $state<number>(Math.min(60, preset.minutes));    /* the handle, in minutes (moves smoothly; 90 shows as a full ring) */
  let snap = $state<number>(preset.minutes);   /* the stop it rests on */
  let n = $state(preset.count);
  let dragging = $state(false);
  let tickKey = $state(0);
  let dial: HTMLDivElement, routebox: HTMLDivElement;
  let W = $state(340);

  const place = $derived(v.toNext !== null ? { name: t('set.nextPlace') } : null);
  const toPlace = $derived(v.toNext);
  const there = $derived(toPlace !== null && n * snap >= toPlace);

  function clockWords(add: number) {
    const d = new Date(game.clockMs() + add * 60_000);
    let m = d.getHours() * 60 + d.getMinutes(); m = Math.round(m / 5) * 5 % 1440;
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }
  /* a repeating job counts for the minutes it runs, whatever their length (D-121): no "enough" mark on the line */
  const when = $derived(t('set.ends', { end: clockWords(n * snap + (n - 1) * BREATH) }));

  /* ---- the dial ---- */
  const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
  const nearest = (x: number) => FACE.reduce((b, s) => (Math.abs(s - x) < Math.abs(b - x) ? s : b), FACE[0] as number);
  const magnet = (x: number) => { const d = nearest(x), k = Math.abs(x - d); return k < 2.5 ? x + (d - x) * (1 - k / 2.5) * .6 : x; };
  function onSnap(s: number) {
    if (s === snap) return;
    snap = s; tickKey++;
    void platform.haptics.tick();
  }
  let anim = 0;
  /* never a frame left running into a screen that has gone (C#22) */
  $effect(() => () => cancelAnimationFrame(anim));
  function settleTo(target: number, fromTap = false) {
    cancelAnimationFrame(anim); onSnap(target);
    if (reduce) { val = Math.min(60, target); return; }
    const from = val, dur = fromTap ? 520 : 380, to = Math.min(60, target); let t0: number | null = null;
    const back = (k: number) => { const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
    const f = (ts: number) => {
      t0 ??= ts;
      const k = clamp((ts - t0) / dur, 0, 1);
      val = clamp(from + (to - from) * back(k), 4, 61);
      if (k < 1) anim = requestAnimationFrame(f); else val = to;
    };
    anim = requestAnimationFrame(f);
  }
  function angleAt(e: PointerEvent) {
    const r = dial.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
    let a = Math.atan2(dx, -dy) * 180 / Math.PI; if (a < 0) a += 360;
    return { a, d: Math.hypot(dx, dy), w: r.width };
  }
  function down(e: PointerEvent) {
    const p0 = angleAt(e);
    if (p0.d < p0.w * .28) return;
    cancelAnimationFrame(anim);
    dial.setPointerCapture(e.pointerId); dragging = true;
    const mv = (ev: PointerEvent) => {
      let a = angleAt(ev).a; const lastA = val * 6;
      if (a < 30) a = lastA > 195 ? 360 : 30;      /* the empty arc holds at whichever end you came from */
      if (Math.abs(a - lastA) > 120) a = lastA;
      val = magnet(clamp(a / 6, 5, 60)); onSnap(nearest(val));
    };
    const up = () => { dragging = false; dial.removeEventListener('pointermove', mv); dial.removeEventListener('pointerup', up); dial.removeEventListener('pointercancel', up); settleTo(nearest(val)); };
    dial.addEventListener('pointermove', mv); dial.addEventListener('pointerup', up); dial.addEventListener('pointercancel', up);
    mv(e); e.preventDefault();
  }
  function dialKey(e: KeyboardEvent) {
    let i = (DIAL as readonly number[]).indexOf(snap);
    if (['ArrowRight', 'ArrowUp', '+', '='].includes(e.key)) i++; else if (['ArrowLeft', 'ArrowDown', '-'].includes(e.key)) i--; else return;
    e.preventDefault(); settleTo(DIAL[clamp(i, 0, DIAL.length - 1)], true);
  }

  /* ---- the route: one line, time is distance ---- */
  function setCount(x: number) { const c = clamp(x, 1, MAXN); if (c !== n) { n = c; void platform.haptics.tick(); } }
  const span = $derived(Math.max(215, Math.min(MAXN, n + 1) * snap, toPlace !== null && toPlace <= 8 * 60 ? toPlace + 20 : 0));
  function countAt(e: PointerEvent) {
    const r = routebox.getBoundingClientRect(), x = e.clientX - r.left;
    const m = (x - 8) / (W - 11) * span;
    return Math.ceil(Math.max(1, m) / snap - .02);
  }
  function routeDown(e: PointerEvent) {
    routebox.setPointerCapture(e.pointerId); setCount(countAt(e));
    const mv = (ev: PointerEvent) => setCount(countAt(ev));
    const up = () => { routebox.removeEventListener('pointermove', mv); routebox.removeEventListener('pointerup', up); routebox.removeEventListener('pointercancel', up); };
    routebox.addEventListener('pointermove', mv); routebox.addEventListener('pointerup', up); routebox.addEventListener('pointercancel', up);
    e.preventDefault();
  }
  const H = 68, y = 34.5, x0 = 8;
  const x1 = $derived(W - 3);
  const px = (m: number) => x0 + (x1 - x0) * m / span;
  const ARCH = 'M-6 8 V-1 Q-6 -8 0 -8 Q6 -8 6 -1 V8';
  const segs = $derived.by(() => {
    let d = ''; const gap = 2.5;
    for (let i = 0; i < n; i++) {
      const a = px(i * snap) + (i ? gap : 0), b = px((i + 1) * snap) - (i + 1 < n ? gap : 0);
      if (b > a + .5) d += `M${a.toFixed(1)} ${y}H${b.toFixed(1)}`;
    }
    return d;
  });
  const xe = $derived(px(n * snap));
  const xg = $derived(toPlace !== null && toPlace <= span ? px(toPlace) : null);
  const lit = $derived(xg === null ? 0 : clamp((xe - xg + 6) / 8, 0, 1));
  const gAnchor = $derived(xg === null ? 'middle' : xg + 58 > W ? 'end' : xg - 58 < 0 ? 'start' : 'middle');
  /* the side chamber sits at its own place on the road, halfway to the next place (D-122): it lights once the run reaches it */
  const side = $derived.by(() => {
    const m = v.toChamber;
    if (m === null || m > span) return null;
    let xb = px(Math.max(1, m));
    if (xg !== null && Math.abs(xb - xg) < 12) xb = xg - 12;
    const left = xb + 20 + 9 + 98 > W, dir = left ? -1 : 1;
    return { xb, dir, left, cx: xb + dir * 20, cy: y - 19, lit: n * snap >= m };
  });

  /* refused by the rules (a delve under way, an end still to answer): said, never a flash of an empty delve (C#10) */
  let refused = $state(false);
  function start() {
    platform.sound.unlock();
    if (errands) game.do({ do: 'startErrands', jobs: errands, minutes: snap, count: n });
    else game.do({ do: 'startRun', job: jobId, minutes: snap, count: n });
    if (!game.whole.run) { refused = true; return; }
    if (errands) errandPick.jobs = [];
    go('delve');
  }
  /* too little room left for the dial (a long name and a note, with the phone's text set larger): the name and the note
     give up a line or two; once tight, it stays so for this set-up, so the layout never see-saws (fresh review) */
  let stageH = $state(0), tight = $state(false);
  $effect(() => { if (stageH && stageH < 280) tight = true; });
</script>

<div class="rs">
  <Scene painting={v.here.painting} />
  <div class="ui">
    <header class="top col">
      <!-- an errand run's set-up has no "Change the job": the way back takes the room (D-139) -->
      <div class="topbar rise" class:solo={!job}>
        <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
        <span></span>
        <!-- the job itself, one quiet tap away from every delve (D-131, step 3) -->
        {#if job}<button class="icon-link change" onclick={() => go('rhythms', job.id)}><span>{t('job.change')}</span></button>{:else}<span></span>{/if}
      </div>
      <section class="job rise d1" class:tight>
        <div class="label-line lit">{t('set.label')}</div>
        {#if !job}
          <!-- the errand run (D-139): its errands, struck off in the delve -->
          <h1 class="say-lg">{t('errand.title')}</h1>
          <p class="soft errands">{t('errand.set', { n: errands?.length ?? 0, names })}</p>
        {:else}
        <h1 class="say-lg">{job.name}</h1>
        <!-- the job put off: what waits beyond it (it lived on Today's next job, D-135) -->
        {#if job.avoided && game.whole.findWaits}<p class="soft last"><span class="find-mark" aria-hidden="true">◇ </span>{t('set.avoided')}</p>{/if}
        {#if carry > 0}<p class="soft carryon">{t('set.carry', { min: minutesWords(carry) })}</p>{/if}
        {#if job.note}<p class="soft last note">{t('set.stopped', { note: job.note })}</p>{/if}
        <!-- the job's list (D-126): struck off a line at a time in the delve -->
        {#if job.list}<p class="soft last">{job.list.split('\n').filter(l => l.trim()).join(' · ')}</p>{/if}
        {/if}
      </section>
    </header>

    <div class="mid stage col rise d2" bind:clientHeight={stageH}>
      <div class="stage-in">
        <div class="dialwrap">
          <div class="dial" class:dragging bind:this={dial} role="slider" tabindex="0" aria-label={t('set.length')}
            aria-valuemin={DIAL[0]} aria-valuemax={LONG} aria-valuenow={snap} style="--p:{(val * 6 / 360).toFixed(4)}"
            onpointerdown={down} onkeydown={dialKey}>
            <div class="halo"></div><div class="disc"></div>
            <div class="band track"></div>
            <div class="glow wide"><div class="band fill"></div></div>
            <div class="glow"><div class="band fill"></div></div>
            <div class="band fill"></div>
            {#each FACE as m}<i class="notch" class:lit={m <= val + .01} style="--a:{ANG[m]}deg"></i>{/each}
            {#key tickKey}<div class="pulse" class:go={tickKey > 0} style="--a:{ANG[snap]}deg"></div>{/key}
            <div class="handle"></div>
            <div class="inner">{#key tickKey}<span class="num" class:tick={tickKey > 0}>{snap}</span>{/key}<span class="unit">{t('set.minutes')}</span></div>
          </div>
          <div class="stops">
            {#each FACE as m}
              <button class="stop" class:on={m === snap} class:past={m < snap} type="button" style="--a:{m === 60 ? 0 : ANG[m]}deg"
                aria-label={`${m} ${t('set.minutes')}`} onclick={() => settleTo(m, true)}>{m}</button>
            {/each}
          </div>
          <!-- one long delve: past the hour, so it has its own stop under the dial (D-110) -->
          <button class="stop long" class:on={snap === LONG} type="button" aria-pressed={snap === LONG}
            aria-label={`${LONG} ${t('set.minutes')}`} onclick={() => settleTo(snap === LONG ? 60 : LONG, true)}>{t('set.long', { n: LONG })}</button>
        </div>
      </div>
    </div>

    <section class="bottom col">
      <div class="run rise d3" class:there>
        <h2 class="carve">{place ? t(there ? 'set.to' : 'set.towards', { place: place.name }) : t('set.onward')}</h2>
        <div class="route" bind:this={routebox} bind:clientWidth={W} role="slider" tabindex="0" aria-label={t('set.count', { n: delves(n), len: snap })}
          aria-valuemin={1} aria-valuemax={MAXN} aria-valuenow={n} onpointerdown={routeDown}
          onkeydown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setCount(n + 1); else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setCount(n - 1); }}>
          <svg viewBox="0 0 {W} {H}" aria-hidden="true">
            <defs>
              <linearGradient id="beyond" gradientUnits="userSpaceOnUse" x1={x0} x2={x1} y1="0" y2="0"><stop offset="0" stop-color="#babaff" stop-opacity=".34" /><stop offset=".7" stop-color="#babaff" stop-opacity=".2" /><stop offset="1" stop-color="#babaff" stop-opacity="0" /></linearGradient>
              <linearGradient id="seg" gradientUnits="userSpaceOnUse" x1={x0} x2={Math.max(xe, x0 + 1)} y1="0" y2="0"><stop offset="0" stop-color="#8f86ff" stop-opacity=".45" /><stop offset="1" stop-color="#f1efff" /></linearGradient>
              <radialGradient id="rn"><stop offset="0" stop-color="#fff" /><stop offset=".4" stop-color="#b9b3ff" stop-opacity=".7" /><stop offset="1" stop-color="#8f86ff" stop-opacity="0" /></radialGradient>
            </defs>
            <path d="M{x0} {y}H{x1}" stroke="url(#beyond)" stroke-width="1" />
            <path d={segs} stroke="url(#seg)" stroke-width="2" stroke-linecap="round" style="filter:drop-shadow(0 0 4px rgba(143,134,255,.95))" />
            {#if xg !== null && place}
              <g transform="translate({xg.toFixed(1)} {y})" opacity={(.42 + .58 * lit).toFixed(2)} style={lit > .5 ? 'filter:drop-shadow(0 0 5px rgba(143,134,255,1))' : ''}>
                <path d="{ARCH} Z" fill="#0b0b1c" /><path d={ARCH} fill="none" stroke="#ece9ff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
              </g>
              <text x={gAnchor === 'end' ? W : gAnchor === 'start' ? 0 : xg} y={y + 25} text-anchor={gAnchor} fill={lit > .5 ? '#eceaff' : '#a3a6cc'}>{inSentence(place.name)}</text>
            {/if}
            <circle cx={x0} cy={y} r="3.4" fill="#ffd27a" style="filter:drop-shadow(0 0 5px #f2c170)" />
            <!-- "here" steps aside when the next place is right beside it, so the two words never print over each other (review 2) -->
            {#if xg === null || !place || xg - x0 > 90}<text x={x0 - 5} y={y + 25} fill="#a3a6cc">{t('set.here')}</text>{/if}
            {#if side}
              <g opacity={side.lit ? .95 : .5} style={side.lit ? 'filter:drop-shadow(0 0 4px rgba(143,134,255,.9))' : ''}>
                <path d="M{side.xb.toFixed(1)} {y} C{(side.xb + side.dir * 3).toFixed(1)} {y - 9} {(side.xb + side.dir * 9).toFixed(1)} {y - 15} {(side.cx - side.dir * 5).toFixed(1)} {side.cy + 2}" fill="none" stroke="#c9c5ff" stroke-width="1" stroke-dasharray="2 2.5" />
                <g transform="translate({side.cx.toFixed(1)} {side.cy}) scale(.62)"><path d="{ARCH} Z" fill="#0b0b1c" /><path d={ARCH} fill="none" stroke="#d9d6ff" stroke-width="1.8" stroke-linecap="round" /></g>
                <text x={side.cx + side.dir * 9} y={side.cy + 4} text-anchor={side.left ? 'end' : 'start'} fill="#c7c9e6">{t('set.side')}</text>
              </g>
            {/if}
            <circle cx={xe} cy={y} r="10" fill="url(#rn)" />
          </svg>
        </div>
        <div class="count">
          <button type="button" aria-label={t('set.less')} disabled={n <= 1} onclick={() => setCount(n - 1)}><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4 9h10" /></svg></button>
          <div aria-live="polite"><div class="n">{t('set.count', { n: delves(n), len: snap })}</div><div class="when">{when}</div></div>
          <button type="button" aria-label={t('set.more')} disabled={n >= MAXN} onclick={() => setCount(n + 1)}><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4 9h10M9 4v10" /></svg></button>
        </div>
      </div>
      <div class="go rise d4">
        {#if refused}<p class="soft refused" role="status">{t('set.refused')}</p>{/if}
        <button class="btn" onclick={start}>{t('set.begin')}</button>
        <!-- the first small step, one quiet tap from every set-up (MORNING-REPORT Part 3 #4) -->
        <!-- (only for a job not yet begun: one with minutes behind it, or where he stopped, is under way) -->
        {#if job && carry === 0 && !job.note}<button class="text-link cant" onclick={() => go('cant', job.id)}><span>{t('today.cantGetStarted')}</span></button>{/if}
      </div>
    </section>
  </div>
</div>

<style>
  .rs { display: contents; }
  button.home { color: var(--ink-2); }
  .topbar.solo { grid-template-columns: auto 1fr auto; }
  .change span { font-family: var(--life); font-style: italic; font-size: calc(15px * var(--ts, 1)); letter-spacing: 0; text-transform: none; color: var(--ink-2); }
  /* the errands, two lines at most: the full list is on the delve */
  .errands { margin-top: 2px; font-style: italic; font-size: calc(15px * var(--ts, 1)); text-align: left; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
  .refused { font-style: italic; font-size: calc(15px * var(--ts, 1)); text-align: center; margin-bottom: 8px; }
  .last, .carryon { margin-top: 2px; font-style: italic; font-size: calc(15px * var(--ts, 1)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; }
  .find-mark { color: var(--gold-hi); font-style: normal; }
  .go .cant { display: flex; align-items: center; margin: 0 auto; min-height: 44px; font-style: italic; color: var(--ink-2); }
  /* where he stopped is the point of the note: shown in full, a few lines (deep review B10) */
  .last.note { white-space: normal; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; line-height: 1.3; }
  /* a long name keeps to three lines; the dial below gives way to it */
  .job.tight h1 { -webkit-line-clamp: 2; line-clamp: 2; }
  .job.tight .last.note { -webkit-line-clamp: 2; line-clamp: 2; }
  .job h1 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden; overflow-wrap: anywhere; }
</style>
