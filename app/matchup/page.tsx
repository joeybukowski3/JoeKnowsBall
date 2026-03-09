import { MatchupDashboard } from "@/components/matchup/MatchupDashboard";
import { getMatchupPageData } from "@/lib/api/liveData";
import { presets } from "@/lib/data";

export default async function MatchupPage() {
  const { teams, games, meta } = await getMatchupPageData();

  return (
    <MatchupDashboard
      teams={teams}
      games={games}
      presets={presets}
      dataSource={meta.source}
    />
  );
}
