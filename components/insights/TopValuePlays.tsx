import { InsightCard } from "@/components/insights/InsightCard";
import { TeamChip } from "@/components/shared/TeamChip";
import type { GameValueRow } from "@/lib/types";

type TopValuePlaysProps = {
  rows: GameValueRow[];
  title?: string;
};

export function TopValuePlays({
  rows,
  title = "Best Value Plays Today",
}: TopValuePlaysProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <InsightCard
          key={row.game.id}
          eyebrow={title}
          title={row.matchup}
          value={`${(row.moneylineEdge * 100).toFixed(1)}% edge`}
          tone="emerald"
          description={`${row.game.startTime} • Spread edge ${row.spreadEdge.toFixed(1)} • ${row.valueTier} value`}
        >
          <TeamChip
            name={row.awayTeam.name}
            shortName={row.awayTeam.shortName}
            subtitle={`at ${row.homeTeam.name}`}
            compact
          />
        </InsightCard>
      ))}
    </div>
  );
}
