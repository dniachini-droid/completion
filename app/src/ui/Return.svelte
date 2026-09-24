<script lang="ts">
  /* What a job's return brings from the story (BALANCING §4: each job done plays its step, 20–40 s): the next step of
     the story, or a sealed thing opening when a Key lands (never called a Key), or a line of the passage; a mark to
     guess where one is offered; and any find. One drawable thing at a time; nothing here is a task. */
  import { game, content } from './game.svelte';
  import { returnOf } from '../core/game';
  import { t } from '../content/copy/en';
  import Guess from './Guess.svelte';

  let { doneSeq, extraFinds = [] }: { doneSeq: number | null; extraFinds?: string[] } = $props();
  const r = $derived(doneSeq !== null ? returnOf(content, game.facts, doneSeq) : null);
  const finds = $derived([...(r?.finds ?? []), ...extraFinds].map(id => content.story.finds.find(f => f.id === id)).filter(f => !!f));
  const picked = $derived(r?.beat ? game.facts.find(f => f.type === 'choiceMade' && f.beat === r.beat) : undefined);
</script>

{#if r && r.line}
  {#if r.key}<div class="label-line centred lit key">{t('step.key')}</div>{/if}
  <p class="say story on-scene">{r.line}</p>
  {#each r.guess as mark (mark)}<Guess {mark} />{/each}
  {#if r.choice && r.beat && !picked}
    <div class="choice">
      {#each r.choice as c, i}
        <button class="text-link" onclick={() => game.do({ do: 'choose', beat: r.beat!, pick: i })}><span>{c}</span></button>
      {/each}
    </div>
  {/if}
{/if}
{#each finds as f (f!.id)}
  <div class="find">
    <div class="label-line centred gold">{t('find.label')}</div>
    <p class="say on-scene">{f!.line}</p>
  </div>
{/each}

<style>
  .key { margin-top: 6px; }
  .story { font-size: 18px; line-height: 1.42; margin: 10px 0 12px; }
  .choice { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; margin: -2px 0 8px; }
  .find { margin: 10px 0 6px; }
  .find p { font-size: 17px; line-height: 1.4; margin-top: 8px; color: var(--ink-2); }
</style>
