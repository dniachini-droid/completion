<script lang="ts">
  // Phase 8 trial screen, in the morning screen's shape (morning.html). Throwaway.
  import { t } from '../../content/copy';
  import { startDelve, delveEndsAt, type Delve } from '../../core/delve';
  import { platform } from '../../platform';
  import { bloom } from '../bloom';
  import Scene from '../layers/Scene.svelte';
  import { DELVE_ALERT_ID, saveDelve } from '../trial-state';

  let { onbegin }: { onbegin: (d: Delve) => void } = $props();

  const sizes = ['low', 'normal', 'high'] as const;
  let size = $state<(typeof sizes)[number]>('normal');
  const lengths = [1, 3, 25];
  let length = $state(1);
  let note = $state('');
  let busy = false;

  function pick<T>(set: (v: T) => void, v: T) { set(v); platform.haptics.tick(); }

  async function begin() {
    if (busy) return;
    busy = true;
    platform.haptics.tap();
    const d = startDelve(platform.now(), length);
    await saveDelve(d);
    const allowed = await platform.notifications.ensurePermission();
    if (allowed) {
      await platform.notifications.schedule(DELVE_ALERT_ID, new Date(delveEndsAt(d)), t('notify.delveEnd.title'), t('notify.delveEnd.body'));
    }
    busy = false;
    onbegin(d);
  }
</script>

<Scene src="./paint/hall-early.jpg" />
<div class="ui">
  <header class="top col">
    <div class="topbar rise"><span class="day">{t('trial.day')}</span><span></span><span></span></div>
    <h1 class="carve lg rise">{t('trial.place')}</h1>
    <div class="seg rise d1" role="group" aria-label={t('trial.size.label')}>
      {#each sizes as s}
        <button use:bloom aria-pressed={size === s} onclick={() => pick((v) => (size = v), s)}>{t(`trial.size.${s}`)}</button>
      {/each}
    </div>
    <p class="seg-note rise d1">{t('trial.size.note')}</p>
    <section class="ahead rise d2">
      <div class="label-line">{t('trial.ahead')}</div>
      <p class="say on-scene">{t('trial.ahead.say')}</p>
    </section>
  </header>
  <div class="mid"></div>
  <section class="bottom col rise d3">
    <div class="label-line lit">{t('trial.next')}</div>
    <h2 class="say-lg">{t('trial.next.job')}</h2>
    <p class="soft">{note || t('trial.next.soft')}</p>
    <div class="seg lengths" role="group" aria-label={t('trial.length.label')}>
      {#each lengths as n}
        <button use:bloom aria-pressed={length === n} onclick={() => pick((v) => (length = v), n)}>{t('trial.length.min', { n })}</button>
      {/each}
    </div>
    <button class="btn" use:bloom onclick={begin}>{t('trial.begin')}</button>
    <p class="build">{t('trial.build', { v: __BUILD__ })}</p>
  </section>
</div>

<style>
  .seg { margin-top: 12px; }
  .ahead { margin-top: 12px; }
  .ahead p { font-size: 17.5px; line-height: 1.38; margin-top: 6px; white-space: pre-line; }
  h2 { margin: 8px 0 4px; }
  .lengths { margin: 14px 0 18px; }
  .build { margin-top: 10px; text-align: center; font-family: var(--life); font-style: italic; font-size: 13px; color: var(--ink-3); opacity: .7; }
</style>
