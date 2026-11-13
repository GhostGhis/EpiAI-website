'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  INTERVIEW_DECISION_BANDS,
  INTERVIEW_GUIDE,
  INTERVIEW_SCALE,
  INTERVIEW_SECTIONS,
  decisionForScore,
  sectionAlert,
} from '@/lib/admission/interview-grid';
import { cn } from '@/lib/utils/cn';

type Question = {
  id: string;
  code: string;
  section: string;
  prompt: string;
  maxPoints: number;
  lookingFor: string;
  followUp: string;
  criteria: Array<{ scores: string; level: string; indicators: string }>;
  isVeto: boolean;
};

type Props = {
  fr: boolean;
  candidateName: string;
  questions: Question[];
  points: Record<string, number>;
  remarks: Record<string, string>;
  notes: string;
  closure: {
    candidateQuestions?: string;
    engagement?: Record<string, 'yes' | 'no' | 'reserve'>;
    engagementNotes?: Record<string, string>;
  };
  busy: boolean;
  onPoints: (questionId: string, value: number) => void;
  onRemark: (questionId: string, value: string) => void;
  onNotes: (value: string) => void;
  onClosure: (next: Props['closure']) => void;
  onClose: () => void;
  onSave: (decision?: 'validated' | 'rejected') => void;
};

const fieldClass =
  'w-full rounded-lg border border-default bg-card px-3 py-2 text-sm text-primary transition-[border-color,box-shadow] hover:border-brand-400/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25';

