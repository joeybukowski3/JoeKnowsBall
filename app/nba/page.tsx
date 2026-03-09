import { PremiumLockPage } from "@/components/shared/PremiumLockPage";

export default function NBAPage() {
  return (
    <PremiumLockPage
      sport="NBA"
      tableTitle="Team strength, pace, and price discovery"
      cardTitles={["Efficiency Board", "Rest Advantage", "Prop Models"]}
      trendTitle="Schedule spots and rotation-adjusted edges"
    />
  );
}
