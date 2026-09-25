<script lang="ts">
  /* The prototype's own controls: temporary, recorded in PROTOTYPE_NOTES.md, gone when the prototype ends. */
  import { game } from './game.svelte';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';

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
  </section>
</div>

<style>
  h1 { margin: 10px 0 8px; }
  .label-line { margin-top: 18px; }
  .say { color: var(--ink-2); }
  button.home { color: var(--ink-2); }
</style>
