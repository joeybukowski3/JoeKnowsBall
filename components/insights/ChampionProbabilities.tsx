import { InsightCard } from "@/components/insights/InsightCard";
import { TeamChip } from "@/components/shared/TeamChip";
import type { TournamentSimulationRow } from "@/lib/types";

type ChampionProbabilitiesProps = {
  rows: TournamentSimulationRow[];
  title?: string;
  mode?: "champion" | "finalFour";
};

export function ChampionProbabilities({
  rows,
  title = "Most Likely Champions",
  mode = "champion",
}: ChampionProbabilitiesProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => {
        const probability = mode === "champion" ? row.champion : row.finalFour;

        return (
          <InsightCard
            key={row.team.id}
            eyebrow={title}
            title={row.team.name}
            value={`${(probability * 100).toFixed(1)}%`}
            tone={mode === "champion" ? "sky" : "emerald"}
            description={
              mode === "champion"
                ? `${(row.championshipGame * 100).toFixed(1)}% title-game rate`
                : `${(row.elite8 * 100).toFixed(1)}% Elite Eight rate`
            }
          >
            <TeamChip
              team={row.team}
              name={row.team.name}
              shortName={row.team.shortName}
              subtitle={row.team.conference}
              compact
            />
          </InsightCard>
        );
      })}
    </div>
  );
}
