<script lang="ts">
  /* The job menu (D-131, step 3): the phone's own long-press menu, in the app's look. The job's name, then Delve · Edit ·
     Put on a day · Delete. Put on a day shows the one calendar here; Delete goes at once, with Undo on the screen
     underneath (D-125), and looks like no other choice. A tap outside closes it. */
  import { game } from './game.svelte';
  import { t } from '../content/copy/en';
  import { menu, closeMenu, settling, openTick } from './menu.svelte';
  import { closeRows } from './SwipeRow.svelte';
  import { steady } from './taps';
  import DayPick from './DayPick.svelte';

  const j = $derived(menu.job ? game.job(menu.job) : undefined);
  const v = $derived(game.view);
  let placing = $state(false);
  $effect(() => { void menu.job; placing = false; });

  function to(f: () => void) { if (settling()) return; const go = menu.go; steady(); closeMenu(); closeRows(); if (go) f(); }
  function delve() { const id = j!.id, go = menu.go!; to(() => go('set', id)); }
  /* done without a delve: ticked off with the time it took (D-134) */
  function tick() { const id = j!.id, go = menu.go!; to(() => openTick(id, go)); }
  /* "I can't start": the first small step, for any job not done (it lived on Today's next job, D-135) */
  function cant() { const id = j!.id, go = menu.go!; to(() => go('cant', id)); }
  function edit() { const id = j!.id, go = menu.go!; to(() => go('rhythms', id)); }
  function place(day: string) {
    const id = j!.id;
    steady(); game.do({ do: 'putOnDay', job: id, day, ...(menu.entry ? { entry: menu.entry } : {}) });
    closeMenu(); closeRows();
  }
  function remove() {
    if (settling()) return;
    const id = j!.id, on = menu.on;
    steady(); closeMenu(); closeRows();
    /* a done row held: only that day's record of a recurring job goes (its minutes stay); otherwise the job (D-125) */
    if (on) game.removeDone(id, on); else game.remove(id);
  }
  const recurring = $derived(!!j && v.content.rhythms.some(r => r.job === j.id));
  /* a one-off done is finished: no more delving on it, and no day to put it on; a recurring job can always be delved again */
  const finished = $derived(!!j && !recurring && (v.done.has(j.id) || !!menu.on));
  function key(e: KeyboardEvent) { if (e.key === 'Escape') closeMenu(); }
</script>

<svelte:window onkeydown={key} />
{#if j}
  <div class="scrim" role="presentation" onclick={() => { if (!settling()) closeMenu(); }}></div>
  <div class="menu" role="dialog" aria-modal="true" aria-label={j.name}>
    <p class="name">{j.name}</p>
    <button class="item" disabled={!!v.run || finished} onclick={delve}>{t('menu.delve')}</button>
    {#if !v.done.has(j.id) && !finished}<button class="item" disabled={!!v.run} onclick={tick}>{t('tick.off')}</button>{/if}
    {#if !v.done.has(j.id) && !finished}<button class="item" disabled={!!v.run} onclick={cant}>{t('today.cantStart')}</button>{/if}
    <button class="item" onclick={edit}>{t('menu.edit')}</button>
    {#if !finished && !menu.on}<button class="item" aria-expanded={placing} onclick={() => { if (!settling()) placing = !placing; }}>{t('satchel.day')}</button>{/if}
    {#if placing}<div class="cal"><DayPick from={v.day} label={t('satchel.day')} pick={place} /></div>{/if}
    <button class="item del" disabled={v.run?.job.id === j.id || v.runEnd?.job.id === j.id} onclick={remove}>{t('job.delete')}</button>
    <button class="item cancel" onclick={() => { if (!settling()) closeMenu(); }}>{t('rhythms.cancel')}</button>
  </div>
{/if}

<style>
  .scrim { position: absolute; inset: 0; z-index: 30; background: rgba(4, 4, 12, .55); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
  .menu { position: absolute; z-index: 31; left: 16px; right: 16px; bottom: calc(var(--safe-b, 0px) + 16px); max-height: calc(100% - 80px); overflow-y: auto;
    background: rgba(18, 16, 38, .96); border: 1px solid var(--edge-2); padding: 6px 0; animation: up .18s ease-out; }
  @keyframes up { from { transform: translateY(12px); opacity: 0; } }
  .name { margin: 8px 18px 6px; font-family: var(--life); font-size: 15px; font-style: italic; color: var(--ink-2); text-align: center; overflow-wrap: anywhere; }
  .item { display: block; width: 100%; min-height: 48px; padding: 0 18px; text-align: center; font-family: var(--life); font-size: 18px; color: var(--ink);
    border-top: 1px solid var(--edge-4); }
  .item:disabled { color: var(--ink-3); }
  /* Delete never looks like every other choice (D-131) */
  .item.del { color: #f0a0b0; }
  .item.del:disabled { color: var(--ink-3); }
  .item.cancel { color: var(--ink-2); font-style: italic; }
  .cal { padding: 0 12px 8px; }
</style>
