// Every line the app says, in one place (D-046). Screens look lines up by key; no sentence is typed into a screen.
// Nothing here is final wording: the language pass comes after 3–4 weeks of play.
// Phase 8 trial lines are marked "trial." and are throwaway.
export const en = {
  'trial.day': 'Trial',
  'trial.place': 'The Lamp Hall',
  'trial.size.label': 'How big today is',
  'trial.size.low': 'Low',
  'trial.size.normal': 'Normal',
  'trial.size.high': 'High',
  'trial.size.note': 'tap these: each one should tick under your thumb',
  'trial.ahead': 'Ahead',
  'trial.ahead.say': 'A short delve, to test the alert.\nLock the phone once it starts.',
  'trial.next': 'Next',
  'trial.next.job': 'A trial delve',
  'trial.next.soft': 'Choose how long, then Begin.',
  'trial.length.label': 'How long',
  'trial.length.min': '{n} min',
  'trial.begin': 'Begin',
  'trial.build': 'build {v}',

  'notify.ask': 'So you hear when a delve ends.',
  'notify.denied': 'Alerts are off. The delve still counts; its end shows when you come back.',
  'notify.delveEnd.title': 'The delve is over',
  'notify.delveEnd.body': 'Come back up when you’re ready.',

  'delve.towards': 'Towards',
  'delve.place': 'The Far Door',
  'delve.left': '{n} min left',
  'delve.unit': 'minutes left',
  'delve.unitOne': 'minute left',
  'delve.lock': 'Lock the phone now. It should sound at the end.',
  'delve.stepAway': 'Step away',
  'delve.ended': 'The delve is over.',
  'delve.ended.soft': 'Did you hear it, with the phone locked?',
  'delve.back': 'Back to the hall',
} as const;

export type CopyKey = keyof typeof en;
