/** Grille officielle Epi'AI — version numérique (même contenu que le PDF jury). */

export type ScoreBand = {
  scores: string;
  level: string;
  indicators: string;
};

export type InterviewGridQuestion = {
  code: string;
  section: 'A' | 'B' | 'C' | 'D';
  prompt: string;
  maxPoints: number;
  lookingFor: string;
  followUp: string;
  criteria: ScoreBand[];
  isVeto?: boolean;
};

export type InterviewGridSection = {
  id: 'A' | 'B' | 'C' | 'D';
  title: string;
  maxPoints: number;
  intro: string;
  questions: InterviewGridQuestion[];
};

export const INTERVIEW_SCALE = [
  { scores: '1–2', level: 'Insuffisant', meaning: 'Réponse vague, absente ou en décalage avec l’engagement demandé.' },
  { scores: '3', level: 'Correct', meaning: 'Réponse sincère avec au moins un exemple ou un élément concret.' },
  { scores: '4–5', level: 'Excellent', meaning: 'Réponse structurée, personnelle, illustrée, avec du recul.' },
] as const;

export const INTERVIEW_DECISION_BANDS = [
  { min: 56, max: 70, label: 'Admis(e)', comment: 'Intégration au prochain cycle.' },
  { min: 42, max: 55, label: 'Liste d’attente / entretien complémentaire', comment: 'Points à clarifier lors d’un second échange (court).' },
  { min: 0, max: 41, label: 'Non admis(e)', comment: 'Peut se représenter dans 6 mois ; un retour constructif lui est donné.' },
] as const;

export const INTERVIEW_GUIDE = {
  title: 'Grille d’entretien — Admission',
  subtitle: 'Document réservé au jury · Confidentiel',
  consignes: [
    'Même base pour tous. Posez les mêmes questions à chaque candidat(e), dans le même ordre ; les relances sont là pour approfondir, pas pour piéger.',
    'Notez des faits, pas des impressions. Un exemple concret vaut mieux qu’une belle phrase. Écrivez ce qui a été dit, puis attribuez la note.',
    'Évaluez le potentiel, pas le niveau. Aucun prérequis technique n’est demandé. Un(e) débutant(e) motivé(e) et organisé(e) vaut plus qu’un(e) expert(e) peu fiable.',
    'Évitez les biais. Ne notez pas l’aisance à l’oral, l’accent ou la timidité : si un(e) candidat(e) est stressé(e), reformulez et laissez-lui le temps de réfléchir.',
    'Silence = réflexion. Attendez 5 à 10 secondes avant de relancer. Ne donnez jamais la réponse attendue.',
    'Notation individuelle d’abord. Chaque membre du jury note seul(e), puis les scores sont confrontés. En cas d’écart de 2 points ou plus, discutez et justifiez.',
  ],
  schedule: [
    { step: 'Accueil', duration: '3 min', content: 'Présentation du jury et d’Epi’AI, déroulé, mise à l’aise du/de la candidat(e).' },
    { step: 'Section A', duration: '7 min', content: 'Motivation & vision IA' },
    { step: 'Section B', duration: '6 min', content: 'Culture IA & esprit critique (dont la mise en situation)' },
    { step: 'Section C', duration: '7 min', content: 'Capacité de travail & régularité' },
    { step: 'Section D', duration: '5 min', content: 'Esprit d’équipe & valeurs' },
    { step: 'Clôture', duration: '2 min', content: 'Questions du/de la candidat(e), confirmation de l’engagement, suite du processus.' },
  ],
  alerts: [
    'Clause de veto : une note de 1 ou moins sur D3 (Éthique) est rédhibitoire, quelle que soit la note totale.',
    'Signal d’alerte : un score inférieur à 50 % sur une section (A, B, C ou D) doit être discuté et justifié, même si le total est suffisant. En particulier la section C : sans régularité, le reste ne tient pas sur 9 mois.',
  ],
  positiveSignals: [
    'Donne des exemples vécus et précis',
    'Reconnaît ses limites et ses erreurs',
    'Pose des questions pertinentes sur l’association',
    'Montre de l’entraide spontanée',
    'Parle de ce qu’il/elle a construit, pas seulement suivi',
  ],
  warningSignals: [
    'Réponses génériques, copiées ou pré-apprises',
    'Minimise la charge de travail sans plan',
    'Cherche surtout un titre ou un CV',
    'Parle des autres de façon méprisante',
    'Aucune initiative d’apprentissage personnelle',
  ],
  engagementChecks: [
    'Disponible pour 3 séances par semaine pendant 9 mois',
    'Conscient(e) du travail personnel attendu entre les séances',
    'Accepte de contribuer activement (entraide, partage, présence)',
    'Prêt(e) à respecter les règles et valeurs de l’association',
  ],
} as const;

