import type { ICategory } from './types';

export const CATEGORIES: ICategory[] = [
  {
    id: 'workshop',
    slug: 'workshop',
    name: { en: 'Workshop', fr: 'Workshop' },
    icon: 'Wrench',
    color: 'text-brand-400',
    bgColor: 'bg-blue-400/10',
  },
  {
    id: 'conference',
    slug: 'conference',
    name: { en: 'Conference', fr: 'Conference' },
    icon: 'Mic2',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
  {
    id: 'hackathon',
    slug: 'hackathon',
    name: { en: 'Hackathon', fr: 'Hackathon' },
    icon: 'Code2',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
  },
  {
    id: 'meetup',
    slug: 'meetup',
    name: { en: 'Meetup', fr: 'Meetup' },
    icon: 'Users',
    color: 'text-brand-400',
    bgColor: 'bg-brand-400/10',
  },
  {
    id: 'formation',
    slug: 'formation',
    name: { en: 'Training', fr: 'Formation' },
    icon: 'GraduationCap',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
  },
];
