import Link from "next/link";

export interface Job {
  id: string;
  title: string;
  description: string;
  level: string;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {job.level}
          </span>

          <h3 className="mt-4 text-xl font-semibold text-slate-900">
            {job.title}
          </h3>
        </div>

        <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600">
          →
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
        {job.description}
      </p>

      <div className="mt-6 text-sm font-semibold text-indigo-600">
        Explore career path
      </div>
    </Link>
  );
}