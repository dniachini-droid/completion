<script lang="ts">
  /* The job menu (D-131, step 3): the phone's own long-press menu, in the app's look. The job's name, then Delve · Edit ·
     Put on a day · Delete. Put on a day shows the one calendar here; Delete goes at once, with Undo on the screen
     underneath (D-125), and looks like no other choice. A tap outside closes it. */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import { menu, closeMenu, settling, openTick, sayWaited } from './menu.svelte';
  import { closeRows } from './SwipeRow.svelte';
  import { steady } from './taps';
  import { modal } from './modal';
  import DayPick from './DayPick.svelte';
  import WaitPick from './WaitPick.svelte';
  import { waitingOf } from '../core/week';
  import { errandChoices } from '../core/game';

  const j = $derived(menu.job ? game.job(menu.job) : undefined);
  const v = $derived(game.whole);
  let placing = $state(false), waiting = $state(false);
  $effect(() => { void menu.job; placing = false; waiting = false; });

  function to(f: () => void) { if (settling()) return; const go = menu.go; steady(); closeMenu(); closeRows(); if (go) f(); }
  function delve() { const id = j!.id, go = menu.go!; to(() => go('set', id)); }
  /* done without a delve: ticked off with the time it took (D-134) */
  function tick() { const id = j!.id, go = menu.go!; to(() => openTick(id, go)); }
  /* "I can't start": the first small step, for any job not done (it lived on Today's next job, D-135) */
  function cant() { const id = j!.id, go = menu.go!; to(() => go('cant', id)); }
  /* the errand run, off Today's main screen, is here for an errand and in the Satchel (MORNING-REPORT, simplify) */
  const errandable = $derived(!!j && !v.run && !v.night && (() => { const ids = errandChoices(content, game.facts, game.minute); return ids.length >= 2 && ids.includes(j.id); })());
  /* "Just this one today" (MORNING-REPORT Part 3 #7): on a low day, every other job today set aside at once, one Undo */
  const justOne = $derived(!!j && menu.from === 'today' && !v.run && v.order.includes(j.id) && !v.done.has(j.id)
    && v.order.some(id => id !== j.id && !v.done.has(id)));
  function justThis() { if (settling()) return; const id = j!.id; steady(); closeMenu(); closeRows(); game.justThis(id); }
  function errands() { const go = menu.go!; to(() => go('errands')); }
  function edit() { const id = j!.id, go = menu.go!; to(() => go('rhythms', id)); }
  /* a job done today, to do again (D-131): in the menu too, so a tap on a done row finds it (J11) */
  function notDone() { if (settling()) return; const id = j!.id; steady(); closeMenu(); closeRows(); game.do({ do: 'notDone', job: id }); }
  function place(day: string) {
    const id = j!.id;
    steady(); game.do({ do: 'putOnDay', job: id, day, ...(menu.entry ? { entry: menu.entry } : {}) });
    closeMenu(); closeRows();
  }
  /* "Waiting on…" (D-137): off the lists until its day; "Back to it" an ordinary job again */
  const wait = $derived(j ? waitingOf(game.facts).get(j.id) : undefined);
  function waitOn(until: string, who: string) {
    const id = j!.id, from = menu.from, onToday = v.slate.includes(id) || v.replies.some(r => r.job === id);
    steady(); game.do({ do: 'waitOn', job: id, until, who });
    closeMenu(); closeRows();
    /* said only where Dan is, Today or the Satchel; never from the Week (review of D-137) */
    if (from && waitingOf(game.facts).get(id)?.until === until) sayWaited(id, until, from === 'today' && onToday);
  }
  function backToIt() { if (settling()) return; const id = j!.id; steady(); closeMenu(); closeRows(); game.do({ do: 'backToIt', job: id }); sayWaited(null); }
  function remove() {
    if (settling()) return;
    const id = j!.id, on = menu.on;
    steady(); closeMenu(); closeRows();
    /* a done row held: only that day's record of a recurring job goes (its minutes stay); otherwise the job (D-125) */
    if (on) game.removeDone(id, on); else game.remove(id);
  }
  const recurring = $derived(!!j && v.content.rhythms.some(r => r.job === j.id));
  /* Delete on a recurring job asks once: it takes all its days, not this one (deep review H#9); Undo stays */
  let confirming = $state(false);
  $effect(() => { void menu.job; confirming = menu.ask; });
  function del() { if (settling()) return; if (recurring && !menu.on && !confirming) { confirming = true; return; } remove(); }
  /* why some choices are greyed (deep review H#10): an errand of the run under way, a question still to answer, a delve on */
  const why = $derived(!j ? '' : v.run?.errands?.some(e => e.job.id === j.id) ? t('menu.why.errand')
    : v.runEnd?.pending ? t('menu.why.count') : v.run ? t('menu.why.delve') : '');
  function count() { const go = menu.go; to(() => go?.('delve')); }
  /* a one-off done is finished: no more delving on it, and no day to put it on; a recurring job can always be delved again */
  const finished = $derived(!!j && !recurring && (v.done.has(j.id) || !!menu.on));
  function key(e: KeyboardEvent) { if (e.key === 'Escape') closeMenu(); }
</script>

