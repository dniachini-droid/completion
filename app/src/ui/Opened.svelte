<script lang="ts">
  /* A locked thing opened with a Key Dan chose to use on the Map (D-142): its own place's painting and name, so it never
     plays as if he had jumped back from where he is; its words; what it added to the records; the Keys left. */
  import { game, content } from './game.svelte';
  import { t } from '../content/copy/en';
  import { sealOf, beatOf } from '../core/story';
  import { paintingOf } from '../core/game';
  import Scene from './Scene.svelte';
  import Words from './Words.svelte';
  import type { Go } from './nav';

  let { go, id }: { go: Go; id: string } = $props();
  const v = $derived(game.view);
  const s = content.story;
  const x = $derived(sealOf(s, id));
  const opened = $derived(!!x && v.story.opened.has(x.id));
  const line = $derived(x ? (x.beat ? beatOf(s, x.beat)?.line : x.line) ?? '' : '');
  const records = $derived(x ? [...(x.carries?.records ?? []), ...(x.beat ? beatOf(s, x.beat)?.carries?.records ?? [] : [])] : []);
  /* the painting of the place it is in: the place reached on its stretch whose name begins its "where", else the last
     place reached there */
  const painting = $derived.by(() => {
    if (!x) return v.here.painting;
    const there = s.beats.filter(b => b.stretch === x.stretch && b.name && v.story.played.has(b.id)
      && (b.kind === 'arrival' || b.kind === 'arrivalKey' || b.kind === 'word'));
    const named = there.find(b => x.where.toLowerCase().startsWith(b.name!.toLowerCase()));
    return paintingOf((named ?? there[there.length - 1])?.id ?? null, x.stretch);
  });
  const left = $derived(v.keys === 0 ? t('opened.left.none') : v.keys === 1 ? t('opened.left.one') : t('opened.left.many', { n: v.keys }));
</script>

<Scene {painting} />
<div class="ui">
  <header class="top col">
    <div class="topbar rise">
      <button class="home" onclick={() => go('map')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg><span>{t('map.nav')}</span></button>
      <span></span><span></span>
    </div>
  </header>
  <div class="mid"></div>
  <section class="bottom fit col center">
    <div class="scroll">
      {#if x && opened}
        <div class="label-line centred gold rise">{t('opened.label')}</div>
        <h2 class="carve md rise d1">{x.where}</h2>
        {#if line}<div class="rise d2"><Words plain length={line.length}><p class="say story on-scene">{line}</p></Words></div>{/if}
        {#if records.length}<p class="rise d3 recs"><button class="text-link" onclick={() => go('records', records[0])}><span>{t('opened.records')}</span></button></p>{/if}
        <p class="soft rise d3 left">{left}</p>
      {/if}
    </div>
    <div class="go rise d3">
      <button class="btn resting" onclick={() => go('map')}>{t('opened.toMap')}</button>
    </div>
  </section>
</div>

<style>
  .bottom h2 { margin: 10px 0 8px; }
  .mid { min-height: clamp(112px, 22vh, 200px); }
  .recs { margin: 10px 0 0; }
  .left { margin: 8px 0 0; }
</style>
