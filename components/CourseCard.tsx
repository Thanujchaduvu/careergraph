interface CourseCardProps {
  course: {
    id: string;
    title: string;
    platform: string;
    level: string;
    duration: string;
    skills: string[];
  };
}

export default function CourseCard({
  course,
}: CourseCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {course.platform}
          </span>

          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {course.title}
          </h3>
        </div>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          {course.level}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-500">
        Duration: {course.duration}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {course.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}