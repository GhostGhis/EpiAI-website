import { FAQ_CATALOG, type FaqId } from './catalog';
import { normalizeText, tokenize } from './normalize';

export const MIN_FAQ_SCORE = 5;
export const AMBIGUITY_GAP = 3;

export interface FaqMatchResult {
  id: FaqId;
  score: number;
}

export interface FaqMatchResponse {
  match: FaqMatchResult | null;
  suggestions: FaqId[];
}

function scoreEntry(query: string, queryTokens: string[], entry: (typeof FAQ_CATALOG)[number]): number {
  let score = entry.priority ?? 0;

  for (const variant of entry.variants) {
    const normalizedVariant = normalizeText(variant);
    if (normalizedVariant.length >= 4 && query.includes(normalizedVariant)) {
      score += 12;
    }
  }

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword.length < 3) continue;

    if (normalizedKeyword.length >= 4 && query.includes(normalizedKeyword)) {
      score += 3;
    } else if (queryTokens.includes(normalizedKeyword)) {
      score += 4;
    }
  }

  const entryTokens = new Set([
    ...entry.keywords.flatMap((k) => tokenize(k)),
    ...entry.variants.flatMap((v) => tokenize(v)),
  ]);

  for (const token of queryTokens) {
    if (entryTokens.has(token)) score += 1;
  }

  return score;
}

/** Deterministic FAQ matcher — returns catalog id only, never generates text. */
export function matchFaq(input: string): FaqMatchResponse {
  const query = normalizeText(input);
  if (!query) {
    return { match: null, suggestions: [] };
  }

  const queryTokens = tokenize(input);

  const ranked = FAQ_CATALOG.map((entry) => ({
    id: entry.id,
    score: scoreEntry(query, queryTokens, entry),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return { match: null, suggestions: [] };
  }

  const best = ranked[0];
  const second = ranked[1];

  if (best.score < MIN_FAQ_SCORE) {
    return {
      match: null,
      suggestions: ranked.slice(0, 3).map((r) => r.id),
    };
  }

  if (second && best.score - second.score < AMBIGUITY_GAP) {
    return {
      match: null,
      suggestions: ranked.slice(0, 3).map((r) => r.id),
    };
  }

  return {
    match: best,
    suggestions: [],
  };
}
