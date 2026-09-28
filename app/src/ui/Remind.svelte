<script lang="ts">
  /* "Remind me" (D-107): where a time is set, one small choice, off by default. A tap saves it at once (nothing to Save),
     unless the screen holds it until its own Save (`pick`). */
  import { t } from '../content/copy/en';
  import { LEADS, type Lead } from '../core/reminders';

  let { lead, pick }: { lead: Lead | null; pick: (x: Lead | null) => void } = $props();
</script>

<div class="label-line">{t('remind.label')}</div>
<div class="seg remind" role="group" aria-label={t('remind.label')}>
  <button aria-pressed={lead === null} onclick={() => pick(null)}>{t('remind.off')}</button>
  {#each LEADS as x (x)}<button aria-pressed={lead === x} onclick={() => pick(x)}>{t(`remind.at.${x}`)}</button>{/each}
</div>

<style>
  .label-line { margin-top: 12px; }
  .seg { margin-top: 6px; }
  /* four choices on one line, even on a small phone */
  .remind button { letter-spacing: .04em; padding-left: 2px; padding-right: 2px; font-size: 13px; white-space: normal; line-height: 1.15; }
</style>
