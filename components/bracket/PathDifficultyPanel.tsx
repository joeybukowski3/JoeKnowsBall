import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
import type {
  PathDifficultyRow,
  ResolvedBracketGame,
  Team,
  TournamentFieldEntry,
} from "@/lib/types";

type PathDifficultyPanelProps = {
  paths: PathDifficultyRow[];
  champion: Team | null;
  resolvedGames: ResolvedBracketGame[];
  tournamentSummary?: {
    teamCount: number;
    regionLeaders: Array<TournamentFieldEntry | undefined>;
    strongestRegion?: { region: string; averageModelScore: number };
    weakestRegion?: { region: string; averageModelScore: number };
  };
};

export function PathDifficultyPanel({
  paths,
  champion,
  resolvedGames,
  tournamentSummary,
}: PathDifficultyPanelProps) {
  const easiest = [...paths]
    .sort((left, right) => left.pathDifficulty - right.pathDifficulty)
    .slice(0, 10);
  const hardest = [...paths]
    .sort((left, right) => right.pathDifficulty - left.pathDifficulty)
    .slice(0, 10);
  const riskGames = resolvedGames
    .filter((game) => game.upsetRisk === "High" || game.upsetRisk === "Medium")
    .slice(0, 6);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(125,211,252,0.1),rgba(15,23,42,0.38))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
          Bracket Summary
        </p>
        <h3 className="mt-3 text-lg font-semibold text-white">
          Most likely champion
        </h3>
        <div className="mt-4 rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
          {champion ? (
            <TeamChip
              team={champion}
              name={champion.name}
              shortName={champion.shortName}
              subtitle={`${champion.conference} • Current board leader`}
            />
          ) : (
            <p className="text-sm text-slate-400">No champion selected yet.</p>
          )}
        </div>
      </section>

      {tournamentSummary ? (
        <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Tournament Summary
            </h3>
            <Badge tone="sky">{tournamentSummary.teamCount} teams</Badge>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Region leaders
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tournamentSummary.regionLeaders.map((entry) =>
                  entry ? (
                    <Badge key={`${entry.region}-${entry.teamId}`} tone="neutral">
                      {entry.region}: {entry.displayName}
                    </Badge>
                  ) : null,
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Strongest region
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {tournamentSummary.strongestRegion?.region ?? "TBD"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Avg score{" "}
                  {tournamentSummary.strongestRegion
                    ? tournamentSummary.strongestRegion.averageModelScore.toFixed(1)
                    : "--"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Weakest region
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {tournamentSummary.weakestRegion?.region ?? "TBD"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Avg score{" "}
                  {tournamentSummary.weakestRegion
                    ? tournamentSummary.weakestRegion.averageModelScore.toFixed(1)
                    : "--"}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Easiest paths
          </h3>
          <Badge tone="emerald">Top 10</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {easiest.map((row) => (
            <div
              key={row.team.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/55 p-3"
            >
              <TeamChip
                team={row.team}
                name={row.team.name}
                shortName={row.team.shortName}
                subtitle={`Base ${row.baseModelScore.toFixed(1)}`}
                compact
              />
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-200">
                  {row.pathDifficulty.toFixed(1)}
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  path score
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Hardest paths
          </h3>
          <Badge tone="rose">Top 10</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {hardest.map((row) => (
            <div
              key={row.team.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/55 p-3"
            >
              <TeamChip
                team={row.team}
                name={row.team.name}
                shortName={row.team.shortName}
                subtitle={`Adjusted ${row.adjustedTournamentScore.toFixed(1)}`}
                compact
              />
              <div className="text-right">
                <p className="text-sm font-semibold text-rose-200">
                  {row.pathDifficulty.toFixed(1)}
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  path score
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Upset pressure
          </h3>
          <Badge tone="amber">Live board</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {riskGames.length > 0 ? (
            riskGames.map((game) => (
              <div
                key={game.id}
                className="rounded-2xl border border-white/8 bg-slate-950/55 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {game.teamA.team?.name ?? "TBD"} vs {game.teamB.team?.name ?? "TBD"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{game.round}</p>
                  </div>
                  <Badge tone={game.upsetRisk === "High" ? "rose" : "amber"}>
                    {game.upsetRisk} risk
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/8 bg-slate-950/55 p-4 text-sm text-slate-400">
              No notable upset pressure spots in the current board state.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
