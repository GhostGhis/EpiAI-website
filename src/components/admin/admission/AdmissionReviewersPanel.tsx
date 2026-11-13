'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Trash2, UserPlus } from 'lucide-react';
import { MemberPicker } from '@/components/members/MemberPicker';
import { Button, Panel } from '@/components/ui';

type Reviewer = {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string;
  createdAt: string;
};

export function AdmissionReviewersPanel({ locale }: { locale: string }) {
  const fr = locale === 'fr';
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/admission/reviewers');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (fr ? 'Impossible de charger la liste.' : 'Could not load the list.'));
        setReviewers([]);
        return;
      }
      const data = await res.json();
      setReviewers(data.reviewers || []);
    } catch {
      setError(fr ? 'Impossible de charger la liste.' : 'Could not load the list.');
    } finally {
      setLoading(false);
    }
  }, [fr]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function addReviewer() {
    if (!selectedId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/admission/reviewers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkUserId: selectedId,
          email: selectedEmail,
          displayName: selectedName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || (fr ? 'Ajout impossible.' : 'Could not add.'));
        return;
      }
      setSelectedId('');
      setSelectedName('');
      setSelectedEmail('');
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function removeReviewer(id: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/admission/reviewers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (fr ? 'Suppression impossible.' : 'Could not remove.'));
        return;
      }
      await reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      title={fr ? 'Correcteurs & évaluateurs' : 'Graders & interviewers'}
      description={
        fr
          ? 'Ajoute des membres (pas seulement admin / chefs de pôle) pour voir les copies, les corriger et évaluer les entretiens.'
          : 'Add members (not only admins / pole leads) so they can view papers, grade them, and score interviews.'
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-xs font-medium text-secondary">
              {fr ? 'Membre à ajouter' : 'Member to add'}
            </label>
            <MemberPicker
              locale={locale}
              selectedId={selectedId}
              selectedName={selectedName}
              placeholder={fr ? 'Rechercher un membre…' : 'Search a member…'}
              required={false}
              onSelect={(member) => {
                if (!member) {
                  setSelectedId('');
                  setSelectedName('');
                  setSelectedEmail('');
                  return;
                }
                setSelectedId(member.id);
                setSelectedName(member.name);
                setSelectedEmail(member.email);
              }}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={!selectedId || busy}
            onClick={() => void addReviewer()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {fr ? 'Ajouter' : 'Add'}
          </Button>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            {fr ? 'Chargement…' : 'Loading…'}
          </div>
        ) : reviewers.length === 0 ? (
          <p className="text-sm text-muted">
            {fr
              ? 'Aucun correcteur ajouté pour l’instant. Les présidents, admins généraux et chefs de pôle ont déjà accès.'
              : 'No extra graders yet. Presidents, general admins and pole leads already have access.'}
          </p>
        ) : (
          <ul className="divide-y divide-subtle rounded-xl border border-default">
            {reviewers.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary">{r.displayName || r.email}</p>
                  {r.email ? <p className="truncate text-xs text-muted">{r.email}</p> : null}
                </div>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
                  title={fr ? 'Retirer' : 'Remove'}
                  disabled={busy}
                  onClick={() => void removeReviewer(r.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
