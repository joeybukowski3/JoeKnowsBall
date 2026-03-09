type ValueCardProps = {
  eyebrow: string;
  title: string;
  value: string;
  description: string;
};

export function ValueCard({ eyebrow, title, value, description }: ValueCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </p>
      <p className="mt-3 text-sm font-medium text-white">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-sky-300">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
