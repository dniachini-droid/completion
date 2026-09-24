/**
 * Throwaway content for the Phase 8 prototype (D-060): invented places, not the story.
 * The places are the painting kit's three samples (D-062). The jobs are a stand-in for Dan's own list
 * (PLANNER.md → Dan's starting set); editing them arrives with the planner (MVP slice 4).
 * Nothing here is story; nothing here is kept after the prototype.
 */
import type { Content } from '../../core/types';

export const prototype: Content = {
  version: 'proto-1',
  jobs: [
    { id: 'cat', name: 'Order the cat’s medication', delve: true, length: 25, doneBy: 'dan', avoided: true, firstStep: 'Open the vet’s page on your phone.' },
    { id: 'course', name: 'Course', delve: true, length: 180, enoughAt: 50, doneBy: 'enough', firstStep: 'Open the course and find where you stopped.' },
    { id: 'gym', name: 'Gym, then the sauna', delve: false, length: 60, doneBy: 'dan', firstStep: 'Put your gym shoes on.' },
    { id: 'spanish', name: 'Spanish study', delve: true, length: 60, doneBy: 'enough', firstStep: 'Open the book at the last page you used.' },
    { id: 'meal', name: 'Meal prep', delve: false, length: 60, doneBy: 'dan', firstStep: 'Take one pan out and put it on the hob.' },
    { id: 'post', name: 'Sort the post', delve: true, length: 25, doneBy: 'dan', avoided: true, firstStep: 'Bring the pile to the table.' },
    { id: 'tank', name: 'Tank clean', delve: false, length: 60, doneBy: 'dan', firstStep: 'Fill the bucket.' },
  ],
  route: [
    { id: 'sample-well-stair', name: 'The Well Stair', line: 'The stair goes down round the wall, into the light.',
      ahead: 'A gallery opens off the bottom step. Water sounds in it.', painting: 'sample-well-stair', at: 0 },
    { id: 'sample-rib-gallery', name: 'The Rib Gallery', line: 'Water runs down the middle, towards the crack of light.',
      ahead: 'Past the crack, a dome. Light comes from above.', painting: 'sample-rib-gallery', at: 75 },
    { id: 'sample-pool-dome', name: 'The Pool Dome', line: 'Light falls through the crown into the still pool.',
      ahead: 'The pool is deeper than it looks.', painting: 'sample-pool-dome', at: 275 },
  ],
  camps: [
    { id: 'camp-ledge', name: 'A ledge on the way', look: 'A cup cut into the wall, just big enough for a lamp.' },
    { id: 'camp-niche', name: 'A dry niche', look: 'Someone swept this floor, a long time ago.' },
    { id: 'camp-turn', name: 'A turn in the passage', look: 'The air moves here. There’s a draught from further down.' },
  ],
  passages: [
    'The passage opens out ahead.',
    'The floor slopes gently down.',
    'Old steps, worn in the middle.',
    'A draught, cool, from further in.',
    'The walls close in, then widen again.',
    'Water somewhere, out of sight.',
  ],
  teasers: [
    'There’s a sound behind the next wall, like water over stone.',
    'The next stretch is lit from somewhere you can’t see yet.',
    'A step further down, the passage turns. Something catches the light there.',
  ],
};
