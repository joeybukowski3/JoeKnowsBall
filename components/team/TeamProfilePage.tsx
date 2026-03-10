import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { StrengthBar } from "@/components/shared/StrengthBar";
import { TeamChip } from "@/components/shared/TeamChip";
import { getTeamMeta } from "@/lib/data/teamMeta";
import { rankingCategories } from "@/lib/data";
import { getTournamentEntryByTeamId } from "@/lib/data/tournamentField";
import type {
  BracketGameNode,
  DataSource,
  FuturesMarket,
  RankingCategoryGroup,
  RankingPreset,
  Team,
} from "@/lib/types";
import { rankingsEngine } from "@/lib/utils/rankingsEngine";
import { americanToImpliedProbability, formatAmericanOdds } from "@/lib/utils/oddsCalculator";
import { pathDifficulty } from "@/lib/utils/pathDifficulty";
import { buildBracketRankingRows, tournamentSimulator } from "@/lib/utils/tournamentSimulator";
import { getValueTier } from "@/lib/utils/valueRatings";
import { matchTeamName } from "@/lib/utils/teamMatcher";

type TeamProfilePageProps = {
  team: Team | null;
  teams: Team[];
  bracketTeams: Team[];
  futuresMarkets: FuturesMarket[];
  bracketGames: BracketGameNode[];
  preset: RankingPreset;
  dataSource: DataSource;
};

function clonePresetSettings(preset: RankingPreset) {
  return {
    presetId: preset.id,
    activeCategories: { ...preset.activeCategories },
    weights: { ...preset.weights },
  };
}

function getCategoryRankings(teams: Team[], preset: RankingPreset) {
  const rankingRows = rankingsEngine(teams, clonePresetSettings(preset), rankingCategories);
  const categoryRanks = new Map<string, Record<RankingCategoryGroup, number>>();

  for (const category of rankingCategories) {
    const sorted = [...rankingRows].sort((left, right) => {
      const diff = left.categoryScores[category.key].raw - right.categoryScores[category.key].raw;
      return category.direction === "lower" ? diff : -diff;
    });

    sorted.forEach((row, index) => {
      const current = categoryRanks.get(row.team.id) ?? ({} as Record<RankingCategoryGroup, number>);
      current[category.key] = index + 1;
      categoryRanks.set(row.team.id, current);
    });
  }

  return {
    rankingRows,
    categoryRanks,
  };
}

function getRegionStrength(
  paths: ReturnType<typeof pathDifficulty>,
  bracketTeams: Team[],
  region: string | undefined,
) {
  if (!region) {
    return null;
  }

  const regionTeamIds = new Set(
    bracketTeams
      .filter((entry) => getTournamentEntryByTeamId(entry.id)?.region === region)
      .map((entry) => entry.id),
  );
  const regionTeams = paths.filter((row) => regionTeamIds.has(row.team.id));
  if (regionTeams.length === 0) {
    return null;
  }

  const average =
    regionTeams.reduce((sum, row) => sum + row.adjustedTournamentScore, 0) / regionTeams.length;

  return average;
}

