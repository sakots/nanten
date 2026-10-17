import type { TileCode } from "./types";

const honorOrder: Record<string, number> = {
  east: 27, south: 28, west: 29, north: 30, white: 31, green: 32, red: 33,
};
const suitOrder: Record<string, number> = { m: 0, p: 9, s: 18 };

function rank(tile: TileCode): number {
  return honorOrder[tile] ?? suitOrder[tile[1]] + Number(tile[0]) - 1;
}

export function sortTiles(tiles: readonly TileCode[]): TileCode[] {
  return [...tiles].sort((a, b) => rank(a) - rank(b));
}