<svelte:window onkeydown={key} />
{#if j}
  <div class="scrim" role="presentation" onclick={() => { if (!settling()) closeMenu(); }}></div>
  <div class="menu" role="dialog" aria-modal="true" aria-label={j.name} use:modal>
    <p class="name">{j.name}</p>
    {#if why}<p class="why">{why}</p>{/if}
    <!-- a calendar open takes the menu's place, Cancel always in view under it (360 × 780, N polish) -->
    {#if placing}<div class="cal"><DayPick from={v.day} label={t('satchel.day')} pick={place} /></div>
    {:else if waiting}<div class="cal"><WaitPick day={v.day} who={wait?.who ?? ''} name={j.name} pick={waitOn} /></div>
    {:else if confirming}
    <p class="ask">{t('menu.delAsk', { job: j.name })}</p>
    <button class="item del" onclick={del}>{t('job.delete')}</button>
    <button class="item" onclick={() => { if (menu.ask) { closeMenu(); closeRows(); } else confirming = false; }}>{t('menu.keep')}</button>
    {:else if v.runEnd?.pending}
    <!-- the errand question waiting: the way to it is here, so no menu ever stands over "Strike them off" (H#10) -->
    <button class="item" onclick={count}>{t('errand.waitsGo')}</button>
    {:else}
    <button class="item" disabled={!!v.run || !!v.runEnd?.pending || finished} onclick={delve}>{v.done.has(j.id) && recurring ? t('menu.delveAgain') : t('menu.delve')}</button>
    {#if menu.on === v.day && v.done.has(j.id)}<button class="item" onclick={notDone}>{t('row.notDone')}</button>{/if}
    {#if !v.done.has(j.id) && !finished}<button class="item" disabled={!!v.run || !!v.runEnd?.pending} onclick={tick}>{t('tick.off')}</button>{/if}
    {#if justOne}<button class="item" onclick={justThis}>{t('menu.justThis')}</button>{/if}
    {#if errandable}<button class="item" onclick={errands}>{t('errand.link')}</button>{/if}
    {#if !v.done.has(j.id) && !finished}<button class="item" disabled={!!v.run || !!v.runEnd?.pending} onclick={cant}>{t('today.cantStart')}</button>{/if}
    <button class="item" onclick={edit}>{t('menu.edit')}</button>
    {#if !finished && !menu.on}<button class="item" aria-expanded={placing} onclick={() => { if (!settling()) { placing = !placing; waiting = false; } }}>{t('satchel.day')}</button>{/if}
    <!-- only a one-off still to do can wait on a reply; a recurring job simply comes again (D-137) -->
    {#if !recurring && !finished && !v.done.has(j.id)}
      {#if wait}<button class="item" onclick={backToIt}>{t('wait.back')}</button>{/if}
      <button class="item" aria-expanded={waiting} disabled={v.run?.job.id === j.id || v.runEnd?.job.id === j.id || !!v.run?.errands?.some(e => e.job.id === j.id) || !!v.runEnd?.errands?.some(e => e.job.id === j.id)} onclick={() => { if (!settling()) { waiting = !waiting; placing = false; } }}>{wait ? t('wait.still') : t('wait.menu')}</button>
    {/if}
    <button class="item del" disabled={v.run?.job.id === j.id || v.runEnd?.job.id === j.id || !!v.run?.errands?.some(e => e.job.id === j.id) || !!v.runEnd?.errands?.some(e => e.job.id === j.id)} onclick={del}>{t('job.delete')}</button>
    {/if}
    <button class="item cancel" onclick={() => { if (!settling()) closeMenu(); }}>{t('rhythms.cancel')}</button>
  </div>
{/if}

<style>
  .scrim { position: absolute; inset: 0; z-index: 30; background: rgba(4, 4, 12, .55); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
  /* on the column's edges, like everything else on the screen (spacing review S15) */
  .menu { position: absolute; z-index: 31; left: max(var(--gutter), calc((100% - var(--col)) / 2 + var(--gutter))); right: max(var(--gutter), calc((100% - var(--col)) / 2 + var(--gutter))); bottom: calc(var(--safe-b, 0px) + 16px); max-height: calc(100% - 80px); overflow-y: auto;
    background: rgba(18, 16, 38, .96); border: 1px solid var(--edge-2); padding: 6px 0; animation: up .18s ease-out; }
  @keyframes up { from { transform: translateY(12px); opacity: 0; } }
  .name { margin: 6px 18px 12px; font-family: var(--life); font-size: calc(15px * var(--ts, 1)); font-style: italic; color: var(--ink-2); text-align: center; overflow-wrap: anywhere; }
  .item { display: block; width: 100%; min-height: 48px; padding: 0 18px; text-align: center; font-family: var(--life); font-size: calc(18px * var(--ts, 1)); color: var(--ink);
    border-top: 1px solid var(--edge-4); }
  .item:disabled { color: var(--ink-3); }
  /* Delete never looks like every other choice (D-131) */
  .item.del { color: #f0a0b0; }
  .item.del:disabled { color: var(--ink-3); }
  .item.cancel { color: var(--ink-2); font-style: italic; }
  .cal { padding: 0 12px 8px; }
  .why, .ask { margin: 0 18px 8px; font-family: var(--life); font-size: calc(15px * var(--ts, 1)); font-style: italic; color: var(--ink-2); text-align: center; }
  .ask { color: var(--ink); font-size: calc(16.5px * var(--ts, 1)); }
</style>
