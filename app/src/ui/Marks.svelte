<script lang="ts">
  /* The marks (SCRIPT §9; the cell and read-out of mock-up record.html): every mark Dan has met, in the Cut's own
     lettering, each with what it reads as now: known, his guess with a question mark, new (guess it here), seen but not
     known, a name, or only part of it. A struck guess is one line. Guessing is never "wrong" here; the place confirms. */
  import { game, content } from './game.svelte';
  import { marksSeen, mayGuess, markOf } from '../core/story';
  import { t, type CopyKey, partWords } from '../content/copy/en';
  import Glyph from './Glyph.svelte';
  import type { Go } from './nav';
  import { back } from './back.svelte';

  let { go, id }: { go: Go; id?: string } = $props();
  const v = $derived(game.whole);
  const s = content.story;
  const list = $derived(marksSeen(s, v.story));
  /* what Dan can read or guess first; the marks only seen so far (their shapes) smaller, below */
  const known = $derived(list.filter(x => x.state !== 'seen'));
  const unknown = $derived(list.filter(x => x.state === 'seen'));
  /* the newest open mark is selected first: that is the one worth looking at */
  let sel = $state<string | null>(id ?? null);
  /* the page opens with nothing chosen: a place to look, not a quiz; a mark opens when tapped (Dan left it to Claude, D-082) */
  const current = $derived(list.find(x => x.id === sel) ?? null);
  let changing = $state(false);
  const m = $derived(current ? markOf(s, current.id) : undefined);
  const canGuess = $derived(!!current && mayGuess(s, v.story, current.id));
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

  function caption(x: (typeof list)[number]): { text: string; q: boolean; cls: string } {
    if (x.state === 'held') return { text: x.held!.word, q: false, cls: 'known' };
    if (x.state === 'guess') return { text: x.held!.word, q: true, cls: 'guess' };
    if (x.state === 'open') return { text: t('marks.new'), q: false, cls: 'new' };
    if (x.state === 'name') return { text: x.id === 'mk-ring' ? t('marks.aName') : '—', q: false, cls: 'name' };
    return { text: '—', q: false, cls: 'unk' };
  }
  function pick(x: string) { sel = x; changing = false; }
  function guess(g: string) { if (!current) return; game.do({ do: 'guess', mark: current.id, guess: g }); changing = false; }
  /* candidates, shuffled once per mark (the same order as where it was offered) */
  const options = $derived.by(() => {
    const c = [...(m?.candidates ?? [])], key = m?.id ?? '';
    let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    for (let i = c.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [c[i], c[j]] = [c[j], c[i]]; }
    return c;
  });
</script>

