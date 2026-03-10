import { InsightCard } from "@/components/insights/InsightCard";
import { TeamChip } from "@/components/shared/TeamChip";
import type { FuturesValueRow } from "@/lib/types";
import { formatAmericanOdds } from "@/lib/utils/oddsCalculator";

type FuturesValueWatchProps = {
  rows: FuturesValueRow[];
  title?: string;
};

export function FuturesValueWatch({
  rows,
  title = "Best Futures Value",
}: FuturesValueWatchProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <InsightCard
          key={row.team.id}
          eyebrow={title}
          title={row.team.name}
          value={`${(row.futuresEdge * 100).toFixed(1)}% edge`}
          tone="sky"
          description={`Rank #${row.rank} • ${formatAmericanOdds(row.titleOdds)} title odds • Path ${row.pathDifficulty.toFixed(1)}`}
        >
          <TeamChip
            team={row.team}
            name={row.team.name}
            shortName={row.team.shortName}
            subtitle={row.team.conference}
            compact
          />
        </InsightCard>
      ))}
    </div>
  );
}
