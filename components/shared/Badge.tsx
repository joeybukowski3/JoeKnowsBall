type BadgeTone = "neutral" | "sky" | "emerald" | "amber" | "rose";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  neutral: "border-[var(--accent-mid)] bg-[var(--accent-light)] text-[var(--accent)]",
  sky: "border-[var(--accent-mid)] bg-[var(--accent-light)] text-[var(--accent)]",
  emerald: "border-[var(--green-bg)] bg-[var(--green-bg)] text-[var(--green)]",
  amber: "border-[var(--gold-bg)] bg-[var(--gold-bg)] text-[var(--gold)]",
  rose: "border-[var(--red-bg)] bg-[var(--red-bg)] text-[var(--red)]",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-[5px] border px-[9px] py-[3px] text-[11px] font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
