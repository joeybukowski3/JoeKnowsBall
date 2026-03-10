"use client";

type WeightSliderProps = {
  label: string;
  value: number;
  active: boolean;
  onChange: (value: number) => void;
};

export function WeightSlider({ label, value, active, onChange }: WeightSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span className="rounded-full border border-white/8 bg-white/[0.045] px-2.5 py-1 text-[11px] font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
        className="h-2.5 w-full appearance-none rounded-full bg-white/10 accent-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
      />
      <div className="stat-bar h-1.5">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
