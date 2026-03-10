import { getTeamMeta } from "@/lib/data/teamMeta";
import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
import type { Game, MatchupSummary as MatchupSummaryType } from "@/lib/types";
import { namesReferToSameTeam } from "@/lib/utils/teamMatcher";

type MatchupSummaryProps = {
  summary: MatchupSummaryType;
  game?: Game;
};

function getCardTone(isEdge: boolean) {
  return isEdge
    ? "border-indigo-400/30 bg-[linear-gradient(180deg,rgba(79,70,229,0.18),rgba(255,255,255,0.03))]"
    : "border-white/10 bg-white/[0.04]";
}

export function MatchupSummary({ summary, game }: MatchupSummaryProps) {
  const metaA = getTeamMeta(summary.teamA.team.name);
  const metaB = getTeamMeta(summary.teamB.team.name);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className={`glass-panel rounded-[30px] p-6 ${getCardTone(summary.edgeTeam === "teamA")}`}>
        <div className="mb-5 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${metaA.primary}, ${metaA.secondary})` }} />
        <div className="flex items-start justify-between gap-3">
          <TeamChip team={summary.teamA.team} name={summary.teamA.team.name} shortName={summary.teamA.team.shortName} subtitle={summary.teamA.team.conference} />
          <Badge tone="sky">Rank #{summary.teamA.rank}</Badge>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Model Score</p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.teamA.overallScore.toFixed(1)}</p>
            <div className="stat-bar mt-3 h-2">
              <span style={{ width: `${Math.min(100, Math.max(12, summary.teamA.overallScore))}%` }} />
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Win Probability</p>
            <p className="mt-2 text-3xl font-semibold text-white">{(summary.teamA.winProbability * 100).toFixed(1)}%</p>
            <div className="stat-bar mt-3 h-2">
              <span style={{ width: `${Math.max(6, summary.teamA.winProbability * 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="neutral">Off {summary.teamA.team.metrics.offense.toFixed(1)}</Badge>
          <Badge tone="neutral">Def {summary.teamA.team.metrics.defense.toFixed(1)}</Badge>
          <Badge tone="neutral">Form {summary.teamA.team.metrics.recentForm.toFixed(0)}</Badge>
          {game && namesReferToSameTeam(game.homeTeam, summary.teamA.team.name) && !game.neutralSite ? <Badge tone="sky">Home Court</Badge> : null}
        </div>
      </section>

      <section className={`glass-panel rounded-[30px] p-6 ${getCardTone(summary.edgeTeam === "teamB")}`}>
        <div className="mb-5 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${metaB.primary}, ${metaB.secondary})` }} />
        <div className="flex items-start justify-between gap-3">
          <TeamChip team={summary.teamB.team} name={summary.teamB.team.name} shortName={summary.teamB.team.shortName} subtitle={summary.teamB.team.conference} />
          <Badge tone="sky">Rank #{summary.teamB.rank}</Badge>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Model Score</p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.teamB.overallScore.toFixed(1)}</p>
            <div className="stat-bar mt-3 h-2">
              <span style={{ width: `${Math.min(100, Math.max(12, summary.teamB.overallScore))}%` }} />
            </div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Win Probability</p>
            <p className="mt-2 text-3xl font-semibold text-white">{(summary.teamB.winProbability * 100).toFixed(1)}%</p>
            <div className="stat-bar mt-3 h-2">
              <span style={{ width: `${Math.max(6, summary.teamB.winProbability * 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="neutral">Off {summary.teamB.team.metrics.offense.toFixed(1)}</Badge>
          <Badge tone="neutral">Def {summary.teamB.team.metrics.defense.toFixed(1)}</Badge>
          <Badge tone="neutral">Form {summary.teamB.team.metrics.recentForm.toFixed(0)}</Badge>
          {game && namesReferToSameTeam(game.homeTeam, summary.teamB.team.name) && !game.neutralSite ? <Badge tone="sky">Home Court</Badge> : null}
        </div>
      </section>
    </div>
  );
}
