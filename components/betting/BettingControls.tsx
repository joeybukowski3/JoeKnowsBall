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
    <div className="space-y-5 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
      <div className="grid gap-4 xl:grid-cols-[280px_200px_220px_minmax(0,1fr)]">
        <PresetSelector
          presets={presets}
          value={presetId}
          onChange={onPresetChange}
        />
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Date
          </label>
          <select
            value={dateFilter}
            onChange={(event) => onDateFilterChange(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400"
          >
            <option value="all">All Dates</option>
            {dateOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Sort Games
          </label>
          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value as BettingControlsProps["sortBy"])
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400"
          >
            <option value="edge">Highest Edge</option>
            <option value="winProbability">Highest Win Probability</option>
            <option value="closest">Closest Matchups</option>
            <option value="upsetRisk">Biggest Upset Risk</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Slate Filter
          </label>
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            <button
              type="button"
              onClick={() => onGameFilterChange("all")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                gameFilter === "all"
                  ? "bg-slate-100 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              All Games
            </button>
            <button
              type="button"
              onClick={() => onGameFilterChange("top")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                gameFilter === "top"
                  ? "bg-slate-100 text-slate-950"
                  : "text-slate-300 hover:text-white"
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
