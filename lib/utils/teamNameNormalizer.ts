function toAsciiSafe(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeTeamName(rawName: string) {
  return toAsciiSafe(rawName)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bst[. ]/g, "saint ")
    .replace(/\buc\s+/g, "uc ")
    .replace(/['".,()/:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createTeamSlug(rawName: string) {
  return normalizeTeamName(rawName).replace(/[^a-z0-9]+/g, "-");
}
