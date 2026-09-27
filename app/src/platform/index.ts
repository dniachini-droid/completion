import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics as CapHaptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import type { Away, Panel, PanelState, Platform } from './types';
import { sound } from './chime';
import { adopt, sqlSaves, textSaves, type Db, type Saves } from './saves';

/** The live saves (the real one and the rehearsal's): what's written the old way is brought into SQLite at start. */
const LIVE = ['save.v1', 'save.rehearsal'];

/* On the web link and in tests: the browser's own storage, the whole save as one text. */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  remove: (k: string) => { try { localStorage.removeItem(k); } catch { /* */ } },
};

/* In the app, small settings (the rehearsal's): the phone's own app settings (Preferences), which iOS never clears to
   save space and iCloud backs up. Read once at start into memory; each write goes to the phone at once. Up to D-106 the
   save was kept here too, and is again if SQLite fails. */
const kept = new Map<string, string>();
const nativeStore = {
  keys: () => [...kept.keys()],
  get: (k: string) => kept.get(k) ?? null,
  set: (k: string, v: string) => { kept.set(k, v); void Preferences.set({ key: k, value: v }); },
  remove: (k: string) => { kept.delete(k); void Preferences.remove({ key: k }); },
};
async function readKept() {
  const { keys } = await Preferences.keys();
  for (const key of keys) { const { value } = await Preferences.get({ key }); if (value !== null) kept.set(key, value); }
}

/* The app's own native part (app/ios/App/App/AwayPlugin.swift): telling locking the phone from going into another
   app, which only the phone can do (D-094). */
interface AwayPlugin {
  watch(o: { on: boolean; alerts: string[] }): Promise<void>;
  take(): Promise<{ at?: number }>;
  log(): Promise<{ entries: { at: number; how: 'locked' | 'left' | 'unsure'; signs: string[] }[] }>;
}
const Native = registerPlugin<AwayPlugin>('Away');
const nativeAway: Away & { first: number | null } = {
  first: null,
  watch(on, alerts) { void Native.watch({ on, alerts: alerts.map(String) }).catch(() => {}); },
  /* never waited on for long: a reply lost while the phone locks or wakes must not stop the game's clock for good */
  async take() { try { return (await Promise.race([Native.take(), new Promise<never>((_, no) => setTimeout(no, 2000))])).at ?? null; } catch { return null; } },
  async log() { try { return (await Native.log()).entries; } catch { return []; } },
};

/* The delve's panel (D-095): the app's own small plugin, ios/App/App/DelvePanelPlugin.swift. A phone that has Live
   Activities turned off for the app, or an older build, simply shows none: the delve never waits on it. */
const DelvePanel = registerPlugin<{ show(p: PanelState): Promise<unknown>; end(): Promise<unknown> }>('DelvePanel');
const nativePanel: Panel = {
  async show(p) { try { await DelvePanel.show(p); } catch { /* no panel */ } },
  async end() { try { await DelvePanel.end(); } catch { /* no panel */ } },
};

/* The save (D-106): SQLite, through the app's own small plugin (ios/App/App/SavePlugin.swift); all the SQL is in
   saves.ts. If SQLite can't be opened, or a write ever fails, the save goes on the old way, whole, in the app settings,
   with nothing lost (memory holds it all); the next start brings it back into SQLite (adopt: the longer log wins). */
const SqlPlugin = registerPlugin<{
  open(): Promise<void>;
  run(o: { steps: { sql: string; args?: unknown[] }[] }): Promise<void>;
  all(o: { sql: string; args?: unknown[] }): Promise<{ rows: (string | number | null)[][] }>;
}>('Save');
const nativeDb: Db = {
  run: steps => SqlPlugin.run({ steps }),
  all: async (sql, args) => (await SqlPlugin.all({ sql, args })).rows,
};
let saves: Saves = textSaves(nativeStore, 'settings');
let saveTrouble: string | null = null;
async function openSaves() {
  try {
    await SqlPlugin.open();
    const sql = await sqlSaves(nativeDb, why => {
      saveTrouble = `write: ${String((why as Error)?.message ?? why)}`;
      const settings = textSaves(nativeStore, 'settings');
      for (const [k, raw] of sql.all()) nativeStore.set(k, raw);
      saves = settings;
    });
    await adopt(sql, nativeStore, LIVE);
    saves = sql;
  } catch (why) {
    /* SQLite unusable: the old way, which the settings still hold (nothing was moved out of them unless written first) */
    saveTrouble = `open: ${String((why as Error)?.message ?? why)}`;
    saves = textSaves(nativeStore, 'settings');
  }
}

