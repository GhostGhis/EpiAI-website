'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-white mb-4">Error</h1>
        <p className="text-xl text-white/60 mb-8">
          Something went wrong. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition"
          >
            Try Again
          </button>
          <Link href="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
