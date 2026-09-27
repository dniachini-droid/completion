<script lang="ts">
  /* Settings (D-107): reminders (the one switch, and bedtime's), the save's copies, and the trial's own controls below.
     Reached from the Daybook, out of the day's way. Changing anything here earns nothing and loses nothing. */
  import { game } from './game.svelte';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import Remind from './Remind.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { platform } from '../platform';
  import { BEDTIME, reminderOf, remindersOn } from '../core/reminders';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const on = $derived(remindersOn(game.facts));
  const bed = $derived(reminderOf(game.facts, BEDTIME));
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
      {/if}
      {#if !platform.notifier.locked}<p class="soft note">{t('settings.reminders.web')}</p>
      {:else if game.alertsOff}<p class="soft note">{t('settings.reminders.refused')}</p>{/if}
    </section>

    <div class="links"><button class="text-link" onclick={() => go('proto')}><span>{t('settings.trial')}</span></button></div>
  </div>
</div>

<style>
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 28px; }
  h1 { margin-top: 4px; }
  section { margin-top: 10px; }
  .label-line { margin-top: 14px; }
  .note { text-align: left; margin: 6px 0 10px; font-size: 15px; }
  .seg { margin-top: 6px; }
  .bed { margin-top: 16px; color: var(--ink-2); }
  .links { display: flex; justify-content: center; gap: 18px; margin-top: 22px; }
  button.home { color: var(--ink-2); }
</style>
