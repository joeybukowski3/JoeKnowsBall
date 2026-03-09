import { RankingsDashboard } from "@/components/rankings/RankingsDashboard";
import { games, mockTeams, odds, presets } from "@/lib/data";

export default function HomePage() {
  return (
    <RankingsDashboard
      teams={mockTeams}
      presets={presets}
      odds={odds}
      games={games}
    />
  );
}
