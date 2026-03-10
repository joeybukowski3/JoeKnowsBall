import { InsightCard } from "@/components/insights/InsightCard";
import { TeamChip } from "@/components/shared/TeamChip";
import type { PathDifficultyRow } from "@/lib/types";

type HardestPathsProps = {
  rows: PathDifficultyRow[];
  title?: string;
};

export function HardestPaths({
  rows,
  title = "Hardest Tournament Paths",
}: HardestPathsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <InsightCard
          key={row.team.id}
          eyebrow={title}
          title={row.team.name}
          value={row.pathDifficulty.toFixed(1)}
          tone="rose"
          description={`Adjusted score ${row.adjustedTournamentScore.toFixed(1)} • Base ${row.baseModelScore.toFixed(1)}`}
        >
          <TeamChip
            name={row.team.name}
            shortName={row.team.shortName}
            subtitle={`Path score ${row.pathDifficulty.toFixed(1)}`}
            compact
          />
        </InsightCard>
      ))}
    </div>
  );
}
