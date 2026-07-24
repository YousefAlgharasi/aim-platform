import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--surface-sunken)] text-[var(--color-primary-500)] font-bold text-2xl">
        404
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Page Not Found</h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm">
        The admin resource or page you requested could not be found or has been moved.
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] transition-colors mt-2"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
