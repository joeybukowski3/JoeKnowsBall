import { mockTeams } from "@/lib/data/mockTeams";
import { tournamentField } from "@/lib/data/tournamentField";
import { buildTournamentBracket, buildTournamentTeams } from "@/lib/utils/buildTournamentBracket";

export const mockBracketTeams = buildTournamentTeams(mockTeams, tournamentField);

export const mockBracketGames = buildTournamentBracket(tournamentField);
