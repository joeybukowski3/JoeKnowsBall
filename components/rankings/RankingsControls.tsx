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
    <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_26px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-end">
        <div className="space-y-2">
          <PresetSelector
            presets={presets}
            value={settings.presetId}
            onChange={onPresetChange}
          />
          <p className="text-sm leading-6 text-slate-300">
            {selectedPreset.description}
          </p>
        </div>
        <div className="flex items-center justify-start lg:justify-end">
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl border border-white/12 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-sky-300/35 hover:bg-white/14"
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
              className={`group rounded-[24px] border p-4 transition ${
                isActive
                  ? "border-sky-400/25 bg-[linear-gradient(180deg,rgba(125,211,252,0.12),rgba(255,255,255,0.04))] shadow-[0_18px_50px_rgba(14,165,233,0.12)]"
                  : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {category.label}
                  </p>
                  <p className="text-xs leading-5 text-slate-400">
                    {category.description}
                  </p>
                </div>
                <span
                  className={`mt-0.5 inline-flex h-6 w-11 items-center rounded-full border p-0.5 transition ${
                    isActive
                      ? "border-sky-300/30 bg-sky-400/20"
                      : "border-white/10 bg-slate-900/80"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onCategoryToggle(category.key)}
                    className="sr-only"
                  />
                  <span
                    className={`h-4 w-4 rounded-full bg-white shadow transition ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
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
