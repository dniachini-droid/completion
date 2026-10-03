<script lang="ts">
  /* Settings (D-107): reminders (the one switch, and bedtime's), the save's copies, and the trial's own controls below.
     Reached by the small gear at the top of Today (D-130), out of the day's way; the bedtime can be changed here. Changing anything here earns nothing and loses nothing. */
  import { game } from './game.svelte';
  import { t, dateWords } from '../content/copy/en';
  import { copySummary, readSave, type Save } from '../core/save';
  import Scene from './Scene.svelte';
  import Remind from './Remind.svelte';
  import Bedtime from './Bedtime.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { platform } from '../platform';
  import { flushSync } from 'svelte';
  import { BEDTIME, nudgeOn, reminderOf, remindersOn } from '../core/reminders';
  import { calendarOf } from '../core/week';

  let { go }: { go: Go } = $props();
  const v = $derived(game.whole);
  const on = $derived(remindersOn(game.facts));
  const bed = $derived(reminderOf(game.facts, BEDTIME));
  const nudge = $derived(nudgeOn(game.facts));
  /* the phone's calendar, read-only (D-115): off until turned on; asked once, in the tap that turns it on */
  const cal = $derived(calendarOf(game.facts));
  let cals = $state<{ id: string; title: string }[]>([]), calRefused = $state(false);
  if (calendarOf(game.facts).on) void platform.calendar.calendars().then(x => (cals = x)).catch(() => {});
  async function calOn() {
    calRefused = false;
    if (!(await platform.calendar.permit())) { calRefused = true; return; }
    cals = await platform.calendar.calendars();
    game.do({ do: 'calendarShow', on: true, calendars: null });
    void game.readCalendar();
  }
  function calToggle(id: string) {
    const now = cal.calendars ?? cals.map(c => c.id);
    const next = now.includes(id) ? now.filter(x => x !== id) : [...now, id];
    game.do({ do: 'calendarShow', on: true, calendars: next.length === cals.length ? null : next });
  }

  /* the save's copies (D-107): Save a copy; Restore asks once, in plain words, and keeps what is there now aside */
  /* raw: a picked save is a whole log, never watched fact by fact (deep review F#3) */
  let asking = $state.raw<Save | null>(null), said = $state('');
  async function copy() {
    said = '';
    try { await game.saveCopy(); } catch { said = t('settings.copy.failed'); }
  }
  async function pick() {
    said = ''; asking = null;
    let text: string | null = null;
    try { text = await platform.copies.pick(); } catch { /* chose none */ }
    if (text === null) return;
    const read = readSave(text);
    /* tried on the rules first: a file the game can't run is refused here, plainly, and nothing is written (B14) */
    if (!read || !game.canRestore(read.save)) { said = t('settings.restore.bad'); return; }
    asking = read.save;
    flushSync(); askEl?.scrollIntoView({ block: 'nearest' });
  }
  let askEl = $state<HTMLDivElement | null>(null);
  function ask(s: Save): string {
    const { day, done } = copySummary(s);
    const n = t(done === 1 ? 'jobs.one' : 'jobs.many', { n: done });
    return day && done ? t('settings.restore.ask', { date: dateWords(day), n }) : t('settings.restore.empty');
  }
  function restore() { if (!asking) return; const ok = game.restore(asking); asking = null; said = t(ok ? 'settings.restore.done' : 'settings.restore.bad'); }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    <h1 class="carve lg rise">{t('settings.label')}</h1>
  </header>

  <div class="body col rise d1">
    <!-- the bedtime, changed here at any hour; on Today only from the evening (D-130) -->
    <section>
      <div class="label-line">{t('camp.bedtime')}</div>
      <Bedtime say={t('settings.bedtime.say')} />
    </section>

    <section>
      <div class="label-line">{t('settings.reminders')}</div>
      <p class="soft note">{t('settings.reminders.say')}</p>
      <div class="seg" role="group" aria-label={t('settings.reminders')}>
        <button aria-pressed={on} onclick={() => game.do({ do: 'reminders', on: true })}>{t('settings.reminders.on')}</button>
        <button aria-pressed={!on} onclick={() => game.do({ do: 'reminders', on: false })}>{t('settings.reminders.off')}</button>
      </div>
      {#if on}
        <p class="say bed">{t('settings.bedtime', { time: v.bedtime })}</p>
        <Remind lead={bed} pick={x => game.do({ do: 'remind', target: BEDTIME, lead: x })} />
        <!-- the re-entry nudge (D-113): off by default; only after three quiet days, at most once a week -->
        <div class="label-line nudge">{t('settings.nudge')}</div>
        <p class="soft note">{t('settings.nudge.say')}</p>
        <div class="seg" role="group" aria-label={t('settings.nudge')}>
          <button aria-pressed={nudge} onclick={() => game.do({ do: 'nudge', on: true })}>{t('settings.nudge.on')}</button>
          <button aria-pressed={!nudge} onclick={() => game.do({ do: 'nudge', on: false })}>{t('settings.nudge.off')}</button>
        </div>
      {/if}
      {#if game.alertsOff}<p class="soft note">{t('settings.reminders.refused')}</p>{/if}
    </section>

    <section>
      <div class="label-line">{t('settings.cal')}</div>
      <p class="soft note">{t('settings.cal.say')}</p>
      <div class="seg" role="group" aria-label={t('settings.cal')}>
        <button aria-pressed={cal.on} onclick={calOn}>{t('settings.cal.on')}</button>
        <button aria-pressed={!cal.on} onclick={() => game.do({ do: 'calendarShow', on: false, calendars: cal.calendars })}>{t('settings.cal.off')}</button>
      </div>
      {#if calRefused}<p class="soft note">{t('settings.cal.refused')}</p>{/if}
      {#if cal.on && cals.length}
        <div class="cals">
          {#each cals as c (c.id)}
            {@const shown = !cal.calendars || cal.calendars.includes(c.id)}
            <button class="cal" aria-pressed={shown} onclick={() => calToggle(c.id)}><span class="pip" class:done={shown}></span><span>{c.title}</span></button>
          {/each}
        </div>
      {/if}
    </section>

    <section>
      <div class="label-line">{t('settings.save')}</div>
      <p class="soft note">{t('settings.save.app')}</p>
      <button class="btn-quiet full" onclick={copy}><span>{t('settings.copy')}</span></button>
      {#if asking}
        <div class="ask" bind:this={askEl}>
          <p class="say">{ask(asking)}</p>
          <div class="btn-row"><button class="btn" onclick={restore}>{t('settings.restore.yes')}</button><button class="btn-quiet" onclick={() => (asking = null)}><span>{t('settings.restore.no')}</span></button></div>
        </div>
      {:else}
        <button class="btn-quiet full gap" onclick={pick}><span>{t('settings.restore')}</span></button>
      {/if}
      {#if said}<p class="say said" aria-live="polite">{said}</p>{/if}
    </section>

    <div class="links"><button class="text-link" onclick={() => go('proto')}><span>{t('settings.trialLink')}</span></button></div>
  </div>
</div>

<style>
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 28px; }
  h1 { margin-top: 4px; }
  section { margin-top: 10px; }
  .label-line { margin-top: 14px; }
  .note { text-align: left; margin: 6px 0 10px; font-size: calc(15px * var(--ts, 1)); }
  .seg { margin-top: 6px; }
  .nudge { margin-top: 16px; }
  .cals { margin-top: 8px; }
  /* its diamond and name where a job row has them: the marker centred in 20 px, the name 32 px in (spacing review S16) */
  .cal { display: flex; align-items: center; gap: 17px; width: 100%; min-height: 44px; background: none; border: 0; border-bottom: 1px solid var(--edge-2);
    color: var(--ink); font: inherit; font-size: calc(16px * var(--ts, 1)); text-align: left; padding: 0 0 0 5px; cursor: pointer; }
  .cal[aria-pressed='false'] span:last-child { color: var(--ink-3); }
  .bed { margin-top: 16px; color: var(--ink-2); }
  .full { width: 100%; }
  .gap { margin-top: 10px; }
  .ask { margin-top: 12px; border: 1px solid var(--edge-2); background: rgba(10,9,24,.7); padding: 12px 14px; }
  .ask .say { margin-bottom: 12px; }
  .said { margin-top: 10px; color: var(--ink-2); }
  .links { display: flex; justify-content: center; gap: 18px; margin-top: 22px; }
  button.home { color: var(--ink-2); }
</style>
