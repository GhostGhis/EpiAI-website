import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

// Routes protégées (nécessitent une authentification)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/admin(.*)',
  '/settings(.*)',
  '/forum(.*)',
  '/chat(.*)',
  '/events(.*)',
  '/resources(.*)',
  '/intranet(.*)',
  '/my-registrations(.*)',
  '/my-resources(.*)',
  '/attendance(.*)',
  '/api/notifications(.*)',
  '/api/onboarding(.*)',
  '/api/admin/resend-credentials(.*)',
  '/api/dashboard(.*)',
  '/api/profile(.*)',
  '/api/settings(.*)',
  '/api/forum(.*)',
  '/api/resources(.*)',
  '/api/events(.*)',
  '/api/activities(.*)',
  '/api/chat(.*)',
  '/api/stats(.*)',
  '/api/users(.*)',
  '/api/admin/bulk-invite(.*)',
  '/(fr|en)/dashboard(.*)',
  '/(fr|en)/profile(.*)',
  '/(fr|en)/admin(.*)',
  '/(fr|en)/settings(.*)',
  '/(fr|en)/forum(.*)',
  '/(fr|en)/chat(.*)',
  '/(fr|en)/events(.*)',
  '/(fr|en)/resources(.*)',
  '/(fr|en)/intranet(.*)',
  '/(fr|en)/my-registrations(.*)',
  '/(fr|en)/my-resources(.*)',
  '/(fr|en)/attendance(.*)',
  '/(fr|en)/change-password(.*)',
]);

// Routes publiques (accessibles sans auth)
const isPublicRoute = createRouteMatcher([
  '/',
  '/join',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/setup-admin',
  '/forgot-password',
  '/reset-password',
  '/api/webhooks(.*)',
  '/api/admin/invite(.*)', // Public pour la création du premier admin
  '/api/team-members(.*)',
  '/(fr|en)',
  '/(fr|en)/join',
  '/(fr|en)/membership',
  '/(fr|en)/sign-in(.*)',
  '/(fr|en)/sign-up(.*)',
  '/(fr|en)/setup-admin',
  '/(fr|en)/forgot-password',
  '/(fr|en)/reset-password',
  '/(fr|en)/change-password',
  '/(fr|en)/verify-email',
  '/(fr|en)/blog(.*)',
  '/(fr|en)/projects(.*)',
  '/(fr|en)/team(.*)',
  '/(fr|en)/about(.*)',
  '/(fr|en)/calendar(.*)',
  '/(fr|en)/partners(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Exclure les fichiers statiques (assets, images, uploads, etc.)
  const pathname = req.nextUrl.pathname;
  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/uploads/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|pdf|docx?|xlsx?|pptx?|zip|rar|gz|tar|mp4|webm|mp3|wav|csv|json|xml|txt)$/)
  ) {
    return;
  }

  // Routes publiques ne nécessitent pas d'authentification
  if (isPublicRoute(req)) {
    // For routes that need i18n (page routes, not API routes)
    if (!pathname.startsWith('/api')) {
      const response = createMiddleware(routing)(req);
      response.headers.set('x-pathname', pathname);
      return response;
    }
    return;
  }

  // Protection des routes si nécessaire
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // For routes that need i18n (page routes, not API routes)
  if (!pathname.startsWith('/api')) {
    const response = createMiddleware(routing)(req);
    response.headers.set('x-pathname', pathname);
    return response;
  }

  // For API routes, inject x-pathname header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}, {
  // Configurer Clerk pour inclure publicMetadata dans le session token
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
});

export const config = {
  matcher: [
    // Match everything except:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - static files in public folder are handled in the middleware function
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
