import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import type { Platform } from '../types';

// The app version (Capacitor). Storage here is Preferences for the Phase 8 trials;
// the fact log moves to SQLite with the heart slice (TECH_DECISIONS.md → routine choices).
export function nativePlatform(): Platform {
  return {
    kind: 'native',
    now: () => Date.now(),
    storage: {
      async get(key) { return (await Preferences.get({ key })).value; },
      async set(key, value) { await Preferences.set({ key, value }); },
      async remove(key) { await Preferences.remove({ key }); },
    },
    notifications: {
      async ensurePermission() {
        let p = await LocalNotifications.checkPermissions();
        if (p.display === 'prompt' || p.display === 'prompt-with-rationale') p = await LocalNotifications.requestPermissions();
        return p.display === 'granted';
      },
      async schedule(id, at, title, body) {
        await LocalNotifications.cancel({ notifications: [{ id }] }).catch(() => {});
        await LocalNotifications.schedule({
          notifications: [{ id, title, body, schedule: { at, allowWhileIdle: true } }],
        });
      },
      async cancel(id) { await LocalNotifications.cancel({ notifications: [{ id }] }); },
    },
    haptics: {
      tick: () => Haptics.impact({ style: ImpactStyle.Light }),
      tap: () => Haptics.impact({ style: ImpactStyle.Medium }),
      success: () => Haptics.notification({ type: NotificationType.Success }),
    },
  };
}
