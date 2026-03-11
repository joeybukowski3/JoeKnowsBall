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
    <div className="glass-panel space-y-4 rounded-[10px] p-4">
      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-end">
        <div className="space-y-2">
          <PresetSelector
            presets={presets}
            value={settings.presetId}
            onChange={onPresetChange}
          />
          <p className="text-[13px] leading-5 text-[var(--muted)]">
            {selectedPreset.description}
          </p>
        </div>
        <div className="flex items-center justify-start lg:justify-end">
          <button
            type="button"
            onClick={onReset}
            className="ghost-button px-3.5 py-2"
          >
            Reset to preset defaults
          </button>
        </div>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const isActive = settings.activeCategories[category.key];

          return (
            <label
              key={category.key}
              className={`group rounded-[10px] border p-3 transition ${
                isActive
                  ? "border-[var(--accent-mid)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-mid)] hover:bg-[#fbfcff]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-[13px] font-semibold text-[var(--text)]">
                    {category.label}
                  </p>
                  <p className="text-[11px] leading-4.5 text-[var(--muted)]">
                    {category.description}
                  </p>
                </div>
                <span
                    className={`mt-0.5 inline-flex h-6 w-11 items-center rounded-full border p-0.5 transition ${
                    isActive
                      ? "border-[var(--accent-mid)] bg-[var(--accent-light)]"
                      : "border-[var(--border)] bg-[var(--bg)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onCategoryToggle(category.key)}
                    className="sr-only"
                  />
                  <span
                    className={`h-4 w-4 rounded-full bg-[var(--accent)] shadow transition ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </div>
              <div className="mt-3">
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
