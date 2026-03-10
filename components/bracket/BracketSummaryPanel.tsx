import { Badge } from "@/components/shared/Badge";
import { Panel } from "@/components/shared/Panel";
import { TeamChip } from "@/components/shared/TeamChip";
import type { BracketSummaryData } from "@/lib/types";

type BracketSummaryPanelProps = {
  summary: BracketSummaryData;
};

export function BracketSummaryPanel({ summary }: BracketSummaryPanelProps) {
  return (
    <Panel
      eyebrow="Bracket Summary"
      title="Generated board summary"
      description="A compact read on the active preset, projected finish, upset count, and region strength."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[24px] border border-white/8 bg-slate-950/55 p-4 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Active Preset
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{summary.selectedPreset}</p>
            </div>
            <Badge tone="sky">{summary.upsetCount} upset picks</Badge>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Champion
          </p>
          <div className="mt-2">
            <TeamChip
              team={summary.champion}
              name={summary.champion?.name ?? "Pending"}
              shortName={summary.champion?.shortName}
              compact
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Runner-up: {summary.runnerUp?.name ?? "Pending"}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Biggest upset
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {summary.biggestUpset?.label ?? "No upset pick yet"}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {summary.biggestUpset?.severity ?? "None"}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4 sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Final Four
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {summary.finalFour.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-white/8 bg-slate-950/55 px-3 py-2"
              >
                <TeamChip team={team} name={team.name} shortName={team.shortName} compact />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Strongest region
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {summary.strongestRegion?.region ?? "Pending"}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Avg adjusted score {summary.strongestRegion?.score.toFixed(1) ?? "--"}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Weakest region
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {summary.weakestRegion?.region ?? "Pending"}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Avg adjusted score {summary.weakestRegion?.score.toFixed(1) ?? "--"}
          </p>
        </div>
      </div>
    </Panel>
  );
}
