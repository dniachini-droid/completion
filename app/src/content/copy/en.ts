/**
 * Every line the app says (D-046), looked up by key. Written well, in full sentences, in the voice of a
 * told tale (Dan: "think J. R. R. Tolkien", 2026-09-24, D-073); buttons and settings stay short and plain. {name} marks a value filled in by the screen.
 */
export const copy = {
  /* Today */
  'today.ahead': 'Ahead',
  'today.road.place': 'The next place in {min}',
  'today.road.side': 'a side chamber in {min}',
  'today.keys.none': 'No Keys',
  'today.keys.one': '1 Key',
  'today.keys.many': '{n} Keys',
  'today.keys.say': 'Keys open the locked things you pass. Keep up a recurring job to earn one.',
  'today.keys.use': 'Use it on the Map',
  'today.keys.useMany': 'Use one on the Map',
  'today.keys.here': 'Use it here',
  'today.keys.hereMany': 'Use one here',
  'today.keys.useOnMap': 'A Key is never used for you: on the Map, choose any locked thing you have passed.',
  'today.aheadKey': 'Needs a Key',
  'today.behind': 'Behind you',
  'today.behindMap': 'On the Map',
  'today.next': 'Next',
  'today.teaser.avoided': 'This is the task you have been putting off, and something waits for you on the far side of it.',
  'today.teaser.delve': 'The passage runs on from where you last set down your lamp.',
  'today.delve': 'Delve',
  'today.cantStart': 'I can’t start',
  /* a delve job worked on today and not yet said to be done (after "Not yet", or the question left): it can be (D-120) */
  'today.itsDone': 'It’s done',
  'today.underWay': 'Under way',
  'today.aside.said': 'Taken off today.',
  'today.putBack': 'Put it back', 'today.srPutBack': '{job}: put it back on today',
  'today.onlyAvoided': 'Only {job} left: that’s the one.',
  'today.holdHint': 'Press and hold a job for more.',
  'row.wentBy': '{time} · went by',
  'today.stillToCome': 'Still to come: {what}.',
  'today.carry': 'Carry on with {job}',
  'today.carry.left': 'You have {min} left in this delve.',
  'today.carry.go': 'Carry on',
  'today.finishHere': 'Finish here',
  'today.label': 'Today',
  'today.enough': 'The day’s work is done, and it was enough.',
  'today.reached': 'You came at last to {place}.',
  'today.camped': 'You made your camp at {place}.',
  'today.look': 'See where you are',
  'today.keepGoing': 'Keep going',
  'today.deeper': 'Anything more takes you deeper.',
  'row.done': 'done',
  'nav.proto': 'Trial',
  'nav.settings': 'Settings',

  /* the run set-up (the dial) */
  'set.label': 'Delves',
  'set.minutes': 'minutes',
  'set.long': '{n} · one long delve',
  'set.towards': 'Towards {place}',
  'set.to': 'To {place}',
  'set.onward': 'Further in',
  'set.nextPlace': 'the next place',
  'set.count': '{n} of {len}',
  'set.ends': 'finishing around {end}',
  'set.here': 'here',
  'set.side': 'a side chamber',
  'set.less': 'One delve fewer',
  'set.more': 'One more delve',
  'set.length': 'Length of each delve',
  'set.begin': 'Begin',

  /* the delve */
  'delve.towards': 'Towards',
  'delve.further': 'Further in',
  'delve.moves': 'While you work, the expedition goes on beneath the hill.',
  'delve.left': 'left of {len} minutes',
  'delve.single': 'one delve',
  'delve.ofRun': 'the {ord} of {card} delves',
  'delve.more': 'This one is extra: the {ord} delve.',
  'delve.away.noAlerts': 'Alerts are turned off for this app in Settings, so no sound will come while the phone is locked. Keep an eye on the time, or turn them on in Settings, then Notifications.',
  'delve.stepAway': 'Pause',
  'delve.paused': 'Paused',
  'delve.finishHere': 'Finish here',
  'delve.breather': 'A breather',
  'delve.breather.done': 'The {ord} delve is behind you.',
  'delve.breather.say': 'Rest a while and draw breath. The next delve will begin on its own.',
  'delve.startNow': 'Start it now',
  'delve.held.say': 'Your minutes are safe. The delve will wait for you, even if you close the app.',
  'delve.back': 'Back to the delve',
  'delve.back.left': '{min} left',
  'delve.awayLabel': 'Paused while you were away',
  'delve.away.say': 'You went into another app, so the delve waited for you. The time away does not count, and nothing you did is lost.',
  'delve.carryOn': 'Carry on',
  'delve.label': 'The delve',
  'delve.doneOne': 'The delve is ended, and your lamp still burns.',
  'delve.doneRun': 'The long run is ended.',
  'delve.sessionComplete': 'Your {job} is done for the day: {min}.',
  'delve.finished': 'You spent {min} on {job}.',
  'delve.ask': 'Is it done?',
  'delve.yes': 'Done',
  'delve.notYet': 'Not yet',
  'delve.yesSay': 'It is done, and the day goes on.',
  'delve.kept': 'Every minute counts: {min} so far.',
  'delve.keptNone': 'It will keep.',
  'delve.keptSay': 'Nothing is lost. Your next delve on it carries on from here.',
  /* a one-off's delve carrying on from its earlier minutes (D-133) */
  'delve.sofar': '{min} on it so far',
  'set.carry': 'Carries on from {min}.',
  'set.avoided': 'Put off a while: something waits beyond it.',
  'delve.toToday': 'Back to today',
  'delve.see': 'See where you are',
  'delve.today': 'Today',

  /* the step, for a job done away from the phone */
  'step.label': 'Done',
  'step.done': '{job}',
  'step.key': 'You kept up {job} and earned a Key, and used it here. Notches in the dark fill with light, and what was locked opens.',
  'step.keyJob': 'a recurring job',
  'step.keyKept': 'You used a Key you were keeping. Notches in the dark fill with light, and what was locked opens.',
  'step.keyHeld': 'You kept up {job} and earned a Key. Nothing locked is within reach yet, so you keep it for the next locked thing you come to.',
  'step.keyHere': 'You kept up {job} and earned a Key. Something here is locked, and the Key would open it.',
  'step.keyMap': 'You kept up {job} and earned a Key. You keep it: on the Map, use it on any locked thing you have passed.',
  'step.useHere': 'Use it here', 'step.keepIt': 'Keep it',
  'step.keyKeep': 'You kept up {job} and earned a Key. You keep it, for here or anywhere on the Map.',
  'step.keyAlready.week': 'You already earned this week’s Key for {job}.',
  'step.keyAlready.fortnight': 'You already earned this fortnight’s Key for {job}.',
  'step.keyAlready.month': 'You already earned this month’s Key for {job}.',
  'step.keyAlready.year': 'You already earned this year’s Key for {job}.',
  'step.keyAlready.days': 'You already earned the Key for {job} these last days.',
  'find.label': 'A find',
  'guess.label': 'A symbol',
  'guess.from': 'One of the symbols you saw at {place}.',
  'arrive.marksLater': 'Not every symbol here can be read yet. You will be asked about them further on, and the Symbols page keeps them until then.',
  'guess.ask': 'What do you think it means?',
  'guess.kept': 'You guessed {guess}. In time the place itself will tell you whether you were right.',
  'records.label': 'Records',
  'records.title': 'What you’ve found',
  'records.none': 'You have found nothing yet. Records lie further in, for those who go looking.',
  'records.her': 'Her sheet',
  'records.read': 'Read it',
  'records.done': 'Done reading',
  'records.tapMark': 'Tap a symbol to see what you know of it.',
  'records.nav': 'Records',

  /* the marks (SCRIPT §9; mock-up record.html) */
  'marks.nav': 'Symbols',
  'marks.label': 'Symbols',
  'marks.title': 'What you can read',
  'marks.none': 'You have no symbols yet. They are cut on walls and records further in.',
  'marks.this': 'This symbol',
  'marks.new': 'new',
  'marks.aName': 'a name',
  'marks.unknown': 'Seen, but not known yet',
  'marks.held': 'You know this one now: it means {word}. The place itself told you.',
  'marks.guess': 'You guessed {word}. In time the place itself will tell you whether you were right.',
  'marks.open': 'You have not met this symbol before. What do you think it means?',
  'marks.seen': 'You have seen this symbol, but its meaning is still hidden from you.',
  'marks.ring': 'This is a name, cut inside a ring. You cannot read it yet, but you will know it when you meet it again.',
  'marks.part': 'Only part of it has come to light so far: {part}. The rest lies further in.',
  'marks.keep': 'Keep {word}',
  'marks.change': 'Change it',
  'marks.else': 'What else might it mean?',
  'marks.struck': 'You guessed {word}.',
  'settle.held': 'Your guess held true: {word}.',
  'part.label': 'Part of a symbol',
  'part.hook': 'a hook, open',
  'part.wedge': 'a wedge',
  'guess.part': 'You have seen part of this one before: {part}.',

  /* the word: cutting it (the story job's §7; mock-up cut.html), and the stair beyond (stair.html, D-039) */
  'cut.label': 'The word',
  'cut.ask': 'Cut the word: the two symbols you know, in the right order.',
  'cut.hint.rod': 'Tap the blank to set the rod’s edge in it.',
  'cut.hint.first': 'Tap the first symbol to cut it.',
  'cut.hint.second': 'Now tap the second.',
  'cut.hint.lock': 'Tap the rod to lock the word.',
  'cut.through': 'Go through',
  'cut.later': 'Later',
  'stair.label': 'Beyond the lintel',
  'stair.say': 'From here, every delve takes you further down into the deep.',
  'stair.down': 'Go down',
  'map.nav': 'Map',
  'arrive.back': 'Back to {to}',
  'map.readAgain': 'Read again: {place}', 'map.readHere': 'Read it again',
  'map.label': 'The map',
  'map.regionLabel': 'The first region',
  'map.regionName': 'The Quiet',
  'map.here': 'you are here',
  'map.hereLabel': 'You are here',
  'map.hereIn': 'Here · {stretch}',
  'map.opened': 'Opened · Read again', 'map.openedSr': 'Opened with a Key: read again, {where}',
  'map.walked': 'Walked',
  'map.walkedSealed': 'Walked · something here needs a Key',
  'map.reached': 'Reached',
  'map.wayIn': 'The way you came in.',
  'map.sealed': 'needs a Key',
  'map.useKey': 'Use a Key',
  'map.noKey': 'Keep up a recurring job to earn a Key.',
  'opened.label': 'You used a Key',
  'opened.left.none': 'No Keys left.',
  'opened.left.one': '1 Key left.',
  'opened.left.many': '{n} Keys left.',
  'opened.records': 'Read it in your records',
  'opened.toMap': 'Back to the Map',
  'opened.again': 'Opened with a Key',
  'opened.nav': 'Opened',
  'map.ahead': 'ahead',
  'map.aheadLabel': 'Not reached yet',
  'map.aheadName': 'Somewhere ahead',
  'map.aheadSay': 'Its name comes when you get there.',
  'map.forecast': '{day} · forecast',
  'map.forecastLabel': 'Forecast',
  'map.forecastSay': 'If the week goes as planned, the next place is reached on {day}. A forecast, not a promise.',

  /* day complete and the arrival */
  'arrive.label': 'Arrived',
  'words.hide': 'Hide the words',
  'words.show': 'Read on',
  'look.open': 'Look',
  'look.hint': 'Pinch to look closer. Tap to come back.',
  'look.back': 'Back to the words',
  'arrive.camp': 'Camp',
  'arrive.enough': 'The day’s work is done.',
  'arrive.keyOpens': 'You used a Key you were keeping.',
  'arrive.enough2': 'Rest now.',
  'arrive.rest': 'Rest here for today',
  'arrive.onward': 'Back to today',

  /* I can't start */
  'cant.label': 'Just ahead',
  'cant.first': 'Start with one small thing:',
  'cant.ten': 'Try ten minutes?',
  'cant.notNow': 'Not now',
  'cant.fallback': 'The passage runs on, and a cool draught comes up from somewhere further in.',

  /* the prototype's own controls (temporary; PROTOTYPE_NOTES.md) */
  'proto.label': 'Prototype',
  'proto.title': 'The trial’s own controls',
  'proto.about': 'This save is a trial run: it starts afresh when the test begins.',
  'proto.rehearsal': 'Rehearsal: minutes pass 60 times faster',
  'proto.rehearsal.on': 'Rehearsal is on. A 25-minute delve takes 25 seconds. It has its own save, which starts afresh each time.',
  'proto.rehearsal.off': 'Real time. Use it on real jobs.',
  'proto.rehearsal.start': 'Start a rehearsal',
  'proto.rehearsal.stop': 'Back to real time',
  'proto.reset': 'Start this save again',
  'proto.reset.confirm': 'Tap again to wipe it',
  'proto.close': 'Close',
  'proto.badge': 'Rehearsal ×60',
  'proto.leave.title': 'Locking, or another app?',
  'proto.leave.about': 'To test the pause (D-094): start a delve, lock the phone for half a minute, and come back. Then go into another app for half a minute, and come back. Each time shows here with how the phone read it.',
  'proto.leave.locked': 'Locked: the delve went on',
  'proto.leave.left': 'Another app: paused',
  'proto.leave.unsure': 'Back within 15 seconds, no sign of a lock: the delve went on',
  'proto.leave.none': 'Nothing yet.',
  'proto.save.title': 'Where the save is kept',
  'proto.save.sqlite': 'In the phone’s database: each thing you do is written as it happens.',
  'proto.save.settings': 'In the app’s settings, the old way: nothing is lost, and the next start moves it back.',

  /* the week and the gaps (slice 4) */
  'today.tonight': 'Tonight',
  'today.bedtime': 'Bed by',
  'today.tonight.say': 'Press Go to sleep as you get into bed, then put the phone down. In bed by {bedtime}, and tomorrow begins a little further in, with something waiting for you.',
  'nav.week': 'Week', 'nav.daybook': 'Daybook', 'nav.back': 'Back',
  'row.at': 'at {time}',

  /* choosing what to do: any job, any time (D-077) */
  'row.notToday': 'Not today', 'row.srAside': '{job}: not today', 'row.srDelete': '{job}: delete',
  'set.stopped': 'Last time: {note}',
  'delve.whereStopped': 'Where did you stop? (for next time)',
  'cant.ask': 'What’s the first thing you’d touch?', 'cant.keep': 'Keep it',
  'today.notToday': 'Not today',
  'oops.say': 'Something went wrong on this screen. Your save is safe.',
  'today.running.say': 'Your delve is still going. The timer keeps time whether you watch it or not.',
  'today.running.go': 'Back to the delve',
  'today.else': 'Something else…',
  'today.clear': 'Nothing more is on today’s list.',
  'today.clear.say': 'Add a job, or rest. The road will keep.',
  /* the day's finish line is its first 3 hours; the rest waits below (D-131) */
  'today.ifTime': 'If there’s time',
  /* the one job menu (D-131, step 3) */
  'job.more': 'More…',
  'week.about.why': '{job} usually takes you about {min}.', 'week.about.set': 'From the minutes set for each job.', 'week.about.rest': 'The rest, from the minutes set for them.',
  /* a job ticked off without a delve (D-134) */
  'tick.off': 'Tick off', 'tick.sr': '{job}: tick off', 'tick.title': 'How long did it take?',
  'tick.onTop': 'On top of the {min} you delved', 'tick.noMore': 'No more', 'tick.hour': '{n} h', 'tick.halfHour': '1½ h',
  'menu.delve': 'Delve', 'menu.delveAgain': 'Delve again', 'menu.edit': 'Edit', 'menu.srEdit': '{job}: edit',
  /* a one-off waiting on someone's reply (D-137): earns nothing, costs nothing, no word of blame */
  'wait.menu': 'Waiting on…', 'wait.who': 'Who or what? (if you like)', 'wait.who.label': '{job}: waiting on who or what',
  'wait.until': 'Back on {day}', 'wait.another': 'Another day…',
  'wait.label': 'Waiting', 'wait.on': 'Waiting on {who} · back {day}', 'wait.plain': 'Waiting · back {day}',
  'wait.onNow': 'Waiting on {who}', 'wait.ask': 'Did they reply?',
  'wait.back': 'Back to it', 'wait.still': 'Still waiting', 'wait.done': 'It’s done',
  'wait.srBack': '{job}: back to it', 'wait.srStill': '{job}: still waiting, choose a day', 'wait.srDone': '{job}: it’s done',
  'wait.said': '{job}: in the satchel until {day}.',
  /* a done job taken back, to work on it more (D-131) */
  'row.notDone': 'Not done after all', 'row.srNotDone': '{job}: not done after all',
  /* Tonight, in the last hour before bed (D-131): both optional, neither ever mentioned if skipped */
  'tonight.first': 'Tomorrow starts with:', 'tonight.first.none': 'Choose a job', 'tonight.first.label': 'Choose what tomorrow starts with',
  'tonight.first.planned': 'Planned for tomorrow', 'tonight.first.others': 'Other jobs', 'tonight.first.keep': 'Keep it',
  'tonight.mind': 'Anything on your mind?', 'tonight.mind.hint': 'One line: it goes in the satchel', 'tonight.mind.put': 'Put in', 'tonight.mind.said': 'In the satchel.',

  'camp.bedtime': 'Bedtime',
  'camp.change': 'Change',
  'camp.earlier': 'Earlier',
  'camp.later': 'Later',
  'camp.sleep.kept': 'You are in bed on time. Tomorrow begins a little further in, with something waiting for you. Put the phone down now.',
  'camp.sleep.late': 'Sleep well. The head start is for nights you are in bed by {bedtime}. Nothing is lost.',
  'morning.headStart': 'You went to sleep on time, so the day begins a little further in.',
  'camp.goodnight': 'Go to sleep',
  'camp.night': 'Goodnight.',

  'morning.label': 'In the morning',
  'morning.title': 'Something was waiting for you at camp.',
  'morning.read': 'Read the record again',
  'morning.go': 'On to today',

  'welcome.label': 'Where you were',
  'welcome.at': 'You were at {place}.',
  'welcome.ahead': 'Ahead of you: {thing}.',
  'welcome.record': 'Read the last record',
  'welcome.go': 'Back to today',
  'welcome.say': 'You have been away, but the road has waited for you. One small task is enough to take it up again.',

  'daybook.label': 'The daybook',
  'daybook.written': 'Written for you as the week drew to its close.',
  'daybook.none': 'The pages are still blank. At the end of each week in which you do something, a page will be written here for you.',
  'daybook.held': 'The week held',
  'daybook.times': '{job} {n}',
  'daybook.once': 'once', 'daybook.twice': 'twice', 'daybook.many': '{n} times',
  'daybook.reached': 'You reached {places}.',
  'daybook.went': 'Where you went',
  'daybook.camped': 'It was a week of camps and short roads, and every step of it still counts.',
  'daybook.learned': 'Learned',
  'daybook.soFar': 'So far',
  'daybook.next': 'Further on',
  'daybook.count': 'At {where}, a row of notches filled with light, and what it kept shut opened.',
  'daybook.readAgain': 'Read again',
  'daybook.finds': 'Found',
  'daybook.offer': 'Shall the week ahead be planned for you?',
  'daybook.planIt': 'Plan it for me',
  'look.offer': 'Look ahead at the week? About a minute.', 'look.go': 'Look ahead',
  'look.still': 'Still wanted?', 'look.keep': 'Keep', 'look.skip': 'Skip',
  'look.coming': 'Coming up', 'look.nothing': 'Nothing fixed this week.', 'look.more': 'and more in the week',
  'look.next': 'Next', 'look.matters': 'What matters most?', 'look.nothingParticular': 'Nothing in particular',
  'daybook.notNow': 'Not now',
  'daybook.close': 'Close',
  'daybook.earlier': 'Earlier',
  'daybook.later': 'Later',
  'and': 'and',

  'week.label': 'This week',
  'week.next': 'Next week',
  'week.this': 'This week',
  'week.forecast': 'The plan points to {what}.',
  'week.forecast.one': 'the next place around {day}',
  'week.forecast.then': 'and the one after around {day}',
  'week.none': 'There is no plan for this week.',
  'week.none.next': 'There is no plan for next week yet.',
  'week.none.say': 'Today works well enough without one. If you like, the week can be laid out for you, and you may change whatever looks wrong.',
  'week.plan': 'Plan my week',
  'week.rhythms': 'Recurring jobs',
  'week.add': 'Add',
  'week.addTo': 'Add to {day}',
  'week.moveTo': 'Move to',
  'week.at': 'At {time}',
  'week.addPlaceholder': 'For example, the dentist',
  'week.time': 'Time',
  'week.anyTime': 'Any time',
  'week.setTime': 'Set a time',
  'week.asideNote': 'not today',
  'week.fold.done': '{n} done', 'week.fold.left': '{n} to do',
  'week.putBack': 'Back on today',
  'week.off': 'Not this week',
  'week.today': 'today',

  'rhythms.label': 'Recurring jobs',
  'rhythms.say': 'These are the things you do again and again. You may change any of them, at any time.',
  'rhythms.add': 'Add one',
  'rhythms.editing': 'Change it', 'rhythms.adding': 'A new one',
  'rhythms.name': 'What',
  'rhythms.often': 'How often',
  'rhythms.aWeek': 'A week', 'rhythms.setDays': 'Set days', 'rhythms.fortnight': 'Fortnightly',
  'rhythms.nWeek': '{n} a week',
  'rhythms.timesWeek': '{n} times a week',
  'rhythms.onceWeek': 'Once a week',
  'rhythms.every2': 'every 2 weeks',
  'rhythms.every2long': 'Once every 2 weeks',
  'slip.date': '{job} was wanted {date}. Still needed?', 'slip.appt': '{job}, on {day} at {time}, went by. Still needed?', 'slip.today': 'Put it on today',
  'week.aboutMin': 'about {n} min', 'week.aboutH': 'about {n} h', 'week.replan': 'Lay out the rest of the week',
  'week.later': 'A later week', 'week.after': 'The week after', 'week.otherDay': 'Another day…',
  'by.date': 'by {date}', 'by.label': 'By a date', 'by.none': 'No date', 'by.set': 'By',
  'by.passed': 'Its date has passed.', 'by.still': 'Still needed', 'by.new': 'New date', 'by.letGo': 'Let it go',
  'rhythms.monthly': 'Monthly', 'rhythms.yearlyShort': 'Yearly', 'rhythms.everyShort': 'Every few days',
  'rhythms.onADate': 'On a date', 'rhythms.onAWeekday': 'On a weekday',
  'rhythms.monthDay': 'on the {n} of each month', 'rhythms.lastDay': 'last day',
  'rhythms.monthNth': 'on the {nth} {day} of each month',
  'rhythms.nth.1': 'first', 'rhythms.nth.2': 'second', 'rhythms.nth.3': 'third', 'rhythms.nth.4': 'fourth', 'rhythms.nth.-1': 'last',
  'rhythms.yearly': 'every year on {date}',
  'rhythms.everyN': 'every {n} days',
  'rhythms.everySay': 'Counted from the day you last did it, not from a date.',
  'rhythms.each': 'About how long', 'rhythms.each.say': 'For planning the week. Each delve still starts at 30 minutes.',
  'rhythms.newNumber': 'A changed number counts from next week, but you can plan with it straight away.',
  'rhythms.save': 'Save', 'rhythms.cancel': 'Cancel',
  'rhythms.stop': 'Stop it recurring',
  'job.once': 'Once', 'job.onceSay': 'Once, until it is done.', 'job.onceUntil': 'once',
  'job.others': 'Other jobs', 'job.change': 'Change the job', 'job.back': 'Back to {to}', 'job.gone': 'Gone from your lists.',
  'job.avoided': 'I tend to put this off', 'job.yes': 'Yes', 'job.no': 'No',
  'job.step': 'First small step', 'job.stepHint': 'What would you touch first?',
  'job.note': 'A note', 'job.noteHint': 'Where you stopped, or anything to keep with it',
  'job.remove': 'Delete', 'job.delete': 'Delete', 'job.cantDelete': '{job} is in a delve: finish it first.', 'job.removed': '{name} is gone from your lists.', 'job.undo': 'Undo',
  'rhythms.less': 'Fewer', 'rhythms.more': 'More', 'rhythms.shorter': 'Shorter', 'rhythms.longer': 'Longer',
  'days.short.0': 'Sun', 'days.short.1': 'Mon', 'days.short.2': 'Tue', 'days.short.3': 'Wed', 'days.short.4': 'Thu', 'days.short.5': 'Fri', 'days.short.6': 'Sat',
  'days.plural.0': 'Sundays', 'days.plural.1': 'Mondays', 'days.plural.2': 'Tuesdays', 'days.plural.3': 'Wednesdays', 'days.plural.4': 'Thursdays', 'days.plural.5': 'Fridays', 'days.plural.6': 'Saturdays',
  /* the satchel (D-126): the jobs with no day yet */
  'nav.satchel': 'Satchel', 'delve.list': 'The list',
  'satchel.label': 'The Satchel',
  'satchel.say': 'Every job that isn’t on today. Delve on one whenever you like.',
  'satchel.add': 'A new job', 'satchel.add.hint': 'A new job', 'satchel.now': 'Delve now', 'satchel.later': 'Save for later',
  'satchel.add.today': 'A job for today', 'satchel.add.todayHint': 'A job for today', 'satchel.toToday': 'Add to today',
  'satchel.return.today': 'Return adds it to today.', 'satchel.return.later': 'Return keeps it here, with no day.',
  'row.sofar': '{min} so far',
  'satchel.saved': '{job}: in the satchel.',
  'satchel.noDay': 'No day yet', 'satchel.coming': 'Coming up', 'satchel.recurring': 'Recurring jobs',
  'satchel.recurring.add': 'Add a recurring job', 'satchel.move': '{job}: on {day}. Tap to move it',
  'satchel.empty': 'Nothing here with no day yet. When something comes to mind, it goes here.',
  'satchel.list': 'List', 'satchel.list.done': 'Close', 'satchel.list.label': 'The list for {job}', 'satchel.list.hint': 'A line at a time', 'satchel.list.full': 'The list is full: take a line out to add another.',
  'satchel.day': 'Put on a day', 'satchel.placed': '{job}: on {day}.',
  /* remembered jobs (D-136): the jobs Dan has had before, under the box as he types; the one offer to make a job repeat */
  'satchel.before': 'Jobs you’ve had before', 'satchel.usually': 'usually {min}', 'satchel.pick.sr': '{job}, usually {min}',
  'satchel.have.noDay': '{job} is already in your satchel.', 'satchel.have.coming': '{job} is already on {day}.',
  'satchel.have.waiting': '{job} is already waiting: back {day}.', 'satchel.have.today': '{job} is already on today’s list.', 'satchel.have.recurring': '{job} is one of your recurring jobs: it comes round by itself.',
  'satchel.offer': '{job} keeps coming back. Make it repeat?', 'satchel.offer.yes': 'Make it repeat', 'satchel.offer.no': 'No thanks',
  'pick.today': 'today', 'pick.prev': 'The month before', 'pick.next': 'The next month',
  'today.addJob': 'Add a job',
  /* a stray thought parked mid-delve (D-138) */
  'park.link': 'Park a thought', 'park.label': 'A thought to park for later', 'park.hint': 'A thought, for later', 'park.save': 'Park it',
  'park.cancel': 'Cancel', 'park.parked': 'Parked: {job}', 'park.have': '{job} is already on your list.',
  'park.count.1': 'One thought parked in the Satchel', 'park.count': '{n} thoughts parked in the Satchel',
  /* the errand run (D-139): several jobs in one delve, struck off as each is done */
  'errand.link': 'Errand run', 'errand.title': 'Errand run',
  'errand.say': 'Tick the jobs for one trip out. In the delve, strike each off as it is done.',
  'errand.start': 'Start the run', 'errand.more': 'Tick two or more.',
  'errand.none': 'An errand run takes two jobs or more. Nothing else is waiting just now.',
  'errand.today': 'On today', 'errand.list': 'The errands', 'errand.sr': '{job}: take it on the run',
  'errand.set': '{n} errands: {names}',
  'errand.end': 'An errand run of {min}.', 'errand.endNone': 'The errand run is ended.',
  'errand.ask': 'What got done?', 'errand.askSay': 'Strike off each one you did. The rest stay as they are.', 'errand.count': 'Count them',
  'errand.doneRow': 'done · {min}', 'errand.leftRow': 'still to do',
  'errand.carried': 'Nothing was struck off. Every minute moved you on, and each errand keeps its share.',
  'errand.doneSay': '{job} is done.',

  'month.1': 'January', 'month.2': 'February', 'month.3': 'March', 'month.4': 'April', 'month.5': 'May', 'month.6': 'June',
  'month.7': 'July', 'month.8': 'August', 'month.9': 'September', 'month.10': 'October', 'month.11': 'November', 'month.12': 'December',
  'monthShort.1': 'Jan', 'monthShort.2': 'Feb', 'monthShort.3': 'Mar', 'monthShort.4': 'Apr', 'monthShort.5': 'May', 'monthShort.6': 'June',
  'monthShort.7': 'July', 'monthShort.8': 'Aug', 'monthShort.9': 'Sept', 'monthShort.10': 'Oct', 'monthShort.11': 'Nov', 'monthShort.12': 'Dec',

  /* the phone's alerts */
  /* reminders (D-107): only for things Dan gave a time, only if he asked; calm, never "you haven't opened the app" */
  'remind.label': 'Remind me',
  'settings.label': 'Settings',
  'settings.reminders': 'Reminders',
  'settings.reminders.say': 'A reminder comes only for something you gave a time and asked to be reminded of: set it where you set the time, in the week or in your recurring jobs. One alert each, and never to call you back to the app.',
  'settings.reminders.on': 'On', 'settings.reminders.off': 'All off',
  'settings.cal': 'Your calendar',
  'settings.cal.say': 'Shows the events in your phone’s calendar in the week, read-only, and gives a busy day less to do. A Google calendar shows if it is added in the phone’s Settings. Nothing is changed and nothing leaves your phone.',
  'settings.cal.on': 'Show it', 'settings.cal.off': 'Off',
  'settings.cal.refused': 'The phone isn’t letting the app read the calendar. You can allow it in the phone’s Settings, under this app, Calendars: Full Access.',
  'settings.nudge': 'A word after a quiet spell',
  'settings.nudge.say': 'If the app hasn’t been opened for three days, one quiet word at 6 pm. Never more than once a week, and never a count. Off unless you turn it on.',
  'settings.nudge.on': 'On', 'settings.nudge.off': 'Off',
  'nudge.title': 'Long Answer',
  'nudge.body': 'Your place is kept. One small thing is enough, whenever you like.',
  'settings.reminders.refused': 'The phone is not letting the app alert you. You can allow it in the phone’s Settings, under this app’s Notifications.',
  'settings.bedtime': 'A reminder for bed by {time}',
  'settings.bedtime.say': 'Bed by',
  'settings.trial': 'The trial’s own controls',
  'settings.save': 'Your save',
  'settings.save.app': 'Each week a copy is also written to the Files app, under On My iPhone, in Long Answer. The last four are kept.',
  'settings.copy': 'Save a copy',
  'settings.restore': 'Restore from a copy',
  'settings.restore.ask': 'Restore the copy from {date}? It holds {n} done. What you have now is kept aside first, so nothing is lost.',
  'settings.restore.empty': 'Restore this copy? It holds nothing done yet. What you have now is kept aside first, so nothing is lost.',
  'settings.restore.yes': 'Restore it', 'settings.restore.no': 'Cancel',
  'settings.restore.bad': 'That file is not a save this app can read. Nothing was changed.',
  'settings.restore.done': 'The copy is restored.',
  'settings.copy.failed': 'The copy could not be made. Nothing was changed.',
  'jobs.one': '1 job', 'jobs.many': '{n} jobs',
  'remind.off': 'Off', 'remind.at.0': 'At the time', 'remind.at.15': '15 min before', 'remind.at.60': '1 h before',
  'remind.job.0': 'It is {time}, the time you set for it.',
  'remind.job.15': 'In a quarter of an hour, at {time}.',
  'remind.job.60': 'In an hour, at {time}.',
  'remind.bed.title': 'Bed by {time}',
  'remind.bed.0': 'It is the bedtime you chose. Go to sleep is waiting in the app.',
  'remind.bed.15': 'A quarter of an hour to your bedtime. Time to begin winding down.',
  'remind.bed.60': 'An hour to your bedtime.',
  'remind.again': 'Again in 10 min',
  'remind.by.day': 'Today is the day you gave it.', 'remind.by.before': 'Tomorrow is the day you gave it.',
  'remind.date.day': 'On the morning', 'remind.date.before': 'The day before',
  'notify.delveEnd.title': 'The delve is over',
  'notify.delveEnd.body': 'Come back up when you are ready.',
  'notify.breatherEnd.title': 'The next delve is starting',
  'notify.breatherEnd.body': 'Your breather is over.',

  /* the delve's panel on the lock screen and in the Dynamic Island (D-095): read at a glance, so short */
  'panel.paused': 'Your minutes are safe.',
  'panel.away.line': 'You went into another app, so the delve is waiting for you.',
  'panel.breather.line': 'The {ord} delve will begin on its own.',
  'panel.breather.left': 'of the breather',
  'panel.goesOn': 'The run goes on',
  'panel.goesOn.line': 'It goes on by itself, and ends at {end}.',
  'panel.goesOn.left': 'left of the run',

  /* words for numbers and times */
  'min.one': '1 minute', 'min.many': '{n} minutes', 'hour.one': '1 hour', 'hour.many': '{n} hours',
  'min.short': '{n} min', 'hour.short': '{n} h',
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
/** "50 min", "3 h", "1 h 20 min": for a note that must stay on one line */
export function minutesShort(m: number): string {
  if (m < 60) return t('min.short', { n: m });
  const h = Math.floor(m / 60), r = m % 60;
  return t('hour.short', { n: h }) + (r ? ' ' + t('min.short', { n: r }) : '');
}
export const ord = (k: number) => copy[`ord.${Math.min(8, Math.max(1, k))}` as CopyKey];
export const card = (k: number) => copy[`card.${Math.min(8, Math.max(1, k))}` as CopyKey];
export const delves = (n: number) => t(n === 1 ? 'delves.one' : 'delves.many', { n });
/** A place's name inside a sentence: "You reached the Rib Gallery." */
export const inSentence = (name: string) => name.replace(/^The /, 'the ');
/** "Monday", from a game day. */
export const dayName = (day: string) => copy[`day.${new Date(`${day}T00:00:00Z`).getUTCDay()}` as CopyKey];
/** "27 September 2026" */
/** "by Fri 10 Oct": a line's date, in the quiet italic (D-114). */
export function byWords(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  return copy['by.date' as CopyKey].replace('{date}', `${copy[`days.short.${d.getUTCDay()}` as CopyKey]} ${d.getUTCDate()} ${copy[`month.${d.getUTCMonth() + 1}` as CopyKey].slice(0, 3)}`);
}
export function dateWords(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  return `${d.getUTCDate()} ${copy[`month.${d.getUTCMonth() + 1}` as CopyKey]} ${d.getUTCFullYear()}`;
}
/** "once", "twice", "4 times" */
export const timesWords = (n: number) => n === 1 ? copy['daybook.once'] : n === 2 ? copy['daybook.twice'] : t('daybook.many', { n });
/** "a, b and c" */
export function listWords(xs: string[]): string {
  return xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${copy.and} ${xs[xs.length - 1]}`;
}
/** "28 Sept – 4 Oct": a Daybook page's title, short enough for the carved heading on a small phone (D-130) */
export function weekDatesShort(monday: string): string {
  const a = new Date(`${monday}T00:00:00Z`), b = new Date(a.getTime() + 6 * 864e5);
  const m = (d: Date) => copy[`monthShort.${d.getUTCMonth() + 1}` as CopyKey];
  return a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()} – ${b.getUTCDate()} ${m(b)}` : `${a.getUTCDate()} ${m(a)} – ${b.getUTCDate()} ${m(b)}`;
}
/** "21 – 27 September" */
export function weekDates(monday: string): string {
  const a = new Date(`${monday}T00:00:00Z`), b = new Date(a.getTime() + 6 * 864e5);
  const m = (d: Date) => copy[`month.${d.getUTCMonth() + 1}` as CopyKey];
  return a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()} – ${b.getUTCDate()} ${m(b)}` : `${a.getUTCDate()} ${m(a)} – ${b.getUTCDate()} ${m(b)}`;
}
/** "the 1st", "the 31st" (a 31st is the last day of a shorter month) */
export const dayOrd = (n: number) => n >= 31 ? t('rhythms.lastDay') : `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
/** "3 March", from "03-03" */
export const yearWords = (md: string) => new Date(`2000-${md}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
/** How often a recurring job comes round: "4 a week", "Thursdays", "every 3 days"… */
export function oftenWords(r: { days?: number[]; every?: 2; times?: number; everyDays?: number; yearly?: string; monthly?: { day: number } | { nth: number; weekday: number } }): string {
  if (r.monthly) return 'day' in r.monthly ? t('rhythms.monthDay', { n: dayOrd(r.monthly.day) }) : t('rhythms.monthNth', { nth: t(`rhythms.nth.${r.monthly.nth}` as CopyKey), day: t(`day.${r.monthly.weekday}` as CopyKey) });
  if (r.yearly) return t('rhythms.yearly', { date: yearWords(r.yearly) });
  if (r.everyDays) return t('rhythms.everyN', { n: r.everyDays });
  return r.days ? r.days.map(x => t(`days.plural.${x}` as CopyKey)).join(', ') : r.every === 2 ? t('rhythms.every2') : t('rhythms.nWeek', { n: r.times ?? 1 });
}
/** "Thu 2 Oct": a day, short */
export function dayShort(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  return `${copy[`days.short.${d.getUTCDay()}` as CopyKey]} ${d.getUTCDate()} ${copy[`month.${d.getUTCMonth() + 1}` as CopyKey].slice(0, 3)}`;
}
