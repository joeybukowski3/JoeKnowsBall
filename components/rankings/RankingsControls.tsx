import { PresetSelector } from "@/components/shared/PresetSelector";
import { WeightSlider } from "@/components/shared/WeightSlider";
import type { RankingPreset } from "@/lib/types";

type RankingsControlsProps = {
  presets: RankingPreset[];
};

export function RankingsControls({ presets }: RankingsControlsProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 lg:grid-cols-[280px_repeat(3,minmax(0,1fr))]">
      <PresetSelector presets={presets} />
      <WeightSlider label="Efficiency" value={42} />
      <WeightSlider label="Strength of Schedule" value={28} />
      <WeightSlider label="Recent Form" value={30} />
    </div>
  );
}
