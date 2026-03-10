import { StrengthBar } from "@/components/shared/StrengthBar";

type ValueCardProps = {
  eyebrow: string;
  title: string;
  value: string;
  description: string;
  strengthValue?: number | null;
  tone?: "primary" | "positive" | "neutral";
};

export function ValueCard({
  eyebrow,
  title,
  value,
  description,
  strengthValue,
  tone = "primary",
}: ValueCardProps) {
  return (
    <div className="glass-panel rounded-[26px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200/80">{eyebrow}</p>
      <p className="mt-3 text-sm font-medium text-white">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>
      {strengthValue !== undefined && strengthValue !== null ? (
        <StrengthBar value={strengthValue} className="mt-3" compact tone={tone} />
      ) : null}
      <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}
