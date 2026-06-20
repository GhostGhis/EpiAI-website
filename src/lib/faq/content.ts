import fr from '../../../messages/fr.json';
import en from '../../../messages/en.json';
import { FAQ_CATALOG, type FaqId } from './catalog';

export type ChatbotLocale = 'fr' | 'en';

const LOCALES = { fr, en } as const;

export function getFaqAnswers(locale: ChatbotLocale): Record<FaqId, string> {
  return LOCALES[locale].Chatbot.faq as Record<FaqId, string>;
}

export function getFaqQuestions(locale: ChatbotLocale): Record<FaqId, string> {
  return LOCALES[locale].Chatbot.questions as Record<FaqId, string>;
}

export function getChatbotCopy(locale: ChatbotLocale) {
  return LOCALES[locale].Chatbot;
}

/** Compact catalog block injected into the AI system prompt (ground truth). */
export function buildCatalogContext(locale: ChatbotLocale): string {
  const answers = getFaqAnswers(locale);
  const questions = getFaqQuestions(locale);

  return FAQ_CATALOG.map((entry) => {
    const label = questions[entry.id] || entry.id;
    const variants = entry.variants.slice(0, 4).join(' | ');
    return `[${entry.id}] ${label}\nVariants: ${variants}\nAnswer: ${answers[entry.id]}`;
  }).join('\n\n');
}

export function getAnswerForFaqIds(ids: FaqId[], locale: ChatbotLocale): string {
  const answers = getFaqAnswers(locale);
  return ids
    .map((id) => answers[id])
    .filter(Boolean)
    .join('\n\n');
}

export function isValidFaqId(id: string): id is FaqId {
  return FAQ_CATALOG.some((e) => e.id === id);
}
