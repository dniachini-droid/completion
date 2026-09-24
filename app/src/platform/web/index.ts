import type { Platform } from '../types';

// The browser version: for the Phase 8 web prototype and the flow tests.
// A browser can't sound an alert with the phone locked; that is exactly what the native version is for.
export function webPlatform(): Platform {
  const timers = new Map<number, ReturnType<typeof setTimeout>>();
  return {
    kind: 'web',
    now: () => Date.now(),
    storage: {
      async get(k) { try { return localStorage.getItem(k); } catch { return null; } },
      async set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode: throwaway prototype data */ } },
      async remove(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
    },
    notifications: {
      async ensurePermission() {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;
        return (await Notification.requestPermission()) === 'granted';
      },
      async schedule(id, at, title, body) {
        clearTimeout(timers.get(id));
        timers.set(id, setTimeout(() => {
          try { if (Notification.permission === 'granted') new Notification(title, { body }); } catch { /* ignore */ }
        }, Math.max(0, at.getTime() - Date.now())));
      },
      async cancel(id) { clearTimeout(timers.get(id)); timers.delete(id); },
    },
    haptics: {
      async tick() { navigator.vibrate?.(8); },
      async tap() { navigator.vibrate?.(14); },
      async success() { navigator.vibrate?.([12, 60, 18]); },
    },
  };
}
