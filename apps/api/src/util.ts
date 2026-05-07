export const now = (): string => new Date().toISOString();

export function slugKey(input: string): string {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function sortByVersionDesc<T extends { version: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (b.version || 0) - (a.version || 0));
}
