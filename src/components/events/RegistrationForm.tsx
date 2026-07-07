'use client';

import { useState, useTransition } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/events/utils';
import { User, Mail, Calendar, Check, X, AlertCircle } from 'lucide-react';

interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  spotsLeft: number;
  isRegistered: boolean;
  isPast: boolean;
  isFull: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RegistrationForm({
  eventId,
  eventTitle,
  eventDate,
  spotsLeft,
  isRegistered,
  isPast,
  isFull,
  onSuccess,
  onCancel,
}: RegistrationFormProps) {
  const { isSignedIn, userId } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isSignedIn) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
        <User className="w-10 h-10 text-white/30 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Sign In Required
        </h3>
        <p className="text-white/60 mb-4">
          You need to be signed in to register for this event.
        </p>
        <a
          href="/sign-in"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (isPast) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
        <Calendar className="w-10 h-10 text-white/30 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Event Has Passed
        </h3>
        <p className="text-white/60">
          This event has already taken place.
        </p>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="p-6 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-3">
          <Check className="w-7 h-7 text-brand-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          You're Registered!
        </h3>
        <p className="text-white/60 mb-4">
          {eventTitle} • {formatDate(eventDate)}
        </p>
        <button
          onClick={() => {
            startTransition(async () => {
              try {
                const response = await fetch(`/api/events/${eventId}/cancel`, {
                  method: 'DELETE',
                });

                if (!response.ok) throw new Error('Failed to cancel');

                if (onCancel) onCancel();
                window.location.reload();
              } catch (err) {
                setError('Failed to cancel registration');
              }
            });
          }}
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          {isPending ? 'Cancelling...' : 'Cancel Registration'}
        </button>
      </div>
    );
  }

  const handleRegister = async () => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/register`, {
          method: 'POST',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to register');
        }

        setSuccess(true);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  if (success) {
    return (
      <div className="p-6 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-3">
          <Check className="w-7 h-7 text-brand-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Registration Successful!
        </h3>
        <p className="text-white/60">
          Check your email for confirmation details.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">
        Register for this Event
      </h3>

      {/* User Info */}
      <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-white/40" />
          <span className="text-white/70">Membre connecté</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-white/40" />
          <span className="text-white/70">{userId?.slice(0, 8)}...</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Capacity Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/60">Availability</span>
          <span className={cn(
            'font-medium',
            spotsLeft <= 5 ? 'text-red-400' : 'text-white/70'
          )}>
            {spotsLeft} spots left
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              spotsLeft <= 5 ? 'bg-red-500' : spotsLeft <= 20 ? 'bg-amber-500' : 'bg-brand-500'
            )}
            style={{ width: `${Math.min(100, (100 - (spotsLeft / (spotsLeft + 10)) * 100))}%` }}
          />
        </div>
      </div>

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={isPending || isFull}
        className={cn(
          'w-full py-3 rounded-xl font-semibold transition-all',
          isFull
            ? 'bg-white/5 text-white/40 cursor-not-allowed'
            : 'bg-white text-black hover:bg-white/90',
          isPending && 'opacity-50'
        )}
      >
        {isPending ? 'Registering...' : isFull ? 'Event Full' : 'Register Now'}
      </button>
    </div>
  );
}
