import { BestBetsDashboard } from "@/components/betting/BestBetsDashboard";
import { getBettingPageData } from "@/lib/api/liveData";
import { presets } from "@/lib/data";

export default async function BestBetsPage() {
  const { teams, bracketTeams, games, futuresMarkets, bracketGames, meta } =
    await getBettingPageData();

  return (
    <BestBetsDashboard
      teams={teams}
      bracketTeams={bracketTeams}
      games={games}
      futuresMarkets={futuresMarkets}
      bracketGames={bracketGames}
      presets={presets}
      dataSource={meta.source}
    />
  );
}
