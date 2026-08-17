interface SkillBadgeProps {
  name: string;
  category?: string;
  difficulty?: string;
}

export default function SkillBadge({
  name,
  category,
  difficulty,
}: SkillBadgeProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{name}</h3>

        {difficulty && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {difficulty}
          </span>
        )}
      </div>

      {category && (
        <p className="mt-2 text-xs text-slate-500">
          {category}
        </p>
      )}
    </div>
  );
}