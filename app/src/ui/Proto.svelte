<script lang="ts">
  /* The prototype's own controls: temporary, recorded in PROTOTYPE_NOTES.md, gone when the prototype ends. */
  import { game } from './game.svelte';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';
  import { platform } from '../platform';

  /* the phone's own reading of each time the app went to the background during a delve (D-094's test on TestFlight) */
  let leaves = $state<Awaited<ReturnType<typeof platform.away.log>>>([]);
  if (platform.app) void platform.away.log().then(l => (leaves = l));
  const how = { locked: t('proto.leave.locked'), left: t('proto.leave.left'), unsure: t('proto.leave.unsure') };
  const hhmm = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let { go }: { go: Go } = $props();
  let confirm = $state(false);
  function wipe() { if (!confirm) { confirm = true; return; } game.reset(); confirm = false; go('today'); }
  function rehearse(on: boolean) { game.setRehearsal(on); go('today'); }
</script>

<Scene painting={game.view.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    <div class="label-line">{t('proto.label')}</div>
    <h1 class="say-lg">{t('proto.title')}</h1>
    <p class="soft">{t('proto.about')}</p>
  </header>
  <div class="mid"></div>
  <section class="bottom col stack">
    <p class="say">{game.proto.rehearsal ? t('proto.rehearsal.on') : t('proto.rehearsal.off')}</p>
    <button class="btn-quiet full" onclick={() => rehearse(!game.proto.rehearsal)}>
      <span>{game.proto.rehearsal ? t('proto.rehearsal.stop') : t('proto.rehearsal.start')}</span>
    </button>
    <button class="btn-quiet full" onclick={wipe}><span>{confirm ? t('proto.reset.confirm') : t('proto.reset')}</span></button>
    {#if platform.app}
      <div class="label-line">{t('proto.leave.title')}</div>
      <p class="soft">{t('proto.leave.about')}</p>
      <ul class="leaves">
        {#each leaves as l}<li><span class="at">{hhmm(l.at)}</span> {how[l.how]}{l.signs.length ? ` (${l.signs.join(', ')})` : ''}</li>
        {:else}<li>{t('proto.leave.none')}</li>{/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  h1 { margin: 10px 0 8px; }
  .label-line { margin-top: 18px; }
  .say { color: var(--ink-2); }
  button.home { color: var(--ink-2); }
  .leaves { list-style: none; margin: 0; padding: 0; font-size: 14px; color: var(--ink-2); }
  .leaves li { padding: 3px 0; }
  .leaves .at { color: var(--ink-3); font-variant-numeric: tabular-nums; }
</style>
