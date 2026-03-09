import { Badge } from "@/components/shared/Badge";
import type { MatchupSummary } from "@/lib/types";

type MatchupInsightProps = {
  summary: MatchupSummary;
};

export function MatchupInsight({ summary }: MatchupInsightProps) {
  const topEdges = summary.rows
    .filter(
      (row) => row.active && row.label !== "Overall Model Score" && row.edge !== "even",
    )
    .sort((left, right) => Math.abs(right.difference) - Math.abs(left.difference))
    .slice(0, 3);

  const leadingTeam =
    summary.edgeTeam === "teamA"
      ? summary.teamA.team.name
      : summary.edgeTeam === "teamB"
        ? summary.teamB.team.name
        : "Neither team";

  const balanceText =
    Math.abs(summary.scoreDifferential) < 3
      ? "The matchup looks tightly priced by the model."
      : Math.abs(summary.scoreDifferential) < 8
        ? "The edge is real, but the profile still leaves room for variance."
        : "The current preset sees a clear structural advantage.";

  return (
    <div className="space-y-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.34))] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Matchup Insight
        </p>
        <Badge
          tone={
            summary.edgeTeam === "teamA" || summary.edgeTeam === "teamB"
              ? "sky"
              : "neutral"
          }
        >
          {summary.edgeTeam === "even" ? "Balanced" : `${leadingTeam} edge`}
        </Badge>
      </div>
      <p className="text-sm leading-7 text-slate-300">
        {leadingTeam} grades better in this preset. {balanceText}
      </p>
      <div className="grid gap-3">
        {topEdges.length > 0 ? (
          topEdges.map((edge) => (
            <div
              key={edge.label}
              className="rounded-2xl border border-white/8 bg-slate-950/55 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{edge.label}</p>
                <Badge tone={edge.edge === "teamA" ? "sky" : "emerald"}>
                  {edge.edge === "teamA"
                    ? summary.teamA.team.shortName
                    : summary.teamB.team.shortName}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                {edge.edge === "teamA" ? summary.teamA.team.name : summary.teamB.team.name}
                {" "}holds the edge here by {Math.abs(edge.difference).toFixed(1)} model points.
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4 text-sm text-slate-400">
            Active categories are producing a mostly even comparison.
          </div>
        )}
      </div>
    </div>
  );
}
