import { describe, expect, it } from "vitest";
import { normalizeTile, sortTiles } from "./tiles";
import type { TileCode } from "./types";

describe("automatic tile ordering", () => {
  it("orders suits numerically before winds and dragons without mutating the hand", () => {
    const hand: TileCode[] = ["red", "9s", "green", "north", "2m", "white", "9p", "east", "1s", "west", "1m", "south", "1p", "2m"];
    const original = [...hand];
    expect(sortTiles(hand)).toEqual(["1m", "2m", "2m", "1p", "9p", "1s", "9s", "east", "south", "west", "north", "white", "green", "red"]);
    expect(hand).toEqual(original);
  });

  it("orders red fives at five, before ordinary fives in every suit", () => {
    const hand: TileCode[] = ["6s", "5p", "0s", "4m", "5m", "0p", "6m", "4s", "0m", "4p", "5s", "6p", "5m"];
    const original = [...hand];
    expect(sortTiles(hand)).toEqual(["4m", "0m", "5m", "5m", "6m", "4p", "0p", "5p", "6p", "4s", "0s", "5s", "6s"]);
    expect(hand).toEqual(original);
  });

  it("normalizes red fives without changing ordinary fives or the red dragon", () => {
    expect(["0m", "0p", "0s", "5m", "red"].map((tile) => normalizeTile(tile as TileCode)))
      .toEqual(["5m", "5p", "5s", "5m", "red"]);
  });
});
