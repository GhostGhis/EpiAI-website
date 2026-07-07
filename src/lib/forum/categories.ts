import type { ICategory } from './types';

export const CATEGORIES: ICategory[] = [
  {
    id: 'general',
    slug: 'general',
    name: { en: 'General', fr: 'General' },
    description: { en: 'General discussions about the association', fr: 'Discussions generales sur l\'association' },
    icon: 'MessageSquare',
    color: 'text-brand-400',
    threadCount: 0,
  },
  {
    id: 'ia',
    slug: 'ia',
    name: { en: 'AI', fr: 'IA' },
    description: { en: 'Artificial Intelligence discussions', fr: 'Discussions sur l\'Intelligence Artificielle' },
    icon: 'Brain',
    color: 'text-purple-400',
    threadCount: 0,
  },
  {
    id: 'web',
    slug: 'web',
    name: { en: 'Web', fr: 'Web' },
    description: { en: 'Web development topics', fr: 'Sujets de developpement web' },
    icon: 'Globe',
    color: 'text-brand-400',
    threadCount: 0,
  },
  {
    id: 'mobile',
    slug: 'mobile',
    name: { en: 'Mobile', fr: 'Mobile' },
    description: { en: 'Mobile development discussions', fr: 'Discussions sur le developpement mobile' },
    icon: 'Smartphone',
    color: 'text-orange-400',
    threadCount: 0,
  },
  {
    id: 'data',
    slug: 'data',
    name: { en: 'Data', fr: 'Data' },
    description: { en: 'Data Science and Analytics', fr: 'Data Science et Analyses' },
    icon: 'Database',
    color: 'text-cyan-400',
    threadCount: 0,
  },
  {
    id: 'other',
    slug: 'other',
    name: { en: 'Other', fr: 'Autres' },
    description: { en: 'Other topics', fr: 'Autres sujets' },
    icon: 'Folder',
    color: 'text-gray-400',
    threadCount: 0,
  },
];

export const TAGS = [
  { id: 'python', name: 'Python', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', threadCount: 5 },
  { id: 'tensorflow', name: 'TensorFlow', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', threadCount: 3 },
  { id: 'pytorch', name: 'PyTorch', color: 'bg-red-500/20 text-red-400 border-red-500/30', threadCount: 4 },
  { id: 'react', name: 'React', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', threadCount: 2 },
  { id: 'nodejs', name: 'Node.js', color: 'bg-green-500/20 text-green-400 border-green-500/30', threadCount: 1 },
  { id: 'ml', name: 'Machine Learning', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', threadCount: 6 },
  { id: 'dl', name: 'Deep Learning', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', threadCount: 4 },
  { id: 'nlp', name: 'NLP', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', threadCount: 2 },
];
