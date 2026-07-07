'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGate } from '@/components/shared/PermissionGate';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  Upload,
  ImageIcon,
} from 'lucide-react';
import type { ITeamMember, CreateTeamMemberInput } from '@/lib/team/types';
import { TEAM_POLES } from '@/lib/team/poles';

const SECTION_OPTIONS = [
  { value: 'executive', label: { en: 'Executive Board', fr: 'Bureau Exécutif' } },
  { value: 'referent', label: { en: 'Referent', fr: 'Référent' } },
  { value: 'pole', label: { en: 'Strategic Pole', fr: 'Pôle Stratégique' } },
  { value: 'mentor', label: { en: 'Mentor', fr: 'Mentor' } },
];

export default function AdminTeamPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const [members, setMembers] = useState<ITeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ITeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateTeamMemberInput & { isActive?: boolean }>({
    name: '',
    role: '',
    title: '',
    section: 'pole',
    poleKey: '',
    description: '',
    photoUrl: '',
    socialLinks: { linkedin: '', github: '' },
    displayOrder: 0,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch('/api/team-members?all=true');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditing(null);
    setForm({
      name: '',
      role: '',
      title: '',
      section: 'pole',
      poleKey: '',
      description: '',
      photoUrl: '',
      socialLinks: { linkedin: '', github: '' },
      displayOrder: members.length,
    });
    setShowForm(true);
  }

  function openEditForm(member: ITeamMember) {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      title: member.title || '',
      section: member.section,
      poleKey: member.poleKey || '',
      description: member.description || '',
      photoUrl: member.photoUrl || '',
      socialLinks: { ...member.socialLinks },
      displayOrder: member.displayOrder,
      isActive: member.isActive,
    });
    setShowForm(true);
  }

  const handlePhotoUpload = useCallback(async (file: File) => {
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch('/api/upload/team-photo', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setForm(f => ({ ...f, photoUrl: data.url }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      console.error('Upload error:', e);
      alert('Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  }, []);

  async function handleSave() {
    try {
      const url = editing ? `/api/team-members/${editing.id}` : '/api/team-members';
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowForm(false);
        fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error || 'Error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(locale === 'fr' ? 'Supprimer ce membre?' : 'Delete this member?')) return;

    try {
      const res = await fetch(`/api/team-members/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMembers();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleToggleActive(member: ITeamMember) {
    try {
      const res = await fetch(`/api/team-members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      if (res.ok) fetchMembers();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const grouped = {
    executive: members.filter(m => m.section === 'executive'),
    pole: members.filter(m => m.section === 'pole'),
    mentor: members.filter(m => m.section === 'mentor'),
  };

  return (
    <PermissionGate permission="team.manage">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {locale === 'fr' ? 'Gestion de l\'Équipe' : 'Team Management'}
            </h1>
            <p className="text-white/60">
              {locale === 'fr'
                ? 'Gérez les membres affichés sur la page d\'accueil. Les changements sont immédiats.'
                : 'Manage team members displayed on the homepage. Changes are immediate.'}
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            {locale === 'fr' ? 'Ajouter' : 'Add Member'}
          </button>
        </div>

        {/* Member Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-zinc-900 rounded-2xl border border-white/10 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {editing
                    ? (locale === 'fr' ? 'Modifier le membre' : 'Edit Member')
                    : (locale === 'fr' ? 'Ajouter un membre' : 'Add Member')}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">{locale === 'fr' ? 'Nom complet' : 'Full Name'} *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-white/30 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">{locale === 'fr' ? 'Rôle/Poste' : 'Role/Position'} *</label>
                    <input
                      value={form.role}
                      onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                      placeholder="Ex: Président, Chef Pôle Tech"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-white/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">{locale === 'fr' ? 'Titre' : 'Title'}</label>
                    <input
                      value={form.title || ''}
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Ex: Lead, Co-Lead"
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-white/30 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Section *</label>
                    <select
                      value={form.section}
                      onChange={(e) => setForm(f => ({ ...f, section: e.target.value as any }))}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-white/30 outline-none"
                    >
                      {SECTION_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label[locale as 'en' | 'fr']}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">{locale === 'fr' ? 'Clé du pôle' : 'Pole Key'}</label>
                    <select
                      value={form.poleKey || ''}
                      onChange={(e) => setForm(f => ({ ...f, poleKey: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-white/30 outline-none"
                    >
                      <option value="">—</option>
                      {TEAM_POLES.map(p => (
                        <option key={p.key} value={p.key}>
                          {locale === 'fr' ? p.nameFr : p.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1 block">
                    {locale === 'fr' ? 'Photo' : 'Photo'}
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                    className="relative cursor-pointer rounded-xl border-2 border-dashed border-white/10 hover:border-white/30 transition-colors group overflow-hidden"
                    style={{ minHeight: '100px' }}
                  >
                    {form.photoUrl ? (
                      <div className="relative">
                        <img
                          src={form.photoUrl}
                          alt="Preview"
                          className="w-full h-36 object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                          <div className="text-white text-center">
                            <Upload className="w-6 h-6 mx-auto mb-1" />
                            <p className="text-xs">{locale === 'fr' ? 'Changer la photo' : 'Change photo'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-white/30 group-hover:text-white/50 transition-colors">
                        {photoUploading ? (
                          <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full" />
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <p className="text-xs font-medium">{locale === 'fr' ? 'Cliquer ou glisser une photo' : 'Click or drag a photo'}</p>
                            <p className="text-[10px] mt-1">JPEG, PNG, WebP — max 5MB</p>
                          </>
                        )}
                      </div>
                    )}
                    {photoUploading && form.photoUrl && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                        <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full" />
                      </div>
                    )}
                  </div>
                  {form.photoUrl && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, photoUrl: '' })); }}
                      className="mt-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
                    >
                      {locale === 'fr' ? '✕ Supprimer la photo' : '✕ Remove photo'}
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1 block">Description</label>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-white/30 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">LinkedIn</label>
                    <input
                      value={form.socialLinks?.linkedin || ''}
                      onChange={(e) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, linkedin: e.target.value } }))}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-white/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">GitHub</label>
                    <input
                      value={form.socialLinks?.github || ''}
                      onChange={(e) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, github: e.target.value } }))}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-white/30 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1 block">{locale === 'fr' ? 'Ordre d\'affichage' : 'Display Order'}</label>
                  <input
                    type="number"
                    value={form.displayOrder || 0}
                    onChange={(e) => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-24 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-white/30 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {locale === 'fr' ? 'Sauvegarder' : 'Save'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors"
                >
                  {locale === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members by Section */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="h-5 w-40 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([section, sectionMembers]) => (
            <div key={section}>
              <h2 className="text-lg font-bold text-white mb-3">
                {SECTION_OPTIONS.find(s => s.value === section)?.label[locale as 'en' | 'fr'] || section}
                <span className="text-white/30 text-sm ml-2">({sectionMembers.length})</span>
              </h2>

              {sectionMembers.length === 0 ? (
                <p className="text-white/30 text-sm py-2">{locale === 'fr' ? 'Aucun membre' : 'No members'}</p>
              ) : (
                <div className="space-y-2 mb-6">
                  {sectionMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${member.isActive
                          ? 'bg-white/5 border-white/10'
                          : 'bg-white/[0.02] border-white/5 opacity-50'
                        }`}
                    >
                      {/* Photo */}
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white/40 text-lg font-bold">{member.name.charAt(0)}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{member.name}</p>
                        <p className="text-white/50 text-xs">{member.role} {member.title ? `- ${member.title}` : ''}</p>
                        {member.poleKey && <p className="text-white/30 text-[10px]">{member.poleKey}</p>}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActive(member)}
                          className={`p-2 rounded-lg transition-colors ${member.isActive
                              ? 'text-brand-400 hover:bg-brand-500/10'
                              : 'text-white/30 hover:bg-white/5'
                            }`}
                          title={member.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {member.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditForm(member)}
                          className="p-2 rounded-lg text-brand-400 hover:bg-brand-500/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </PermissionGate>
  );
}
