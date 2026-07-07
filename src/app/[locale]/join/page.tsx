'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

export default function JoinPage() {
    const t = useTranslations('Join');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const conditions = t('conditions_list').split(';');
    const procedure = t('procedure_steps').split(';');
    const rights = t('rights_list').split(';');
    const duties = t('duties_list').split(';');

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        whatsapp: '',
        motivations: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/membership', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit application');
            }

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen font-[family-name:var(--font-geist-sans)] text-white overflow-x-hidden">
            {/* Background Image */}
            <div className="fixed inset-0 -z-10">
                <Image
                    src="/assets/hero-bg.jpg"
                    alt="Background"
                    fill
                    className="object-cover brightness-[0.2] scale-105"
                    priority
                />
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 relative z-10">
                {/* Intro Section */}
                <div className="text-center mb-20 animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tight">
                        {t('title')}
                    </h1>
                    <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl max-w-4xl mx-auto shadow-2xl transition-all duration-500 hover:border-white/20">
                        <h2 className="text-brand-300 text-sm font-bold uppercase tracking-[0.3em] mb-6">
                            {t('intro_title')}
                        </h2>
                        <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light italic">
                            "{t('intro_text')}"
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {/* Conditions */}
                    <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/25 flex items-center justify-center text-brand-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold">{t('conditions_title')}</h3>
                        </div>
                        <ul className="space-y-4">
                            {conditions.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Engagement */}
                    <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-600/15 border border-brand-500/25 flex items-center justify-center text-brand-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold">{t('engagement_title')}</h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed leading-relaxed font-light">
                            {t('engagement_text')}
                        </p>
                    </div>
                </div>

                {/* Procedure & Fees */}
                <div className="grid md:grid-cols-2 gap-8 mb-20 uppercase-titles">
                    <div className="space-y-8">
                        {/* Procedure */}
                        <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md">
                            <h3 className="text-brand-300 text-xs font-bold tracking-widest mb-6">{t('procedure_title')}</h3>
                            <div className="space-y-6 relative ml-4">
                                <div className="absolute left-[-16px] top-2 bottom-2 w-px bg-white/10"></div>
                                {procedure.map((step, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute left-[-20px] top-1.5 w-2 h-2 rounded-full bg-brand-500 border-2 border-slate-900"></div>
                                        <p className="text-gray-300 text-sm">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fees */}
                        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                            <h3 className="text-brand-300 text-xs font-bold tracking-widest mb-4">{t('fees_title')}</h3>
                            <p className="text-2xl font-black mb-2">5.00€ <span className="text-sm font-normal text-gray-400">/ {t('fees_per_year')}</span></p>
                            <p className="text-xs text-gray-400 italic leading-relaxed">
                                {t('fees_text')}
                            </p>
                        </div>
                    </div>

                    {/* Rights & Duties */}
                    <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md flex flex-col">
                        <div className="mb-10">
                            <h3 className="text-brand-400 text-xs font-bold tracking-widest mb-6">{t('rights_title')}</h3>
                            <ul className="space-y-3">
                                {rights.map((right, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-200 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <svg className="w-4 h-4 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {right}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-red-400 text-xs font-bold tracking-widest mb-6">{t('duties_title')}</h3>
                            <ul className="space-y-3">
                                {duties.map((duty, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-200 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                        </svg>
                                        {duty}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                <div id="apply" className="mt-20 scroll-mt-32">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-4">{t('form_title')}</h2>
                        <p className="text-gray-400 font-light">{t('cta_text')}</p>
                    </div>

                    <div className="glass-panel p-8 md:p-12 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-xl max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                        {submitted ? (
                            <div className="py-20 text-center animate-fade-in">
                                <div className="w-20 h-20 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-8 text-brand-400">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">{t('form_success')}</h3>
                                <button
                                    onClick={() => { setSubmitted(false); setFormData({ firstName: '', lastName: '', email: '', whatsapp: '', motivations: '' }); }}
                                    className="text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors"
                                >
                                    Envoyer une autre candidature
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t('form_first_name')}</label>
                                        <input
                                            required
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all font-light"
                                            placeholder="Jean"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t('form_last_name')}</label>
                                        <input
                                            required
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all font-light"
                                            placeholder="Dupont"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t('form_email')}</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all font-light"
                                        placeholder="jean.dupont@epitech.eu"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t('form_whatsapp')}</label>
                                    <input
                                        required
                                        type="tel"
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all font-light"
                                        placeholder="+33 6 00 00 00 00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t('form_motivations')}</label>
                                    <textarea
                                        required
                                        name="motivations"
                                        value={formData.motivations}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all font-light resize-none"
                                        placeholder={t('form_motivations_placeholder')}
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            t('form_submit')
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
