import type { NormalizedTeamStats, Team } from "@/lib/types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function deriveShooting(profile: NormalizedTeamStats, fallback: Team) {
  const direct = profile.values.shooting;
  if (direct !== null) {
    return direct;
  }

  const threePoint = profile.values.threePointPct;
  const freeThrow = profile.values.freeThrowPct;
  if (threePoint !== null || freeThrow !== null) {
    return Number(
      (
        (threePoint ?? fallback.metrics.shooting) * 0.7 +
        (freeThrow ?? fallback.stats.freeThrowRate ?? fallback.metrics.shooting) * 0.3
      ).toFixed(1),
    );
  }

  return fallback.metrics.shooting;
}

function buildMergedMetrics(team: Team, profile: NormalizedTeamStats) {
  const offense = profile.values.adjustedOffense ?? team.metrics.offense;
  const defense = profile.values.adjustedDefense ?? team.metrics.defense;
  const shooting = deriveShooting(profile, team);
  const rebounding = profile.values.rebounding ?? team.metrics.rebounding;
  const ballControl = profile.values.ballControl ?? team.metrics.ballControl;
  const sos = profile.values.strengthOfSchedule ?? team.metrics.sos;
  const recentForm = profile.values.recentForm ?? team.metrics.recentForm;
  const homeAway = profile.values.homeAway ?? team.metrics.homeAway;

  return {
    offense: Number(offense.toFixed(1)),
    defense: Number(defense.toFixed(1)),
    shooting: Number(shooting.toFixed(1)),
    rebounding: Number(rebounding.toFixed(1)),
    ballControl: Number(ballControl.toFixed(1)),
    sos: Number(sos.toFixed(1)),
    recentForm: Number(recentForm.toFixed(1)),
    homeAway: Number(homeAway.toFixed(1)),
    atsTrends: team.metrics.atsTrends,
  };
}

function buildMergedStats(team: Team, profile: NormalizedTeamStats) {
  return {
    adjustedOffense: profile.values.adjustedOffense ?? team.stats.adjustedOffense,
    adjustedDefense: profile.values.adjustedDefense ?? team.stats.adjustedDefense,
    tempo: profile.values.pace ?? team.stats.tempo,
    effectiveFieldGoalPct: profile.values.shooting ?? team.stats.effectiveFieldGoalPct,
    turnoverRate: profile.values.ballControl ?? team.stats.turnoverRate,
    reboundRate: profile.values.rebounding ?? team.stats.reboundRate,
    freeThrowRate: profile.values.freeThrowPct ?? team.stats.freeThrowRate,
    freeThrowPct: profile.values.freeThrowPct ?? team.stats.freeThrowPct ?? null,
    threePointPct: profile.values.threePointPct ?? team.stats.threePointPct ?? null,
    opponentThreePointPct:
      profile.values.opponentThreePointPct ?? team.stats.opponentThreePointPct ?? null,
    trueShootingPct: profile.values.trueShootingPct ?? team.stats.trueShootingPct ?? null,
    strengthOfSchedule:
      profile.values.strengthOfSchedule ?? team.stats.strengthOfSchedule ?? null,
    recentForm: profile.values.recentForm ?? team.stats.recentForm ?? null,
    homeAwaySplit: profile.values.homeAway ?? team.stats.homeAwaySplit ?? null,
    pace: profile.values.pace ?? team.stats.pace ?? null,
  };
}

export function mergeStatsIntoTeams(teams: Team[], profiles: NormalizedTeamStats[]) {
  const byTeamId = new Map(profiles.map((profile) => [profile.teamId, profile]));

  return teams.map((team) => {
    const profile = byTeamId.get(team.id);
    if (!profile) {
      return team;
    }

    const mergedMetrics = buildMergedMetrics(team, profile);

    return {
      ...team,
      stats: buildMergedStats(team, profile),
      metrics: mergedMetrics,
      statProfile: {
        ...profile,
        values: {
          ...profile.values,
          recentForm: clamp(mergedMetrics.recentForm, 0, 100),
          homeAway: clamp(mergedMetrics.homeAway, 0, 100),
          strengthOfSchedule: clamp(mergedMetrics.sos, 0, 100),
        },
      },
    };
  });
}
