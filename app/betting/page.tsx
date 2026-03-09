import { BettingDashboard } from "@/components/betting/BettingDashboard";
import { games, mockBracketGames, mockBracketTeams, mockFutures, mockTeams, presets } from "@/lib/data";

export default function BettingPage() {
  return (
    <BettingDashboard
      teams={mockTeams}
      bracketTeams={mockBracketTeams}
      games={games}
      presets={presets}
      futuresMarkets={mockFutures}
      bracketGames={mockBracketGames}
    />
  );
}
