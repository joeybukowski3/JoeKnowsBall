import { BracketBuilderDashboard } from "@/components/bracket/BracketBuilderDashboard";
import { getBettingPageData } from "@/lib/api/liveData";
import { presets } from "@/lib/data";

export default async function BracketPage() {
  const { bracketGames, bracketTeams } = await getBettingPageData();

  return (
    <BracketBuilderDashboard
      teams={bracketTeams}
      bracketGames={bracketGames}
      presets={presets}
    />
  );
}
