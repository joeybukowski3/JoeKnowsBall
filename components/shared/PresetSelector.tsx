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
      <label htmlFor="preset-selector" className="section-label">
        Preset
      </label>
      <select
        id="preset-selector"
        className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--accent-mid)] focus:shadow-[0_0_0_3px_rgba(26,86,219,0.08)]"
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
