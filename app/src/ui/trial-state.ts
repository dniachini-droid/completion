// Phase 8 trial state: the one running delve, saved the moment it begins (throwaway; the fact log arrives with the heart slice).
import type { Delve } from '../core/delve';
import { platform } from '../platform';

const KEY = 'trial.delve';
export const DELVE_ALERT_ID = 1;

export async function loadDelve(): Promise<Delve | null> {
  const raw = await platform.storage.get(KEY);
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Delve;
    return Number.isFinite(d.startedAt) && d.minutes > 0 ? d : null;
  } catch {
    return null;
  }
}
export const saveDelve = (d: Delve) => platform.storage.set(KEY, JSON.stringify(d));
export const clearDelve = () => platform.storage.remove(KEY);
