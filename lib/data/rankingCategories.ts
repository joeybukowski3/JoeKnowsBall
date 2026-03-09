import type { RankingCategoryConfig } from "@/lib/types";

export const rankingCategories: RankingCategoryConfig[] = [
  {
    key: "offense",
    label: "Offense",
    shortLabel: "Off",
    description: "Scoring efficiency and half-court creation.",
    direction: "higher",
  },
  {
    key: "defense",
    label: "Defense",
    shortLabel: "Def",
    description: "Points allowed and disruption rate.",
    direction: "lower",
  },
  {
    key: "shooting",
    label: "Shooting",
    shortLabel: "Shot",
    description: "Shot quality, spacing, and finishing.",
    direction: "higher",
  },
  {
    key: "rebounding",
    label: "Rebounding",
    shortLabel: "Reb",
    description: "Offensive and defensive glass control.",
    direction: "higher",
  },
  {
    key: "ballControl",
    label: "Ball Control",
    shortLabel: "Ball",
    description: "Turnover avoidance and decision-making.",
    direction: "lower",
  },
  {
    key: "sos",
    label: "SOS",
    shortLabel: "SOS",
    description: "Schedule strength and opponent quality.",
    direction: "higher",
  },
  {
    key: "recentForm",
    label: "Recent Form",
    shortLabel: "Form",
    description: "Performance over the last six games.",
    direction: "higher",
  },
  {
    key: "homeAway",
    label: "Home/Away",
    shortLabel: "Venue",
    description: "Travel resilience and road profile.",
    direction: "higher",
  },
  {
    key: "atsTrends",
    label: "ATS Trends",
    shortLabel: "ATS",
    description: "Mock against-the-spread trend rating.",
    direction: "higher",
  },
];
