"use client";

type WeightSliderProps = {
  label: string;
  value: number;
  active: boolean;
  onChange: (value: number) => void;
};

export function WeightSlider({
  label,
  value,
  active,
  onChange,
}: WeightSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span className="text-xs text-slate-400">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        disabled={!active}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full appearance-none rounded-full bg-slate-800 accent-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}
