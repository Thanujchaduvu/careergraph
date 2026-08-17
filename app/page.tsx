import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import JobGrid from "@/components/JobGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <Hero />

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Popular career paths
            </h2>

            <p className="mt-3 max-w-2xl text-slate-500">
              Choose a role to explore its required skills, prerequisite
              relationships, and recommended learning resources.
            </p>
          </div>

          <JobGrid />
        </section>
      </main>
    </div>
  );
}
