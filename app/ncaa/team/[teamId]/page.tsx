import { TeamProfilePage } from "@/components/team/TeamProfilePage";
import { getNcaaTeamPageData } from "@/lib/api/liveData";
import { presets } from "@/lib/data/presets";

type TeamPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function NCAATeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const data = await getNcaaTeamPageData(teamId);

  return (
    <TeamProfilePage
      team={data.team}
      teams={data.teams}
      bracketTeams={data.bracketTeams}
      futuresMarkets={data.futuresMarkets}
      bracketGames={data.bracketGames}
      preset={presets[0]}
      dataSource={data.meta.source}
    />
  );
}
