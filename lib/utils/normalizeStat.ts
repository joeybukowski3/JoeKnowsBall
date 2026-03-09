type NormalizeStatOptions = {
  inverse?: boolean;
  scale?: number;
};

export function normalizeStat(
  value: number,
  min: number,
  max: number,
  options: NormalizeStatOptions = {},
) {
  const { inverse = false, scale = 100 } = options;

  if (max === min) {
    return scale;
  }

  const normalized = (value - min) / (max - min);
  const adjusted = inverse ? 1 - normalized : normalized;

  return adjusted * scale;
}
