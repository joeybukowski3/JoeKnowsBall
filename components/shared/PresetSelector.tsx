"use client";

import type { RankingPreset } from "@/lib/types";

type PresetSelectorProps = {
  presets: RankingPreset[];
  value: string;
  onChange: (value: string) => void;
};

export function PresetSelector({ presets, value, onChange }: PresetSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="preset-selector" className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Preset
      </label>
      <select
        id="preset-selector"
        className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-sky-300 focus:bg-white/[0.08]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  );
}
