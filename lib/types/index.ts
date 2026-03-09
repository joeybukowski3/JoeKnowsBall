export type TeamStats = {
  adjustedOffense: number;
  adjustedDefense: number;
  tempo: number;
  effectiveFieldGoalPct: number;
  turnoverRate: number;
  reboundRate: number;
  freeThrowRate: number;
};

export type RankingCategoryGroup =
  | "offense"
  | "defense"
  | "shooting"
  | "rebounding"
  | "ballControl"
  | "sos"
  | "recentForm"
  | "homeAway"
  | "atsTrends";

export type RankingMetrics = Record<RankingCategoryGroup, number>;

export type Team = {
  id: string;
  name: string;
  shortName: string;
  conference: string;
  record: string;
  rank: number;
  seed?: string;
  isTournamentTeam: boolean;
  logo?: string | null;
  stats: TeamStats;
  metrics: RankingMetrics;
};

export type Game = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeSeed?: string;
  awaySeed?: string;
  startTime: string;
  round: string;
  spread: number;
  moneylineHome: number;
  moneylineAway: number;
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

export type DataSource = "live" | "mock";

export type DataMeta = {
  source: DataSource;
  provider?: string;
  updatedAt?: string;
  fallbackReason?: string;
};

export type DataEnvelope<T> = {
  data: T;
  meta: DataMeta;
};

export type RankingPreset = {
  id: string;
  name: string;
  description: string;
  activeCategories: Record<RankingCategoryGroup, boolean>;
  weights: Record<RankingCategoryGroup, number>;
};

export type RankingCategoryConfig = {
  key: RankingCategoryGroup;
  label: string;
  shortLabel: string;
  description: string;
  direction: "higher" | "lower";
};

export type RankingSettings = {
  presetId: string;
  activeCategories: Record<RankingCategoryGroup, boolean>;
  weights: Record<RankingCategoryGroup, number>;
};

export type RankingCategoryScore = {
  raw: number;
  normalized: number;
  active: boolean;
  weight: number;
};

export type RankingResultRow = {
  rank: number;
  team: Team;
  overallScore: number;
  valueScore: number;
  valueLabel: "Strong" | "Watch" | "Neutral";
  categoryScores: Record<RankingCategoryGroup, RankingCategoryScore>;
};

export type MatchupMode = "upcoming" | "manual";

export type MatchupCategoryResult = {
  category: RankingCategoryGroup | "overall";
  label: string;
  teamAValue: number;
  teamBValue: number;
  teamANormalized: number;
  teamBNormalized: number;
  edge: "teamA" | "teamB" | "even";
  difference: number;
  active: boolean;
  weight: number;
};

export type MatchupSummary = {
  teamA: {
    team: Team;
    rank: number;
    overallScore: number;
    winProbability: number;
  };
  teamB: {
    team: Team;
    rank: number;
    overallScore: number;
    winProbability: number;
  };
  rows: MatchupCategoryResult[];
  scoreDifferential: number;
  modelSpread: number;
  marketSpread: number;
  edgeTeam: "teamA" | "teamB" | "even";
  valueIndicator: "Strong" | "Watch" | "Neutral";
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

export type BracketRound =
  | "Round of 64"
  | "Round of 32"
  | "Sweet 16"
  | "Elite 8"
  | "Final Four"
  | "Championship";

export type BracketMode = "manual" | "auto";

export type BracketParticipantSource = {
  type: "team" | "winner";
  teamId?: string;
  sourceGameId?: string;
  seed?: number;
};

export type BracketGameNode = {
  id: string;
  region: string;
  round: BracketRound;
  order: number;
  nextGameId: string | null;
  nextSlot: "teamA" | "teamB" | null;
  participants: [BracketParticipantSource, BracketParticipantSource];
};

export type ResolvedBracketParticipant = {
  team: Team | null;
  seed: number | null;
  modelScore: number | null;
  rank: number | null;
  winProbability: number | null;
};

export type ResolvedBracketGame = {
  id: string;
  region: string;
  round: BracketRound;
  order: number;
  nextGameId: string | null;
  nextSlot: "teamA" | "teamB" | null;
  teamA: ResolvedBracketParticipant;
  teamB: ResolvedBracketParticipant;
  winnerTeamId: string | null;
  upsetRisk: "Low" | "Medium" | "High" | "Toss-Up";
};

export type PathDifficultyRound = {
  round: BracketRound;
  expectedOpponentStrength: number;
};

export type PathDifficultyRow = {
  team: Team;
  baseModelScore: number;
  pathDifficulty: number;
  adjustedTournamentScore: number;
  rounds: PathDifficultyRound[];
};

export type TournamentSimulationRoundKey =
  | "roundOf32"
  | "sweet16"
  | "elite8"
  | "finalFour"
  | "championshipGame"
  | "champion";

export type TournamentSimulationRow = {
  team: Team;
  roundOf32: number;
  sweet16: number;
  elite8: number;
  finalFour: number;
  championshipGame: number;
  champion: number;
};

export type TournamentSimulationResult = {
  iterations: number;
  champion: Team | null;
  rows: TournamentSimulationRow[];
};

export type FuturesMarket = {
  id: string;
  team: string;
  book: string;
  titleOdds: number;
};

export type GameOddsLine = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  book: string;
  commenceTime: string;
  spread: number;
  moneylineHome: number;
  moneylineAway: number;
};

export type BettingValueTier = "Strong" | "Medium" | "Small" | "Pass";

export type GameValueRow = {
  game: Game;
  awayTeam: Team;
  homeTeam: Team;
  matchup: string;
  sportsbookSpread: number;
  modelSpread: number;
  spreadEdge: number;
  sportsbookMoneyline: number;
  modelWinProbability: number;
  impliedWinProbability: number;
  moneylineEdge: number;
  upsetRisk: ResolvedBracketGame["upsetRisk"];
  valueTier: BettingValueTier;
};

export type FuturesValueRow = {
  team: Team;
  rank: number;
  titleOdds: number;
  impliedTitleProbability: number;
  modelTitleProbability: number;
  futuresEdge: number;
  pathDifficulty: number;
  valueTier: BettingValueTier;
};
