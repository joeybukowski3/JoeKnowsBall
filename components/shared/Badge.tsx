type BadgeTone = "neutral" | "sky" | "emerald" | "amber" | "rose";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  neutral: "border-slate-700 bg-slate-900/80 text-slate-200",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-200",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
