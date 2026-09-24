/**
 * Every line the app says (D-046), looked up by key. Placeholder wording until the language pass
 * (after 3–4 weeks of play, D-046). {name} marks a value filled in by the screen.
 */
export const copy = {
  /* Today */
  'today.suggested': 'a suggestion · one tap changes it',
  'today.capacity': 'How big today is',
  'cap.low': 'Low', 'cap.normal': 'Normal', 'cap.high': 'High',
  'today.ahead': 'Ahead',
  'today.next': 'Next',
  'today.teaser.avoided': 'There’s something in the step after this one.',
  'today.teaser.delve': 'The passage goes on from here.',
  'today.teaser.away': 'Away from the phone. Come back and say when it’s done.',
  'today.begin': 'Begin',
  'today.swap': 'Swap',
  'today.cantStart': 'I can’t start',
  'today.already': 'Already done',
  'today.underWay': 'Under way',
  'today.underWay.say': 'Come back when it’s done.',
  'today.done': 'Done',
  'today.carry': 'Carry on: {job}',
  'today.carry.left': '{min} left in this delve',
  'today.carry.go': 'Carry on',
  'today.finishHere': 'Finish here',
  'today.label': 'Today',
  'today.enough': 'That’s the day. Enough.',
  'today.reached': 'You reached {place}.',
  'today.camped': 'You made camp: {place}.',
  'today.look': 'See where you are',
  'today.keepGoing': 'Keep going',
  'today.lighter': 'A lighter day.',
  'row.done': 'done',
  'row.underWay': 'under way',
  'row.delves': '{n} of {len}',
  'row.delve': 'a delve',
  'row.about': 'about {len}',
  'nav.proto': 'Prototype',

  /* the run set-up (the dial) */
  'set.label': 'Delves',
  'set.minutes': 'minutes',
  'set.towards': 'Towards {place}',
  'set.to': 'To {place}',
  'set.onward': 'Further in',
  'set.nextPlace': 'the next place',
  'set.count': '{n} of {len}',
  'set.ends': 'ends around {end}',
  'set.enoughAt': 'enough around {at}',
  'set.enoughAndEnds': 'enough around {at} · ends {end}',
  'set.here': 'here',
  'set.enough': 'enough',
  'set.side': 'a side chamber',
  'set.less': 'One delve fewer',
  'set.more': 'One more delve',
  'set.length': 'Length of each delve',
  'set.begin': 'Begin',

  /* the delve */
  'delve.towards': 'Towards',
  'delve.further': 'Further in',
  'delve.moves': 'The expedition moves while you work.',
  'delve.left': 'left of {len} minutes',
  'delve.single': 'a single delve',
  'delve.ofRun': 'the {ord} of {card} delves',
  'delve.enoughAfter': 'enough after this one',
  'delve.more': 'more · the {ord} delve',
  'delve.away.locked': 'Put the phone away. You’ll hear it end.',
  'delve.away.web': 'Put the phone down. It chimes if this page stays open.',
  'delve.stepAway': 'Step away',
  'delve.finishHere': 'Finish here',
  'delve.breather': 'A breather',
  'delve.breather.done': 'That’s the {ord} delve.',
  'delve.breather.say': 'Rest a little. The next starts by itself.',
  'delve.breather.enough': 'Enough for today. You set more, so the next starts by itself.',
  'delve.startNow': 'Start it now',
  'delve.held.say': 'Your minutes are kept. It’ll wait for you, even if you leave.',
  'delve.back': 'Back to the delve',
  'delve.back.left': '{min} left',
  'delve.label': 'The delve',
  'delve.enoughLabel': 'Enough',
  'delve.doneOne': 'That’s the delve done.',
  'delve.doneRun': 'That’s the run done.',
  'delve.sessionComplete': '{job} session complete.',
  'delve.enoughSay': 'Enough for today.',
  'delve.finished': '{min} on {job}.',
  'delve.ask': 'Is it done?',
  'delve.yes': 'Done',
  'delve.notYet': 'Not yet',
  'delve.yesSay': 'Done. The day moves on.',
  'delve.kept': '{min} kept.',
  'delve.keptSay': 'It’ll be there when you come back to it.',
  'delve.toToday': 'Back to today',
  'delve.see': 'See where you are',
  'delve.today': 'Today',

  /* the step, for a job done away from the phone */
  'step.label': 'Done',
  'step.done': '{job}.',
  'step.key': 'A count fills',
  'find.label': 'A find',
  'guess.label': 'A mark',
  'guess.ask': 'What might it mean?',
  'guess.kept': 'Your guess: {guess}. The place will tell you.',
  'records.label': 'Records',
  'records.title': 'What you’ve found',
  'records.none': 'Nothing yet. Records turn up as you go further in.',
  'records.her': 'Her sheet',
  'records.read': 'Read it',
  'records.nav': 'Records',
  'map.nav': 'Map',
  'map.label': 'The map',
  'map.close': 'Close',
  'map.region': 'Region',
  'map.here': 'you are here',
  'map.sealed': 'sealed',
  'map.ahead': 'ahead',

  /* day complete and the arrival */
  'arrive.label': 'Arrived',
  'arrive.camp': 'Camp',
  'arrive.first': 'Your first time here.',
  'arrive.enough': 'That’s the day.',
  'arrive.enough2': 'Enough.',
  'arrive.rest': 'Rest here for today',
  'arrive.onward': 'Back to today',
  'arrive.cut': 'Go on',

  /* I can't start */
  'cant.label': 'Just ahead',
  'cant.first': 'One small thing first:',
  'cant.ten': '10 minutes?',
  'cant.notNow': 'Not now',
  'cant.fallback': 'The passage goes on, and there is a draught from further in.',

  /* the prototype's own controls (temporary; PROTOTYPE_NOTES.md) */
  'proto.label': 'Prototype',
  'proto.title': 'The first playable, being built',
  'proto.about': 'This save is a trial run: it starts afresh when the test begins. The paintings are stand-ins until each place is painted.',
  'proto.rehearsal': 'Rehearsal: minutes pass 60 times faster',
  'proto.rehearsal.on': 'Rehearsal is on. A 25-minute delve takes 25 seconds. It has its own save, which starts afresh each time.',
  'proto.rehearsal.off': 'Real time. Use it on real jobs.',
  'proto.rehearsal.start': 'Start a rehearsal',
  'proto.rehearsal.stop': 'Back to real time',
  'proto.reset': 'Start this save again',
  'proto.reset.confirm': 'Tap again to wipe it',
  'proto.close': 'Close',
  'proto.badge': 'Rehearsal ×60',

  /* the phone's alerts */
  'notify.delveEnd.title': 'The delve is over',
  'notify.delveEnd.body': 'Come back up when you’re ready.',
  'notify.breatherEnd.title': 'The next delve begins',
  'notify.breatherEnd.body': 'The breather is over.',

  /* words for numbers and times */
  'min.one': '1 minute', 'min.many': '{n} minutes', 'hour.one': '1 hour', 'hour.many': '{n} hours',
  'ord.1': 'first', 'ord.2': 'second', 'ord.3': 'third', 'ord.4': 'fourth', 'ord.5': 'fifth', 'ord.6': 'sixth', 'ord.7': 'seventh', 'ord.8': 'eighth',
  'card.1': 'one', 'card.2': 'two', 'card.3': 'three', 'card.4': 'four', 'card.5': 'five', 'card.6': 'six', 'card.7': 'seven', 'card.8': 'eight',
  'delves.one': '1 delve', 'delves.many': '{n} delves',
  'day.0': 'Sunday', 'day.1': 'Monday', 'day.2': 'Tuesday', 'day.3': 'Wednesday', 'day.4': 'Thursday', 'day.5': 'Friday', 'day.6': 'Saturday',
} as const;

export type CopyKey = keyof typeof copy;
export const t = (k: CopyKey, vars?: Record<string, string | number>): string =>
  vars ? copy[k].replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? '')) : copy[k];

/** "25 minutes", "1 hour 20 minutes" */
export function minutesWords(m: number): string {
  if (m < 60) return t(m === 1 ? 'min.one' : 'min.many', { n: m });
  const h = Math.floor(m / 60), r = m % 60;
  return t(h === 1 ? 'hour.one' : 'hour.many', { n: h }) + (r ? ' ' + t(r === 1 ? 'min.one' : 'min.many', { n: r }) : '');
}
export const ord = (k: number) => copy[`ord.${Math.min(8, Math.max(1, k))}` as CopyKey];
export const card = (k: number) => copy[`card.${Math.min(8, Math.max(1, k))}` as CopyKey];
export const delves = (n: number) => t(n === 1 ? 'delves.one' : 'delves.many', { n });
/** A place's name inside a sentence: "You reached the Rib Gallery." */
export const inSentence = (name: string) => name.replace(/^The /, 'the ');
