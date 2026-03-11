import { RankingsDashboard } from "@/components/rankings/RankingsDashboard";
import { getBettingPageData } from "@/lib/api/liveData";
import { presets } from "@/lib/data";
import { tournamentFieldTeamIds } from "@/lib/data/tournamentField";

export default async function HomePage() {
  const { teams, bracketTeams, games, futuresMarkets, bracketGames, meta } =
    await getBettingPageData();

  return (
    <RankingsDashboard
      teams={teams}
      bracketTeams={bracketTeams}
      presets={presets}
      futuresMarkets={futuresMarkets}
      games={games}
      bracketGames={bracketGames}
      dataSource={meta.source}
      tournamentTeamIds={tournamentFieldTeamIds}
      focusedHomeView
    />
  );
}
