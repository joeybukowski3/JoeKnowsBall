import { NcaaInsightsDashboard } from "@/components/insights/NcaaInsightsDashboard";
import { getBettingPageData } from "@/lib/api/liveData";
import { presets } from "@/lib/data";

export default async function NcaaInsightsPage() {
  const { teams, bracketTeams, games, futuresMarkets, bracketGames, meta } =
    await getBettingPageData();

  return (
    <NcaaInsightsDashboard
      teams={teams}
      bracketTeams={bracketTeams}
      games={games}
      futuresMarkets={futuresMarkets}
      bracketGames={bracketGames}
      preset={presets[0]}
      dataSource={meta.source}
    />
  );
}
