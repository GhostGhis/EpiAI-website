import { sendGenericEmail, getSiteUrl } from '@/lib/email/resend';
import { formatParis } from './time';

/** Groupe WhatsApp « Entretien et test d’entrée » — envoyé à la convocation au test. */
export const ADMISSION_WHATSAPP_GROUP_URL =
  'https://chat.whatsapp.com/C0uDGFghoYbBmqCPp4dcgk';

function wrap(title: string, body: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#18181b;border-radius:12px;overflow:hidden;color:#d4d4d8;">
      <div style="padding:28px 32px;background:#0D1B4A;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;">Epi'AI</h1>
        <p style="margin:8px 0 0;color:#93c5fd;font-size:13px;">${title}</p>
      </div>
      <div style="padding:32px;background:#27272a;">${body}</div>
      <div style="padding:18px 32px;text-align:center;color:#71717a;font-size:12px;">Epi'AI - Epitech</div>
    </div>
  `;
}

function btn(href: string, label: string) {
  return `<p style="margin:24px 0 0;"><a href="${href}" style="display:inline-block;background:#3479F0;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${label}</a></p>`;
}

export async function sendAdmissionReceivedEmail(email: string, firstName: string) {
  return sendGenericEmail({
    email,
    subject: "Candidature reçue - Epi'AI",
    html: wrap(
      'Candidature reçue',
      `<p>Bonjour ${firstName},</p>
       <p>Nous avons bien reçu ta demande. Tu n’as pas encore accès à la plateforme membre.</p>
       <p>L’équipe va examiner ton dossier. Si tu es retenu(e) pour la suite, tu recevras un e-mail pour passer un test d’entrée, puis un entretien.</p>`,
    ),
  });
}

export async function sendTestInviteEmail(params: {
  email: string;
  firstName: string;
  token: string;
  examTitle: string;
}) {
  const url = `${getSiteUrl()}/fr/admission/${params.token}`;
  return sendGenericEmail({
    email: params.email,
    subject: "Epi'AI - tu es convoqué(e) au test d’entrée",
    html: wrap(
      'Test d’entrée',
      `<p>Bonjour ${params.firstName},</p>
       <p>Ta candidature a été retenue pour l’étape suivante : le test <strong>${params.examTitle}</strong>.</p>
       <p>Choisis un créneau parmi ceux proposés. Tu recevras tes identifiants de composition <strong>10 minutes avant le début</strong>, avec le lien vers la salle d’examen.</p>
       <p>Rejoins aussi le groupe WhatsApp <strong>Entretien et test d’entrée</strong> pour suivre les infos du process :</p>
       ${btn(ADMISSION_WHATSAPP_GROUP_URL, 'Rejoindre le groupe WhatsApp')}
       <p style="margin-top:8px;font-size:13px;color:#a1a1aa;word-break:break-all;">${ADMISSION_WHATSAPP_GROUP_URL}</p>
       ${btn(url, 'Choisir mon créneau')}`,
    ),
  });
}

export async function sendSlotChosenEmail(params: {
  email: string;
  firstName: string;
  when: Date;
  examTitle: string;
}) {
  return sendGenericEmail({
    email: params.email,
    subject: `Créneau confirmé - ${params.examTitle}`,
    html: wrap(
      'Créneau confirmé',
      `<p>Bonjour ${params.firstName},</p>
       <p>Ton test <strong>${params.examTitle}</strong> est fixé au <strong>${formatParis(params.when)}</strong> (heure de Paris).</p>
       <p>10 minutes avant, tu recevras un e-mail avec le lien et tes identifiants de composition (ce ne sont pas les identifiants de la plateforme membre).</p>`,
    ),
  });
}

