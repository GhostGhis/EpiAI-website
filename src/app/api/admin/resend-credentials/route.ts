import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { randomBytes } from 'crypto';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { sendWelcomeEmail } from '@/lib/email/resend';

function generateSecurePassword(): string {
  return randomBytes(12).toString('base64url').slice(0, 16) + '!A1';
}

/** POST /api/admin/resend-credentials — regénère le mot de passe et renvoie l'email de bienvenue */
export async function POST(request: NextRequest) {
  try {
    const permCheck = await checkUserPermission('membership.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const client = await clerkClient();

    const users = await client.users.getUserList({ emailAddress: [normalizedEmail], limit: 1 });
    const user = users.data[0];
    if (!user) {
      return NextResponse.json({ error: 'Aucun compte Clerk pour cet email' }, { status: 404 });
    }

    const newPassword = generateSecurePassword();
    await client.users.updateUser(user.id, {
      password: newPassword,
      publicMetadata: {
        ...((user.publicMetadata as Record<string, unknown>) || {}),
        mustResetPassword: true,
      },
    });

    let emailSent = false;
    try {
      await sendWelcomeEmail({
        email: normalizedEmail,
        firstName: user.firstName || 'Membre',
        password: newPassword,
      });
      emailSent = true;
    } catch (emailError) {
      console.error('[Resend credentials] Email failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      emailSent,
      credentials: emailSent
        ? null
        : {
            email: normalizedEmail,
            password: newPassword,
            note: "Email non envoyé — transmets ces identifiants manuellement (WhatsApp, etc.)",
          },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('[Resend credentials]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
