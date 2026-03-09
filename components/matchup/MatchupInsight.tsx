import type { MatchupSummary } from "@/lib/types";

type MatchupInsightProps = {
  summary: MatchupSummary;
};

export function MatchupInsight({ summary }: MatchupInsightProps) {
  const topEdges = summary.rows
    .filter((row) => row.active && row.label !== "Overall Model Score" && row.edge !== "even")
    .sort((left, right) => Math.abs(right.difference) - Math.abs(left.difference))
    .slice(0, 2);

  const leadingTeam =
    summary.edgeTeam === "teamA"
      ? summary.teamA.team.name
      : summary.edgeTeam === "teamB"
        ? summary.teamB.team.name
        : "Neither team";

  const balanceText =
    Math.abs(summary.scoreDifferential) < 3
      ? "This profiles as a fairly balanced matchup."
      : Math.abs(summary.scoreDifferential) < 8
        ? "This matchup shows a clear but manageable edge."
        : "The model sees this as fairly lopsided.";

  const drivers =
    topEdges.length > 0
      ? topEdges.map((edge) => edge.label).join(" and ")
      : "small across-the-board differences";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Matchup Insight
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        {leadingTeam} grades better in this preset, driven primarily by {drivers}.
        {" "}{balanceText}
      </p>
    </div>
  );
}
