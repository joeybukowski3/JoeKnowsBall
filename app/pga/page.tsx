import { PremiumLockPage } from "@/components/shared/PremiumLockPage";

export default function PGAPage() {
  return (
    <PremiumLockPage
      sport="PGA"
      tableTitle="Course-fit rankings and outright value"
      cardTitles={["Strokes Gained", "Course Fit", "Placement Value"]}
      trendTitle="Round-by-round form and weather split analysis"
    />
  );
}
