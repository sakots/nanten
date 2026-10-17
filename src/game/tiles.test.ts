import { describe, expect, it } from "vitest";
import { sortTiles } from "./tiles";
import type { TileCode } from "./types";

describe("automatic tile ordering", () => {
  it("orders suits numerically before winds and dragons without mutating the hand", () => {
    const hand: TileCode[] = ["red", "9s", "green", "north", "2m", "white", "9p", "east", "1s", "west", "1m", "south", "1p", "2m"];
    const original = [...hand];
    expect(sortTiles(hand)).toEqual(["1m", "2m", "2m", "1p", "9p", "1s", "9s", "east", "south", "west", "north", "white", "green", "red"]);
    expect(hand).toEqual(original);
  });
});
