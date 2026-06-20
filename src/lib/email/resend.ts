import { Resend } from 'resend';
import { logger } from '@/lib/logger';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/** Expéditeur — doit être un domaine vérifié dans Resend (ou onboarding@resend.dev en test). */
export function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "Epi'AI <onboarding@resend.dev>";
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002').replace(/\/$/, '');
}

function ensureResend() {
  const client = getResendClient();
  if (!client) {
    throw new Error('RESEND_API_KEY manquant — configure la variable sur Vercel');
  }
  return client;
}

interface WelcomeEmailParams {
  email: string;
  firstName: string;
  password: string;
}

export async function sendWelcomeEmail({ email, firstName, password }: WelcomeEmailParams) {
  const resend = ensureResend();
  const signInUrl = `${getSiteUrl()}/fr/sign-in`;

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: [email],
    subject: 'Bienvenue chez Epi\'AI - Tes identifiants de connexion',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <tr>
              <td style="background-color: #18181b; border-radius: 12px 12px 0 0; padding: 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Epi'AI</h1>
                <p style="color: #a1a1aa; margin: 10px 0 0 0;">Scientific Excellence at Epitech</p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #27272a; padding: 40px;">
                <h2 style="color: #ffffff; margin: 0 0 20px 0;">Bienvenue, ${firstName} !</h2>
                <p style="color: #d4d4d8; line-height: 1.6; margin: 0 0 20px 0;">
                  Ta candidature a été approuvée par l'équipe Epi'AI. Tu fais maintenant partie de notre communauté !
                </p>

                <div style="background-color: #18181b; border-radius: 8px; padding: 24px; margin: 24px 0;">
                  <p style="color: #a1a1aa; margin: 0 0 12px 0; font-size: 14px;">Voici tes identifiants de connexion :</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="color: #d4d4d8; padding: 8px 0; border-bottom: 1px solid #3f3f46;">
                        <strong>Email :</strong> ${email}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #d4d4d8; padding: 8px 0;">
                        <strong>Mot de passe :</strong> ${password}
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="color: #fbbf24; line-height: 1.6; margin: 0 0 20px 0;">
                  ⚠️ <strong>Important :</strong> Tu devras changer ton mot de passe lors de ta première connexion.
                </p>

                <a href="${signInUrl}"
                   style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin-top: 16px;">
                  Se connecter
                </a>
              </td>
            </tr>
            <tr>
              <td style="background-color: #18181b; border-radius: 0 0 12px 12px; padding: 30px; text-align: center;">
                <p style="color: #71717a; font-size: 14px; margin: 0;">
                  Epi'AI - L'excellence scientifique au cœur d'Epitech
                </p>
                <p style="color: #52525b; font-size: 12px; margin: 10px 0 0 0;">
                  © ${new Date().getFullYear()} Epi'AI. Tous droits réservés.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    throw error;
  }

  return data;
}

export async function sendApplicationReceivedEmail(email: string, firstName: string) {
  const resend = ensureResend();
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: [email],
    subject: 'Candidature reçue - Epi\'AI',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <tr>
              <td style="background-color: #18181b; border-radius: 12px 12px 0 0; padding: 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">Epi'AI</h1>
              </td>
            </tr>
            <tr>
              <td style="background-color: #27272a; padding: 40px;">
                <h2 style="color: #ffffff; margin: 0 0 20px 0;">Merci, ${firstName} !</h2>
                <p style="color: #d4d4d8; line-height: 1.6;">
                  Ta candidature a été reçue avec succès. Notre équipe va l'examiner et tu recevras une réponse sous peu.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #18181b; border-radius: 0 0 12px 12px; padding: 30px; text-align: center;">
                <p style="color: #71717a; font-size: 14px; margin: 0;">© ${new Date().getFullYear()} Epi'AI</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    throw error;
  }
}

interface GenericEmailParams {
  email: string;
  subject: string;
  html: string;
}

export async function sendGenericEmail({ email, subject, html }: GenericEmailParams) {
  const resend = getResendClient();
  if (!resend) {
    logger.warn('RESEND_API_KEY missing, email skipped', { email, subject });
    return null;
  }
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: [email],
    subject,
    html,
  });
  if (error) {
    logger.error('Resend send failed', { email, subject, error: String(error) });
    throw error;
  }
  return true;
}

export async function sendMembershipRejectedEmail(email: string, firstName: string) {
  return sendGenericEmail({
    email,
    subject: 'Candidature Epi\'AI — décision',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#27272a;color:#d4d4d8;">
        <h2 style="color:#fff;">Bonjour ${firstName},</h2>
        <p>Nous te remercions pour ta candidature à Epi'AI. Après examen, l'équipe a décidé de ne pas donner suite pour le moment.</p>
        <p>Tu peux renouveler ta candidature lors d'une prochaine session de recrutement.</p>
        <p style="color:#71717a;font-size:12px;">Epi'AI — Epitech</p>
      </div>
    `,
  });
}

export async function sendEventReminderEmail(
  email: string,
  firstName: string,
  eventTitle: string,
  eventDate: string,
  eventLink: string
) {
  return sendGenericEmail({
    email,
    subject: `Rappel : ${eventTitle} demain`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#27272a;color:#d4d4d8;">
        <h2 style="color:#fff;">Rappel événement</h2>
        <p>Bonjour ${firstName},</p>
        <p>L'événement <strong>${eventTitle}</strong> a lieu demain (${eventDate}).</p>
        <p><a href="${eventLink}" style="color:#3b82f6;">Voir les détails</a></p>
      </div>
    `,
  });
}

export async function sendNewEventEmail(
  email: string,
  firstName: string,
  eventTitle: string,
  eventLink: string
) {
  return sendGenericEmail({
    email,
    subject: `Nouvel événement Epi'AI : ${eventTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#27272a;color:#d4d4d8;">
        <h2 style="color:#fff;">Nouvel événement</h2>
        <p>Bonjour ${firstName},</p>
        <p>Un nouvel événement vient d'être publié : <strong>${eventTitle}</strong>.</p>
        <p><a href="${eventLink}" style="color:#3b82f6;">S'inscrire / voir les détails</a></p>
      </div>
    `,
  });
}

export async function sendForumReplyEmail(
  email: string,
  threadTitle: string,
  replyAuthor: string,
  threadLink: string
) {
  return sendGenericEmail({
    email,
    subject: `Nouvelle réponse : ${threadTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#27272a;color:#d4d4d8;">
        <h2 style="color:#fff;">Nouvelle réponse sur le forum</h2>
        <p><strong>${replyAuthor}</strong> a répondu à « ${threadTitle} ».</p>
        <p><a href="${threadLink}" style="color:#3b82f6;">Lire la discussion</a></p>
      </div>
    `,
  });
}

export async function sendMandatoryActivityEmail(
  email: string,
  firstName: string,
  activityTitle: string,
  activityDate: string,
  link: string
) {
  return sendGenericEmail({
    email,
    subject: `Activité obligatoire : ${activityTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#27272a;color:#d4d4d8;">
        <h2 style="color:#fff;">Activité intranet obligatoire</h2>
        <p>Bonjour ${firstName},</p>
        <p>Une activité obligatoire a été planifiée : <strong>${activityTitle}</strong> le ${activityDate}.</p>
        <p><a href="${link}" style="color:#3b82f6;">Voir l'activité et s'inscrire</a></p>
      </div>
    `,
  });
}
