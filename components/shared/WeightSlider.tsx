type WeightSliderProps = {
  label: string;
  value: number;
};

export function WeightSlider({ label, value }: WeightSliderProps) {
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
        readOnly
        className="h-2 w-full cursor-default appearance-none rounded-full bg-slate-800 accent-sky-400"
      />
    </div>
  );
}
