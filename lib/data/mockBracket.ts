import { mockTeams } from "@/lib/data/mockTeams";
import type { BracketGameNode, BracketRound, Team } from "@/lib/types";

const pairings: Array<[number, number]> = [
  [1, 16],
  [8, 9],
  [5, 12],
  [4, 13],
  [6, 11],
  [3, 14],
  [7, 10],
  [2, 15],
];

const regionFields = {
  East: [
    "Houston",
    "Wisconsin",
    "Saint Mary's",
    "Colorado State",
    "Gonzaga",
    "Mississippi State",
    "Texas Tech",
    "Florida Atlantic",
    "Seton Hall",
    "Nevada",
    "Drake",
    "McNeese",
    "Princeton",
    "Vermont",
    "South Dakota State",
    "Howard",
  ],
  West: [
    "Connecticut",
    "Creighton",
    "Baylor",
    "Kansas",
    "Clemson",
    "TCU",
    "San Diego State",
    "Boise State",
    "Utah State",
    "Dayton",
    "VCU",
    "Grand Canyon",
    "Charleston",
    "Akron",
    "Colgate",
    "Longwood",
  ],
  South: [
    "Purdue",
    "Duke",
    "Marquette",
    "Alabama",
    "Auburn",
    "BYU",
    "Illinois",
    "Texas",
    "Virginia",
    "Northwestern",
    "New Mexico",
    "Liberty",
    "Yale",
    "Samford",
    "UC Irvine",
    "Morehead State",
  ],
  Midwest: [
    "Tennessee",
    "Arizona",
    "North Carolina",
    "Iowa State",
    "Kentucky",
    "Michigan State",
    "Florida",
    "Colorado",
    "Texas A&M",
    "Washington State",
    "Indiana State",
    "James Madison",
    "Appalachian State",
    "Belmont",
    "Princeton State",
    "Montana State",
  ],
} as const;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

function createSyntheticTeam(
  name: string,
  seed: number,
  region: string,
  index: number,
): Team {
  const metrics = getSyntheticMetrics(seed, index);

  return {
    id: `${slugify(region)}-${slugify(name)}`,
    name,
    shortName: name.slice(0, 4).toUpperCase(),
    conference: `${region} League`,
    record: `${32 - seed}-${seed + 4}`,
    rank: seed + index,
    seed: String(seed),
    isTournamentTeam: true,
    stats: {
      adjustedOffense: metrics.offense,
      adjustedDefense: metrics.defense,
      tempo: 64 + (index % 7),
      effectiveFieldGoalPct: metrics.shooting,
      turnoverRate: metrics.ballControl,
      reboundRate: metrics.rebounding,
      freeThrowRate: 28 + (16 - seed) * 0.45,
    },
    metrics,
  };
}

function buildTournamentTeams() {
  const existingByName = Object.fromEntries(
    mockTeams.map((team) => [team.name, team]),
  ) as Record<string, Team>;

  return Object.entries(regionFields).flatMap(([region, teamNames]) =>
    teamNames.map((name, index) => {
      const seed = index + 1;
      const existing = existingByName[name];

      if (existing) {
        return {
          ...existing,
          id: existing.id,
          seed: String(seed),
          isTournamentTeam: true,
        };
      }

      return createSyntheticTeam(name, seed, region, index);
    }),
  );
}

function getRegionForTeam(name: string) {
  const match = Object.entries(regionFields).find(([, names]) =>
    (names as readonly string[]).includes(name),
  );

  return match?.[0] ?? null;
}

function createRegionGames(region: string): BracketGameNode[] {
  const round64: BracketGameNode[] = pairings.map(([seedA, seedB], index) => {
    const round32GameId = `${slugify(region)}-r32-${Math.floor(index / 2) + 1}`;

    return {
      id: `${slugify(region)}-r64-${index + 1}`,
      region,
      round: "Round of 64" as BracketRound,
      order: index + 1,
      nextGameId: round32GameId,
      nextSlot: (index % 2 === 0 ? "teamA" : "teamB") as "teamA" | "teamB",
      participants: [
        {
          type: "team" as const,
          teamId: `${slugify(region)}-${slugify(regionFields[region as keyof typeof regionFields][seedA - 1])}`,
          seed: seedA,
        },
        {
          type: "team" as const,
          teamId: `${slugify(region)}-${slugify(regionFields[region as keyof typeof regionFields][seedB - 1])}`,
          seed: seedB,
        },
      ] as BracketGameNode["participants"],
    };
  });

  const round32: BracketGameNode[] = Array.from({ length: 4 }, (_, index) => {
    const sweet16GameId = `${slugify(region)}-s16-${Math.floor(index / 2) + 1}`;

    return {
      id: `${slugify(region)}-r32-${index + 1}`,
      region,
      round: "Round of 32" as BracketRound,
      order: index + 1,
      nextGameId: sweet16GameId,
      nextSlot: (index % 2 === 0 ? "teamA" : "teamB") as "teamA" | "teamB",
      participants: [
        { type: "winner" as const, sourceGameId: `${slugify(region)}-r64-${index * 2 + 1}` },
        { type: "winner" as const, sourceGameId: `${slugify(region)}-r64-${index * 2 + 2}` },
      ] as BracketGameNode["participants"],
    };
  });

  const sweet16: BracketGameNode[] = Array.from({ length: 2 }, (_, index) => ({
    id: `${slugify(region)}-s16-${index + 1}`,
    region,
    round: "Sweet 16" as BracketRound,
    order: index + 1,
    nextGameId: `${slugify(region)}-e8-1`,
    nextSlot: index === 0 ? "teamA" : "teamB",
    participants: [
      { type: "winner" as const, sourceGameId: `${slugify(region)}-r32-${index * 2 + 1}` },
      { type: "winner" as const, sourceGameId: `${slugify(region)}-r32-${index * 2 + 2}` },
    ] as BracketGameNode["participants"],
  }));

  const elite8: BracketGameNode[] = [
    {
      id: `${slugify(region)}-e8-1`,
      region,
      round: "Elite 8" as BracketRound,
      order: 1,
      nextGameId:
        region === "East" || region === "West" ? "final-four-1" : "final-four-2",
      nextSlot:
        region === "East" || region === "South" ? "teamA" : "teamB",
      participants: [
        { type: "winner" as const, sourceGameId: `${slugify(region)}-s16-1` },
        { type: "winner" as const, sourceGameId: `${slugify(region)}-s16-2` },
      ] as BracketGameNode["participants"],
    },
  ];

  return [...round64, ...round32, ...sweet16, ...elite8];
}

export const mockBracketTeams = buildTournamentTeams().map((team) => ({
  ...team,
  id: getRegionForTeam(team.name)
    ? `${slugify(getRegionForTeam(team.name) ?? "field")}-${slugify(team.name)}`
    : team.id,
}));

export const mockBracketGames: BracketGameNode[] = [
  ...createRegionGames("East"),
  ...createRegionGames("West"),
  ...createRegionGames("South"),
  ...createRegionGames("Midwest"),
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
];
