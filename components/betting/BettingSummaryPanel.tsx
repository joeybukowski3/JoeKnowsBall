import { ValueCard } from "@/components/betting/ValueCard";
import type { FuturesValueRow, GameValueRow } from "@/lib/types";

type BettingSummaryPanelProps = {
  strongestMoneyline: GameValueRow | null;
  strongestSpread: GameValueRow | null;
  bestFutures: FuturesValueRow | null;
  mostUpsetProne: GameValueRow | null;
  averageEdge: number;
};

export function BettingSummaryPanel({
  strongestMoneyline,
  strongestSpread,
  bestFutures,
  mostUpsetProne,
  averageEdge,
}: BettingSummaryPanelProps) {
  return (
    <div className="space-y-4">
      <ValueCard
        eyebrow="Moneyline"
        title={strongestMoneyline?.matchup ?? "No edge"}
        value={strongestMoneyline ? `${(strongestMoneyline.moneylineEdge * 100).toFixed(1)}%` : "--"}
        description="Largest model edge versus the implied moneyline on the filtered slate."
      />
      <ValueCard
        eyebrow="Spread"
        title={strongestSpread?.matchup ?? "No edge"}
        value={strongestSpread ? `${strongestSpread.spreadEdge.toFixed(1)} pts` : "--"}
        description="Biggest gap between market spread and model spread estimate."
      />
      <ValueCard
        eyebrow="Futures"
        title={bestFutures?.team.name ?? "No futures value"}
        value={bestFutures ? `${(bestFutures.futuresEdge * 100).toFixed(1)}%` : "--"}
        description="Best title futures discrepancy after blending rankings, path, and simulation."
      />
      <ValueCard
        eyebrow="Volatility"
        title={mostUpsetProne?.matchup ?? "No hotspot"}
        value={mostUpsetProne?.upsetRisk ?? "--"}
        description="Most upset-prone matchup based on seed, rank, and model proximity."
      />
      <ValueCard
        eyebrow="Slate"
        title="Average model edge"
        value={`${(averageEdge * 100).toFixed(1)}%`}
        description="Mean moneyline edge across the currently visible game slate."
      />
    </div>
  );
}
