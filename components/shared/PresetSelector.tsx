import type { RankingPreset } from "@/lib/types";

type PresetSelectorProps = {
  presets: RankingPreset[];
};

export function PresetSelector({ presets }: PresetSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="preset-selector"
        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
      >
        Preset
      </label>
      <select
        id="preset-selector"
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400"
        defaultValue={presets[0]?.id}
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
