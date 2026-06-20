import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleChatbotRequest } from '@/lib/chatbot/assistant';

describe('handleChatbotRequest', () => {
  let savedOpenAi: string | undefined;
  let savedGemini: string | undefined;

  beforeEach(() => {
    savedOpenAi = process.env.OPENAI_API_KEY;
    savedGemini = process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (savedOpenAi) process.env.OPENAI_API_KEY = savedOpenAi;
    else delete process.env.OPENAI_API_KEY;
    if (savedGemini) process.env.GEMINI_API_KEY = savedGemini;
    else delete process.env.GEMINI_API_KEY;
  });

  it('returns catalog answer for direct faqId', async () => {
    const result = await handleChatbotRequest({
      faqId: 'join',
      locale: 'fr',
    });
    expect(result.source).toBe('catalog');
    expect(result.faqIds).toEqual(['join']);
    expect(result.answer).toContain('Rejoindre');
  });

  it('matches join variants without AI', async () => {
    const result = await handleChatbotRequest({
      message: 'comment adhérer à epiai',
      locale: 'fr',
    });
    expect(result.faqIds).toContain('join');
    expect(result.answer.length).toBeGreaterThan(20);
  });

  it('handles greetings without fallback when AI is off', async () => {
    const result = await handleChatbotRequest({
      message: 'salut',
      locale: 'fr',
    });
    expect(result.source).toBe('smalltalk');
    expect(result.answer).toContain('Salut');
    expect(result.suggestions).toContain('join');
  });

  it('returns fallback for unrelated input without AI key', async () => {
    const result = await handleChatbotRequest({
      message: 'xyzzy qwerty random nonsense 12345',
      locale: 'fr',
    });
    expect(result.source).toBe('fallback');
    expect(result.suggestions?.length).toBeGreaterThan(0);
  });
});
