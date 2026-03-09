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
    <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_26px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-end">
        <div className="max-w-[320px]">
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
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Auto-fill bracket
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl border border-white/12 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/14"
          >
            Reset bracket
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/8 bg-slate-950/55 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Board mode
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Click winners in manual mode or let the current model advance the field.
          </p>
        </div>
        <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/70 p-1">
          <button
            type="button"
            onClick={() => onModeChange("manual")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              mode === "manual"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Manual Mode
          </button>
          <button
            type="button"
            onClick={() => onModeChange("auto")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              mode === "auto"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Auto Mode
          </button>
        </div>
      </div>
    </div>
  );
}
