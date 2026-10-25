import type { TileCode } from "./types";

const honorOrder: Record<string, number> = {
  east: 27, south: 28, west: 29, north: 30, white: 31, green: 32, red: 33,
};
const suitOrder: Record<string, number> = { m: 0, p: 9, s: 18 };

export function normalizeTile(tile: TileCode): TileCode {
  if (tile === "0m") return "5m";
  if (tile === "0p") return "5p";
  if (tile === "0s") return "5s";
  return tile;
}

function rank(tile: TileCode): number {
  const normalized = normalizeTile(tile);
  return honorOrder[normalized] ?? suitOrder[normalized[1]] + Number(normalized[0]) - 1;
}

export function sortTiles(tiles: readonly TileCode[]): TileCode[] {
  return [...tiles].sort((a, b) => rank(a) - rank(b) || Number(b[0] === "0") - Number(a[0] === "0"));
}
