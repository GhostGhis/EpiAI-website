export type FaqId =
  | 'about'
  | 'join'
  | 'poles'
  | 'events'
  | 'resources'
  | 'dashboard'
  | 'membership_status'
  | 'contact'
  | 'chat_forum'
  | 'roles'
  | 'partners'
  | 'attendance';

export interface FaqEntry {
  id: FaqId;
  /** Full question phrases (normalized matching). */
  variants: string[];
  /** Short trigger tokens — only matched as whole words or substrings ≥ 4 chars. */
  keywords: string[];
  priority?: number;
}

/** Curated FAQ catalog — answers live in i18n (`Chatbot.faq.{id}`). No LLM, no invented text. */
export const FAQ_CATALOG: FaqEntry[] = [
  {
    id: 'about',
    variants: [
      "c'est quoi epiai",
      "qu'est ce que epiai",
      "qui est epiai",
      "presentation de l association",
      "what is epiai",
      "who is epiai",
      "tell me about epiai",
    ],
    keywords: ['epiai', 'association', 'asso', 'campus', 'epitech', 'ia', 'intelligence'],
    priority: 1,
  },
  {
    id: 'join',
    variants: [
      'comment rejoindre',
      'comment aderer',
      "comment s inscrire",
      'comment devenir membre',
      'how to join',
      'how do i join',
      'become a member',
    ],
    keywords: ['rejoindre', 'adherer', 'adhesion', 'join', 'candidat', 'inscri', 'membre'],
    priority: 3,
  },
  {
    id: 'poles',
    variants: [
      'quels sont les poles',
      'liste des poles',
      'organigramme des poles',
      'what are the poles',
      'list of poles',
    ],
    keywords: ['pole', 'poles', 'formation', 'tech', 'recherche', 'communication', 'administration'],
    priority: 2,
  },
  {
    id: 'events',
    variants: [
      'quels evenements',
      'prochains evenements',
      'comment s inscrire a un evenement',
      'upcoming events',
      'how to register for an event',
    ],
    keywords: ['evenement', 'event', 'hackathon', 'workshop', 'conference', 'calendrier'],
    priority: 2,
  },
  {
    id: 'resources',
    variants: [
      'ou sont les ressources',
      'acceder aux cours',
      'bibliotheque pedagogique',
      'learning resources',
      'where are the resources',
    ],
    keywords: ['ressource', 'resource', 'cours', 'course', 'pdf', 'video', 'apprendre', 'learn'],
    priority: 2,
  },
  {
    id: 'dashboard',
    variants: [
      'espace membre',
      'acceder au dashboard',
      'comment me connecter',
      'member area',
      'how to log in',
      'access the platform',
    ],
    keywords: ['dashboard', 'espace', 'connexion', 'login', 'compte', 'plateforme', 'intranet'],
    priority: 2,
  },
  {
    id: 'membership_status',
    variants: [
      'statut de mon adhesion',
      'periode d essai',
      'membre en attente',
      'membership status',
      'trial period',
      'pending member',
    ],
    keywords: ['statut', 'essai', 'pending', 'active', 'approve', 'validation', 'adhesion'],
    priority: 2,
  },
  {
    id: 'contact',
    variants: [
      'comment vous contacter',
      'nous contacter',
      'contactez l equipe',
      'how to contact',
      'get in touch',
    ],
    keywords: ['contact', 'email', 'whatsapp', 'equipe', 'team', 'ecrire'],
    priority: 2,
  },
  {
    id: 'chat_forum',
    variants: [
      'difference chat forum',
      'a quoi sert le chat',
      'comment utiliser le forum',
      'chat vs forum',
      'how to use the forum',
    ],
    keywords: ['chat', 'forum', 'discussion', 'message', 'canal', 'channel'],
    priority: 1,
  },
  {
    id: 'roles',
    variants: [
      'quels sont les roles',
      'hierarchie des roles',
      'qui est le president',
      'what are the roles',
      'role hierarchy',
    ],
    keywords: ['role', 'roles', 'president', 'bureau', 'admin', 'membre', 'mentor'],
    priority: 1,
  },
  {
    id: 'partners',
    variants: [
      'partenaires de l association',
      'entreprises partenaires',
      'association partners',
      'partner companies',
    ],
    keywords: ['partenaire', 'partner', 'sponsor', 'entreprise', 'company'],
    priority: 1,
  },
  {
    id: 'attendance',
    variants: [
      'comment marquer ma presence',
      'feuille de presence',
      'assiduite evenements',
      'mark my attendance',
      'attendance sheet',
    ],
    keywords: ['presence', 'attendance', 'assiduite', 'feuille', 'emargement'],
    priority: 1,
  },
];

export const FAQ_CHIP_IDS: FaqId[] = [
  'join',
  'poles',
  'events',
  'resources',
  'dashboard',
  'contact',
];
