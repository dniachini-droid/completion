<script lang="ts">
  /* Choose a delve (D-077): any job can be a delve (D-041), chosen by Dan, at any time of the day and after its work is
     done. Today's list first, then his other jobs, then something new named here (every job is a delve, D-117). Choosing
     earns nothing by itself; only the delve does (P5). */
  import { game } from './game.svelte';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';

  let { go }: { go: Go } = $props();
  const v = $derived(game.view);
  const todays = $derived(v.slate.filter(id => !v.done.has(id)));
  /* the rest of Dan's jobs, those not done today first (more on a done job still counts, D-043) */
  /* a one-off finished on an earlier day isn't offered again (D-117) */
  const finished = $derived(new Set(game.facts.filter(f => f.type === 'jobDone' && f.day !== v.day).map(f => (f as { job: string }).job)));
  const others = $derived(v.content.jobs.filter(j => !j.stopped && !todays.includes(j.id)
    && !(finished.has(j.id) && !v.content.rhythms.some(r => r.job === j.id)))
    .sort((a, b) => Number(v.done.has(a.id)) - Number(v.done.has(b.id))));
  let name = $state('');

  function note(id: string): string {
    if (v.done.has(id)) return t('row.done');
    return '';
  }
  function pick(id: string) { go('set', id); }
  function fresh() {
    const line = name.trim();
    if (!line) return;
    const f = game.do({ do: 'addItems', lines: [line] });
    const added = f.find(x => x.type === 'itemAdded');
    if (added && added.type === 'itemAdded') go('set', added.id);
  }
</script>

<Scene painting={v.here.painting} blur />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    <h1 class="carve lg rise">{t('choose.label')}</h1>
    <p class="soft say-note rise">{t('choose.say')}</p>
  </header>

  <div class="body col rise d1">
    {#if todays.length}
      <div class="label-line lit">{t('choose.today')}</div>
      <div class="rows">
        {#each todays as id (id)}
          <button class="row" onclick={() => pick(id)}><span class="pip"></span><span class="t">{game.job(id)?.name}</span><span class="s"></span></button>
        {/each}
      </div>
    {/if}
    {#if others.length}
      <div class="label-line">{todays.length ? t('choose.other') : t('choose.all')}</div>
      <div class="rows">
        {#each others as j (j.id)}
          <button class="row" class:done={v.done.has(j.id)} onclick={() => pick(j.id)}><span class="pip" class:done={v.done.has(j.id)}></span><span class="t">{j.name}</span><span class="s">{note(j.id)}</span></button>
        {/each}
      </div>
    {/if}
    <div class="label-line">{t('choose.new')}</div>
    <form class="new" onsubmit={(e) => { e.preventDefault(); fresh(); }}>
      <input bind:value={name} aria-label={t('choose.new')} placeholder={t('choose.new.hint')} maxlength="120" enterkeyhint="go" />
      <button class="btn-quiet" type="submit" disabled={!name.trim()}><span>{t('choose.new.go')}</span></button>
    </form>
  </div>
</div>

<style>
  .body { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: 28px; }
  h1 { margin-top: 4px; }
  .say-note { margin-top: 4px; text-align: left; }
  .label-line { margin-top: 18px; margin-bottom: 4px; }
  button.row { width: 100%; text-align: left; }
  .new { display: flex; gap: 10px; margin-top: 8px; }
  .new input { flex: 1; min-width: 0; min-height: 44px; padding: 0 12px; font: inherit; font-size: 17px; color: #fff;
    background: rgba(255, 255, 255, .06); border: 1px solid var(--edge-2); border-radius: 0; }
  .new .btn-quiet { padding: 0 14px; }
  .new .btn-quiet:disabled { opacity: .5; }
  button.home { color: var(--ink-2); }
</style>
