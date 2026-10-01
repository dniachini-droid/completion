<script lang="ts">
  /* What a job's return brings from the story (BALANCING §4: each job done plays its step, 20–40 s): the next step of
     the story, or a sealed thing opening when a Key lands (never called a Key), or a line of the passage; a mark to
     guess where one is offered; and any find. One drawable thing at a time; nothing here is a task. */
  import { game, content } from './game.svelte';
  import { returnOf } from '../core/game';
  import { t } from '../content/copy/en';
  import Guess from './Guess.svelte';
  import Glyph from './Glyph.svelte';
  import Settled from './Settled.svelte';
  import Words from './Words.svelte';
  import type { CopyKey } from '../content/copy/en';

  import type { Go } from './nav';
  let { doneSeq, extraFinds = [], go, look }: { doneSeq: number | null; extraFinds?: string[]; go?: Go; look?: () => void } = $props();
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  /* a small choice never gates anything: each option opens what it names (the record here), then comes back */
  function pick(i: number) { if (!r?.beat) return; game.do({ do: 'choose', beat: r.beat, pick: i }); if (r.records.length && go) go('records', r.records[i]); }
  const r = $derived(doneSeq !== null ? returnOf(content, game.facts, doneSeq) : null);
  /* what Dan is told about a Key (D-141): earned by this job, kept from earlier, or earned and kept for later */
  /* named after the job that kept up its rhythm (D-142): "You kept up Gym and earned a Key" */
  const jobName = $derived.by(() => { const f = doneSeq !== null ? game.facts.find(x => x.seq === doneSeq) : undefined; return f?.type === 'jobDone' ? game.job(f.job)?.name ?? t('step.keyJob') : t('step.keyJob'); });
  /* a Key is never spent for Dan (D-143 A): earned with something locked where he is, he is offered "Use it here" or
     "Keep it"; with something locked behind him, the Map; else he keeps it for the next locked thing */
  const v = $derived(game.view);
  let kept = $state(false);
  const offerHere = $derived(r?.keyNote === 'held' && !kept && !!v.keyHere && v.keys > 0 && !!go);
  const keyLine = $derived(r?.keyNote === 'held'
    ? (offerHere ? t('step.keyHere', { job: jobName }) : kept ? t('step.keyKeep', { job: jobName }) : v.keyUse ? t('step.keyMap', { job: jobName }) : t('step.keyHeld', { job: jobName }))
    : r?.keyNote === 'kept' ? t('step.keyKept') : r?.key ? t('step.key', { job: jobName })
    /* kept up again in a period whose Key it already earned: said, so Dan never wonders (L C4) */
    : r?.keyAlready ? t(`step.keyAlready.${r.keyAlready}` as CopyKey, { job: jobName }) : '');
  function useHere() { const id = v.keyHere; if (!id || !go) return; game.do({ do: 'useKey', seal: id }); go('opened', id); }
  const finds = $derived([...(r?.finds ?? []), ...extraFinds].map(id => content.story.finds.find(f => f.id === id)).filter(f => !!f));
</script>

{#snippet offer()}
  {#if offerHere}
    <div class="key-offer"><button class="text-link use" onclick={useHere}><span>{t('step.useHere')}</span></button><button class="text-link" onclick={() => (kept = true)}><span>{t('step.keepIt')}</span></button></div>
  {/if}
{/snippet}

{#if r && r.line}
  <!-- the story's words and any find keep to the lower half and scroll there; they can be folded away (D-085) -->
  <Words plain {look} length={r.line.length + finds.reduce((n, f) => n + f!.line.length, 0) + keyLine.length}>
    <!-- a Key's note is two sentences of plain text, as wide as the story's words, with room after it: never squeezed into a
         carved label's short line (Dan: "very very bad styling", D-131) -->
    {#if keyLine}<p class="key-note on-scene">{keyLine}</p>{@render offer()}{/if}
    <p class="say story on-scene">{r.line}</p>
    {#each finds as f (f!.id)}
      <div class="find">
        <div class="label-line centred gold">{t('find.label')}</div>
        <p class="say on-scene">{f!.line}</p>
      </div>
    {/each}
  </Words>
  {#if r.part}
    <div class="part">
      <div class="label-line centred">{t('part.label')}</div>
      <Glyph part={r.part.el} size={46} />
      <p class="soft">{t(`part.${r.part.el}` as CopyKey)}</p>
    </div>
  {/if}
  <Settled beat={r.beat} />
  {#each r.guess as mark (mark)}<Guess {mark} />{/each}
  {#if r.records.length && go}
    <div class="choice">
      {#if r.choice}
        {#each r.choice.slice(0, r.records.length) as c, i}<button class="text-link" onclick={() => pick(i)}><span>{cap(c)}</span></button>{/each}
      {:else}
        <button class="text-link" onclick={() => go('records', r.records[0])}><span>{t('records.read')}</span></button>
      {/if}
    </div>
  {/if}
{:else if finds.length || keyLine}
  <Words plain {look} length={finds.reduce((n, f) => n + f!.line.length, 0) + keyLine.length}>
    {#if keyLine}<p class="key-note on-scene">{keyLine}</p>{@render offer()}{/if}
    {#each finds as f (f!.id)}
      <div class="find">
        <div class="label-line centred gold">{t('find.label')}</div>
        <p class="say on-scene">{f!.line}</p>
      </div>
    {/each}
  </Words>
{/if}

<style>
  .key-offer { display: flex; justify-content: center; gap: 22px; margin: -18px 0 20px; }
  .key-offer .use span { color: #f2c170; }
  .key-note { margin: 6px 0 28px; font-family: var(--life); font-size: 16.5px; line-height: 1.45; font-style: italic;
    color: var(--violet-hi); text-align: center; text-transform: none; letter-spacing: normal; }
  .story { font-size: 18px; line-height: 1.42; margin: 10px 0 12px; }
  .choice { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; margin: -2px 0 8px; }
  .find { margin: 10px 0 6px; }
  .find :global(.label-line), .find p { text-align: center; }
  .part { text-align: center; margin: 4px 0 10px; }
  .part .label-line { margin-bottom: 8px; }
  .part .soft { margin-top: 4px; }
  .find p { font-size: 17px; line-height: 1.4; margin-top: 8px; color: var(--ink-2); }
</style>
