import type { RankingPreset } from "@/lib/types";

export const presets: RankingPreset[] = [
  {
    id: "balanced",
    name: "Balanced Model",
    description: "Even blend of efficiency, schedule, and form.",
    weights: {
      efficiency: 42,
      strengthOfSchedule: 28,
      recentForm: 30,
    },
  },
  {
    id: "tournament",
    name: "Tournament Lens",
    description: "Increases recency and shot-making stability for March.",
    weights: {
      efficiency: 38,
      strengthOfSchedule: 22,
      recentForm: 40,
    },
  },
  {
    id: "betting",
    name: "Betting Edge",
    description: "Leans into predictive efficiency and opponent adjustments.",
    weights: {
      efficiency: 50,
      strengthOfSchedule: 30,
      recentForm: 20,
    },
  },
];
