import type {
  BestBetValueTier,
  BettingConfidenceTier,
  BettingValueTier,
} from "@/lib/types";

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

export function getBestBetValueTier(edge: number): BestBetValueTier {
  const absoluteEdge = Math.abs(edge);

  if (absoluteEdge >= 0.09) {
    return "Elite Value";
  }

  if (absoluteEdge >= 0.055) {
    return "Strong Value";
  }

  if (absoluteEdge >= 0.025) {
    return "Moderate Value";
  }

  return "Pass";
}

export function getSpreadBestBetValueTier(edge: number): BestBetValueTier {
  const absoluteEdge = Math.abs(edge);

  if (absoluteEdge >= 5) {
    return "Elite Value";
  }

  if (absoluteEdge >= 3.25) {
    return "Strong Value";
  }

  if (absoluteEdge >= 1.5) {
    return "Moderate Value";
  }

  return "Pass";
}

export function getConfidenceTier({
  probability,
  edge,
  volatility,
}: {
  probability: number;
  edge: number;
  volatility: number;
}): BettingConfidenceTier {
  if (probability >= 0.66 && Math.abs(edge) >= 0.05 && volatility <= 0.33) {
    return "High Confidence";
  }

  if (probability >= 0.55 && volatility <= 0.48) {
    return "Medium Confidence";
  }

  return "Volatile";
}
