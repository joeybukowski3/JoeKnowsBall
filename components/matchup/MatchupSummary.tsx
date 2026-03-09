import type { Game, MatchupSummary } from "@/lib/types";

type MatchupSummaryProps = {
  summary: MatchupSummary;
  game?: Game;
};

function getCardTone(isEdge: boolean) {
  return isEdge
    ? "border-sky-500/40 bg-sky-500/10"
    : "border-slate-800 bg-slate-950/50";
}

export function MatchupSummary({ summary, game }: MatchupSummaryProps) {
  const teamAEdge = summary.edgeTeam === "teamA";
  const teamBEdge = summary.edgeTeam === "teamB";

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className={`rounded-2xl border p-5 ${getCardTone(teamAEdge)}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Team A
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {summary.teamA.team.name}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {summary.teamA.team.conference}
            </p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200">
            Rank #{summary.teamA.rank}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Model Score
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.teamA.overallScore.toFixed(1)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Win Probability
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {(summary.teamA.winProbability * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Off {summary.teamA.team.metrics.offense.toFixed(1)}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Def {summary.teamA.team.metrics.defense.toFixed(1)}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Form {summary.teamA.team.metrics.recentForm.toFixed(0)}
          </span>
          {game && game.homeTeam === summary.teamA.team.name && !game.neutralSite ? (
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
              Home Court
            </span>
          ) : null}
        </div>
      </section>

      <section className={`rounded-2xl border p-5 ${getCardTone(teamBEdge)}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Team B
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {summary.teamB.team.name}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {summary.teamB.team.conference}
            </p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200">
            Rank #{summary.teamB.rank}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Model Score
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.teamB.overallScore.toFixed(1)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Win Probability
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {(summary.teamB.winProbability * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Off {summary.teamB.team.metrics.offense.toFixed(1)}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Def {summary.teamB.team.metrics.defense.toFixed(1)}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Form {summary.teamB.team.metrics.recentForm.toFixed(0)}
          </span>
          {game && game.homeTeam === summary.teamB.team.name && !game.neutralSite ? (
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
              Home Court
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
