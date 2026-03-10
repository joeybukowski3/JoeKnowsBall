type StrengthBarProps = {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  compact?: boolean;
  tone?: "primary" | "positive" | "neutral";
  className?: string;
  valueClassName?: string;
};

function clampPercentage(value: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (value / max) * 100));
}

function getToneClasses(tone: NonNullable<StrengthBarProps["tone"]>) {
  switch (tone) {
    case "positive":
      return "bg-[linear-gradient(90deg,rgba(34,197,94,0.68),rgba(74,222,128,0.92))]";
    case "neutral":
      return "bg-[linear-gradient(90deg,rgba(148,163,184,0.5),rgba(203,213,225,0.82))]";
    default:
      return "bg-[linear-gradient(90deg,rgba(79,70,229,0.7),rgba(96,165,250,0.94))]";
  }
}

export function StrengthBar({
  value,
  max = 100,
  label,
  showValue = false,
  compact = false,
  tone = "primary",
  className = "",
  valueClassName = "",
}: StrengthBarProps) {
  const percentage = clampPercentage(value, max);

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-3">
          {label ? (
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue ? (
            <span className={`text-xs font-semibold text-slate-300 ${valueClassName}`.trim()}>
              {value.toFixed(1)}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className={`overflow-hidden rounded-full border border-white/6 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${
          compact ? "h-1.5" : "h-2.5"
        }`}
      >
        <span
          className={`block h-full rounded-full transition-[width] duration-300 ease-out ${getToneClasses(tone)}`}
          style={{ width: `${Math.max(compact ? 4 : 6, percentage)}%` }}
        />
      </div>
    </div>
  );
}
