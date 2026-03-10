export type TeamStats = {
  adjustedOffense: number;
  adjustedDefense: number;
  tempo: number;
  effectiveFieldGoalPct: number;
  turnoverRate: number;
  reboundRate: number;
  freeThrowRate: number;
  freeThrowPct?: number | null;
  threePointPct?: number | null;
  opponentThreePointPct?: number | null;
  trueShootingPct?: number | null;
  strengthOfSchedule?: number | null;
  recentForm?: number | null;
  homeAwaySplit?: number | null;
  pace?: number | null;
};

export type TeamStatSource =
  | "ncaa-api"
  | "espn-stats"
  | "espn-bpi"
  | "torvik"
  | "fallback";

export type TeamStatCategoryAvailability = {
  live: boolean;
  source: TeamStatSource;
  fallbackUsed: boolean;
};

export type NormalizedTeamStats = {
  teamId: string;
  displayName: string;
  updatedAt: string;
  source: TeamStatSource[];
  sourceFields: string[];
  isLive: boolean;
  completeness: number;
  status: "live" | "partial-fallback" | "mock-fallback";
  availability: {
    offense: TeamStatCategoryAvailability;
    defense: TeamStatCategoryAvailability;
    shooting: TeamStatCategoryAvailability;
    rebounding: TeamStatCategoryAvailability;
    ballControl: TeamStatCategoryAvailability;
    freeThrowPct: TeamStatCategoryAvailability;
    threePointPct: TeamStatCategoryAvailability;
    opponentThreePointPct: TeamStatCategoryAvailability;
    trueShootingPct: TeamStatCategoryAvailability;
    strengthOfSchedule: TeamStatCategoryAvailability;
    recentForm: TeamStatCategoryAvailability;
    homeAway: TeamStatCategoryAvailability;
    pace: TeamStatCategoryAvailability;
  };
  values: {
    adjustedOffense: number | null;
    adjustedDefense: number | null;
    shooting: number | null;
    rebounding: number | null;
    ballControl: number | null;
    freeThrowPct: number | null;
    threePointPct: number | null;
    opponentThreePointPct: number | null;
    trueShootingPct: number | null;
    strengthOfSchedule: number | null;
    recentForm: number | null;
    homeAway: number | null;
    pace: number | null;
  };
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
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  logoLightUrl?: string | null;
  hasLiveLogo?: boolean;
  stats: TeamStats;
  metrics: RankingMetrics;
  statProfile?: NormalizedTeamStats;
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

export type TeamMatchConfidence = "exact" | "alias" | "derived" | "unresolved";

export type TeamMatchResult = {
  sourceName: string;
  canonicalId: string;
  canonicalName: string;
  confidence: TeamMatchConfidence;
  matchedTeam: Team | null;
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
export type BracketAutoFillMode = "all" | "remaining";
export type BracketLocksMap = Record<string, boolean>;
export type UpsetSeverity = "None" | "Mild Upset" | "Strong Upset" | "Major Upset";

export type BracketParticipantSource = {
  type: "team" | "winner";
  teamId?: string;
  sourceGameId?: string;
  seed?: number;
};

export type TournamentRegion = "East" | "West" | "South" | "Midwest";

export type TournamentFieldEntry = {
  teamId: string;
  displayName: string;
  seed: number;
  region: TournamentRegion;
  slot: number;
  playIn?: boolean;
  active?: boolean;
  locked?: boolean;
};

export type TournamentFieldValidation = {
  isValid: boolean;
  warnings: string[];
  duplicateTeamIds: string[];
  duplicateSlots: string[];
  invalidRegions: string[];
  missingSeedsByRegion: Record<TournamentRegion, number[]>;
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
  isLocked: boolean;
  upsetRisk: "Low" | "Medium" | "High" | "Toss-Up";
  upsetSeverity: UpsetSeverity;
  pickReason: {
    label: string;
    detail: string;
  } | null;
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

export type BracketSummaryData = {
  selectedPreset: string;
  champion: Team | null;
  runnerUp: Team | null;
  finalFour: Team[];
  upsetCount: number;
  biggestUpset: {
    gameId: string;
    label: string;
    severity: UpsetSeverity;
  } | null;
  strongestRegion: {
    region: TournamentRegion;
    score: number;
  } | null;
  weakestRegion: {
    region: TournamentRegion;
    score: number;
  } | null;
};

export type BracketPresetComparisonRow = {
  presetId: string;
  presetName: string;
  champion: Team | null;
  runnerUp: Team | null;
  finalFour: Team[];
  upsetCount: number;
  biggestUpset: string | null;
  differentChampion: boolean;
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
export type BestBetValueTier =
  | "Elite Value"
  | "Strong Value"
  | "Moderate Value"
  | "Pass";
export type BettingConfidenceTier =
  | "High Confidence"
  | "Medium Confidence"
  | "Volatile";
export type BetMarketType = "moneyline" | "spread" | "futures";

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

export type BestBetRow = {
  id: string;
  marketType: BetMarketType;
  matchup: string;
  selection: string;
  team: Team | null;
  opponent?: Team | null;
  startTime?: string;
  edge: number;
  modelProbability: number;
  impliedProbability: number;
  line: string;
  valueTier: BestBetValueTier;
  confidenceTier: BettingConfidenceTier;
  volatilityScore: number;
  reasons: string[];
  sourceGame?: GameValueRow;
  sourceFuture?: FuturesValueRow;
};

export type UpsetPredictionRow = {
  id: string;
  matchup: string;
  favorite: Team;
  underdog: Team;
  favoriteWinProbability: number;
  upsetProbability: number;
  upsetSeverity: "Watch" | "Live Dog" | "Danger Zone";
  confidenceTier: BettingConfidenceTier;
  reasons: string[];
  sourceGame: GameValueRow;
};
