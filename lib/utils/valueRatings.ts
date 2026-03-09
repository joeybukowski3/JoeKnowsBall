import type { BettingValueTier } from "@/lib/types";

export function getValueTier(edge: number): BettingValueTier {
  const absoluteEdge = Math.abs(edge);

  if (absoluteEdge >= 0.055) {
    return "Strong";
  }

  if (absoluteEdge >= 0.03) {
    return "Medium";
  }

  if (absoluteEdge >= 0.015) {
    return "Small";
  }

  return "Pass";
}

export function getSpreadValueTier(edge: number): BettingValueTier {
  const absoluteEdge = Math.abs(edge);

  if (absoluteEdge >= 3.5) {
    return "Strong";
  }

  if (absoluteEdge >= 2) {
    return "Medium";
  }

  if (absoluteEdge >= 1) {
    return "Small";
  }

  return "Pass";
}
