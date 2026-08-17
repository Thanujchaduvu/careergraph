import Navbar from "@/components/Navbar";
import JobGrid from "@/components/JobGrid";

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Career explorer
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Explore career paths
          </h1>

          <p className="mt-4 max-w-2xl text-slate-500">
            Choose a role to discover the skills it requires,
            prerequisite skills, connected companies, and recommended
            learning resources.
          </p>
        </div>

        <JobGrid />
      </main>
    </div>
  );
}