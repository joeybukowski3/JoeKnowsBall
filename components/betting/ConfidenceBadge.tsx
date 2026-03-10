import { Badge } from "@/components/shared/Badge";
import type { BettingConfidenceTier } from "@/lib/types";

type ConfidenceBadgeProps = {
  tier: BettingConfidenceTier;
};

export function ConfidenceBadge({ tier }: ConfidenceBadgeProps) {
  const tone =
    tier === "High Confidence" ? "emerald" : tier === "Medium Confidence" ? "sky" : "amber";

  return <Badge tone={tone}>{tier}</Badge>;
}
