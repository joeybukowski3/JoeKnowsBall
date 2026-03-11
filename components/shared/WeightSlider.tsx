"use client";

type WeightSliderProps = {
  label: string;
  value: number;
  active: boolean;
  onChange: (value: number) => void;
  compact?: boolean;
};

export function WeightSlider({ label, value, active, onChange, compact = false }: WeightSliderProps) {
  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <div className="flex items-center justify-between">
        <span className={`${compact ? "text-[11px]" : "text-sm"} font-medium text-[var(--text)]`}>
          {compact ? "Weight" : label}
        </span>
        <span className={`rounded-[5px] border border-[var(--border)] bg-[var(--bg)] ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"} font-bold text-[var(--muted)]`}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        disabled={!active}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full disabled:cursor-not-allowed disabled:opacity-40"
      />
      <div className={`stat-bar ${compact ? "h-1" : "h-1.5"}`}>
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
