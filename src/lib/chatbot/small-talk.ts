import { normalizeText, tokenize } from '@/lib/faq/normalize';

const GREETING_PHRASES = new Set([
  'salut',
  'bonjour',
  'bonsoir',
  'hello',
  'hi',
  'hey',
  'coucou',
  'yo',
  'cc',
  'bjr',
  'bonne journee',
  'good morning',
  'good evening',
  'good afternoon',
  'howdy',
]);

const THANKS_PHRASES = new Set([
  'merci',
  'thanks',
  'thank you',
  'thx',
  'ok merci',
  'super merci',
]);

const GOODBYE_PHRASES = new Set([
  'au revoir',
  'a plus',
  'a bientot',
  'bye',
  'goodbye',
  'ciao',
  'see you',
]);

function matchesPhraseSet(message: string, phrases: Set<string>): boolean {
  const normalized = normalizeText(message);
  if (!normalized) return false;
  if (phrases.has(normalized)) return true;

  const tokens = tokenize(message);
  if (tokens.length <= 3 && tokens.every((t) => phrases.has(t) || t.length <= 2)) {
    return tokens.some((t) => phrases.has(t));
  }

  for (const phrase of phrases) {
    if (phrase.includes(' ') && normalized === phrase) return true;
  }

  return false;
}

export function isGreeting(message: string): boolean {
  return matchesPhraseSet(message, GREETING_PHRASES);
}

export function isThanks(message: string): boolean {
  return matchesPhraseSet(message, THANKS_PHRASES);
}

export function isGoodbye(message: string): boolean {
  return matchesPhraseSet(message, GOODBYE_PHRASES);
}

export type SmallTalkKind = 'greeting' | 'thanks' | 'goodbye';

export function detectSmallTalk(message: string): SmallTalkKind | null {
  if (isGreeting(message)) return 'greeting';
  if (isThanks(message)) return 'thanks';
  if (isGoodbye(message)) return 'goodbye';
  return null;
}
