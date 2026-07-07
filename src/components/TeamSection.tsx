'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { ITeamMember } from '@/lib/team/types';
import { TEAM_POLES } from '@/lib/team/poles';

type TeamSectionProps = {
    initialMembers?: ITeamMember[];
    locale?: 'fr' | 'en';
};

export default function TeamSection({ initialMembers, locale: localeProp }: TeamSectionProps) {
    const [members, setMembers] = useState<ITeamMember[]>(initialMembers ?? []);
    const [loading, setLoading] = useState(!initialMembers?.length);
    const [locale, setLocale] = useState<'en' | 'fr'>(localeProp ?? 'fr');

    useEffect(() => {
        if (localeProp) {
            setLocale(localeProp);
            return;
        }
        const path = window.location.pathname;
        setLocale(path.startsWith('/fr') ? 'fr' : 'en');
    }, [localeProp]);

    useEffect(() => {
        if (initialMembers?.length) {
            setMembers(initialMembers);
            setLoading(false);
            return;
        }

        fetch('/api/team-members')
            .then(res => res.ok ? res.json() : [])
            .then(data => setMembers(Array.isArray(data) ? data : []))
            .catch(() => setMembers([]))
            .finally(() => setLoading(false));
    }, [initialMembers]);

    const referents = members.filter(m => m.section === 'referent');
    const executives = members.filter(m => m.section === 'executive');
    const poleMembers = members.filter(m => m.section === 'pole' && m.name !== '—');
    const poleVacant = members.filter(m => m.section === 'pole' && m.name === '—');
    const mentors = members.filter(m => m.section === 'mentor');

    const poleGroups = poleMembers.reduce<Record<string, ITeamMember[]>>((acc, m) => {
        const key = m.poleKey || m.role;
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
        return acc;
    }, {});

    const vacantPoleKeys = new Set(poleVacant.map(p => p.poleKey).filter(Boolean) as string[]);

    const techPoles = TEAM_POLES.filter(p => p.category === 'tech');
    const nonTechPoles = TEAM_POLES.filter(p => p.category === 'non_tech');

    const SocialLink = ({ type, url }: { type: 'linkedin' | 'github', url?: string }) => {
        if (!url) return null;
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors p-1" aria-label={type}>
                {type === 'linkedin' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                )}
            </a>
        );
    };

    const MemberCard = ({ member, large = false }: { member: ITeamMember; large?: boolean }) => (
        <div className={`p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-brand-500/30 transition-all duration-300 group ${large ? 'max-w-sm mx-auto' : ''}`}>
            <div className={`${large ? 'w-24 h-24' : 'w-20 h-20'} mx-auto mb-4 rounded-full bg-zinc-900 border-2 border-brand-500/25 flex items-center justify-center overflow-hidden group-hover:border-brand-400/50 transition-colors relative`}>
                {member.photoUrl ? (
                    <Image src={member.photoUrl} alt={member.name} fill className="object-cover" sizes="96px" />
                ) : (
                    <span className="text-2xl font-bold text-white/40">{member.name.charAt(0)}</span>
                )}
            </div>
            <div className="text-sm text-brand-300 font-bold mb-1 tracking-widest uppercase">{member.role}</div>
            <div className="text-lg font-bold text-white mb-1">{member.name}</div>
            {member.title && <div className="text-xs text-gray-400 mb-2">{member.title}</div>}
            {member.description && <p className="text-xs text-gray-400 mb-3">{member.description}</p>}
            <div className="flex justify-center gap-4 border-t border-white/10 pt-4">
                <SocialLink type="linkedin" url={member.socialLinks.linkedin} />
                <SocialLink type="github" url={member.socialLinks.github} />
            </div>
        </div>
    );

    const PoleCard = ({ poleKey, poleDef, assigned }: { poleKey: string; poleDef?: typeof TEAM_POLES[0]; assigned: ITeamMember[] }) => {
        const isVacant = assigned.length === 0 || vacantPoleKeys.has(poleKey);
        const name = poleDef ? (locale === 'fr' ? poleDef.nameFr : poleDef.nameEn) : assigned[0]?.role || poleKey;
        const mission = poleDef ? (locale === 'fr' ? poleDef.missionFr : poleDef.missionEn) : assigned[0]?.description;

        return (
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 text-left flex items-start gap-4 group hover:-translate-y-1 hover:shadow-xl">
                <div className="flex shrink-0">
                    {isVacant ? (
                        <div className="w-14 h-14 rounded-xl bg-blue-900/40 border border-dashed border-white/20 flex items-center justify-center text-white/30 text-xs font-bold">
                            ?
                        </div>
                    ) : (
                        assigned.map((m, idx) => (
                            <div key={m.id} className={`w-14 h-14 rounded-xl bg-[#020617] border border-white/10 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-[#020617] relative ${idx > 0 ? '-ml-4 z-10' : 'z-20'}`}>
                                {m.photoUrl ? (
                                    <Image src={m.photoUrl} alt={m.name} fill className="object-cover" sizes="56px" />
                                ) : (
                                    <span className="text-lg font-bold text-white/40">{m.name.charAt(0)}</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold mb-0.5 text-brand-300 group-hover:brightness-125 transition-all leading-tight">{name}</h4>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-bold">
                        {isVacant
                            ? (locale === 'fr' ? 'Responsable à nommer' : 'Lead to be assigned')
                            : assigned.length > 1 ? 'Co-Leads' : (assigned[0]?.title || 'Lead')}
                    </div>
                    {!isVacant && (
                        <div className="text-white text-sm font-medium mb-1 truncate">
                            {assigned.map(m => m.name).join(' & ')}
                        </div>
                    )}
                    {mission && (
                        <p className="text-xs text-gray-400 mb-2 leading-snug min-h-[2.5em]">{mission}</p>
                    )}
                </div>
            </div>
        );
    };

    const renderPoleGrid = (poles: typeof TEAM_POLES) => (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {poles.map(pole => (
                <PoleCard
                    key={pole.key}
                    poleKey={pole.key}
                    poleDef={pole}
                    assigned={poleGroups[pole.key] || []}
                />
            ))}
        </div>
    );

    if (loading) {
        return (
            <section id="team" className="py-20 px-4 min-h-[400px] flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-2 border-white/20 border-t-blue-400 rounded-full" />
            </section>
        );
    }

    if (members.length === 0) {
        return (
            <section id="team" className="py-20 px-4 text-center">
                <p className="text-white/40">
                    {locale === 'fr' ? 'Aucun membre de l\'équipe à afficher.' : 'No team members to display.'}
                </p>
            </section>
        );
    }

    return (
        <section id="team" className="py-16 sm:py-20 px-4 min-h-0 sm:min-h-screen flex flex-col justify-center relative">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-900/15 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-zinc-800/20 rounded-full blur-[100px] -z-10" />

            <div className="max-w-6xl mx-auto w-full text-center z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-12 text-white tracking-tight">
                    {locale === 'fr' ? 'Notre Équipe' : 'Our Team'}
                </h2>

                {referents.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-xl font-bold mb-8 text-white/90 border-b border-white/10 pb-3 inline-block">
                            {locale === 'fr' ? 'Notre Référent' : 'Our Referent'}
                        </h3>
                        <div className="flex justify-center">
                            {referents.map(m => <MemberCard key={m.id} member={m} large />)}
                        </div>
                    </div>
                )}

                {executives.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-xl font-bold mb-8 text-white/90 border-b border-white/10 pb-3 inline-block">
                            {locale === 'fr' ? 'Bureau Exécutif' : 'Executive Board'}
                        </h3>
                        <div className="flex flex-col md:flex-row justify-center gap-6">
                            {executives.map(m => <MemberCard key={m.id} member={m} large />)}
                        </div>
                    </div>
                )}

                <div className="mb-16">
                    <h3 className="text-xl font-bold mb-4 text-white/90 border-b border-white/10 pb-3 inline-block">
                        {locale === 'fr' ? 'Pôles Techniques' : 'Technical Poles'}
                    </h3>
                    <div className="mb-8 hidden md:block max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10 opacity-80">
                        <Image src="/assets/team/charts/poles-tech.png" alt="" width={1024} height={579} className="w-full h-auto" />
                    </div>
                    {renderPoleGrid(techPoles)}
                </div>

                <div className="mb-16">
                    <h3 className="text-xl font-bold mb-4 text-white/90 border-b border-white/10 pb-3 inline-block">
                        {locale === 'fr' ? 'Pôles Non-Techniques' : 'Non-Technical Poles'}
                    </h3>
                    <div className="mb-8 hidden md:block max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10 opacity-80">
                        <Image src="/assets/team/charts/poles-non-tech.png" alt="" width={1024} height={579} className="w-full h-auto" />
                    </div>
                    {renderPoleGrid(nonTechPoles)}
                </div>

                {mentors.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold mb-8 text-white/90 border-b border-white/10 pb-3 inline-block">
                            {locale === 'fr' ? 'Nos Mentors' : 'Our Mentors'}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            {mentors.map(mentor => (
                                <div key={mentor.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all flex flex-col items-center text-center gap-2">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 relative">
                                        {mentor.photoUrl ? (
                                            <Image src={mentor.photoUrl} alt={mentor.name} fill className="object-cover" sizes="64px" />
                                        ) : (
                                            <span className="flex items-center justify-center w-full h-full text-white/40 font-bold">{mentor.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-semibold leading-tight">{mentor.name}</p>
                                        {mentor.title && <p className="text-[10px] text-brand-300/80 mt-1">{mentor.title}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
