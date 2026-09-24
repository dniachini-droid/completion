/** What the app carries: Dan's starting set and the story. */
import type { Content } from '../../core/types';
import { jobs, rhythms } from './dan';
import { story } from '../sealed';

export const content: Content = { version: 'mvp-1', jobs, rhythms, story };
