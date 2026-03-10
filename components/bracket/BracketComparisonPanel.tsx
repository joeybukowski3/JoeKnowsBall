import { Panel } from "@/components/shared/Panel";
import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
import type { BracketPresetComparisonRow } from "@/lib/types";

type BracketComparisonPanelProps = {
  rows: BracketPresetComparisonRow[];
};

export function BracketComparisonPanel({ rows }: BracketComparisonPanelProps) {
  return (
    <Panel
      eyebrow="Preset Comparison"
      title="How each model fills the bracket"
      description="Final Four and champion picks across the core presets, with upset appetite summarized for quick comparison."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((row) => (
          <article
            key={row.presetId}
            className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{row.presetName}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {row.runnerUp?.shortName ?? "Pending"} vs {row.champion?.shortName ?? "Pending"}
                </p>
              </div>
              <Badge tone={row.differentChampion ? "amber" : "sky"}>
                {row.differentChampion ? "Different champion" : "Matches baseline"}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Champion
                </p>
                <div className="mt-2">
                  <TeamChip
                    name={row.champion?.name ?? "Pending"}
                    shortName={row.champion?.shortName}
                    compact
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Upset Profile
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{row.upsetCount} upset picks</p>
                <p className="mt-1 text-xs text-slate-400">{row.biggestUpset ?? "No major upset flagged"}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Final Four
              </p>
              <div className="mt-2 grid gap-2">
                {row.finalFour.map((team) => (
                  <div
                    key={`${row.presetId}-${team.id}`}
                    className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2"
                  >
                    <TeamChip name={team.name} shortName={team.shortName} compact />
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
