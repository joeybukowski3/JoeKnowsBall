import { Badge } from "@/components/shared/Badge";
import type { BestBetValueTier } from "@/lib/types";

type ValueTierBadgeProps = {
  tier: BestBetValueTier;
};

export function ValueTierBadge({ tier }: ValueTierBadgeProps) {
  const tone =
    tier === "Elite Value"
      ? "emerald"
      : tier === "Strong Value"
        ? "sky"
        : tier === "Moderate Value"
          ? "amber"
          : "neutral";

  return <Badge tone={tone}>{tier}</Badge>;
}
