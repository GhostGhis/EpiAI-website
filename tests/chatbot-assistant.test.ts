import { describe, expect, it } from 'vitest';
import { handleChatbotRequest } from '@/lib/chatbot/assistant';

describe('handleChatbotRequest', () => {
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

  it('handles greetings without fallback', async () => {
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
