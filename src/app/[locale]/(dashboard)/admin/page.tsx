'use client';

import { useAuth } from '@/hooks/useAuth';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { getRolesOrderedByLevel, getRoleName } from '@/lib/roles/utils';
import {
  Users,
  Shield,
  UserCog,
  Crown,
  Building2,
  Award,
  Briefcase,
  GraduationCap,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  RefreshCw,
  Save,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { routing } from '@/i18n/routing';

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

interface Stats {
  totalUsers: number;
  totalMembers: number;
  approvedMembers: number;
  pendingMembers: number;
  adminCount: number;
  lastUpdated: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  lastSignInAt: string | null;
  imageUrl: string;
}

export default function AdminPage({ params }: AdminPageProps) {
  const { locale } = useParams();
  const { isAdmin, canAssignRoles, roleId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Real-time data state
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('active');
  const [isSaving, setIsSaving] = useState(false);

  const roles = getRolesOrderedByLevel();

  // Fetch stats and users
  async function fetchData() {
    try {
      setRefreshing(true);

      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleDeleteUser(userId: string) {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Optimistic UI update
        setUsers(users.filter(u => u.id !== userId));
        // Refresh stats in background
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user');
    }
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setNewRole(user.role === 'nouveau_membre' ? 'membre' : user.role);
    setNewStatus(user.status);
  }

  function closeEditModal() {
    setEditingUser(null);
    setNewRole('');
    setNewStatus('active');
    setIsSaving(false);
  }

  async function handleSaveUser() {
    if (!editingUser) return;

    try {
      setIsSaving(true);

      const requests: Promise<Response>[] = [];

      const normalizedEditingRole = editingUser.role === 'nouveau_membre' ? 'membre' : editingUser.role;
      const roleChanged = newRole !== normalizedEditingRole;
      const statusChanged = newStatus !== editingUser.status;

      if (!roleChanged && !statusChanged) {
        closeEditModal();
        return;
      }

      if (roleChanged) {
        requests.push(
          fetch(`/api/admin/users/${editingUser.id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roleId: newRole }),
          })
        );
      }

      if (statusChanged) {
        requests.push(
          fetch(`/api/admin/users/${editingUser.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberStatus: newStatus }),
          })
        );
      }

      if (requests.length === 0) {
        closeEditModal();
        return;
      }

      const results = await Promise.all(requests);
      const failed = results.find((r) => !r.ok);
      if (failed) {
        const error = await failed.json();
        alert(error.error || 'Failed to update user');
        return;
      }

      setUsers(users.map(u =>
        u.id === editingUser.id ? { ...u, role: newRole, status: newStatus } : u
      ));
      closeEditModal();
      fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating the user');
    } finally {
      setIsSaving(false);
    }
  }

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !selectedRole || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (roleId: string) => {
    const icons: Record<string, any> = {
      president: Crown,
      admin_general: Shield,
      chef_pole: Building2,
      mentor_senior: Award,
      mentor: GraduationCap,
      chef_equipe: Briefcase,
      membre_equipe: UserCog,
      membre: Users,
    };
    return icons[roleId] || Users;
  };

  const getRoleColor = (roleId: string) => {
    const colors: Record<string, string> = {
      president: 'text-red-400 bg-red-400/10 border-red-400/20',
      admin_general: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      chef_pole: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      mentor_senior: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      mentor: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      chef_equipe: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
      membre_equipe: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
      membre: 'text-brand-400 bg-blue-400/10 border-blue-400/20',
    };
    return colors[roleId] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  return (
    <PermissionGate
      permission="dashboard.admin"
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-white/20 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-white/60 text-center max-w-md">
            You don&apos;t have permission to access this page. Only administrators can view this section.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
            <p className="text-white/60">
              Gérez les utilisateurs et leurs rôles. {stats && <span className="text-white/40 text-sm">Dernière mise à jour: {new Date(stats.lastUpdated).toLocaleTimeString()}</span>}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-2 border-white/20 border-t-brand-500 rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-brand-400" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Active</p>
                  <p className="text-2xl font-bold text-brand-400">
                    {stats?.approvedMembers || 0}
                  </p>
                </div>
                <Check className="w-8 h-8 text-brand-400" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {stats?.pendingMembers || 0}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Admins</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {stats?.adminCount || 0}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Roles Overview */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Hiérarchie des Rôles</h2>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => {
              const Icon = getRoleIcon(role.id);
              return (
                <div
                  key={role.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getRoleColor(role.id)}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{role.name[locale as 'en' | 'fr'] || role.name.en}</span>
                  <span className="text-xs opacity-60">Lv.{role.level}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users List */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
              />
            </div>
            <select
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(e.target.value || null)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
            >
              <option value="" className="bg-zinc-900">Tous les rôles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id} className="bg-zinc-900">
                  {role.name[locale as 'en' | 'fr'] || role.name.en}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-3 text-white/60 text-sm font-medium">User</th>
                  <th className="pb-3 text-white/60 text-sm font-medium">Rôle</th>
                  <th className="pb-3 text-white/60 text-sm font-medium">Statut</th>
                  <th className="pb-3 text-white/60 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-white/40">
                      {loading ? 'Chargement...' : 'Aucun utilisateur trouvé'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const Icon = getRoleIcon(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                              {user.imageUrl ? (
                                <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <UserCog className="w-5 h-5 text-white/60" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name}</p>
                              <p className="text-white/40 text-sm">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getRoleColor(user.role)}`}>
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {getRoleName(user.role, locale as 'en' | 'fr')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                            ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {user.status === 'active' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {user.status === 'active'
                              ? (locale === 'fr' ? 'Actif' : 'Active')
                              : user.status === 'pending'
                                ? (locale === 'fr' ? 'En essai' : 'Trial')
                                : user.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <PermissionGate permission="admin.roles.assign">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <PermissionGate permission="admin.users.manage">
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </PermissionGate>
                            </div>
                          </PermissionGate>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Modifier l&apos;utilisateur</h3>
                <button onClick={closeEditModal} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    {editingUser.imageUrl ? (
                      <img src={editingUser.imageUrl} alt={editingUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCog className="w-6 h-6 text-white/60" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-lg">{editingUser.name}</h4>
                    <p className="text-white/40 text-sm">{editingUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    {locale === 'fr' ? 'Statut adhésion' : 'Membership status'}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all mb-4"
                  >
                    <option value="pending" className="bg-zinc-900">
                      {locale === 'fr' ? 'En essai' : 'Trial'}
                    </option>
                    <option value="active" className="bg-zinc-900">
                      {locale === 'fr' ? 'Actif (membre validé)' : 'Active (validated)'}
                    </option>
                    <option value="approved" className="bg-zinc-900">
                      {locale === 'fr' ? 'Approuvé' : 'Approved'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Rôle</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id} className="bg-zinc-900">
                        {role.name[locale as 'en' | 'fr'] || role.name.en} (Lv.{role.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveUser}
                    disabled={isSaving || (newRole === editingUser.role && newStatus === editingUser.status)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGate >
  );
}

