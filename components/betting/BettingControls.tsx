"use client";

import { PresetSelector } from "@/components/shared/PresetSelector";
import type { RankingPreset } from "@/lib/types";

type BettingControlsProps = {
  presets: RankingPreset[];
  presetId: string;
  dateOptions: string[];
  dateFilter: string;
  gameFilter: "all" | "top";
  sortBy: "edge" | "winProbability" | "closest" | "upsetRisk";
  onPresetChange: (presetId: string) => void;
  onDateFilterChange: (date: string) => void;
  onGameFilterChange: (filter: "all" | "top") => void;
  onSortChange: (sortBy: "edge" | "winProbability" | "closest" | "upsetRisk") => void;
};

export function BettingControls({
  presets,
  presetId,
  dateOptions,
  dateFilter,
  gameFilter,
  sortBy,
  onPresetChange,
  onDateFilterChange,
  onGameFilterChange,
  onSortChange,
}: BettingControlsProps) {
  return (
    <div className="glass-panel space-y-4 rounded-[10px] p-4">
      <div className="grid gap-3 xl:grid-cols-[280px_210px_210px_minmax(0,1fr)]">
        <PresetSelector
          presets={presets}
          value={presetId}
          onChange={onPresetChange}
        />
        <div className="surface-card p-3">
          <label className="section-label">
            Date
          </label>
          <select
            value={dateFilter}
            onChange={(event) => onDateFilterChange(event.target.value)}
            className="mt-2 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent-mid)]"
          >
            <option value="all">All Dates</option>
            {dateOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="surface-card p-3">
          <label className="section-label">
            Sort Games
          </label>
          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value as BettingControlsProps["sortBy"])
            }
            className="mt-2 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent-mid)]"
          >
            <option value="edge">Highest Edge</option>
            <option value="winProbability">Highest Win Probability</option>
            <option value="closest">Closest Matchups</option>
            <option value="upsetRisk">Biggest Upset Risk</option>
          </select>
        </div>
        <div className="surface-card p-3">
          <label className="section-label">
            Slate Filter
          </label>
          <div className="mt-2 inline-flex rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-1">
            <button
              type="button"
              onClick={() => onGameFilterChange("all")}
              className={`rounded-[7px] border px-3 py-1.5 text-[13px] font-semibold transition ${
                gameFilter === "all"
                  ? "border-[var(--accent-mid)] bg-[var(--accent-light)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
              }`}
            >
              All Games
            </button>
            <button
              type="button"
              onClick={() => onGameFilterChange("top")}
              className={`rounded-[7px] border px-3 py-1.5 text-[13px] font-semibold transition ${
                gameFilter === "top"
                  ? "border-[var(--accent-mid)] bg-[var(--accent-light)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
              }`}
            >
              Top Value Plays
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
