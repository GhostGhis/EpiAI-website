import { FAQ_CATALOG, FAQ_CHIP_IDS, type FaqId } from '@/lib/faq/catalog';
import {
  buildCatalogContext,
  getAnswerForFaqIds,
  getChatbotCopy,
  isValidFaqId,
  type ChatbotLocale,
} from '@/lib/faq/content';
import { matchFaq } from '@/lib/faq/match';
import { chatCompletionJson, chatCompletionText, isChatbotAiEnabled } from './openai';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type ChatbotSource = 'catalog' | 'ai' | 'fallback';

export interface ChatbotResult {
  answer: string;
  faqIds: FaqId[];
  suggestions?: FaqId[];
  source: ChatbotSource;
}

interface ClassifyResult {
  faqIds?: string[];
  confidence?: number;
  offTopic?: boolean;
  suggestions?: string[];
}

const CONFIDENCE_THRESHOLD = 0.65;
const HIGH_MATCH_SCORE = 8;

function uniqueFaqIds(ids: string[]): FaqId[] {
  const out: FaqId[] = [];
  for (const id of ids) {
    if (isValidFaqId(id) && !out.includes(id)) out.push(id);
  }
  return out;
}

async function classifyWithAi(
  message: string,
  locale: ChatbotLocale,
  history: ChatMessage[]
): Promise<{ faqIds: FaqId[]; suggestions: FaqId[] }> {
  const catalog = buildCatalogContext(locale);
  const allowedIds = FAQ_CATALOG.map((e) => e.id);

  const system = `You are an intent classifier for the Epi'AI student association chatbot.
Your ONLY job is to map user questions to FAQ catalog IDs. Never invent answers.

Allowed FAQ IDs: ${allowedIds.join(', ')}

FAQ CATALOG (ground truth):
${catalog}

Rules:
- Return JSON: { "faqIds": string[], "confidence": number, "offTopic": boolean, "suggestions": string[] }
- faqIds must be from the allowed list only (max 2 entries if clearly related).
- confidence is 0-1 (how sure you are).
- offTopic=true if the question is NOT about Epi'AI / the association / membership / platform.
- If confidence < 0.65, return empty faqIds and suggest up to 3 relevant IDs in "suggestions".
- Handle French and English, typos, slang, and paraphrases.
- Use conversation history for follow-ups ("et les events ?", "how about resources?").`;

  const historyMessages = history.slice(-6).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const parsed = await chatCompletionJson<ClassifyResult>({
    system,
    messages: [...historyMessages, { role: 'user', content: message }],
    temperature: 0,
  });

  const faqIds = uniqueFaqIds(parsed.faqIds || []);
  const suggestions = uniqueFaqIds(parsed.suggestions || []);

  if (
    parsed.offTopic ||
    (parsed.confidence ?? 0) < CONFIDENCE_THRESHOLD ||
    faqIds.length === 0
  ) {
    return { faqIds: [], suggestions: suggestions.slice(0, 3) };
  }

  return { faqIds: faqIds.slice(0, 2), suggestions: [] };
}

/** Rephrase catalog facts naturally — AI must not add new information. */
async function rephraseAnswer(
  message: string,
  facts: string,
  locale: ChatbotLocale,
  history: ChatMessage[]
): Promise<string> {
  const lang = locale === 'fr' ? 'French' : 'English';
  const system = `You are the Epi'AI association assistant. Rewrite the SOURCE FACTS to answer the user's message in ${lang}.
STRICT RULES:
- Use ONLY information from SOURCE FACTS. Do not add, guess, or infer anything else.
- If SOURCE FACTS do not answer the question, reply exactly: "__FALLBACK__"
- Keep 2-5 sentences, friendly and clear.
- No markdown, no bullet lists unless in SOURCE FACTS.`;

  const historyMessages = history.slice(-4).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const text = await chatCompletionText({
    system,
    messages: [
      ...historyMessages,
      {
        role: 'user',
        content: `User question: ${message}\n\nSOURCE FACTS:\n${facts}`,
      },
    ],
    temperature: 0.2,
  });

  if (text.includes('__FALLBACK__')) {
    return facts;
  }

  return text;
}

export async function handleChatbotRequest(params: {
  message?: string;
  faqId?: FaqId;
  locale: ChatbotLocale;
  history?: ChatMessage[];
}): Promise<ChatbotResult> {
  const locale = params.locale === 'en' ? 'en' : 'fr';
  const copy = getChatbotCopy(locale);
  const history = params.history ?? [];

  if (params.faqId && isValidFaqId(params.faqId)) {
    return {
      answer: getAnswerForFaqIds([params.faqId], locale),
      faqIds: [params.faqId],
      source: 'catalog',
    };
  }

  const message = params.message?.trim();
  if (!message) {
    return {
      answer: copy.fallback,
      faqIds: [],
      suggestions: FAQ_CHIP_IDS.slice(0, 3),
      source: 'fallback',
    };
  }

  const localMatch = matchFaq(message);
  if (localMatch.match && localMatch.match.score >= HIGH_MATCH_SCORE) {
    const answer = getAnswerForFaqIds([localMatch.match.id], locale);
    if (isChatbotAiEnabled() && history.length > 0) {
      try {
        const rephrased = await rephraseAnswer(message, answer, locale, history);
        return {
          answer: rephrased,
          faqIds: [localMatch.match.id],
          source: 'ai',
        };
      } catch {
        // fall through to catalog
      }
    }
    return {
      answer,
      faqIds: [localMatch.match.id],
      source: 'catalog',
    };
  }

  if (isChatbotAiEnabled()) {
    try {
      const { faqIds, suggestions } = await classifyWithAi(message, locale, history);

      if (faqIds.length > 0) {
        const facts = getAnswerForFaqIds(faqIds, locale);
        const answer =
          history.length > 0
            ? await rephraseAnswer(message, facts, locale, history)
            : facts;

        return {
          answer: answer.includes('__FALLBACK__') ? facts : answer,
          faqIds,
          source: history.length > 0 ? 'ai' : 'catalog',
        };
      }

      const fallbackSuggestions =
        suggestions.length > 0
          ? suggestions
          : localMatch.suggestions.length > 0
            ? localMatch.suggestions
            : FAQ_CHIP_IDS.slice(0, 3);

      return {
        answer: copy.fallback,
        faqIds: [],
        suggestions: fallbackSuggestions.slice(0, 3),
        source: 'fallback',
      };
    } catch (error) {
      console.error('[chatbot] AI error:', error);
    }
  }

  if (localMatch.match) {
    return {
      answer: getAnswerForFaqIds([localMatch.match.id], locale),
      faqIds: [localMatch.match.id],
      source: 'catalog',
    };
  }

  return {
    answer: copy.fallback,
    faqIds: [],
    suggestions:
      localMatch.suggestions.length > 0
        ? localMatch.suggestions.slice(0, 3)
        : FAQ_CHIP_IDS.slice(0, 3),
    source: 'fallback',
  };
}
