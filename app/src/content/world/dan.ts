/**
 * Dan's starting set (PLANNER.md → Dan's starting set; his own numbers, 2026-09-24), preloaded and his to edit
 * when the planner arrives (slice 4). Plus two one-offs from his list (D-030), so an avoided job is there from day 1.
 */
import type { Job, Rhythm } from '../../core/types';

export const jobs: Job[] = [
  { id: 'course', name: 'Course', delve: true, length: 50, doneBy: 'enough', firstStep: 'Open the course and find where you stopped.' },
  { id: 'gym', name: 'Gym, then the sauna', delve: true, length: 60, doneBy: 'enough', firstStep: 'Put your gym shoes on.' },
  { id: 'spanish', name: 'Spanish study', delve: true, length: 60, doneBy: 'enough', firstStep: 'Open the book at the last page you used.' },
  { id: 'lesson', name: 'Spanish lesson', delve: true, length: 60, doneBy: 'enough', firstStep: 'Open the lesson link and sit down with it.' },
  { id: 'cat', name: 'Order the cat’s medication', delve: true, length: 25, doneBy: 'dan', avoided: true, firstStep: 'Open the vet’s page on your laptop.' },
  { id: 'meal', name: 'Meal prep', delve: true, length: 60, doneBy: 'enough', firstStep: 'Take one pan out and put it on the hob.' },
  { id: 'tank', name: 'Tank clean', delve: true, length: 60, doneBy: 'enough', firstStep: 'Fill the bucket.' },
  { id: 'post', name: 'Sort the post', delve: true, length: 25, doneBy: 'dan', avoided: true, firstStep: 'Bring the pile to the table.' },
];

export const rhythms: Rhythm[] = [
  { id: 'r-gym', job: 'gym', times: 4 },
  { id: 'r-spanish', job: 'spanish', times: 2 },
  { id: 'r-lesson', job: 'lesson', days: [4], time: '18:00' },
  { id: 'r-course', job: 'course', times: 4 },
  { id: 'r-tank', job: 'tank', every: 2 },
  { id: 'r-meal', job: 'meal', days: [0] },
];
