'use client';

import { useAuth } from '@/hooks/useAuth';
import { getRoleName, getRoleLevel } from '@/lib/roles/utils';
import { getRoleChipClass } from '@/lib/ui/role-styles';
import { useParams } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { userButtonProps } from '@/lib/clerk/user-button';
import { Link } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Building2,
  Users,
  BadgeCheck,
  Camera,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageHeader, Panel, Badge } from '@/components/ui';

export default function ProfilePage() {
  const params = useParams();
  const locale = (params.locale as string) || routing.defaultLocale;
  const { userId, roleId, role, isAdmin } = useAuth();
  const { user, isLoaded } = useUser();
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const roleName = roleId ? getRoleName(roleId, locale as 'en' | 'fr') : 'Member';
  const roleLevel = roleId ? getRoleLevel(roleId) : 1;

  // Fetch member data from API
  useEffect(() => {
    async function fetchMemberData() {
      if (!userId) return;

      try {
        const response = await fetch(`/api/members/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setMemberData(data);
        }
      } catch (error) {
        console.error('Error fetching member data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && userId) {
      fetchMemberData();
    }
  }, [userId, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-default border-t-brand-500 rounded-full mx-auto mb-4" />
          <p className="text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userName = user?.firstName || user?.username || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';
  const userEmail = user?.emailAddresses[0]?.emailAddress || 'No email';
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  return (
    <div className="space-y-5 max-w-4xl">
        <PageHeader
          title="Profile"
          description={
            locale === 'fr'
              ? 'Gérez vos informations personnelles et vos préférences.'
              : 'Manage your personal information and preferences.'
          }
        />

        <Panel>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={userName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-default"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-card-muted border border-default flex items-center justify-center">
                  <User className="w-10 h-10 text-secondary" />
                </div>
              )}

              {/* Change Photo Button */}
              <Link
                href="/settings"
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
              >
                <div className="text-center">
                  <Camera className="w-6 h-6 text-primary mx-auto mb-1" />
                  <span className="text-primary text-xs font-medium">
                    {locale === 'fr' ? 'Modifier' : 'Edit'}
                  </span>
                </div>
              </Link>

              <div className="absolute -bottom-2 -right-2">
                <UserButton
                  {...userButtonProps(locale)}
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10 rounded-full border-2 border-zinc-900',
                    },
                  }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                    {userName}
                    {user?.emailAddresses[0]?.verification?.status === 'verified' && (
                      <BadgeCheck className="w-5 h-5 text-brand-400" />
                    )}
                  </h2>
                  <p className="text-secondary">{userEmail}</p>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border ${getRoleChipClass(roleLevel)}`}>
                  <Shield className="w-4 h-4" />
                  <span>{roleName}</span>
                </span>
                <span className="text-muted text-sm">
                  Level {roleLevel}
                </span>
                {isAdmin && (
                  <Badge variant="amber">Administrator</Badge>
                )}
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Panel
            title={locale === 'fr' ? 'Informations Personnelles' : 'Personal Information'}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-muted text-xs uppercase tracking-wide">Email</p>
                  <p className="text-primary">{userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-muted text-xs uppercase tracking-wide">
                    {locale === 'fr' ? 'Membre depuis' : 'Member since'}
                  </p>
                  <p className="text-primary">{joinedDate}</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            title={locale === 'fr' ? 'Équipe & Pôle' : 'Team & Department'}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-muted text-xs uppercase tracking-wide">
                    {locale === 'fr' ? 'Pôle' : 'Department'}
                  </p>
                  <p className="text-primary">{memberData?.pole || 'Not assigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-muted text-xs uppercase tracking-wide">
                    {locale === 'fr' ? 'Équipe' : 'Team'}
                  </p>
                  <p className="text-primary">{memberData?.team || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {role && role.permissions && role.permissions.length > 0 ? (
          <Panel title="Permissions">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {role.permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card text-secondary text-sm"
                >
                  <Shield className="w-4 h-4 text-brand-400" />
                  <span className="capitalize">{permission.replace('.', ': ')}</span>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        <Link
          href="/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card text-primary border border-default hover:bg-card-muted transition-colors text-sm font-semibold shadow-sm"
        >
          <Settings className="w-4 h-4" />
          {locale === 'fr' ? 'Gérer mon compte Clerk' : 'Manage Clerk account'}
        </Link>
      </div>
  );
}
