import { rankingCategories } from "@/lib/data";
import type {
  Game,
  MatchupCategoryResult,
  MatchupSummary,
  RankingPreset,
  RankingSettings,
  Team,
} from "@/lib/types";
import { rankingsEngine } from "@/lib/utils/rankingsEngine";

type MatchupEngineInput = {
  allTeams: Team[];
  teamA: Team;
  teamB: Team;
  preset: RankingPreset;
  game?: Game;
};

function getSettingsFromPreset(preset: RankingPreset): RankingSettings {
  return {
    presetId: preset.id,
    activeCategories: { ...preset.activeCategories },
    weights: { ...preset.weights },
  };
}

function getWinProbability(scoreDifferential: number) {
  return 1 / (1 + Math.exp(-scoreDifferential / 7.5));
}

function getValueIndicator(edge: number): MatchupSummary["valueIndicator"] {
  if (Math.abs(edge) >= 2.5) {
    return "Strong";
  }

  if (Math.abs(edge) >= 1.25) {
    return "Watch";
  }

  return "Neutral";
}

function getVenueAdjustment(game: Game | undefined, teamA: Team, teamB: Team) {
  if (!game || game.neutralSite) {
    return 0;
  }

  if (game.homeTeam === teamA.name) {
    return 2.5;
  }

  if (game.homeTeam === teamB.name) {
    return -2.5;
  }

  return 0;
}

export function matchupEngine({
  allTeams,
  teamA,
  teamB,
  preset,
  game,
}: MatchupEngineInput): MatchupSummary {
  const settings = getSettingsFromPreset(preset);
  const rankingRows = rankingsEngine(allTeams, settings, rankingCategories);
  const teamARow = rankingRows.find((row) => row.team.id === teamA.id);
  const teamBRow = rankingRows.find((row) => row.team.id === teamB.id);

  if (!teamARow || !teamBRow) {
    throw new Error("Matchup engine could not resolve ranking rows for the selected teams.");
  }

  const rows: MatchupCategoryResult[] = rankingCategories.map((category) => {
    const scoreA = teamARow.categoryScores[category.key];
    const scoreB = teamBRow.categoryScores[category.key];
    const difference = scoreA.normalized - scoreB.normalized;

    return {
      category: category.key,
      label: category.label,
      teamAValue: scoreA.raw,
      teamBValue: scoreB.raw,
      teamANormalized: scoreA.normalized,
      teamBNormalized: scoreB.normalized,
      edge:
        Math.abs(difference) < 1.5 ? "even" : difference > 0 ? "teamA" : "teamB",
      difference,
      active: scoreA.active,
      weight: scoreA.weight,
    };
  });

  const venueAdjustment = getVenueAdjustment(game, teamA, teamB);
  const scoreDifferential =
    teamARow.overallScore - teamBRow.overallScore + venueAdjustment;
  const winProbabilityA = getWinProbability(scoreDifferential);
  const winProbabilityB = 1 - winProbabilityA;
  const modelSpread = Number((-scoreDifferential / 5).toFixed(1));
  const marketSpread = game?.spread ?? 0;
  const edgeVersusMarket = marketSpread - modelSpread;

  return {
    teamA: {
      team: teamA,
      rank: teamARow.rank,
      overallScore: Number((teamARow.overallScore + Math.max(venueAdjustment, 0)).toFixed(1)),
      winProbability: winProbabilityA,
    },
    teamB: {
      team: teamB,
      rank: teamBRow.rank,
      overallScore: Number((teamBRow.overallScore + Math.max(-venueAdjustment, 0)).toFixed(1)),
      winProbability: winProbabilityB,
    },
    rows: rows.concat({
      category: "overall",
      label: "Overall Model Score",
      teamAValue: teamARow.overallScore + Math.max(venueAdjustment, 0),
      teamBValue: teamBRow.overallScore + Math.max(-venueAdjustment, 0),
      teamANormalized: teamARow.overallScore,
      teamBNormalized: teamBRow.overallScore,
      edge:
        Math.abs(scoreDifferential) < 1 ? "even" : scoreDifferential > 0 ? "teamA" : "teamB",
      difference: scoreDifferential,
      active: true,
      weight: 100,
    }),
    scoreDifferential: Number(scoreDifferential.toFixed(2)),
    modelSpread,
    marketSpread,
    edgeTeam:
      Math.abs(scoreDifferential) < 1 ? "even" : scoreDifferential > 0 ? "teamA" : "teamB",
    valueIndicator: getValueIndicator(edgeVersusMarket),
  };
}
