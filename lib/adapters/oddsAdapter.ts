import type { GameOddsLine, Odds, Team } from "@/lib/types";
import { americanToImpliedProbability } from "@/lib/utils/oddsCalculator";
import { matchTeamName } from "@/lib/utils/teamMatcher";

type GenericRecord = Record<string, unknown>;

const BOOK_PRIORITY = ["DraftKings", "FanDuel", "BetMGM", "Caesars", "Pinnacle"];
const unresolvedOddsTeams = new Set<string>();

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function parseString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getBookName(entry: GenericRecord) {
  return parseString(entry.title) ?? parseString(entry.key) ?? parseString(entry.name) ?? "Market";
}

function extractMarkets(entry: GenericRecord) {
  const markets = entry.markets;
  return Array.isArray(markets)
    ? markets.filter((market): market is GenericRecord => Boolean(market && typeof market === "object"))
    : [];
}

function extractOutcomes(entry: GenericRecord) {
  const outcomes = entry.outcomes;
  return Array.isArray(outcomes)
    ? outcomes.filter((outcome): outcome is GenericRecord => Boolean(outcome && typeof outcome === "object"))
    : [];
}

function pickBookmaker(event: GenericRecord) {
  const bookmakers = Array.isArray(event.bookmakers)
    ? event.bookmakers.filter((book): book is GenericRecord => Boolean(book && typeof book === "object"))
    : [];

  return bookmakers.sort((left, right) => {
    const leftRank = BOOK_PRIORITY.indexOf(getBookName(left));
    const rightRank = BOOK_PRIORITY.indexOf(getBookName(right));
    return (leftRank === -1 ? 999 : leftRank) - (rightRank === -1 ? 999 : rightRank);
  })[0] ?? null;
}

function getMarket(bookmaker: GenericRecord, key: string) {
  return extractMarkets(bookmaker).find((market) => parseString(market.key) === key) ?? null;
}

function logUnresolvedOddsTeam(rawName: string) {
  if (process.env.NODE_ENV === "production" || !rawName.trim()) {
    return;
  }

  if (unresolvedOddsTeams.has(rawName)) {
    return;
  }

  unresolvedOddsTeams.add(rawName);
  console.warn(`[oddsAdapter] unresolved odds team: ${rawName}`);
}

export function adaptOddsToGameLines(payload: unknown, teams: Team[] = []) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .filter((entry): entry is GenericRecord => Boolean(entry && typeof entry === "object"))
    .map<GameOddsLine | null>((event, index) => {
      const homeMatch = matchTeamName(parseString(event.home_team) ?? "", teams, "odds-home");
      const awayMatch = matchTeamName(parseString(event.away_team) ?? "", teams, "odds-away");
      const bookmaker = pickBookmaker(event);

      if (!homeMatch.matchedTeam) {
        logUnresolvedOddsTeam(parseString(event.home_team) ?? "");
      }

      if (!awayMatch.matchedTeam) {
        logUnresolvedOddsTeam(parseString(event.away_team) ?? "");
      }

      if (!homeMatch.canonicalName || !awayMatch.canonicalName || !bookmaker) {
        return null;
      }

      const book = getBookName(bookmaker);
      const h2hMarket = getMarket(bookmaker, "h2h");
      const spreadMarket = getMarket(bookmaker, "spreads");
      const h2hOutcomes = h2hMarket ? extractOutcomes(h2hMarket) : [];
      const spreadOutcomes = spreadMarket ? extractOutcomes(spreadMarket) : [];

      const homeMoneyline =
        parseNumber(
          h2hOutcomes.find(
            (outcome) =>
              matchTeamName(parseString(outcome.name) ?? "", teams, "odds-h2h").canonicalId ===
              homeMatch.canonicalId,
          )?.price,
        ) ?? -110;
      const awayMoneyline =
        parseNumber(
          h2hOutcomes.find(
            (outcome) =>
              matchTeamName(parseString(outcome.name) ?? "", teams, "odds-h2h").canonicalId ===
              awayMatch.canonicalId,
          )?.price,
        ) ?? -110;
      const homeSpread =
        parseNumber(
          spreadOutcomes.find(
            (outcome) =>
              matchTeamName(parseString(outcome.name) ?? "", teams, "odds-spread").canonicalId ===
              homeMatch.canonicalId,
          )?.point,
        ) ?? 0;

      return {
        id: parseString(event.id) ?? `odds-game-${index + 1}`,
        homeTeam: homeMatch.matchedTeam?.name ?? homeMatch.canonicalName,
        awayTeam: awayMatch.matchedTeam?.name ?? awayMatch.canonicalName,
        book,
        commenceTime: parseString(event.commence_time) ?? new Date().toISOString(),
        spread: homeSpread,
        moneylineHome: homeMoneyline,
        moneylineAway: awayMoneyline,
      };
    })
    .filter((line): line is GameOddsLine => Boolean(line));
}

export function adaptOddsToTeamOdds(lines: GameOddsLine[]) {
  const oddsRows: Odds[] = [];

  for (const line of lines) {
    oddsRows.push({
      id: `${line.id}-home`,
      team: line.homeTeam,
      market: "Moneyline",
      book: line.book,
      price: line.moneylineHome,
      impliedProbability: americanToImpliedProbability(line.moneylineHome),
      modelProbability: americanToImpliedProbability(line.moneylineHome),
    });
    oddsRows.push({
      id: `${line.id}-away`,
      team: line.awayTeam,
      market: "Moneyline",
      book: line.book,
      price: line.moneylineAway,
      impliedProbability: americanToImpliedProbability(line.moneylineAway),
      modelProbability: americanToImpliedProbability(line.moneylineAway),
    });
  }

  return oddsRows;
}
