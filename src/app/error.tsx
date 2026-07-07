'use client';

import { useEffect } from 'react';

export default function RootError({
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
    <html>
      <body className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold mb-4">Error</h1>
          <p className="text-xl text-white/60 mb-8">
            An unexpected error occurred.
          </p>
          <button
            onClick={reset}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 rounded-lg font-semibold transition"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
