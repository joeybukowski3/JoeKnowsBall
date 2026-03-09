"use client";

import { PresetSelector } from "@/components/shared/PresetSelector";
import { WeightSlider } from "@/components/shared/WeightSlider";
import type {
  RankingCategoryConfig,
  RankingCategoryGroup,
  RankingPreset,
  RankingSettings,
} from "@/lib/types";

type RankingsControlsProps = {
  categories: RankingCategoryConfig[];
  presets: RankingPreset[];
  settings: RankingSettings;
  selectedPreset: RankingPreset;
  onPresetChange: (presetId: string) => void;
  onCategoryToggle: (category: RankingCategoryGroup) => void;
  onWeightChange: (category: RankingCategoryGroup, value: number) => void;
  onReset: () => void;
};

export function RankingsControls({
  categories,
  presets,
  settings,
  selectedPreset,
  onPresetChange,
  onCategoryToggle,
  onWeightChange,
  onReset,
}: RankingsControlsProps) {
  return (
    <div className="space-y-5 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-end">
        <div className="space-y-2">
          <PresetSelector
            presets={presets}
            value={settings.presetId}
            onChange={onPresetChange}
          />
          <p className="text-sm text-slate-400">{selectedPreset.description}</p>
        </div>
        <div className="flex items-center justify-start lg:justify-end">
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            Reset to preset defaults
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const isActive = settings.activeCategories[category.key];

          return (
            <label
              key={category.key}
              className={`rounded-2xl border p-4 transition ${
                isActive
                  ? "border-sky-500/40 bg-sky-500/10"
                  : "border-slate-800 bg-slate-950/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {category.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {category.description}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onCategoryToggle(category.key)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-400"
                />
              </div>
              <div className="mt-4">
                <WeightSlider
                  label={`${category.label} weight`}
                  value={settings.weights[category.key]}
                  active={isActive}
                  onChange={(value) => onWeightChange(category.key, value)}
                />
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