export function InterviewScoreSheet({
  fr,
  candidateName,
  questions,
  points,
  remarks,
  notes,
  closure,
  busy,
  onPoints,
  onRemark,
  onNotes,
  onClosure,
  onClose,
  onSave,
}: Props) {
  const [guideOpen, setGuideOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D' | 'close'>('A');

  const byCode = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of questions) {
      if (q.code) map.set(q.code, q);
      else map.set(q.id, q);
    }
    return map;
  }, [questions]);

  const sectionScores = useMemo(() => {
    const out: Record<string, { score: number; max: number }> = {};
    for (const section of INTERVIEW_SECTIONS) {
      let score = 0;
      let max = 0;
      for (const def of section.questions) {
        const q = byCode.get(def.code);
        if (!q) continue;
        score += points[q.id] || 0;
        max += q.maxPoints;
      }
      out[section.id] = { score, max: max || section.maxPoints };
    }
    return out;
  }, [byCode, points]);

  const total = Object.values(points).reduce((a, b) => a + b, 0);
  const totalMax = questions.reduce((a, q) => a + q.maxPoints, 0) || 70;
  const decision = decisionForScore(total);
  const vetoQ = questions.find((q) => q.isVeto || q.code === 'D3');
  const vetoTriggered = vetoQ ? (points[vetoQ.id] || 0) > 0 && (points[vetoQ.id] || 0) <= 1 : false;
  const unanswered = questions.filter((q) => !points[q.id]).length;

  const engagement = closure.engagement || {};

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-[#07112b]/80 p-0 sm:items-center sm:p-4">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-[linear-gradient(165deg,#0b1a3d_0%,#102554_45%,#0d1b4a_100%)] text-white shadow-2xl sm:h-[min(92vh,900px)] sm:rounded-2xl sm:border sm:border-white/10">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-300/80">Epi&apos;AI · Jury</p>
            <h2 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{candidateName}</h2>
            <p className="text-xs text-white/60">
              {fr ? 'Grille numérique d’admission' : 'Digital admission grid'} · {total.toFixed(0)} / {totalMax}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label={fr ? 'Fermer' : 'Close'}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setGuideOpen((v) => !v)}
            className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left"
          >
            <span className="text-sm font-medium text-white/90">
              {fr ? 'Consignes & déroulé (≈ 30 min)' : 'Briefing & schedule (~30 min)'}
            </span>
            {guideOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {guideOpen ? (
            <div className="mb-5 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <ul className="space-y-2 text-[13px] leading-relaxed text-white/75">
                {INTERVIEW_GUIDE.consignes.map((line) => (
                  <li key={line} className="pl-3 border-l-2 border-sky-400/40">{line}</li>
                ))}
              </ul>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-xs">
                  <thead>
                    <tr className="text-white/50">
                      <th className="pb-2 font-medium">{fr ? 'Étape' : 'Step'}</th>
                      <th className="pb-2 font-medium">{fr ? 'Durée' : 'Time'}</th>
                      <th className="pb-2 font-medium">{fr ? 'Contenu' : 'Content'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INTERVIEW_GUIDE.schedule.map((row) => (
                      <tr key={row.step} className="border-t border-white/10 text-white/80">
                        <td className="py-1.5 pr-3 font-medium text-sky-200">{row.step}</td>
                        <td className="py-1.5 pr-3 whitespace-nowrap">{row.duration}</td>
                        <td className="py-1.5">{row.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {INTERVIEW_SCALE.map((row) => (
                  <div key={row.scores} className="rounded-xl bg-white/5 px-3 py-2">
                    <p className="text-xs font-semibold text-sky-200">{row.scores} · {row.level}</p>
                    <p className="mt-1 text-[11px] leading-snug text-white/65">{row.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mb-4 flex flex-wrap gap-2">
            {INTERVIEW_SECTIONS.map((section) => {
              const sc = sectionScores[section.id];
              const alert = sc ? sectionAlert(sc.max, sc.score) && sc.score > 0 : false;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition',
                    activeSection === section.id
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/10 text-white/75 hover:bg-white/15',
                  )}
                >
                  {section.id} · {sc?.score ?? 0}/{sc?.max ?? section.maxPoints}
                  {alert ? ' !' : ''}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setActiveSection('close')}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition',
                activeSection === 'close' ? 'bg-brand-500 text-white' : 'bg-white/10 text-white/75 hover:bg-white/15',
              )}
            >
              {fr ? 'Clôture' : 'Close'}
            </button>
          </div>

          {INTERVIEW_SECTIONS.filter((s) => s.id === activeSection).map((section) => (
            <div key={section.id} className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {section.id} — {section.title}{' '}
                  <span className="text-white/50">(/{section.maxPoints})</span>
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-white/65">{section.intro}</p>
              </div>
              {section.questions.map((def) => {
                const q = byCode.get(def.code);
                if (!q) return null;
                const value = points[q.id] || 0;
                return (
                  <article
                    key={q.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/90">
                          {q.code}
                          {q.isVeto ? (
                            <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-red-300 normal-case tracking-normal">
                              Veto
                            </span>
                          ) : null}
                        </p>
                        <h4 className="mt-1 text-[15px] font-medium leading-snug text-white">{q.prompt}</h4>
                      </div>
                      <span className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white/70">{q.maxPoints} pts</span>
                    </div>

                    <p className="mt-3 text-[12px] leading-relaxed text-white/55">
                      <span className="font-medium text-white/75">{fr ? 'Ce qu’on cherche · ' : 'Looking for · '}</span>
                      {q.lookingFor || def.lookingFor}
                    </p>

                    <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
                      {(q.criteria.length ? q.criteria : def.criteria).map((c) => (
                        <div key={`${q.id}-${c.scores}`} className="rounded-lg bg-black/25 px-2.5 py-2">
                          <p className="text-[11px] font-semibold text-sky-200/90">
                            {c.scores} · {c.level}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-white/55">{c.indicators}</p>
                        </div>
                      ))}
                    </div>

                    {(q.followUp || def.followUp) ? (
                      <p className="mt-3 text-[12px] italic text-amber-200/70">
                        {fr ? 'Relance · ' : 'Follow-up · '}
                        {q.followUp || def.followUp}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => onPoints(q.id, n)}
                          className={cn(
                            'h-11 w-11 rounded-xl text-sm font-semibold transition',
                            value === n
                              ? n <= 2
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                : n === 3
                                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                  : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-white/10 text-white/80 hover:bg-white/20',
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={remarks[q.id] || ''}
                      onChange={(e) => onRemark(q.id, e.target.value)}
                      rows={2}
                      placeholder={fr ? 'Notes du jury (faits observés)…' : 'Jury notes (observed facts)…'}
                      className={`mt-3 ${fieldClass} bg-black/20`}
                    />
                  </article>
                );
              })}
            </div>
          ))}

          {activeSection === 'close' ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">{fr ? 'Clôture (non notée)' : 'Closing (unscored)'}</h3>
                <p className="mt-1 text-sm text-white/65">
                  {fr
                    ? 'Questions du candidat et confirmation d’engagement avant délibération.'
                    : 'Candidate questions and commitment check before deliberation.'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <label className="text-sm font-medium text-white/85">
                  {fr ? '« As-tu des questions pour nous ? »' : '“Do you have questions for us?”'}
                </label>
                <textarea
                  value={closure.candidateQuestions || ''}
                  onChange={(e) => onClosure({ ...closure, candidateQuestions: e.target.value })}
                  rows={3}
                  className={`mt-2 ${fieldClass} bg-black/20`}
                  placeholder={fr ? 'Observations…' : 'Observations…'}
                />
              </div>
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-medium text-white/85">{fr ? 'Confirmation d’engagement' : 'Commitment check'}</p>
                {INTERVIEW_GUIDE.engagementChecks.map((item) => {
                  const key = item;
                  const val = engagement[key];
                  return (
                    <div key={item} className="rounded-xl border border-white/10 px-3 py-2">
                      <p className="text-[13px] text-white/80">{item}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(
                          [
                            ['yes', fr ? 'Oui' : 'Yes'],
                            ['no', fr ? 'Non' : 'No'],
                            ['reserve', fr ? 'Réserve' : 'Caveat'],
                          ] as const
                        ).map(([k, label]) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() =>
                              onClosure({
                                ...closure,
                                engagement: { ...engagement, [key]: k },
                              })
                            }
                            className={cn(
                              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                              val === k ? 'bg-brand-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15',
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <textarea
                value={notes}
                onChange={(e) => onNotes(e.target.value)}
                rows={4}
                className={`${fieldClass} bg-black/20`}
                placeholder={fr ? 'Synthèse & observations générales…' : 'Summary & general observations…'}
              />
            </div>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-white/10 bg-black/30 px-4 py-3 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            {INTERVIEW_DECISION_BANDS.map((b) => (
              <span
                key={b.label}
                className={cn(
                  'rounded-full px-2.5 py-1',
                  decision.label === b.label ? 'bg-brand-500/30 text-sky-100' : 'bg-white/5 text-white/45',
                )}
              >
                {b.min}–{b.max} · {b.label}
              </span>
            ))}
          </div>
          {vetoTriggered ? (
            <p className="mb-2 flex items-center gap-2 text-sm text-red-300">
              <AlertTriangle className="h-4 w-4" />
              {fr ? 'Veto D3 : note ≤ 1 — admission bloquée.' : 'D3 veto: score ≤ 1 — admission blocked.'}
            </p>
          ) : null}
          {unanswered > 0 ? (
            <p className="mb-2 text-xs text-amber-200/80">
              {fr ? `${unanswered} question(s) sans note.` : `${unanswered} unanswered question(s).`}
            </p>
          ) : (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-emerald-300/90">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {fr ? 'Toutes les questions sont notées.' : 'All questions scored.'}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-auto text-sm font-semibold">
              {total.toFixed(0)} / {totalMax}{' '}
              <span className="font-normal text-white/60">· {decision.label}</span>
            </p>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => onSave()}>
              {fr ? 'Enregistrer' : 'Save'}
            </Button>
            <Button size="sm" disabled={busy || vetoTriggered} onClick={() => onSave('validated')}>
              {fr ? 'Valider → membre' : 'Admit'}
            </Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => onSave('rejected')}>
              {fr ? 'Recaler' : 'Reject'}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
