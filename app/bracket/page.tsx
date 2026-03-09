import { BracketBuilderDashboard } from "@/components/bracket/BracketBuilderDashboard";
import { mockBracketGames, mockBracketTeams, presets } from "@/lib/data";

export default function BracketPage() {
  return (
    <BracketBuilderDashboard
      teams={mockBracketTeams}
      bracketGames={mockBracketGames}
      presets={presets}
    />
  );
}
