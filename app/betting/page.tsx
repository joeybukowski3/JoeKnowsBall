import { BettingDashboard } from "@/components/betting/BettingDashboard";
import { getBettingPageData } from "@/lib/api/liveData";
import { presets } from "@/lib/data";

export default async function BettingPage() {
  const { teams, bracketTeams, games, futuresMarkets, bracketGames, meta } =
    await getBettingPageData();

  return (
    <BettingDashboard
      teams={teams}
      bracketTeams={bracketTeams}
      games={games}
      presets={presets}
      futuresMarkets={futuresMarkets}
      bracketGames={bracketGames}
      dataSource={meta.source}
    />
  );
}
