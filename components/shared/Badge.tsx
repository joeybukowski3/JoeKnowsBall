type BadgeTone = "neutral" | "sky" | "emerald" | "amber" | "rose";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  neutral: "border-white/8 bg-white/[0.045] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
  sky: "border-indigo-400/25 bg-indigo-500/12 text-indigo-100 shadow-[0_10px_24px_rgba(79,70,229,0.14)]",
  emerald: "border-emerald-400/25 bg-emerald-500/12 text-emerald-100 shadow-[0_10px_24px_rgba(34,197,94,0.12)]",
  amber: "border-amber-400/25 bg-amber-500/12 text-amber-100 shadow-[0_10px_24px_rgba(245,158,11,0.12)]",
  rose: "border-rose-400/25 bg-rose-500/12 text-rose-100 shadow-[0_10px_24px_rgba(244,63,94,0.12)]",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase backdrop-blur-sm ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