export async function sendExamCredentialsEmail(params: {
  email: string;
  firstName: string;
  login: string;
  password: string;
  when: Date;
  examTitle: string;
}) {
  const url = `${getSiteUrl()}/fr/concours`;
  return sendGenericEmail({
    email: params.email,
    subject: `C’est bientôt - identifiants du test ${params.examTitle}`,
    html: wrap(
      'Salle d’examen',
      `<p>Bonjour ${params.firstName},</p>
       <p>Le test <strong>${params.examTitle}</strong> commence à <strong>${formatParis(params.when)}</strong>.</p>
       <p>Clique sur le lien, entre ces identifiants (uniquement pour composer, pas ton futur compte membre) :</p>
       <div style="background:#18181b;border-radius:8px;padding:16px;margin:16px 0;font-family:ui-monospace,monospace;">
         <p style="margin:0 0 8px;color:#a1a1aa;">Identifiant : <strong style="color:#fff;">${params.login}</strong></p>
         <p style="margin:0;color:#a1a1aa;">Mot de passe : <strong style="color:#fff;">${params.password}</strong></p>
       </div>
       <p>La page passera en plein écran. Toute sortie, changement d’onglet ou copie est enregistrée et visible par le jury.</p>
       ${btn(url, 'Entrer dans la salle d’examen')}`,
    ),
  });
}

export async function sendInterviewInviteEmail(params: {
  email: string;
  firstName: string;
  token: string;
}) {
  const url = `${getSiteUrl()}/fr/admission/${params.token}`;
  return sendGenericEmail({
    email: params.email,
    subject: "Epi'AI - tu es convoqué(e) à l’entretien",
    html: wrap(
      'Entretien',
      `<p>Bonjour ${params.firstName},</p>
       <p>Ton test d’entrée a été validé. Prochaine étape : un entretien avec un membre du bureau.</p>
       <p>Choisis un créneau. La salle te sera indiquée.</p>
       ${btn(url, 'Choisir mon créneau d’entretien')}`,
    ),
  });
}

export async function sendInterviewSlotEmail(params: {
  email: string;
  firstName: string;
  when: Date;
  room: string;
}) {
  return sendGenericEmail({
    email: params.email,
    subject: 'Créneau d’entretien confirmé - Epi’AI',
    html: wrap(
      'Entretien confirmé',
      `<p>Bonjour ${params.firstName},</p>
       <p>Ton entretien est fixé au <strong>${formatParis(params.when)}</strong> (heure de Paris).</p>
       <p>Lieu : <strong>${params.room || 'indiqué le jour J'}</strong>.</p>
       <p>Présente-toi un peu en avance.</p>`,
    ),
  });
}

export async function sendAdmissionRejectedEmail(email: string, firstName: string, stage: string) {
  const isTest = /test/i.test(stage);
  const participationLine = isTest
    ? `<p>Nous tenons surtout à te remercier d’avoir pris le temps de candidater et de participer au test d’entrée. Ton engagement compte vraiment pour nous.</p>`
    : `<p>Nous tenons surtout à te remercier d’avoir pris le temps de candidater et de participer à l’entretien. Ton engagement compte vraiment pour nous.</p>`;

  return sendGenericEmail({
    email,
    subject: "Candidature Epi'AI - décision du jury",
    html: wrap(
      'Décision du jury',
      `<p>Bonjour ${firstName},</p>
       <p>Après un examen attentif de ta candidature, nous ne pouvons malheureusement pas te proposer d’intégrer l’association Epi’AI à l’issue de cette session.</p>
       ${participationLine}
       <p>Les places sont limitées, et les résultats de cette session étaient particulièrement serrés. Faire un choix a été difficile pour le jury - cela ne remet pas en cause ta motivation ni ton parcours.</p>
       <p>Tu ne pourras donc pas faire partie de l’association en tant que membre pour cette session. En revanche, tu continues d’avoir toute ta place dans la communauté Epi’AI : nos Special Talks, Epi’AI Weekly et les activités ouvertes au public restent accessibles à toutes et à tous.</p>
       <p>Merci encore pour ta confiance. On te souhaite le meilleur pour la suite.</p>
       <p style="margin-top:20px;color:#a1a1aa;">L’équipe Epi’AI</p>`,
    ),
  });
}
