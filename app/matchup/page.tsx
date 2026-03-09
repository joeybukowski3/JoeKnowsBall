import { MatchupDashboard } from "@/components/matchup/MatchupDashboard";
import { games, mockTeams, presets } from "@/lib/data";

export default function MatchupPage() {
  return <MatchupDashboard teams={mockTeams} games={games} presets={presets} />;
}
