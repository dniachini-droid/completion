<script lang="ts">
  import Prose from './Prose.svelte';
  /* Day complete and the arrival (INTERACTION_NOTES → day complete; mock-up complete.html). Violet turns to gold
     from the floor up; "That's the day. Enough." The day's success is locked in; rest is the main offer, and a quiet
     "Keep going" is always there (D-038, D-039). A tap anywhere settles the motion at once. */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import Scene from './Scene.svelte';
  import Guess from './Guess.svelte';
  import Settled from './Settled.svelte';
  import Reread from './Reread.svelte';
  import Cut from './Cut.svelte';
  import Words from './Words.svelte';
  import Look from './Look.svelte';
  import { beatOf, marksIn, mayGuess, markHeld, markOf } from '../core/story';
  import { arrivalAt } from '../core/game';
  import { back } from './back.svelte';
  import { leaveWord, moment } from './moment.svelte';
  import { backTo } from './nav';
  import type { Go } from './nav';

  /* `seq`: a place reached before, opened from the Map to read again (its arg is "again:<seq>", never the plain seq a
     second new arrival is shown with, D-135); a new arrival waiting always comes first */
  let { go, seq = null }: { go: Go; seq?: number | null } = $props();
  const v = $derived(game.whole);
  /* a word left for later never stands in for a place read again: the place's name reads the place (deep review B8) */
  const leftLater = (x: { seq: number } | null) => !!x && x.seq === moment.wordLater;
  const again = $derived((!v.arrival || leftLater(v.arrival)) && seq !== null ? arrivalAt(game.facts, content, seq) : null);
  const a = $derived(again ?? (leftLater(v.arrival) && seq !== null ? null : v.arrival) ?? v.lastArrival);
  const fresh = !!game.whole.arrival && !(seq !== null && leftLater(game.whole.arrival));
  let root: HTMLDivElement;

  $effect(() => { if (!a) go('today'); });

  function settleNow(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    root.getAnimations({ subtree: true }).forEach(x => { try { x.finish(); } catch { /* endless */ } });
  }
  /* a word is cut on its own screen, the first time it plays (Cut.svelte) */
  const word = fresh && !!game.whole.arrival && beatOf(content.story, game.whole.arrival.id)?.kind === 'word';
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  /* marks seen here that can't be guessed yet: said gently, once, so a later guess doesn't come from nowhere (D-077) */
  const later = $derived(a ? marksIn(content.story, [...a.records, ...a.way.flatMap(w => w.records), ...a.then.flatMap(w => w.records)]).filter(m => !a.guess.includes(m) && !mayGuess(content.story, v.story, m)
    && !markHeld(markOf(content.story, m)!, v.story)) : []);
  /* a story bit that played on the way here (D-129) offers its record, or its small choice, here */
  function pickWay(beat: string, record: string) { game.do({ do: 'choose', beat, pick: [...a!.way, ...a!.then].find(w => w.beat === beat)!.records.indexOf(record) }); go('records', record); }
  /* how Dan came here (D-154): a new area, the next place in the area he is in, back to an area walked before, or an
     evening at camp; said in the label, and the area named above every place */
  const label = $derived(!a ? '' : again ? t('arrive.again') : a.kind === 'camp' ? t('arrive.camp')
    : a.face === 'evening' ? t(a.late ? 'arrive.lastNight' : 'arrive.evening') : a.face === 'enter' ? t('arrive.newArea') : a.face === 'back' ? t(a.turnOff ? 'arrive.turnOff' : 'arrive.backIn') : t('arrive.label'));
  /* a new area: its name is the title, the place under it; anywhere else the area sits small above the place */
  /* an evening with no one place is named for where it begins (its sections name any other area they move to), D-154 */
  const title = $derived(!a ? '' : a.kind === 'evening' ? a.area || t('arrive.byTheLamp') : a.face === 'enter' && !again ? a.area : a.name);
  const over = $derived(!a ? '' : a.kind === 'evening' ? '' : a.face === 'enter' && !again ? '' : a.area);
  const under = $derived(!a || again || a.face !== 'enter' ? '' : a.name);
  function pick(i: number) { if (!a) return; game.do({ do: 'choose', beat: a.id, pick: i }); go('records', a.records[i]); }
  /* after the cut: through the lintel to the stair (D-039), back to today, or later (the cut waits, unseen) */
  function cutLeave(to: 'through' | 'today' | 'later') {
    /* left for later: Today, with a quiet line back to the word (the flow review, A2: it could not be left) */
    if (to === 'later') { if (v.arrival) leaveWord(v.arrival.seq); go('today'); return; }
    if (to === 'through' && v.arrival) { game.do({ do: 'seen', what: 'arrival', ref: v.arrival.seq }); go('stair'); return; }
    leave('today');
  }

  /* the painting, seen without the words, the buttons or the gold (D-105) */
  let looking = $state(false);
  const look = () => (looking = true);

  function leave(to: 'today' | 'set') {
    if (v.arrival) {
      game.do({ do: 'seen', what: 'arrival', ref: v.arrival.seq });
      /* a big day reached more than one place: each plays in turn */
      const more = game.whole.arrival;
      if (more && to === 'today') { go('arrival', more.seq); return; }
    }
    /* read again from the Map: back to the Map */
    if (again && to === 'today') { go('back'); return; }
    /* Keep going: Dan chooses what next (D-077) */
    if (to === 'set') go('satchel');
    else go('today');
  }
