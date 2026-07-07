import type { RoleDefinition } from './types';

/** Adhérent asso (hors bureau) — consommation & participation, pas de publication éditoriale. */
const MEMBER_PERMISSIONS = ['dashboard.access', 'profile.edit', 'content.edit.own'] as const;

/** Contributeurs de pôle / équipe — peuvent ouvrir des discussions et proposer du contenu. */
const POLE_TEAM_PERMISSIONS = [...MEMBER_PERMISSIONS, 'content.create'] as const;

export const ROLES: Record<string, RoleDefinition> = {
  membre: {
    id: 'membre',
    name: { en: 'Member', fr: 'Membre' },
    level: 1,
    permissions: [...MEMBER_PERMISSIONS],
    color: 'text-brand-400',
    icon: 'Users',
  },
  membre_equipe: {
    id: 'membre_equipe',
    name: { en: 'Team Member', fr: 'Membre d\'Équipe' },
    level: 2,
    permissions: [...POLE_TEAM_PERMISSIONS],
    color: 'text-cyan-400',
    icon: 'UserCog',
  },
  chef_equipe: {
    id: 'chef_equipe',
    name: { en: 'Team Lead', fr: 'Chef d\'Équipe' },
    level: 3,
    permissions: [...POLE_TEAM_PERMISSIONS],
    color: 'text-teal-400',
    icon: 'Briefcase',
  },
  mentor: {
    id: 'mentor',
    name: { en: 'Mentor', fr: 'Mentor' },
    level: 4,
    permissions: ['dashboard.access', 'content.create', 'content.edit.own', 'profile.edit', 'resources.create', 'resources.manage'],
    color: 'text-indigo-400',
    icon: 'GraduationCap',
  },
  mentor_senior: {
    id: 'mentor_senior',
    name: { en: 'Senior Mentor', fr: 'Mentor Senior' },
    level: 5,
    permissions: ['dashboard.access', 'content.create', 'content.edit.own', 'content.edit.all', 'profile.edit', 'resources.create', 'resources.manage'],
    color: 'text-purple-400',
    icon: 'Award',
  },
  logistique: {
    id: 'logistique',
    name: { en: 'Logistics', fr: 'Logistique' },
    level: 6,
    permissions: ['dashboard.access', 'dashboard.admin', 'content.create', 'content.edit.all', 'profile.edit', 'resources.create', 'resources.manage', 'activities.create', 'activities.manage'],
    color: 'text-lime-400',
    icon: 'Truck',
  },
  chef_pole: {
    id: 'chef_pole',
    name: { en: 'Pole Lead', fr: 'Chef de Pôle' },
    level: 7,
    permissions: ['dashboard.access', 'dashboard.admin', 'content.create', 'content.edit.all', 'profile.edit', 'admin.roles.assign', 'membership.manage', 'resources.create', 'resources.manage', 'activities.create', 'activities.manage'],
    color: 'text-amber-400',
    icon: 'Building2',
  },
  admin_general: {
    id: 'admin_general',
    name: { en: 'General Admin', fr: 'Admin Général' },
    level: 8,
    permissions: ['dashboard.access', 'dashboard.admin', 'admin.roles.assign', 'admin.users.manage', 'content.create', 'content.edit.all', 'profile.edit', 'profile.edit.others', 'membership.manage', 'resources.create', 'resources.manage', 'activities.create', 'activities.manage', 'attendance.manage', 'team.manage'],
    color: 'text-orange-500',
    icon: 'Shield',
  },
  president: {
    id: 'president',
    name: { en: 'President', fr: 'Président' },
    level: 9,
    permissions: ['admin.users.manage', 'admin.roles.assign', 'dashboard.access', 'dashboard.admin', 'content.create', 'content.edit.all', 'profile.edit', 'profile.edit.others', 'membership.manage', 'resources.create', 'resources.manage', 'activities.create', 'activities.manage', 'attendance.manage', 'team.manage'],
    color: 'text-red-500',
    icon: 'Crown',
  },
};

/** Anciens slugs → rôle actuel (rétrocompatibilité Clerk / DB). */
export const LEGACY_ROLE_ALIASES: Record<string, keyof typeof ROLES> = {
  nouveau_membre: 'membre',
};

export const DEFAULT_ROLE = 'membre';

export const ROLES_WITH_ASSIGN_PERMISSION = ['president', 'admin_general', 'chef_pole'];

export const ADMIN_ROLES = ['president', 'admin_general', 'chef_pole', 'logistique'];

export function getDefaultRole(): RoleDefinition {
  return ROLES[DEFAULT_ROLE];
}

export function isValidRole(roleId: string): roleId is keyof typeof ROLES {
  return roleId in ROLES;
}