/* A reminder's one action (D-107): "Again in 10 min" sounds it once more, ten minutes on, from the phone's own
   notification without opening the app. Registered once, when the first reminder is laid out. */
let againReady: Promise<void> | null = null, againNext = 0;
function readyAgain(again: { label: string; ids: number[] }) {
  return (againReady ??= (async () => {
    await LocalNotifications.registerActionTypes({ types: [{ id: 'remind', actions: [{ id: 'again', title: again.label }] }] });
    await LocalNotifications.addListener('localNotificationActionPerformed', async e => {
      if (e.actionId !== 'again') return;
      const x = (e.notification.extra ?? {}) as { title?: string; body?: string };
      const id = again.ids[againNext++ % again.ids.length];
      await LocalNotifications.schedule({ notifications: [{ id, title: x.title ?? e.notification.title, body: x.body ?? e.notification.body,
        schedule: { at: new Date(Date.now() + 10 * 60_000), allowWhileIdle: true }, actionTypeId: 'remind', extra: x }] });
    });
  })().catch(() => { againReady = null; }));
}

const native: Platform = {
  store: nativeStore, sound, now: () => new Date(), app: true, away: nativeAway,
  get saves() { return saves; }, get saveTrouble() { return saveTrouble; },
  ready: async () => { await readKept(); await openSaves(); nativeAway.first = await nativeAway.take(); },
  notifier: {
    locked: true,
    async permit() {
      const s = await LocalNotifications.checkPermissions();
      if (s.display === 'granted') return true;
      return (await LocalNotifications.requestPermissions()).display === 'granted';
    },
    async at(id, when, title, body) {
      await LocalNotifications.schedule({ notifications: [{ id, title, body, schedule: { at: when, allowWhileIdle: true }, sound: undefined }] });
    },
    async cancel(ids) { await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) }); },
    async remind(id, when, title, body, again) {
      await readyAgain(again);
      await LocalNotifications.schedule({ notifications: [{ id, title, body, schedule: { at: when, allowWhileIdle: true }, actionTypeId: 'remind', extra: { title, body } }] });
    },
  },
  haptics: { tick: () => CapHaptics.impact({ style: ImpactStyle.Light }), ring: () => CapHaptics.vibrate({ duration: 450 }) },
  panel: nativePanel,
};

/* In a browser a lock and another tab can't be told apart: hiding the page during a delve pauses it (D-094). */
let watching = false, hiddenAt: number | null = null;
document.addEventListener('visibilitychange', () => { if (document.hidden && watching) hiddenAt = Date.now(); });
const webAway: Away = {
  first: null,
  watch(on) { watching = on; },
  async take() { const at = hiddenAt; hiddenAt = null; return at; },
  async log() { return []; },
};

/* In a browser (the web link, tests): the end chimes if the page is open, and shows when you come back. */
const webSaves = textSaves(store, 'browser');
const web: Platform = {
  store, sound, now: () => new Date(), ready: async () => {}, app: false, away: webAway, saves: webSaves, saveTrouble: null,
  notifier: { locked: false, permit: async () => false, at: async () => {}, cancel: async () => {}, remind: async () => {} },
  panel: { show: async () => {}, end: async () => {} },
  haptics: {
    tick: async () => { try { navigator.vibrate?.(8); } catch { /* */ } },
    ring: async () => { try { navigator.vibrate?.(450); } catch { /* */ } },
  },
};

export const platform: Platform = Capacitor.isNativePlatform() ? native : web;
