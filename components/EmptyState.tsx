export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
        ?
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        No career paths found
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        There are currently no jobs available to explore.
      </p>
    </div>
  );
}