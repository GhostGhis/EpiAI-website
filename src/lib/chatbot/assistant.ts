import { FAQ_CATALOG, FAQ_CHIP_IDS, type FaqId } from '@/lib/faq/catalog';
import {
  buildCatalogContext,
  getAnswerForFaqIds,
  getChatbotCopy,
  isValidFaqId,
  type ChatbotLocale,
} from '@/lib/faq/content';
import { matchFaq } from '@/lib/faq/match';
import { detectSmallTalk, type SmallTalkKind } from '@/lib/chatbot/small-talk';
import { chatCompletionJson, isChatbotAiEnabled } from './openai';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type ChatbotSource = 'catalog' | 'ai' | 'fallback' | 'smalltalk';

export interface ChatbotResult {
  answer: string;
  faqIds: FaqId[];
  suggestions?: FaqId[];
  source: ChatbotSource;
}

interface AiResponsePayload {
  faqIds?: string[];
  answer?: string;
  suggestions?: string[];
}

function uniqueFaqIds(ids: string[]): FaqId[] {
  const out: FaqId[] = [];
  for (const id of ids) {
    if (isValidFaqId(id) && !out.includes(id)) out.push(id);
  }
  return out;
}

function defaultSuggestions(
  localSuggestions: FaqId[],
  override?: FaqId[]
): FaqId[] {
  if (override && override.length > 0) return override.slice(0, 3);
  if (localSuggestions.length > 0) return localSuggestions.slice(0, 3);
  return FAQ_CHIP_IDS.slice(0, 3);
}

/** Single AI call: natural conversation strictly grounded on the FAQ catalog. */
async function generateConversationalAnswer(params: {
  message: string;
  locale: ChatbotLocale;
  history: ChatMessage[];
  hintFaqIds?: FaqId[];
  smallTalk?: SmallTalkKind | null;
}): Promise<ChatbotResult> {
  const { message, locale, history, hintFaqIds, smallTalk } = params;
  const copy = getChatbotCopy(locale);
  const catalog = buildCatalogContext(locale);
  const lang = locale === 'fr' ? 'French' : 'English';
  const allowedIds = FAQ_CATALOG.map((e) => e.id).join(', ');

  const system = `You are the conversational assistant for Epi'AI, the AI & data science student association at Epitech.

Your personality: warm, helpful, concise, human — not a rigid FAQ bot.

STRICT GROUNDING RULES (never break these):
1. Use ONLY facts from the FAQ CATALOG below. Do NOT invent names, dates, URLs, policies, or procedures.
2. If the catalog does not contain the answer, say so honestly in a friendly way and invite the user to pick a related topic.
3. Never mention "catalog", "FAQ", or "database" to the user.
4. Respond in ${lang}. Use "tu" in French.

CONVERSATION RULES:
- Use chat history for follow-ups ("et les events ?", "autre chose ?", "merci").
- Greetings: respond naturally and offer help (do not dump the whole FAQ).
- Thanks / goodbye: respond briefly and warmly.
- Unclear questions: ask ONE short clarifying question OR suggest 2-3 topics.
- Answers: 2-6 sentences, conversational — synthesize relevant catalog entries, don't copy-paste verbatim unless necessary.

Allowed FAQ IDs: ${allowedIds}

FAQ CATALOG (sole source of truth):
${catalog}

Return JSON only:
{
  "faqIds": string[],       // catalog entries you used (empty if pure small talk)
  "answer": string,         // natural reply to the user
  "suggestions": string[]   // optional FAQ ids to suggest (max 3) when user needs guidance
}`;

  let userContent = message;
  const hints: string[] = [];
  if (hintFaqIds?.length) hints.push(`likely topics: ${hintFaqIds.join(', ')}`);
  if (smallTalk) hints.push(`message type: ${smallTalk}`);
  if (hints.length) userContent += `\n\n[Context for you: ${hints.join('; ')}]`;

  const historyMessages = history.slice(-8).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const parsed = await chatCompletionJson<AiResponsePayload>({
    system,
    messages: [...historyMessages, { role: 'user', content: userContent }],
    temperature: 0.45,
  });

  const faqIds = uniqueFaqIds([
    ...(parsed.faqIds || []),
    ...(hintFaqIds || []),
  ]).slice(0, 2);

  let answer = parsed.answer?.trim() || '';

  if (!answer && faqIds.length > 0) {
    answer = getAnswerForFaqIds(faqIds, locale);
  }

  if (!answer) {
    answer = copy.fallback;
  }

  const suggestions = uniqueFaqIds(parsed.suggestions || []);

  return {
    answer,
    faqIds,
    suggestions:
      suggestions.length > 0
        ? suggestions.slice(0, 3)
        : faqIds.length === 0
          ? defaultSuggestions([], FAQ_CHIP_IDS.slice(0, 3))
          : undefined,
    source: 'ai',
  };
}

/** Offline path when no AI key — deterministic catalog matching. */
function handleOfflineRequest(params: {
  message: string;
  faqId?: FaqId;
  locale: ChatbotLocale;
}): ChatbotResult {
  const locale = params.locale;
  const copy = getChatbotCopy(locale);

  if (params.faqId && isValidFaqId(params.faqId)) {
    return {
      answer: getAnswerForFaqIds([params.faqId], locale),
      faqIds: [params.faqId],
      source: 'catalog',
    };
  }

  const smallTalk = detectSmallTalk(params.message);
  if (smallTalk) {
    const key = smallTalk as 'greeting' | 'thanks' | 'goodbye';
    return {
      answer: copy[key],
      faqIds: [],
      suggestions:
        smallTalk === 'greeting' ? (['about', 'join', 'events'] as FaqId[]) : undefined,
      source: 'smalltalk',
    };
  }

  const localMatch = matchFaq(params.message);
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
    suggestions: defaultSuggestions(localMatch.suggestions),
    source: 'fallback',
  };
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

  const message = params.message?.trim();
  const faqId = params.faqId && isValidFaqId(params.faqId) ? params.faqId : undefined;

  if (!message && !faqId) {
    return {
      answer: copy.fallback,
      faqIds: [],
      suggestions: FAQ_CHIP_IDS.slice(0, 3),
      source: 'fallback',
    };
  }

  const localMatch = message ? matchFaq(message) : { match: null, suggestions: [] as FaqId[] };
  const hintFaqIds: FaqId[] = faqId
    ? [faqId]
    : localMatch.match
      ? [localMatch.match.id]
      : localMatch.suggestions.slice(0, 2);

  if (isChatbotAiEnabled()) {
    try {
      return await generateConversationalAnswer({
        message: message || copy.questions[faqId!] || faqId!,
        locale,
        history,
        hintFaqIds,
        smallTalk: message ? detectSmallTalk(message) : null,
      });
    } catch (error) {
      console.error('[chatbot] AI error:', error);
    }
  }

  return handleOfflineRequest({
    message: message || '',
    faqId,
    locale,
  });
}
