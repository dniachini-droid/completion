<script lang="ts">
  /* The bedtime, as the phone's own time box: a tap opens its wheel, and what it's set to is kept. On Today in the
     evening (D-093) and in Settings at any hour (D-130). */
  import { game } from './game.svelte';
  import { t } from '../content/copy/en';

  let { say = t('today.bedtime') }: { say?: string } = $props();
  const bedtime = $derived(game.whole.bedtime);
  function set(time: string) { if (time && time !== bedtime) game.do({ do: 'bedtime', time }); }
  function pick(e: MouseEvent) { try { (e.currentTarget as HTMLInputElement).showPicker?.(); } catch { /* not every browser */ } }
</script>

<label class="bed">
  <span class="bed-say">{say}</span><span class="bed-time carve">{bedtime}</span><span class="change">{t('camp.change')}</span>
  <input type="time" step="900" value={bedtime} aria-label={t('camp.bedtime')} onclick={pick} onchange={e => set(e.currentTarget.value)} />
</label>

<style>
  .bed { position: relative; display: flex; align-items: baseline; gap: 12px; margin-top: 8px; cursor: pointer; width: fit-content; min-height: 44px; }
  .bed input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; border: 0; padding: 0; margin: 0; cursor: pointer; -webkit-appearance: none; appearance: none; }
  .bed-say { font-family: var(--life); font-size: calc(18px * var(--ts, 1)); color: var(--ink-2); }
  .bed-time { font-size: calc(28px * var(--ts, 1)); letter-spacing: .06em; color: #fff; }
  .change { font-family: var(--life); font-style: italic; font-size: calc(16px * var(--ts, 1)); color: var(--ink-2); border-bottom: 1px solid var(--edge-3); }
</style>
