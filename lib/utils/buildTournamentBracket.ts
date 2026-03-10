import { activeTournamentField } from "@/lib/data/tournamentField";
import { roundOf64Pairings } from "@/lib/data/tournamentSeeds";
import type {
  BracketGameNode,
  BracketRound,
  Team,
  TournamentFieldEntry,
  TournamentRegion,
} from "@/lib/types";
import { createTeamSlug } from "@/lib/utils/teamNameNormalizer";
import { matchTeamName } from "@/lib/utils/teamMatcher";

function slugify(value: string) {
  return createTeamSlug(value);
}

function getSyntheticMetrics(seed: number, index: number) {
  const seedPenalty = seed * 2.3;
  const variance = index % 4;

  return {
    offense: 124 - seedPenalty + variance * 0.6,
    defense: 89 + seed * 0.85 + variance * 0.5,
    shooting: 58 - seed * 0.28 + variance * 0.2,
    rebounding: 54 - seed * 0.18 + variance * 0.15,
    ballControl: 12.4 + seed * 0.16 + variance * 0.1,
    sos: 92 - seed * 1.5 - variance,
    recentForm: 89 - seed * 1.2 + variance,
    homeAway: 84 - seed * 0.9 + variance,
    atsTrends: 64 - seed * 0.55 + variance,
  };
}

function createSyntheticTeam(entry: TournamentFieldEntry, index: number): Team {
  const metrics = getSyntheticMetrics(entry.seed, index);

  return {
    id: entry.teamId,
    name: entry.displayName,
    shortName: entry.displayName.slice(0, 4).toUpperCase(),
    conference: `${entry.region} League`,
    record: `${32 - entry.seed}-${entry.seed + 4}`,
    rank: entry.seed + index,
    seed: String(entry.seed),
    isTournamentTeam: true,
    stats: {
      adjustedOffense: metrics.offense,
      adjustedDefense: metrics.defense,
      tempo: 64 + (index % 7),
      effectiveFieldGoalPct: metrics.shooting,
      turnoverRate: metrics.ballControl,
      reboundRate: metrics.rebounding,
      freeThrowRate: 28 + (16 - entry.seed) * 0.45,
    },
    metrics,
  };
}

function createRegionGames(region: TournamentRegion, entries: TournamentFieldEntry[]): BracketGameNode[] {
  const round64: BracketGameNode[] = roundOf64Pairings.map(([seedA, seedB], index) => {
    const round32GameId = `${slugify(region)}-r32-${Math.floor(index / 2) + 1}`;
    const top = entries.find((entry) => entry.seed === seedA);
    const bottom = entries.find((entry) => entry.seed === seedB);

    return {
      id: `${slugify(region)}-r64-${index + 1}`,
      region,
      round: "Round of 64" as BracketRound,
      order: index + 1,
      nextGameId: round32GameId,
      nextSlot: (index % 2 === 0 ? "teamA" : "teamB") as "teamA" | "teamB",
      participants: [
        { type: "team", teamId: top?.teamId, seed: seedA },
        { type: "team", teamId: bottom?.teamId, seed: seedB },
      ],
    };
  });

  const round32: BracketGameNode[] = Array.from({ length: 4 }, (_, index) => {
    const sweet16GameId = `${slugify(region)}-s16-${Math.floor(index / 2) + 1}`;

    return {
      id: `${slugify(region)}-r32-${index + 1}`,
      region,
      round: "Round of 32",
      order: index + 1,
      nextGameId: sweet16GameId,
      nextSlot: index % 2 === 0 ? "teamA" : "teamB",
      participants: [
        { type: "winner", sourceGameId: `${slugify(region)}-r64-${index * 2 + 1}` },
        { type: "winner", sourceGameId: `${slugify(region)}-r64-${index * 2 + 2}` },
      ],
    };
  });

  const sweet16: BracketGameNode[] = Array.from({ length: 2 }, (_, index) => ({
    id: `${slugify(region)}-s16-${index + 1}`,
    region,
    round: "Sweet 16",
    order: index + 1,
    nextGameId: `${slugify(region)}-e8-1`,
    nextSlot: index === 0 ? "teamA" : "teamB",
    participants: [
      { type: "winner", sourceGameId: `${slugify(region)}-r32-${index * 2 + 1}` },
      { type: "winner", sourceGameId: `${slugify(region)}-r32-${index * 2 + 2}` },
    ],
  }));

  const elite8: BracketGameNode[] = [
    {
      id: `${slugify(region)}-e8-1`,
      region,
      round: "Elite 8",
      order: 1,
      nextGameId: region === "East" || region === "West" ? "final-four-1" : "final-four-2",
      nextSlot: region === "East" || region === "South" ? "teamA" : "teamB",
      participants: [
        { type: "winner", sourceGameId: `${slugify(region)}-s16-1` },
        { type: "winner", sourceGameId: `${slugify(region)}-s16-2` },
      ],
    },
  ];

  return [...round64, ...round32, ...sweet16, ...elite8];
}

export function buildTournamentTeams(teams: Team[], field = activeTournamentField) {
  return field.map((entry, index) => {
    const match = matchTeamName(entry.displayName, teams, "tournament-field");
    const matchedTeam = match.matchedTeam;

    if (matchedTeam) {
      return {
        ...matchedTeam,
        id: entry.teamId,
        name: entry.displayName,
        seed: String(entry.seed),
        isTournamentTeam: true,
      };
    }

    return createSyntheticTeam(entry, index);
  });
}

export function buildTournamentBracket(field = activeTournamentField) {
  const byRegion = field.reduce<Record<TournamentRegion, TournamentFieldEntry[]>>(
    (accumulator, entry) => {
      if (entry.active !== false) {
        accumulator[entry.region].push(entry);
      }
      return accumulator;
    },
    {
      East: [],
      West: [],
      South: [],
      Midwest: [],
    },
  );

  return [
    ...createRegionGames("East", byRegion.East),
    ...createRegionGames("West", byRegion.West),
    ...createRegionGames("South", byRegion.South),
    ...createRegionGames("Midwest", byRegion.Midwest),
    {
      id: "final-four-1",
      region: "Final Four",
      round: "Final Four",
      order: 1,
      nextGameId: "championship-1",
      nextSlot: "teamA",
      participants: [
        { type: "winner", sourceGameId: "east-e8-1" },
        { type: "winner", sourceGameId: "west-e8-1" },
      ],
    },
    {
      id: "final-four-2",
      region: "Final Four",
      round: "Final Four",
      order: 2,
      nextGameId: "championship-1",
      nextSlot: "teamB",
      participants: [
        { type: "winner", sourceGameId: "south-e8-1" },
        { type: "winner", sourceGameId: "midwest-e8-1" },
      ],
    },
    {
      id: "championship-1",
      region: "Championship",
      round: "Championship",
      order: 1,
      nextGameId: null,
      nextSlot: null,
      participants: [
        { type: "winner", sourceGameId: "final-four-1" },
        { type: "winner", sourceGameId: "final-four-2" },
      ],
    },
  ] satisfies BracketGameNode[];
}
