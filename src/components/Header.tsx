"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BrandLogo } from '@/components/BrandLogo';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const dashboardRoutes = [
    '/dashboard', '/admin', '/profile', '/settings',
    '/resources', '/forum', '/events', '/my-registrations',
    '/my-resources', '/change-password', '/intranet', '/chat', '/attendance',
];

export default function Header() {
    const t = useTranslations('Header');
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const segments = pathname.split('/');
    const isDashboardRoute = dashboardRoutes.some((route) =>
        segments.includes(route.replace('/', ''))
    );
    if (isDashboardRoute) return null;

    const navLinks = [
        { href: '/#about', label: t('about') },
        { href: '/#team', label: t('team') },
        { href: '/blog', label: t('blog') },
        { href: '/partners', label: t('partners') },
        { href: '/#events', label: t('events') },
        { href: '/#projects', label: t('projects') },
    ];

    const locale = pathname.startsWith('/fr') ? 'fr' : 'en';

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center shrink-0" aria-label="EPI'AI home">
                    <BrandLogo size="lg" priority />
                </Link>

                <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-white/80 hover:text-white transition-colors font-medium text-sm"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <select
                        onChange={(e) => {
                            window.location.href = `/${e.target.value}${pathname.replace(/^\/(fr|en)/, '')}`;
                        }}
                        defaultValue={locale}
                        aria-label={t('language')}
                        className="bg-transparent text-white/80 border border-white/20 rounded-lg px-2 py-1 text-sm"
                    >
                        <option value="en" className="text-black">EN</option>
                        <option value="fr" className="text-black">FR</option>
                    </select>
                    <Link
                        href="/join"
                        className="text-white/80 hover:text-white text-sm font-medium"
                    >
                        {t('join')}
                    </Link>
                    <Link href="/sign-in">
                        <span className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-white/15 border border-white/30">
                            {t('sign_in')}
                        </span>
                    </Link>
                </nav>

                <button
                    type="button"
                    className="lg:hidden p-2 text-white/80 hover:text-white"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-expanded={mobileOpen}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="lg:hidden border-t border-white/10 bg-black/80 backdrop-blur-xl overflow-hidden"
                        aria-label="Mobile"
                    >
                        <ul className="flex flex-col p-4 gap-1">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="block py-3 px-4 rounded-xl text-white/90 hover:bg-white/10"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <div className="px-4 py-2">
                                    <label htmlFor="mobile-locale" className="sr-only">{t('language')}</label>
                                    <select
                                        id="mobile-locale"
                                        onChange={(e) => {
                                            window.location.href = `/${e.target.value}${pathname.replace(/^\/(fr|en)/, '')}`;
                                        }}
                                        defaultValue={locale}
                                        className="w-full bg-white/5 text-white border border-white/20 rounded-xl px-4 py-3 text-sm"
                                    >
                                        <option value="en" className="text-black">English</option>
                                        <option value="fr" className="text-black">Français</option>
                                    </select>
                                </div>
                            </li>
                            <li>
                                <Link href="/join" onClick={() => setMobileOpen(false)} className="block py-3 px-4 rounded-xl text-brand-400">
                                    {t('join')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="block py-3 px-4 rounded-xl bg-white/10 text-center text-white font-medium">
                                    {t('sign_in')}
                                </Link>
                            </li>
                        </ul>
                    </motion.nav>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
