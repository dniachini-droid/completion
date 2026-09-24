import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics as CapHaptics, ImpactStyle } from '@capacitor/haptics';
import type { Platform } from './types';
import { sound } from './chime';

/* Prototype storage: the browser's own. The fact log is the real save's shape; on the phone it moves to SQLite
   with the TestFlight build (DATA_MODEL.md; PROTOTYPE_NOTES.md). */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  remove: (k: string) => { try { localStorage.removeItem(k); } catch { /* */ } },
};

const native: Platform = {
  store, sound, now: () => new Date(),
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
  },
  haptics: { tick: () => CapHaptics.impact({ style: ImpactStyle.Light }) },
};

/* In a browser (the web link, tests): the end chimes if the page is open, and shows when you come back. */
const web: Platform = {
  store, sound, now: () => new Date(),
  notifier: { locked: false, permit: async () => false, at: async () => {}, cancel: async () => {} },
  haptics: { tick: async () => { try { navigator.vibrate?.(8); } catch { /* */ } } },
};

export const platform: Platform = Capacitor.isNativePlatform() ? native : web;
