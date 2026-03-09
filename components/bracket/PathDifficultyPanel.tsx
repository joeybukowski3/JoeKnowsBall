import type { PathDifficultyRow, ResolvedBracketGame, Team } from "@/lib/types";

type PathDifficultyPanelProps = {
  paths: PathDifficultyRow[];
  champion: Team | null;
  resolvedGames: ResolvedBracketGame[];
};

export function PathDifficultyPanel({
  paths,
  champion,
  resolvedGames,
}: PathDifficultyPanelProps) {
  const easiest = [...paths]
    .sort((left, right) => left.pathDifficulty - right.pathDifficulty)
    .slice(0, 10);
  const hardest = [...paths]
    .sort((left, right) => right.pathDifficulty - left.pathDifficulty)
    .slice(0, 10);
  const highRiskGames = resolvedGames
    .filter((game) => game.upsetRisk === "High")
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Bracket Summary
        </p>
        <h3 className="mt-3 text-lg font-semibold text-white">
          Most likely champion
        </h3>
        <p className="mt-2 text-2xl font-semibold text-sky-300">
          {champion?.name ?? "TBD"}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Based on the current bracket state and adjusted tournament score.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
          Easiest paths
        </h3>
        <div className="mt-4 space-y-3">
          {easiest.map((row) => (
            <div key={row.team.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{row.team.name}</p>
                <p className="text-xs text-slate-500">
                  Base {row.baseModelScore.toFixed(1)}
                </p>
              </div>
              <span className="text-sm text-emerald-300">
                {row.pathDifficulty.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
          Hardest paths
        </h3>
        <div className="mt-4 space-y-3">
          {hardest.map((row) => (
            <div key={row.team.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{row.team.name}</p>
                <p className="text-xs text-slate-500">
                  Adjusted {row.adjustedTournamentScore.toFixed(1)}
                </p>
              </div>
              <span className="text-sm text-rose-300">
                {row.pathDifficulty.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
          High upset spots
        </h3>
        <div className="mt-4 space-y-3">
          {highRiskGames.map((game) => (
            <div key={game.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-sm font-medium text-white">
                {game.teamA.team?.name ?? "TBD"} vs {game.teamB.team?.name ?? "TBD"}
              </p>
              <p className="mt-1 text-xs text-slate-400">{game.round}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