</script>

{#if a && word}
  <Cut {a} leave={cutLeave} />
{:else if a}
  <div class="arr" class:fresh bind:this={root} onpointerdown={settleNow} role="presentation">
    <Scene painting={a.painting} top="260px" bottom="34%" />
    <div class="facelight" aria-hidden="true"></div>
    <div class="ui fixed">
      <header class="topbar col">
        <button class="home" onclick={() => leave('today')}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg><span>{again ? back.label : t('delve.today')}</span></button>
        <span></span><span></span>
      </header>
      <section class="col head">
        <div class="label-line gold">{label}</div>
        {#if over}<div class="area">{over}</div>{/if}
        <h1 class="carve lg">{title}</h1>
        {#if under}<div class="area under">{under}</div>{/if}
      </section>
      <!-- the painting, left clear: a tap on it looks at it (D-105) -->
      <div class="gap" onclick={look} role="presentation"></div>
      <!-- the words keep to the lower half and scroll there; they can be folded away (D-085) -->
      <div class="col text">
        <Words {look} length={(a.line?.length ?? 0) + (a.look?.length ?? 0) + a.then.reduce((n, w) => n + w.line.length, 0)}>
          {#if a.wayIn && !again}<span class="soft on-scene way-in">{a.wayIn}</span>{/if}
          {#if a.stopAgain}<span class="soft on-scene">{t('arrive.stopAgain')}</span>{/if}
          {#if a.line}<span class="soft on-scene"><Prose text={a.line} /></span>{/if}
          {#if a.look}<span class="soft on-scene look"><Prose text={a.look} /></span>{/if}
          {#each a.way as w (w.beat)}<p class="soft on-scene look"><Prose text={w.line} /></p>{/each}
          {#each a.opened as line}<p class="soft on-scene look">{t('arrive.keyOpens')} <Prose text={line} /></p>{/each}
          {#each a.then as w, i (w.beat)}{#if w.area && w.area !== (i ? a.then[i - 1].area : a.area)}<span class="then-area">{w.area}</span>{/if}<p class="soft on-scene"><Prose text={w.line} /></p>{/each}
        </Words>
      </div>
      <div class="mid col">
        {#if a.id}
          {#each a.way as w (w.beat)}<Settled beat={fresh ? w.beat : null} />{/each}
          {#if a.kind !== 'evening'}<Settled beat={fresh ? a.id : null} />{/if}
          {#each a.then as w (w.beat)}<Settled beat={fresh ? w.beat : null} />{/each}
          {#each a.way as w (w.beat)}<Reread beat={fresh ? w.beat : null} {go} />{/each}
          {#if a.kind !== 'evening'}<Reread beat={fresh ? a.id : null} {go} />{/if}
          {#each a.then as w (w.beat)}<Reread beat={fresh ? w.beat : null} {go} />{/each}
          {#each a.guess as mark (mark)}<Guess {mark} at={a.id} />{/each}
          {#if later.length}<p class="soft later">{t('arrive.marksLater')}</p>{/if}
          {#if a.records.length}
            <div class="choice">
              {#if a.choice}{#each a.choice.slice(0, a.records.length) as c, i}<button class="text-link" onclick={() => pick(i)}><span>{cap(c)}</span></button>{/each}
              {:else}<button class="text-link" onclick={() => go('records', a.records[0])}><span>{t('records.read')}</span></button>{/if}
            </div>
          {/if}
          {#each [...a.way, ...a.then].filter(w => w.records.some(r => !a.records.includes(r))) as w (w.beat)}
            <div class="choice">
              {#if w.choice}{#each w.choice.slice(0, w.records.length) as c, i}<button class="text-link" onclick={() => pickWay(w.beat, w.records[i])}><span>{cap(c)}</span></button>{/each}
              {:else}<button class="text-link" onclick={() => go('records', w.records[0])}><span>{t('records.read')}</span></button>{/if}
            </div>
          {/each}
          {#if a.completedDay && !again}
            <p class="enough">{t('arrive.enough')} <em>{t('arrive.enough2')}</em></p>
          {/if}
        {/if}
      </div>
      <section class="bottom col">
        {#if again}
          <!-- read again from the Map: nothing to decide, only the way back (D-135) -->
          <button class="btn resting" onclick={() => leave('today')}>{backTo(back.label)}</button>
        {:else}
        <button class="btn resting" onclick={() => leave('today')}>{a.completedDay ? t('arrive.rest') : t('arrive.onward')}</button>
        <div class="btn-row"><button class="btn-quiet" onclick={() => leave('set')}><span>{t('today.keepGoing')}</span></button></div>
        <!-- where it goes, said (N clumsy 8) -->
        <p class="soft to-satchel">{t('today.keepGoingSay')}</p>
        {/if}
      </section>
    </div>
    {#if looking}<Look close={() => (looking = false)} />{/if}
  </div>
{/if}

<style>
  .to-satchel { margin: 8px 0 0; font-size: calc(14px * var(--ts, 1)); font-style: italic; text-align: center; }
  .arr { display: contents; }
  .later { text-align: center; margin: 2px 0 10px; font-style: italic; }
  .facelight { position: absolute; inset: 0; z-index: 1; pointer-events: none; mix-blend-mode: screen;
    background: radial-gradient(90% 34% at 50% 68%, rgba(255,178,84,.3) 0%, rgba(250,160,60,.12) 55%, rgba(250,160,60,0) 100%), linear-gradient(0deg, rgba(200,110,30,.3) 0%, rgba(240,150,55,.18) 22%, rgba(250,170,70,.06) 40%, rgba(250,170,70,0) 52%); }
  .fresh :global(.pool), .fresh .facelight { opacity: 0; animation: gold 4.2s .6s ease-in-out forwards; }
  .fresh :global(.fog.warm) { opacity: 0; animation: gold 4.2s 1s ease-in-out forwards; }
  @keyframes gold { to { opacity: 1; } }
  .head { margin-top: 14px; animation: rise 1.4s .4s var(--ease) both; }
  .head .label-line { margin-bottom: 8px; }
  /* the area, small, above the place (or under a new area's name, the place): where Dan is, always said (D-154) */
  .head .area { font-family: var(--life); font-size: calc(15px * var(--ts, 1)); letter-spacing: .06em; color: var(--ink-2); margin-bottom: 4px; }
  .head .area.under { margin: 6px 0 0; }
  .text :global(.way-in) { font-style: italic; }
  /* each moment of an evening says where it is, when it is somewhere else at camp (the journey review) */
  .then-area { display: block; margin-top: 14px; font-family: var(--life); font-size: calc(13px * var(--ts, 1)); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2); }   /* as on the delve and the set-up (spacing review D16) */
  /* wrapped onto two lines, the links' own 44 px keep them apart: no gap between the lines (spacing review D9) */
  .choice { display: flex; justify-content: center; gap: 0 18px; flex-wrap: wrap; margin-bottom: 14px; }
  .topbar { animation: rise 1.2s .2s var(--ease) both; }
  /* the screen itself never scrolls: the words do, in the lower half (D-085) */
  .ui.fixed { overflow: hidden; }
  .head { flex: none; }
  /* with the phone's text set larger, the painting's gap gives way before the words do, so they keep their lines */
  .gap { flex: 1 1 auto; min-height: max(24px, calc(12vh - (var(--ts, 1) - 1) * 300px)); }
  .text { flex: 0 1 auto; min-height: 0; display: flex; flex-direction: column; animation: rise 1.4s .6s var(--ease) both; }
  .text :global(.soft) { display: block; margin-top: 6px; }
  .text :global(.look) { color: var(--gold-hi); margin-top: 12px; }
  .mid { flex: none; display: flex; flex-direction: column; align-items: center; padding-top: 6px; padding-bottom: 14px; }
  .enough { font-family: var(--life); font-size: min(31px, 8vw); line-height: 1.15; color: #fff; text-align: center;
    text-shadow: 0 0 26px rgba(242,193,112,.45), 0 2px 18px rgba(8,6,20,.9); animation: rise 1.6s 2.2s var(--ease) both; }
  .enough em { display: inline-block; animation: rise 1.6s 3s var(--ease) both; }
  /* the way out is there early (by about 2.5 s), even while the scene is still turning gold */
  .bottom { animation: rise 1s 1.4s var(--ease) both; }
  .bottom .btn-row { margin-top: 16px; }
  button.home { color: var(--ink-2); }
</style>
