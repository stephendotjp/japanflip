import type { ScoutItem } from "./types";

const KEY = "japanflip_user";

function readItems(): ScoutItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.scoutItems ?? [];
  } catch {
    return [];
  }
}

function writeItems(items: ScoutItem[]): void {
  let state: Record<string, unknown> = {};
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) state = JSON.parse(stored);
  } catch {}
  localStorage.setItem(KEY, JSON.stringify({ ...state, scoutItems: items }));
}

export function saveScoutItem(item: ScoutItem): void {
  const items = [item, ...readItems()];
  if (items.length <= 50) {
    writeItems(items);
    return;
  }
  const excess = items.length - 50;
  const resolvedSorted = items
    .filter((i) => i.resolved)
    .sort((a, b) => a.scoutedAt.localeCompare(b.scoutedAt));
  const dropIds = new Set(resolvedSorted.slice(0, excess).map((i) => i.id));
  let trimmed = items.filter((i) => !dropIds.has(i.id));
  if (trimmed.length > 50) {
    const unresolvedSorted = trimmed
      .filter((i) => !i.resolved)
      .sort((a, b) => a.scoutedAt.localeCompare(b.scoutedAt));
    const dropIds2 = new Set(
      unresolvedSorted.slice(0, trimmed.length - 50).map((i) => i.id)
    );
    trimmed = trimmed.filter((i) => !dropIds2.has(i.id));
  }
  writeItems(trimmed);
}

export function getScoutItems(): ScoutItem[] {
  return readItems();
}

export function updateScoutItem(id: string, patch: Partial<ScoutItem>): void {
  writeItems(readItems().map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export function deleteScoutItem(id: string): void {
  writeItems(readItems().filter((i) => i.id !== id));
}

export function clearResolvedScoutItems(): void {
  writeItems(readItems().filter((i) => !i.resolved));
}
