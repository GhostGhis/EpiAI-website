import { describe, expect, it } from 'vitest';
import { matchFaq } from '@/lib/faq/match';

describe('matchFaq', () => {
  it('matches join variants', () => {
    expect(matchFaq('Comment rejoindre l\'association ?').match?.id).toBe('join');
    expect(matchFaq('how do i join epiai').match?.id).toBe('join');
    expect(matchFaq('je veux adhérer').match?.id).toBe('join');
  });

  it('matches poles and events', () => {
    expect(matchFaq('Quels sont les pôles ?').match?.id).toBe('poles');
    expect(matchFaq('prochains hackathons').match?.id).toBe('events');
  });

  it('matches resources and dashboard', () => {
    expect(matchFaq('où sont les ressources pédagogiques').match?.id).toBe('resources');
    expect(matchFaq('comment accéder au dashboard').match?.id).toBe('dashboard');
  });

  it('returns fallback with suggestions for unknown input', () => {
    const result = matchFaq('xyzzy foobar');
    expect(result.match).toBeNull();
  });

  it('does not match unrelated gibberish confidently', () => {
    expect(matchFaq('asdfghjkl qwerty').match).toBeNull();
  });

  it('handles accent-insensitive matching', () => {
    expect(matchFaq('comment adherer').match?.id).toBe('join');
    expect(matchFaq('événements à venir').match?.id).toBe('events');
  });
});
