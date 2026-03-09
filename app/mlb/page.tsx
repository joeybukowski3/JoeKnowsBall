import { PremiumLockPage } from "@/components/shared/PremiumLockPage";

export default function MLBPage() {
  return (
    <PremiumLockPage
      sport="MLB"
      tableTitle="Pitching-adjusted power ratings"
      cardTitles={["Starting Pitchers", "Bullpen Form", "Park Factors"]}
      trendTitle="Totals, sides, and travel spot dashboard"
    />
  );
}
