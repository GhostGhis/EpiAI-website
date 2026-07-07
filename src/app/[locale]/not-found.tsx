import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-white/60 mb-8">Page not found</p>
        <Link href="/" className="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
