import { LandingPage } from "@/components/home/LandingPage";
import { getBettingPageData } from "@/lib/api/liveData";
import { presets } from "@/lib/data/presets";

export default async function HomePage() {
  const { teams, bracketTeams, games, bracketGames, meta } =
    await getBettingPageData();

  return (
    <LandingPage
      teams={teams}
      bracketTeams={bracketTeams}
      games={games}
      bracketGames={bracketGames}
      preset={presets[0]}
      dataSource={meta.source}
    />
  );
}
