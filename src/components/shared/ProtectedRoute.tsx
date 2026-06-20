'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import type { Permission, RoleId } from '@/lib/roles/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: RoleId[];
  requiredMinimumRoleLevel?: number;
  redirectToSignIn?: boolean;
  className?: string;
}

/**
 * Composant pour protéger les routes.
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté.
 * Peut aussi vérifier les permissions et rôles.
 */
export function ProtectedRoute({
  children,
  fallback,
  requiredPermission,
  requiredRole,
  requiredMinimumRoleLevel,
  redirectToSignIn = true,
  className,
}: ProtectedRouteProps) {
  const { isSignedIn, hasPermission, roleId, roleLevel, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'fr';

  const isAuthenticated = isSignedIn;
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true;
  const hasRequiredRole = requiredRole && roleId ? requiredRole.includes(roleId as RoleId) : true;
  const hasMinimumRoleLevel =
    requiredMinimumRoleLevel !== undefined ? roleLevel >= requiredMinimumRoleLevel : true;

  const isAllowed =
    isAuthenticated && hasRequiredPermission && hasRequiredRole && hasMinimumRoleLevel;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectToSignIn && !fallback) {
      router.push(`/${locale}/sign-in?redirect_url=${encodeURIComponent(`/${locale}${pathname}`)}`);
    }
  }, [isLoading, isAuthenticated, redirectToSignIn, fallback, router, locale, pathname]);

  if (isLoading) {
    return (
      fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
        </div>
      )
    );
  }

  if (!isAllowed) {
    if (!isAuthenticated && redirectToSignIn && !fallback) {
      return null;
    }
    return <>{fallback}</>;
  }

  return <div className={cn('', className)}>{children}</div>;
}
