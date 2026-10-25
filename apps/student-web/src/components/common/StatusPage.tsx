import { Link } from 'react-router-dom';

export function StatusPage({ code, message }: { code: string; message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 text-center">
      <h1 className="m-0 text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        {code}
      </h1>
      <p className="m-0 text-xl font-bold text-slate-800 dark:text-slate-100">{message}</p>
      <Link to="/" className="mt-2 font-bold text-sm text-[#4F46E5] dark:text-indigo-400 underline underline-offset-2">
        Back to Dashboard
      </Link>
    </div>
  );
}
