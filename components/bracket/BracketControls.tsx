"use client";

import { PresetSelector } from "@/components/shared/PresetSelector";
import type { BracketMode, RankingPreset } from "@/lib/types";

type BracketControlsProps = {
  mode: BracketMode;
  presetId: string;
  presets: RankingPreset[];
  onModeChange: (mode: BracketMode) => void;
  onPresetChange: (presetId: string) => void;
  onAutoFill: () => void;
  onReset: () => void;
};

export function BracketControls({
  mode,
  presetId,
  presets,
  onModeChange,
  onPresetChange,
  onAutoFill,
  onReset,
}: BracketControlsProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-end">
        <div className="max-w-[280px]">
          <PresetSelector
            presets={presets}
            value={presetId}
            onChange={onPresetChange}
          />
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <button
            type="button"
            onClick={onAutoFill}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-white"
          >
            Auto-fill bracket
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Reset bracket
          </button>
        </div>
      </div>

      <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
        <button
          type="button"
          onClick={() => onModeChange("manual")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "manual"
              ? "bg-slate-100 text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Manual Mode
        </button>
        <button
          type="button"
          onClick={() => onModeChange("auto")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === "auto"
              ? "bg-slate-100 text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Auto Mode
        </button>
      </div>
    </div>
  );
}