<!-- the painting behind is drawn once by App, shared by both tabs (D-093) -->
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('back')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{back.label}</span></button>
      <span></span><span></span>
    </div>
    <!-- the two tabs on a row of their own, two equal halves (spacing review, Dan's decision C4) -->
    <div class="seg lv tabs rise" role="group" aria-label={t('marks.label')}>
      <button aria-pressed="false" onclick={() => go('records')}>{t('records.nav')}</button>
      <button aria-pressed="true">{t('marks.nav')}</button>
    </div>
    <div class="label-line rise">{t('marks.label')}</div>
    <h1 class="carve lg rise">{t('marks.title')}</h1>
  </header>

  <div class="body col rise d1">
    {#if !list.length}
      <p class="soft">{t('marks.none')}</p>
    {:else}
      <div class="grid">
        {#each known as x (x.id)}
          {@const c = caption(x)}
          <button class="cell" class:sel={current?.id === x.id} aria-pressed={current?.id === x.id} onclick={() => pick(x.id)}>
            <span class="gw">
              {#if x.state === 'part'}<Glyph part={x.part ?? ''} size={46} dim />
              {:else}<Glyph mark={x.id} size={46} lit={x.state === 'held'} dim={x.state === 'seen'} />{/if}
            </span>
            <span class="cap {c.cls}">{c.text}{#if c.q}<span class="q">?</span>{/if}</span>
          </button>
        {/each}
      </div>
      {#if unknown.length}
        <div class="label-line sub">{t('marks.unknown')}</div>
        <div class="grid small">
          {#each unknown as x, i (x.id)}
            <!-- each its own name, so VoiceOver can tell one from another (deep review A#36) -->
            <button class="cell" class:sel={current?.id === x.id} aria-pressed={current?.id === x.id} aria-label={t('marks.unknownN', { n: i + 1, count: unknown.length })} onclick={() => pick(x.id)}>
              <span class="gw"><Glyph mark={x.id} size={30} dim /></span>
            </button>
          {/each}
        </div>
      {/if}
    {/if}
  </div>

  {#if list.length}
  <div class="foot col">
      {#if current && m}
        {#key current.id + String(v.story.guessed.get(current.id))}
        <section class="readout">
          <div class="label-line lit">{t('marks.this')}</div>
          {#if current.struck}
            <p class="know">{@html t('marks.struck', { word: `<s>${current.held?.guess ?? ''}</s>` })}</p>
            <p class="know">{current.struck}</p>
          {/if}
          {#if current.state === 'held'}
            <p class="know">{@html t('marks.held', { word: `<em>${current.held!.word}</em>` })}</p>
          {:else if current.state === 'guess' && !changing}
            <p class="know">{@html t('marks.guess', { word: `<em>${current.held!.word}</em>` })}</p>
            {#if canGuess}
              <div class="choices"><button class="btn-quiet" onclick={() => (changing = true)}><span>{t('marks.change')}</span></button></div>
            {/if}
          {:else if (current.state === 'open' || changing) && canGuess}
            {#if m.context}<p class="soft ctx">{cap(m.context)}.</p>{/if}
            <p class="know">{changing ? t('marks.else') : t('marks.open')}</p>
            <div class="choices">
              {#each options as o}
                <button class="btn-quiet" aria-pressed={v.story.guessed.get(m.id) === o} onclick={() => guess(o)}><span>{o}</span></button>
              {/each}
            </div>
          {:else if current.state === 'name'}
            <p class="know">{current.id === 'mk-ring' ? t('marks.ring') : cap(m.shape) + '.'}</p>
          {:else if current.state === 'part'}
            <p class="know">{t('marks.part', { part: partWords(current.part ?? '') })}</p>
          {:else}
            <p class="know">{cap(m.shape)}. {t('marks.seen')}</p>
          {/if}
        </section>
        {/key}
      {:else}
        <p class="soft hint">{t('records.tapMark')}</p>
      {/if}
  </div>
  {/if}
</div>

<style>
  /* the marks take only their own height, so on a tall phone the read-out follows them rather than floating at the foot;
     never squeezed below a row and a half, whatever the read-out holds. Both edges fade (the top as base.css's list) */
  .body { flex: 0 1 auto; min-height: 120px; overflow-y: auto; padding-top: 12px; padding-bottom: 16px;
    -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 28px), transparent);
            mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 28px), transparent); }
  /* the read-out stays put under the marks, whatever is scrolled; clear of the faded last row, and it scrolls itself
     rather than hiding the marks at large text (spacing review) */
  .foot { flex: none; padding-top: 16px; padding-bottom: max(18px, env(safe-area-inset-bottom)); min-height: 150px; max-height: 55%; overflow-y: auto; scrollbar-width: none; }
  .foot::-webkit-scrollbar { display: none; }
  .sub { margin: 18px 0 6px; }
  .grid.small { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .grid.small .cell { grid-template-rows: 40px; }
  .grid.small .gw { width: 40px; height: 40px; }
  .grid.small .cell::before { width: 46px; margin-left: -23px; height: 46px; }
  h1 { margin-top: 8px; }
  .tabs { margin: 4px 0 16px; grid-template-columns: 1fr 1fr; }
  .tabs button { padding: 6px 12px; font-size: calc(14px * var(--ts, 1)); }
  button.home { color: var(--ink-2); }
  /* every glyph in the same square, every label on one line beneath (as the record's strip) */
  .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); row-gap: 6px; margin: 0 calc(var(--gutter) * -.4); }
  .cell { position: relative; display: grid; grid-template-rows: 52px 24px; justify-items: center; align-items: center; row-gap: 6px; padding: 6px 0 2px; color: #eceaff; }
  .gw { position: relative; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; }
  .cap { font-family: var(--life); font-style: italic; font-size: calc(15.5px * var(--ts, 1)); line-height: 24px; height: 24px; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
    color: var(--ink-2); white-space: nowrap; text-shadow: 0 1px 8px rgba(6,5,16,.9); }
  .cap .q { color: var(--cold-hi); }
  .cap.unk { color: var(--ink-3); }
  /* "new" is a state, not a meaning: set as a small carved label, never in the italic that meanings read in */
  .cap.new { font-family: var(--carve); font-style: normal; font-weight: 600; font-size: calc(14px * var(--ts, 1)); letter-spacing: .14em; padding-left: .14em;
    text-transform: uppercase; color: var(--violet-hi); }
  .cap.known { color: #fff; }
  .cell.sel .cap { color: #fff; }
  .cell::before { content: ""; position: absolute; left: 50%; width: 60px; margin-left: -30px; top: 2px; height: 60px; pointer-events: none; opacity: 0;
    --tc: var(--violet-hi); --tl: 8px; transform: scale(1.12); transition: opacity .3s var(--ease), transform .35s var(--ease);
    background:
      linear-gradient(var(--tc), var(--tc)) left top/var(--tl) 1px no-repeat, linear-gradient(var(--tc), var(--tc)) left top/1px var(--tl) no-repeat,
      linear-gradient(var(--tc), var(--tc)) right top/var(--tl) 1px no-repeat, linear-gradient(var(--tc), var(--tc)) right top/1px var(--tl) no-repeat,
      linear-gradient(var(--tc), var(--tc)) left bottom/var(--tl) 1px no-repeat, linear-gradient(var(--tc), var(--tc)) left bottom/1px var(--tl) no-repeat,
      linear-gradient(var(--tc), var(--tc)) right bottom/var(--tl) 1px no-repeat, linear-gradient(var(--tc), var(--tc)) right bottom/1px var(--tl) no-repeat;
    filter: drop-shadow(0 0 4px rgba(var(--violet-rgb), .9)); }
  .cell.sel::before { opacity: 1; transform: none; }
  .cell.sel .gw::after { content: ""; position: absolute; inset: -30%; border-radius: 50%; z-index: -1; pointer-events: none;
    background: radial-gradient(closest-side, rgba(var(--violet-rgb), .4), transparent); }
  .readout { margin-top: 4px; animation: rise .8s var(--ease) both; }
  .readout .label-line { margin-bottom: 10px; }
  .know { font-family: var(--life); font-size: calc(18px * var(--ts, 1)); line-height: 1.45; color: var(--ink); margin: 0 0 8px; }
  .know :global(em) { color: #fff; }
  .know :global(s) { color: var(--ink-3); }
  .ctx { margin: 0 0 6px; }
  .choices { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap); margin-top: 10px; }
  .choices .btn-quiet { justify-content: center; min-height: var(--ctl-h); }
  .choices .btn-quiet[aria-pressed="true"] { border-color: var(--edge-2); color: #fff; }
  .hint { text-align: center; margin: 8px 0 16px; }
</style>
