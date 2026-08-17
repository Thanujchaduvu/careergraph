export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm font-medium text-indigo-300">
            Explore careers through connected skills
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Find the skills behind your{" "}
            <span className="text-indigo-400">next career.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Explore career paths, discover skill prerequisites, and find
            learning resources through an interconnected career graph.
          </p>
        </div>
      </div>
    </section>
  );
}