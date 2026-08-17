import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
          404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Career path not found
        </h1>

        <p className="mt-3 text-slate-500">
          We couldn't find the career path you're looking for.
        </p>

        <Link
          href="/jobs"
          className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Explore jobs
        </Link>
      </div>
    </main>
  );
}