export function TeamProfilePage({
  team,
  teams,
  bracketTeams,
  futuresMarkets,
  bracketGames,
  preset,
  dataSource,
}: TeamProfilePageProps) {
  if (!team) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Team Profile"
          title="Team not found"
          description="That NCAA team page could not be resolved from the current live or fallback data set."
        />
        <Panel title="Try these next steps">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ncaa"
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Back to NCAA rankings
            </Link>
            <Link
              href="/bracket"
              className="rounded-2xl border border-white/12 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-sky-300/30 hover:bg-white/14"
            >
              Open bracket builder
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  const meta = getTeamMeta(team.name);
  const { rankingRows, categoryRanks } = getCategoryRankings(teams, preset);
  const rankingRow =
    rankingRows.find((row) => row.team.id === team.id) ??
    rankingRows.find((row) => row.team.name === team.name);
  const bracketRankingRows = buildBracketRankingRows(bracketTeams, preset);
  const simulation = tournamentSimulator({
    teams: bracketTeams,
    bracketGames,
    preset,
    iterations: 3000,
  });
  const simulationRow = simulation.rows.find((row) => row.team.id === team.id) ?? null;
  const paths = pathDifficulty(bracketTeams, bracketGames, bracketRankingRows);
  const pathRow = paths.find((row) => row.team.id === team.id) ?? null;
  const teamRegion = getTournamentEntryByTeamId(team.id)?.region;
  const regionStrength = getRegionStrength(paths, bracketTeams, teamRegion);
  const futuresMatch =
    futuresMarkets.find((market) => matchTeamName(market.team, [team], "team-profile-futures").canonicalId === team.id) ??
    null;
  const impliedProbability = futuresMatch
    ? americanToImpliedProbability(futuresMatch.titleOdds)
    : null;
  const modelTitleProbability = simulationRow?.champion ?? null;
  const futuresEdge =
    impliedProbability !== null && modelTitleProbability !== null
      ? modelTitleProbability - impliedProbability
      : null;
  const categoryRankMap = categoryRanks.get(team.id);

  return (
    <div className="space-y-6">
      <section
        className="overflow-hidden rounded-[32px] border border-white/10 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.22)] sm:p-8"
        style={{
          background: `radial-gradient(circle at top, ${meta.primary}33, transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(15,23,42,0.46))`,
        }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={dataSource === "live" ? "emerald" : "amber"}>
                {dataSource === "live" ? "Live Data" : "Mock Fallback"}
              </Badge>
              <Badge
                tone={
                  team.statProfile?.status === "live"
                    ? "emerald"
                    : team.statProfile?.status === "partial-fallback"
                      ? "amber"
                      : "neutral"
                }
              >
                {team.statProfile?.status === "live"
                  ? "Live Stats"
                  : team.statProfile?.status === "partial-fallback"
                    ? "Partial Fallback"
                    : "Mock Fallback"}
              </Badge>
              {team.seed ? <Badge tone="sky">{team.seed} Seed</Badge> : null}
              <Badge tone="neutral">{team.conference}</Badge>
            </div>
            <div className="flex items-center gap-4">
              <TeamChip
                team={team}
                name={team.name}
                shortName={team.shortName}
                subtitle={team.record}
                href={null}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Model rank</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  #{rankingRow?.rank ?? "--"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Model score</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {rankingRow?.overallScore.toFixed(1) ?? "--"}
                </p>
                {rankingRow ? <StrengthBar value={rankingRow.overallScore} className="mt-3" /> : null}
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tournament</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {pathRow ? "In Field" : "On Bubble"}
                </p>
              </div>
            </div>
          </div>
          <div className="max-w-md space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/85">
              Team outlook
            </p>
            <p className="text-sm leading-7 text-slate-300">
              This page combines the current model rank, weighted category profile,
              tournament path, simulation probabilities, and futures context for a
              single NCAA team view.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
        <Panel
          eyebrow="Model Breakdown"
          title="Category profile"
          description="Weighted category scores under the current default NCAA preset."
        >
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <table className="min-w-full divide-y divide-white/8 text-left">
              <thead className="bg-white/[0.06]">
                <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-right">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 bg-transparent">
                {rankingCategories.map((category) => (
                  <tr key={category.key} className="hover:bg-white/[0.04]">
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {category.label}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-300">
                      {rankingRow ? (
                        <div className="ml-auto flex min-w-[138px] items-center justify-end gap-3">
                          <div className="w-20">
                            <StrengthBar
                              value={rankingRow.categoryScores[category.key].normalized * 100}
                              compact
                            />
                          </div>
                          <span>{rankingRow.categoryScores[category.key].raw.toFixed(1)}</span>
                        </div>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-sky-200">
                      {categoryRankMap?.[category.key] ? `#${categoryRankMap[category.key]}` : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel
            eyebrow="Betting Context"
            title="Futures market"
            description="Current title odds versus model title probability."
          >
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Title odds</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {futuresMatch ? formatAmericanOdds(futuresMatch.titleOdds) : "--"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Implied</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {impliedProbability !== null ? `${(impliedProbability * 100).toFixed(1)}%` : "--"}
                  </p>
                  {impliedProbability !== null ? (
                    <StrengthBar value={impliedProbability * 100} className="mt-3" compact tone="neutral" />
                  ) : null}
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Model</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {modelTitleProbability !== null ? `${(modelTitleProbability * 100).toFixed(1)}%` : "--"}
                  </p>
                  {modelTitleProbability !== null ? (
                    <StrengthBar value={modelTitleProbability * 100} className="mt-3" compact tone="positive" />
                  ) : null}
                </div>
              </div>
              <Badge
                tone={
                  futuresEdge === null
                    ? "neutral"
                    : getValueTier(futuresEdge) === "Strong"
                      ? "emerald"
                      : getValueTier(futuresEdge) === "Medium"
                        ? "sky"
                        : getValueTier(futuresEdge) === "Small"
                          ? "amber"
                          : "neutral"
                }
              >
                {futuresEdge !== null
                  ? `${getValueTier(futuresEdge)} value • ${(futuresEdge * 100).toFixed(1)}% edge`
                  : "No current futures context"}
              </Badge>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          eyebrow="Tournament Outlook"
          title="Simulation probabilities"
          description="Advancement probabilities from the current tournament simulation model."
        >
          {simulationRow ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Sweet 16", simulationRow.sweet16],
                ["Elite 8", simulationRow.elite8],
                ["Final Four", simulationRow.finalFour],
                ["Championship Game", simulationRow.championshipGame],
                ["Title", simulationRow.champion],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {`${((value as number) * 100).toFixed(1)}%`}
                  </p>
                  <StrengthBar value={(value as number) * 100} className="mt-3" compact tone="positive" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              This team is not currently in the active tournament field simulation.
            </p>
          )}
        </Panel>

        <Panel
          eyebrow="Path Difficulty"
          title="Tournament path context"
          description="Expected opponent strength and regional pressure from the current bracket field."
        >
          {pathRow ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Path score</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {pathRow.pathDifficulty.toFixed(1)}
                  </p>
                  <StrengthBar value={pathRow.pathDifficulty} className="mt-3" compact tone="neutral" />
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Adjusted</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {pathRow.adjustedTournamentScore.toFixed(1)}
                  </p>
                  <StrengthBar value={pathRow.adjustedTournamentScore} className="mt-3" compact />
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Region strength</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {regionStrength !== null ? regionStrength.toFixed(1) : "--"}
                  </p>
                  {regionStrength !== null ? (
                    <StrengthBar value={regionStrength} className="mt-3" compact />
                  ) : null}
                </div>
              </div>
              <div className="overflow-hidden rounded-[24px] border border-white/10">
                <table className="min-w-full divide-y divide-white/8 text-left">
                  <thead className="bg-white/[0.06]">
                    <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <th className="px-4 py-3">Round</th>
                      <th className="px-4 py-3 text-right">Expected Opponent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8 bg-transparent">
                    {pathRow.rounds.map((round) => (
                      <tr key={round.round} className="hover:bg-white/[0.04]">
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {round.round}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-300">
                          {round.expectedOpponentStrength.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              This team does not currently have a tournament path assigned in the active field.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
