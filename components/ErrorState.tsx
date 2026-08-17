export default function ErrorState() {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
      <h3 className="text-lg font-semibold text-red-900">
        Unable to load career data
      </h3>

      <p className="mt-2 text-sm text-red-700">
        We couldn't connect to the career database. Please try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}