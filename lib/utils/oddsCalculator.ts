export function americanToImpliedProbability(price: number) {
  if (price > 0) {
    return 100 / (price + 100);
  }

  return Math.abs(price) / (Math.abs(price) + 100);
}

export function impliedProbabilityToAmerican(probability: number) {
  if (probability <= 0 || probability >= 1) {
    return 0;
  }

  if (probability >= 0.5) {
    return Math.round((-probability / (1 - probability)) * 100);
  }

  return Math.round(((1 - probability) / probability) * 100);
}

export function americanToDecimal(price: number) {
  if (price > 0) {
    return price / 100 + 1;
  }

  return 100 / Math.abs(price) + 1;
}

export function calculateEdge(modelProbability: number, impliedProbability: number) {
  return modelProbability - impliedProbability;
}

export function calculateModelSpread(scoreDifferential: number) {
  return Number((-scoreDifferential / 5).toFixed(1));
}

export function formatAmericanOdds(price: number) {
  return price > 0 ? `+${price}` : `${price}`;
}
