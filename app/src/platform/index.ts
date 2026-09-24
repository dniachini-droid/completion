import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics as CapHaptics, ImpactStyle } from '@capacitor/haptics';
import type { Platform } from './types';

/* Prototype storage: the browser's own (SQLite comes with the real save, DATA_MODEL.md). */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  remove: (k: string) => { try { localStorage.removeItem(k); } catch { /* */ } },
};

const native: Platform = {
  store, now: () => new Date(),
  notifier: {
    async permit() {
      const s = await LocalNotifications.checkPermissions();
      if (s.display === 'granted') return true;
      return (await LocalNotifications.requestPermissions()).display === 'granted';
    },
    async at(id, when, title, body) {
      await LocalNotifications.schedule({ notifications: [{ id, title, body, schedule: { at: when, allowWhileIdle: true }, sound: undefined }] });
    },
    async cancel(id) { await LocalNotifications.cancel({ notifications: [{ id }] }); },
  },
  haptics: { tick: () => CapHaptics.impact({ style: ImpactStyle.Light }) },
};

/* In a browser (the web prototype, tests): the end shows when you come back; no buzz. */
const web: Platform = {
  store, now: () => new Date(),
  notifier: { permit: async () => false, at: async () => {}, cancel: async () => {} },
  haptics: { tick: async () => { try { navigator.vibrate?.(8); } catch { /* */ } } },
};

export const platform: Platform = Capacitor.isNativePlatform() ? native : web;
