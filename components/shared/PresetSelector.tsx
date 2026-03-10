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
      <label htmlFor="preset-selector" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Preset
      </label>
      <select
        id="preset-selector"
        className="w-full rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-3.5 text-sm font-medium text-slate-100 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] focus:border-indigo-400/45 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(79,70,229,0.15)]"
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
