'use client';

import { useAuth } from '@/hooks/useAuth';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { getRolesOrderedByLevel, getRoleName } from '@/lib/roles/utils';
import { getRoleChipClass } from '@/lib/ui/role-styles';
import { cn } from '@/lib/utils/cn';
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
  Edit,
  Trash2,
  Check,
  Clock,
  RefreshCw,
  Save,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  PageHeader,
  StatCard,
  Panel,
  Modal,
  FilterBar,
  Input,
  Select,
  Button,
  Badge,
  DataTable,
  DataTableHead,
  DataTableHeadRow,
  DataTableTh,
  DataTableBody,
  DataTableRow,
  DataTableTd,
} from '@/components/ui';

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

  return (
    <PermissionGate
      permission="dashboard.admin"
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-muted mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">Access Denied</h2>
          <p className="text-secondary text-center max-w-md">
            You don&apos;t have permission to access this page. Only administrators can view this section.
          </p>
        </div>
      }
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Admin"
          title="Administration"
          description={
            stats
              ? `Gestion des utilisateurs · MAJ ${new Date(stats.lastUpdated).toLocaleTimeString()}`
              : 'Gestion des utilisateurs et des rôles'
          }
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchData}
              disabled={refreshing}
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          }
        />

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <StatCard key={i} label="" value="" loading />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} />
            <StatCard label="Active" value={stats?.approvedMembers || 0} icon={Check} />
            <StatCard
              label="Pending"
              value={stats?.pendingMembers || 0}
              icon={Clock}
              iconClassName="text-amber-700"
              iconBgClassName="bg-amber-500/10"
            />
            <StatCard label="Admins" value={stats?.adminCount || 0} icon={Shield} />
          </div>
        )}

        <Panel
          title="Hiérarchie des rôles"
          description="Niveaux d'accès de l'association"
          noPadding
          bodyClassName="px-5 py-4"
        >
          <div className="flex flex-wrap gap-1.5">
            {roles.map((role) => {
              const Icon = getRoleIcon(role.id);
              return (
                <span
                  key={role.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium',
                    getRoleChipClass(role.level)
                  )}
                >
                  <Icon className="w-3 h-3 opacity-70" />
                  <span>{role.name[locale as 'en' | 'fr'] || role.name.en}</span>
                  <span className="text-[10px] opacity-50 tabular-nums">L{role.level}</span>
                </span>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Utilisateurs"
          description={`${filteredUsers.length} résultat${filteredUsers.length !== 1 ? 's' : ''}`}
          noPadding
          actions={
            <FilterBar>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                <Input
                  placeholder="Rechercher…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Select
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value || null)}
                className="sm:w-40 h-9 text-sm"
              >
                <option value="">Tous les rôles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name[locale as 'en' | 'fr'] || role.name.en}
                  </option>
                ))}
              </Select>
            </FilterBar>
          }
          bodyClassName="p-0"
        >
          <DataTable>
            <DataTableHead>
              <DataTableHeadRow>
                <DataTableTh>Utilisateur</DataTableTh>
                <DataTableTh>Rôle</DataTableTh>
                <DataTableTh>Statut</DataTableTh>
                <DataTableTh className="w-20 text-right">Actions</DataTableTh>
              </DataTableHeadRow>
            </DataTableHead>
            <DataTableBody>
              {filteredUsers.length === 0 ? (
                <DataTableRow>
                  <DataTableTd colSpan={4} className="py-10 text-center text-muted">
                    {loading ? 'Chargement…' : 'Aucun utilisateur trouvé'}
                  </DataTableTd>
                </DataTableRow>
              ) : (
                filteredUsers.map((user) => {
                  const Icon = getRoleIcon(user.role);
                  const roleMeta = roles.find((r) => r.id === user.role);
                  const level = roleMeta?.level ?? 1;
                  return (
                    <DataTableRow key={user.id}>
                      <DataTableTd>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-card-muted flex items-center justify-center overflow-hidden ring-1 ring-default shrink-0">
                            {user.imageUrl ? (
                              <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserCog className="w-4 h-4 text-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-primary font-medium text-sm truncate">{user.name}</p>
                            <p className="text-muted text-xs truncate">{user.email}</p>
                          </div>
                        </div>
                      </DataTableTd>
                      <DataTableTd>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium',
                            getRoleChipClass(level)
                          )}
                        >
                          <Icon className="w-3 h-3 opacity-70" />
                          {getRoleName(user.role, locale as 'en' | 'fr')}
                        </span>
                      </DataTableTd>
                      <DataTableTd>
                        <Badge variant={user.status === 'active' ? 'brand' : 'amber'}>
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
                        </Badge>
                      </DataTableTd>
                      <DataTableTd className="text-right">
                        <PermissionGate permission="admin.roles.assign">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded-md hover:bg-card-muted text-muted hover:text-primary transition-colors"
                              aria-label="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <PermissionGate permission="admin.users.manage">
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 rounded-md hover:bg-red-500/10 text-muted hover:text-red-600 transition-colors"
                                aria-label="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </PermissionGate>
                          </div>
                        </PermissionGate>
                      </DataTableTd>
                    </DataTableRow>
                  );
                })
              )}
            </DataTableBody>
          </DataTable>
        </Panel>

        <Modal
          open={!!editingUser}
          onClose={closeEditModal}
          title="Modifier l'utilisateur"
          footer={
            <>
              <Button variant="secondary" onClick={closeEditModal}>
                Annuler
              </Button>
              <Button
                onClick={handleSaveUser}
                disabled={
                  isSaving ||
                  (!!editingUser && newRole === editingUser.role && newStatus === editingUser.status)
                }
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
              </Button>
            </>
          }
        >
          {editingUser ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-card-muted flex items-center justify-center overflow-hidden">
                  {editingUser.imageUrl ? (
                    <img src={editingUser.imageUrl} alt={editingUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCog className="w-6 h-6 text-secondary" />
                  )}
                </div>
                <div>
                  <h4 className="text-primary font-medium text-lg">{editingUser.name}</h4>
                  <p className="text-muted text-sm">{editingUser.email}</p>
                </div>
              </div>

              <Select
                label={locale === 'fr' ? 'Statut adhésion' : 'Membership status'}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pending">{locale === 'fr' ? 'En essai' : 'Trial'}</option>
                <option value="active">{locale === 'fr' ? 'Actif (membre validé)' : 'Active (validated)'}</option>
                <option value="approved">{locale === 'fr' ? 'Approuvé' : 'Approved'}</option>
              </Select>

              <Select label="Rôle" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name[locale as 'en' | 'fr'] || role.name.en} (Lv.{role.level})
                  </option>
                ))}
              </Select>
            </>
          ) : null}
        </Modal>
      </div>
    </PermissionGate>
  );
}

