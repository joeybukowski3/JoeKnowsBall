type ValueCardProps = {
  eyebrow: string;
  title: string;
  value: string;
  description: string;
};

export function ValueCard({ eyebrow, title, value, description }: ValueCardProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_20px_60px_rgba(2,6,23,0.18)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/80">{eyebrow}</p>
      <p className="mt-3 text-sm font-medium text-white">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-sky-200">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
