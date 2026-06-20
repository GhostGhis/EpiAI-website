'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
    const { user } = useUser();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleResendEmail = async () => {
        setError('');
        setSending(true);

        try {
            if (!user) return;

            const primaryEmail = user.emailAddresses.find(
                (email) => email.id === user.primaryEmailAddressId
            );

            if (!primaryEmail) {
                throw new Error('No primary email found');
            }

            // Renvoyer l'email de vérification
            await primaryEmail.prepareVerification({ strategy: 'email_code' });

            setSent(true);
            setTimeout(() => setSent(false), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to send verification email');
        } finally {
            setSending(false);
        }
    };

    // Vérifier si l'email est déjà vérifié
    const primaryEmail = user?.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
    );
    const isVerified = primaryEmail?.verification?.status === 'verified';

    if (isVerified) {
        // Si déjà vérifié, rediriger vers le dashboard
        router.push(`/${locale}/dashboard`);
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-4">
            <div className="w-full max-w-md">
                <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                            <Mail className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Vérifiez votre email
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Nous avons envoyé un email de vérification à
                        </p>
                        <p className="text-white font-medium mt-2">
                            {primaryEmail?.emailAddress}
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-zinc-900/30 rounded-lg p-4 mb-6">
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-400" />
                            Étapes à suivre :
                        </h3>
                        <ol className="space-y-2 text-sm text-zinc-300">
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">1.</span>
                                Ouvrez votre boîte mail
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">2.</span>
                                Recherchez l&apos;email de Epi&apos;AI
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">3.</span>
                                Cliquez sur le lien de vérification
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">4.</span>
                                Revenez sur cette page
                            </li>
                        </ol>
                    </div>

                    {/* Success message */}
                    {sent && (
                        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-green-400 text-sm">
                                Email de vérification envoyé avec succès !
                            </p>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Resend button */}
                    <button
                        onClick={handleResendEmail}
                        disabled={sending || sent}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 mb-4"
                    >
                        {sending ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Envoi en cours...
                            </span>
                        ) : sent ? (
                            'Email envoyé ✓'
                        ) : (
                            'Renvoyer l\'email de vérification'
                        )}
                    </button>

                    {/* Help text */}
                    <div className="text-center">
                        <p className="text-zinc-400 text-sm mb-4">
                            Vous n&apos;avez pas reçu d&apos;email ? Vérifiez vos spams.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour à l&apos;accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
