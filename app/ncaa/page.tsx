import { RankingsDashboard } from "@/components/rankings/RankingsDashboard";
import { getNcaaDashboardData } from "@/lib/api/liveData";
import { presets } from "@/lib/data";

export default async function NCAAPage() {
  const { teams, games, odds, meta } = await getNcaaDashboardData();

  return (
    <RankingsDashboard
      teams={teams}
      presets={presets}
      odds={odds}
      games={games}
      dataSource={meta.source}
    />
  );
}
