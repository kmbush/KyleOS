// Spotlight's filter: a case-insensitive substring match over each item's label
// and kind, order preserved. Matches the prototype's behavior exactly.

export interface SearchItem {
  label: string;
  kind: string;
}

export function filterSearch<T extends SearchItem>(items: T[], query: string): T[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;
  return items.filter((it) => `${it.label} ${it.kind}`.toLowerCase().includes(q));
}
