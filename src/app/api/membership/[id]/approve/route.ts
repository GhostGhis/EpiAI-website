import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { getApplicationById, reviewApplication } from '@/lib/membership/repository';
import { sendWelcomeEmail, sendMembershipRejectedEmail } from '@/lib/email/resend';
import { upsertUserFromClerk } from '@/lib/users/repository';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications/service';
import type { ReviewApplicationInput } from '@/lib/membership/types';
import { randomBytes } from 'crypto';

// Générer un mot de passe sécurisé aléatoire
function generateSecurePassword(): string {
  return randomBytes(12).toString('base64url').slice(0, 16) + '!A1';
}

// POST /api/membership/[id]/approve - Approuver une candidature
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier permission côté serveur
    const permCheck = await checkUserPermission('membership.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }
    const reviewerId = permCheck.userId;

    const { id } = await params;
    const body: ReviewApplicationInput = await request.json();

    // Récupérer la candidature
    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      );
    }

    if (body.status === 'approved') {
      console.log('[Approve API] Creating Clerk account for:', application.email);

      // Générer un mot de passe sécurisé unique
      const generatedPassword = generateSecurePassword();

      // Créer le compte Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.createUser({
        emailAddress: [application.email],
        password: generatedPassword,
        firstName: application.firstName,
        lastName: application.lastName,
        skipPasswordChecks: true,
        publicMetadata: {
          roleId: 1,
          role: 'membre',
          approvedAt: new Date().toISOString(),
          mustResetPassword: true,
        },
      });

      console.log('[Approve API] Clerk account created:', clerkUser.id);

      await upsertUserFromClerk({
        clerkId: clerkUser.id,
        email: application.email,
        firstName: application.firstName,
        lastName: application.lastName,
        role: 'membre',
        roleLevel: 1,
      });

      await prisma.user.update({
        where: { clerkId: clerkUser.id },
        data: { memberStatus: 'pending' },
      }).catch(() => {});

      console.log('[Approve API] Sending welcome email to:', application.email);

      // Envoyer l'email de bienvenu
      let emailSentSuccessfully = false;
      let emailError: string | null = null;

      if (!process.env.RESEND_API_KEY) {
        emailError = 'RESEND_API_KEY manquante sur le serveur (Vercel → Environment Variables)';
      } else {
        try {
          await sendWelcomeEmail({
            email: application.email,
            firstName: application.firstName,
            password: generatedPassword,
          });
          emailSentSuccessfully = true;
        } catch (err: unknown) {
          emailError = err instanceof Error ? err.message : 'Échec envoi email';
          console.error('[Approve API] Failed to send welcome email:', err);
        }
      }

      // Mettre à jour le statut
      await reviewApplication(id, body, reviewerId);

      await notifyUser({
        clerkId: clerkUser.id,
        type: 'membership',
        title: 'Bienvenue chez Epi\'AI',
        message: 'Ta candidature a été approuvée. Explore le dashboard !',
        link: '/dashboard',
      });

      console.log('[Approve API] Application approved successfully');

      return NextResponse.json({
        success: true,
        message: 'Application approved and account created',
        accountId: clerkUser.id,
        emailSent: emailSentSuccessfully,
        emailError,
        credentials: emailSentSuccessfully ? null : {
          email: application.email,
          password: generatedPassword,
          note: emailError || 'Email failed to send. User must use these credentials to log in.',
        },
      });
    } else {
      await reviewApplication(id, body, reviewerId);

      try {
        await sendMembershipRejectedEmail(application.email, application.firstName);
      } catch (emailErr) {
        console.error('Rejection email failed:', emailErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Application rejected',
      });
    }
  } catch (error: any) {
    console.error('Error reviewing application:', error);

    // Handle Clerk errors
    if (error.errors) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Clerk error' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to review application' },
      { status: 500 }
    );
  }
}