export const INTERVIEW_SECTIONS: InterviewGridSection[] = [
  {
    id: 'A',
    title: 'Motivation & Vision IA',
    maxPoints: 20,
    intro:
      'Évaluer la sincérité de l’engagement et la clarté du projet personnel. On ne cherche pas un discours parfait — on cherche quelqu’un qui sait pourquoi il/elle est là.',
    questions: [
      {
        code: 'A1',
        section: 'A',
        prompt: 'Pourquoi veux-tu rejoindre Epi’AI plutôt qu’apprendre seul(e) ou via une autre association ?',
        maxPoints: 5,
        lookingFor:
          'Mention de la communauté, de la structure, de la progression collective. Méfiance envers les réponses génériques du type « j’aime l’IA ».',
        followUp: 'Qu’est-ce que tu ne peux pas obtenir seul(e) ? Qu’attends-tu des autres membres ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: '« J’aime l’IA » sans justification concrète.' },
          { scores: '3', level: 'Correct', indicators: 'Cite un bénéfice réel : réseau, projets collectifs, rigueur de l’asso.' },
          { scores: '4–5', level: 'Excellent', indicators: 'Vision claire, lien explicite avec son parcours Epitech et un objectif pro précis.' },
        ],
      },
      {
        code: 'A2',
        section: 'A',
        prompt: 'Quel est, selon toi, le vrai défi de l’IA aujourd’hui — techniquement ou socialement ?',
        maxPoints: 5,
        lookingFor: 'Curiosité intellectuelle et esprit critique. Pas de « ChatGPT c’est impressionnant » sans analyse.',
        followUp: 'D’où tiens-tu cette information ? Qu’est-ce qui te fait penser ça ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: 'Répète un titre d’actualité sans recul ni analyse.' },
          { scores: '3', level: 'Correct', indicators: 'Cite un enjeu réel : alignement, biais, puissance de calcul, données, emploi…' },
          { scores: '4–5', level: 'Excellent', indicators: 'Analyse nuancée, connaissance d’un problème précis, opinion argumentée et personnelle.' },
        ],
      },
      {
        code: 'A3',
        section: 'A',
        prompt: 'Dans 2 ans, que t’imagines-tu faire avec les compétences acquises ici ?',
        maxPoints: 5,
        lookingFor: 'Cohérence entre le projet et l’investissement demandé (9 mois, 3 séances/semaine). Ambition réaliste.',
        followUp: 'Quelle première étape concrète as-tu déjà franchie vers cet objectif ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: '« Faire de l’IA » sans direction ni domaine ciblé.' },
          { scores: '3', level: 'Correct', indicators: 'Domaine ciblé (NLP, vision, RL…) avec un contexte pro ou académique.' },
          { scores: '4–5', level: 'Excellent', indicators: 'Projet précis, lien avec Epitech, conscience du chemin à parcourir.' },
        ],
      },
      {
        code: 'A4',
        section: 'A',
        prompt: 'As-tu déjà essayé d’apprendre seul(e) quelque chose de difficile ? Comment t’y es-tu pris(e) ?',
        maxPoints: 5,
        lookingFor: 'Méthode de travail autonome et résilience face à la difficulté — indispensable pour tenir 9 mois.',
        followUp: 'À quel moment as-tu failli abandonner ? Qu’est-ce qui t’a fait continuer ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: 'Attend qu’on lui explique, aucune initiative décrite.' },
          { scores: '3', level: 'Correct', indicators: 'Exemple concret avec une ressource utilisée (vidéo, doc, tuto, livre).' },
          { scores: '4–5', level: 'Excellent', indicators: 'Démarche structurée et itérative. Sait nommer ce qui a bloqué et comment il/elle s’en est sorti(e).' },
        ],
      },
    ],
  },
  {
    id: 'B',
    title: 'Culture IA & Esprit critique',
    maxPoints: 15,
    intro:
      'Aucun prérequis technique n’est exigé : on évalue la curiosité, la façon de raisonner et le recul face aux outils d’IA — pas le niveau d’expertise. Un(e) débutant(e) curieux(se) peut obtenir 5/5.',
    questions: [
      {
        code: 'B1',
        section: 'B',
        prompt: 'Parle-moi d’un outil, d’un modèle ou d’un projet d’IA récent qui t’a marqué(e). Explique-nous comment il fonctionne, avec tes mots.',
        maxPoints: 5,
        lookingFor: 'Curiosité réelle et capacité à vulgariser. On valorise la compréhension, pas le jargon récité.',
        followUp: 'Comment l’expliquerais-tu à quelqu’un qui n’y connaît rien ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: 'Nomme un outil connu sans pouvoir expliquer ce qu’il fait.' },
          { scores: '3', level: 'Correct', indicators: 'Explique le principe général de façon correcte, même simplifiée.' },
          { scores: '4–5', level: 'Excellent', indicators: 'Explication claire, exemple concret, limites de l’outil identifiées.' },
        ],
      },
      {
        code: 'B2',
        section: 'B',
        prompt:
          'Mise en situation : un modèle obtient d’excellents résultats lors des tests, mais se trompe souvent en conditions réelles. Qu’est-ce qui peut se passer, à ton avis ?',
        maxPoints: 5,
        lookingFor:
          'Raisonnement logique face à un problème inconnu. Les termes exacts (surapprentissage, biais des données…) sont un bonus, pas une obligation.',
        followUp: 'Si tu ne connais pas la réponse : qu’est-ce que tu essaierais en premier ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: 'Aucune piste, ou abandon immédiat (« je ne sais pas »).' },
          { scores: '3', level: 'Correct', indicators: 'Formule au moins une hypothèse plausible (données différentes, modèle trop « par cœur »…).' },
          { scores: '4–5', level: 'Excellent', indicators: 'Plusieurs hypothèses, propose comment les vérifier ; raisonne à voix haute.' },
        ],
      },
      {
        code: 'B3',
        section: 'B',
        prompt:
          'Utilises-tu des outils d’IA (ChatGPT, Copilot, etc.) pour apprendre ou coder ? Comment t’assures-tu de comprendre et de vérifier ce qu’ils te donnent ?',
        maxPoints: 5,
        lookingFor: 'Usage lucide et responsable de l’IA. Un futur membre d’Epi’AI ne doit pas être un simple « copier-coller ».',
        followUp: 'Donne-moi un exemple où l’IA t’a donné une mauvaise réponse. Comment l’as-tu repéré ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: 'Copie les réponses sans les vérifier, ou n’y voit aucun risque.' },
          { scores: '3', level: 'Correct', indicators: 'Relit, teste, reconnaît que l’outil peut se tromper.' },
          { scores: '4–5', level: 'Excellent', indicators: 'Méthode de vérification claire ; utilise l’IA pour comprendre, pas pour remplacer l’effort.' },
        ],
      },
    ],
  },
  {
    id: 'C',
    title: 'Capacité de travail & Régularité',
    maxPoints: 20,
    intro:
      'Le programme est dense : 3 séances par semaine pendant 9 mois, en parallèle du cursus Epitech. Ce bloc évalue la tenue dans la durée — c’est souvent le vrai filtre.',
    questions: [
      {
        code: 'C1',
        section: 'C',
        prompt: 'On est sur 3 séances par semaine + du travail personnel. Comment comptes-tu t’organiser avec le cursus Epitech ?',
        maxPoints: 5,
        lookingFor: 'Gestion du temps réaliste, conscience de la charge. Méfiance envers « pas de problème » sans plan concret.',
        followUp: 'Que feras-tu en semaine de rendu ou de soutenance ? Quelle activité es-tu prêt(e) à réduire ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: '« Je verrai » ou minimise la charge sans aucun plan.' },
          { scores: '3', level: 'Correct', indicators: 'Cite des créneaux hebdomadaires réels, a pensé aux conflits avec les projets / le Hub.' },
          { scores: '4–5', level: 'Excellent', indicators: 'Méthode de planification existante (agenda, Notion…), expérience de projets parallèles réussie.' },
        ],
      },
      {
        code: 'C2',
        section: 'C',
        prompt: 'Raconte-moi un moment où tu as lâché quelque chose en cours de route. Que s’est-il passé ?',
        maxPoints: 5,
        lookingFor: 'Honnêteté et capacité de recul. L’objectif n’est pas d’éliminer — c’est d’évaluer la maturité et l’auto-analyse.',
        followUp: 'Qu’est-ce que tu ferais différemment aujourd’hui ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: 'Déni / esquive (« ça ne m’arrive pas ») ou réponse vide sans exemple.' },
          { scores: '3', level: 'Correct', indicators: 'Exemple réel, reconnaît la cause (surcharge, désintérêt, mauvaise organisation).' },
          { scores: '4–5', level: 'Excellent', indicators: 'Analyse fine de ce qui s’est passé, leçon tirée, ajustement appliqué depuis.' },
        ],
      },
      {
        code: 'C3',
        section: 'C',
        prompt: 'Si tu bloques sur un concept pendant 2 heures sans avancer, que fais-tu ?',
        maxPoints: 5,
        lookingFor: 'Autonomie et débrouillardise — sans dépendance excessive à l’aide extérieure, mais sans s’isoler non plus.',
        followUp: 'À quel moment demandes-tu de l’aide, et comment formules-tu ta question ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: '« J’attends qu’on m’aide » ou abandonne rapidement.' },
          { scores: '3', level: 'Correct', indicators: 'Cherche sur Internet / YouTube, reformule le problème différemment.' },
          { scores: '4–5', level: 'Excellent', indicators: 'Stratégie précise : reformuler, chercher, tester, puis poser une question bien formulée.' },
        ],
      },
      {
        code: 'C4',
        section: 'C',
        prompt: 'Quelle est la dernière chose sérieuse que tu as apprise par toi-même — en dehors de tout cours ?',
        maxPoints: 5,
        lookingFor: 'Curiosité intrinsèque et initiative réelle. Clé pour une association d’apprenants autonomes.',
        followUp: 'Peux-tu nous montrer ou décrire ce que tu as produit ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: 'Rien de récent, ou uniquement des cours obligatoires.' },
          { scores: '3', level: 'Correct', indicators: 'Une technologie, un concept, un projet perso — même modeste.' },
          { scores: '4–5', level: 'Excellent', indicators: 'Apprentissage récent bien décrit, démarche claire, résultat concret produit.' },
        ],
      },
    ],
  },
  {
    id: 'D',
    title: 'Esprit d’équipe & Valeurs',
    maxPoints: 15,
    intro:
      'Epi’AI est une communauté d’étudiants Epitech — la cohésion et l’éthique sont non négociables. Un membre fantôme ou toxique plombe toute la dynamique.',
    questions: [
      {
        code: 'D1',
        section: 'D',
        prompt: 'Quelle différence fais-tu entre un membre actif et un membre « fantôme » dans une association ?',
        maxPoints: 5,
        lookingFor: 'Conscience de l’engagement collectif : sa présence (ou son absence) a un impact sur le groupe.',
        followUp: 'Que fais-tu si tu te rends compte que tu deviens moins disponible ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: '« Je serai actif » sans définir ce que cela signifie concrètement.' },
          { scores: '3', level: 'Correct', indicators: 'Distingue présence, contribution et entraide avec des exemples tangibles.' },
          { scores: '4–5', level: 'Excellent', indicators: 'Formes concrètes de contribution : aider un pair, préparer un résumé, partager une ressource.' },
        ],
      },
      {
        code: 'D2',
        section: 'D',
        prompt: 'Quelqu’un de ton groupe ne comprend pas un concept que toi tu as saisi. Que fais-tu ?',
        maxPoints: 5,
        lookingFor: 'Pédagogie et solidarité — valeurs centrales d’une association d’apprentissage entre pairs. Expliquer, c’est mieux apprendre.',
        followUp: 'Et si la personne ne comprend toujours pas après ta deuxième explication ?',
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: '« C’est son problème » ou ne voit pas l’intérêt de s’impliquer.' },
          { scores: '3', level: 'Correct', indicators: 'Propose d’expliquer, cherche une autre façon de formuler.' },
          { scores: '4–5', level: 'Excellent', indicators: 'Utilise des analogies, vérifie la compréhension, sait qu’enseigner ancre sa propre compréhension.' },
        ],
      },
      {
        code: 'D3',
        section: 'D',
        prompt: 'L’IA peut être utilisée pour tromper, manipuler, surveiller. Est-ce un sujet qui te préoccupe ?',
        maxPoints: 5,
        lookingFor: 'Maturité éthique minimale. Pas de réponse idéologique attendue — juste une réflexion sincère et personnelle.',
        followUp: 'Y a-t-il un projet que tu refuserais de construire ? Pourquoi ?',
        isVeto: true,
        criteria: [
          { scores: '1–2', level: 'Faible', indicators: 'Indifférence totale (« c’est pas mon problème ») ou déni du sujet. VETO possible.' },
          { scores: '3', level: 'Correct', indicators: 'Conscient des enjeux, cite un exemple concret (deepfakes, surveillance, biais).' },
          { scores: '4–5', level: 'Excellent', indicators: 'Position nuancée, lien avec la responsabilité du praticien IA.' },
        ],
      },
    ],
  },
];

export const INTERVIEW_TOTAL_MAX = INTERVIEW_SECTIONS.reduce((sum, s) => sum + s.maxPoints, 0);

export function flattenInterviewQuestions() {
  return INTERVIEW_SECTIONS.flatMap((section) => section.questions);
}

export function decisionForScore(total: number) {
  return INTERVIEW_DECISION_BANDS.find((b) => total >= b.min && total <= b.max) || INTERVIEW_DECISION_BANDS[2];
}

export function sectionAlert(sectionMax: number, sectionScore: number) {
  return sectionScore < sectionMax * 0.5;
}
