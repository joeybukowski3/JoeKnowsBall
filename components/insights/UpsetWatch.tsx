import { InsightCard } from "@/components/insights/InsightCard";
import { Badge } from "@/components/shared/Badge";
import type { GameValueRow, ResolvedBracketGame } from "@/lib/types";

type UpsetWatchProps = {
  games?: GameValueRow[];
  bracketGames?: ResolvedBracketGame[];
  title?: string;
};

function toneFromRisk(risk: string) {
  if (risk === "High") {
    return "rose";
  }
  if (risk === "Medium") {
    return "amber";
  }
  return "neutral";
}

export function UpsetWatch({
  games = [],
  bracketGames = [],
  title = "Upset Watch",
}: UpsetWatchProps) {
  const items =
    games.length > 0
      ? games.map((game) => ({
          id: game.game.id,
          title: game.matchup,
          subtitle: `${game.game.startTime} • ${(game.modelWinProbability * 100).toFixed(1)}% model win`,
          risk: game.upsetRisk,
        }))
      : bracketGames.map((game) => ({
          id: game.id,
          title: `${game.teamA.team?.name ?? "TBD"} vs ${game.teamB.team?.name ?? "TBD"}`,
          subtitle: game.round,
          risk: game.upsetRisk,
        }));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <InsightCard
          key={item.id}
          eyebrow={title}
          title={item.title}
          value={item.risk}
          tone={toneFromRisk(item.risk)}
          description={item.subtitle}
        >
          <Badge tone={toneFromRisk(item.risk)}>{item.risk} risk</Badge>
        </InsightCard>
      ))}
    </div>
  );
}
