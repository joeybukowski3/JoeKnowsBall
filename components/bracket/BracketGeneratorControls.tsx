"use client";

import { PresetSelector } from "@/components/shared/PresetSelector";
import { Badge } from "@/components/shared/Badge";
import type { BracketMode, RankingPreset } from "@/lib/types";

type BracketGeneratorControlsProps = {
  mode: BracketMode;
  presetId: string;
  presets: RankingPreset[];
  comparisonEnabled: boolean;
  lockedCount: number;
  onModeChange: (mode: BracketMode) => void;
  onPresetChange: (presetId: string) => void;
  onToggleComparison: () => void;
  onAutoFillAll: () => void;
  onAutoFillRemaining: () => void;
  onReset: () => void;
};

export function BracketGeneratorControls({
  mode,
  presetId,
  presets,
  comparisonEnabled,
  lockedCount,
  onModeChange,
  onPresetChange,
  onToggleComparison,
  onAutoFillAll,
  onAutoFillRemaining,
  onReset,
}: BracketGeneratorControlsProps) {
  return (
    <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_26px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm">
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-end">
        <div className="max-w-[320px]">
          <PresetSelector presets={presets} value={presetId} onChange={onPresetChange} />
        </div>
        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <Badge tone="amber">{lockedCount} locked picks</Badge>
          <button
            type="button"
            onClick={onAutoFillAll}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Auto-fill full bracket
          </button>
          <button
            type="button"
            onClick={onAutoFillRemaining}
            className="rounded-2xl border border-sky-300/18 bg-sky-400/10 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-300/30 hover:bg-sky-400/14"
          >
            Fill unlocked games
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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="rounded-[24px] border border-white/8 bg-slate-950/55 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Workflow
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Generate the whole board from the active preset, preserve locked picks, and manually override any unlocked game.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/70 p-1">
            <button
              type="button"
              onClick={() => onModeChange("manual")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "manual" ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => onModeChange("auto")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "auto" ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              Auto
            </button>
          </div>
          <button
            type="button"
            onClick={onToggleComparison}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
              comparisonEnabled
                ? "border-emerald-400/35 bg-emerald-400/12 text-emerald-100"
                : "border-white/12 bg-white/8 text-slate-200 hover:border-white/20 hover:bg-white/12"
            }`}
          >
            {comparisonEnabled ? "Hide preset comparison" : "Compare presets"}
          </button>
        </div>
      </div>
    </div>
  );
}
