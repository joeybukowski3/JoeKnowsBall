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
    <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_26px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm">
      <div className="grid gap-4 xl:grid-cols-[320px_220px_220px_minmax(0,1fr)]">
        <PresetSelector
          presets={presets}
          value={presetId}
          onChange={onPresetChange}
        />
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Date
          </label>
          <select
            value={dateFilter}
            onChange={(event) => onDateFilterChange(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-300/40"
          >
            <option value="all">All Dates</option>
            {dateOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Sort Games
          </label>
          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value as BettingControlsProps["sortBy"])
            }
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-300/40"
          >
            <option value="edge">Highest Edge</option>
            <option value="winProbability">Highest Win Probability</option>
            <option value="closest">Closest Matchups</option>
            <option value="upsetRisk">Biggest Upset Risk</option>
          </select>
        </div>
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Slate Filter
          </label>
          <div className="mt-3 inline-flex rounded-2xl border border-white/10 bg-slate-950/70 p-1">
            <button
              type="button"
              onClick={() => onGameFilterChange("all")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                gameFilter === "all"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              All Games
            </button>
            <button
              type="button"
              onClick={() => onGameFilterChange("top")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                gameFilter === "top"
                  ? "bg-white text-slate-950 shadow-sm"
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
