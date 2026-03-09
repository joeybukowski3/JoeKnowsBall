export type TeamStats = {
  adjustedOffense: number;
  adjustedDefense: number;
  tempo: number;
  effectiveFieldGoalPct: number;
  turnoverRate: number;
  reboundRate: number;
  freeThrowRate: number;
};

export type Team = {
  id: string;
  name: string;
  shortName: string;
  conference: string;
  record: string;
  rank: number;
  seed?: string;
  stats: TeamStats;
};

export type Game = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeSeed?: string;
  awaySeed?: string;
  tipoff: string;
  round: string;
  neutralSite: boolean;
};

export type Odds = {
  id: string;
  team: string;
  market: string;
  book: string;
  price: number;
  impliedProbability: number;
  modelProbability: number;
};

export type RankingPreset = {
  id: string;
  name: string;
  description: string;
  weights: {
    efficiency: number;
    strengthOfSchedule: number;
    recentForm: number;
  };
};

export type BracketMatchup = {
  id: string;
  region: string;
  round: string;
  topTeam: string;
  bottomTeam: string;
  upsetRisk: number;
  pathDifficulty: number;
};
