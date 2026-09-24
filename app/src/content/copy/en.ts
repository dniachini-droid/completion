/** Every line the app says (D-046). Placeholder wording until the language pass. */
export const copy = {
  'trial.kicker': 'Phase 8 · trials',
  'trial.title': 'The Well Stair',
  'trial.alert.label': 'The delve alert',
  'trial.alert.begin': 'Begin',
  'trial.alert.what': 'A one-minute test delve. Once it starts, lock the phone.',
  'trial.alert.running': 'Lock the phone and put it away. You’ll hear it end.',
  'trial.alert.left': 'left of one minute',
  'trial.alert.done': 'The delve ended. Did you hear it with the phone locked?',
  'trial.alert.again': 'Try again on silent, then in a Focus',
  'trial.alert.denied': 'Notifications are off, so the end shows only when you come back. Settings → Notifications can turn them on.',
  'trial.feel.label': 'The feel',
  'trial.feel.tap': 'Tap for a tick',
  'trial.feel.hint': 'The page shouldn’t bounce, words shouldn’t select, and nothing should hide under the notch.',
  'notify.delveEnd.title': 'The delve is over',
  'notify.delveEnd.body': 'Come back up when you’re ready.',
} as const;

export type CopyKey = keyof typeof copy;
export const t = (k: CopyKey): string => copy[k];
