import { PremiumLockPage } from "@/components/shared/PremiumLockPage";

export default function NFLPage() {
  return (
    <PremiumLockPage
      sport="NFL"
      tableTitle="Power ratings and spread value board"
      cardTitles={["Power Ratings", "Matchup Finder", "Injury Adjustments"]}
      trendTitle="Market movement and situational trend tracker"
    />
  );
}
