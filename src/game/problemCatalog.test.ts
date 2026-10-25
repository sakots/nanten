import { describe, expect, it } from "vitest";
import { baseProblems, createSession, problems } from "./problems";
import { redFiveVariants } from "./redDora";
import type { Problem, TileCode } from "./types";

const visible = (p: Problem) => [
  ...p.concealed, p.winningTile, ...p.melds.flatMap((m) => m.tiles), ...p.doraIndicators,
];

// Red copies in the same concealed hand or meld are indistinguishable; winning tiles and indicators are not.
function arrangements(p: Problem): number {
  let result = 1;
  for (const five of ["5m", "5p", "5s"] as const) {
    const copies = visible(p).filter((tile) => tile === five).length;
    const locations = Number(p.concealed.includes(five)) + Number(p.winningTile === five)
      + p.melds.filter((meld) => meld.tiles.includes(five)).length
      + p.doraIndicators.filter((tile) => tile === five).length;
    result *= locations + Number(copies < 4);
  }
  return result;
}

const appearance = (p: Problem) => JSON.stringify([
  p.concealed, p.winningTile, p.melds, p.doraIndicators,
]);

describe("numbered red-five question catalog", () => {
  it("numbers every physically possible visible arrangement exactly once per seat", () => {
    let expected = 0;
    for (const base of baseProblems.filter((p) => !p.dealer)) {
      const children = problems.filter((p) => p.id === base.id || p.id.startsWith(`${base.id}-red-`));
      expect(children, base.id).toHaveLength(arrangements(base));
      expect(new Set(children.map(appearance)).size, base.id).toBe(children.length);
      expected += arrangements(base);
    }
    const numbers = [...new Set(problems.map((p) => p.patternNumber))].sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: expected }, (_, index) => index + 1));
    expect(problems).toHaveLength(expected * 2);
    for (const patternNumber of numbers) {
      const pair = problems.filter((p) => p.patternNumber === patternNumber);
      expect(pair.map((p) => p.dealer)).toEqual([false, true]);
      expect(appearance(pair[0])).toBe(appearance(pair[1]));
      expect(pair[0].han).toBe(pair[1].han);
    }
  });

  it("excludes impossible four-normal-five hands from the numbered catalog", () => {
    for (const p of problems) {
      for (const suit of ["m", "p", "s"]) {
        const tiles = visible(p);
        expect(tiles.filter((tile) => tile === `0${suit}`).length, p.id).toBeLessThanOrEqual(1);
        expect(tiles.filter((tile) => tile === `5${suit}`).length, p.id).toBeLessThanOrEqual(3);
      }
    }
  });

  it("gives hand-red and indicator-red versions different numbers while retaining the non-red base number", () => {
    const base = baseProblems.find((p) => p.id === "numeric-beginner-honitsu-six-pin-dora-child")!;
    const variants = problems.filter((p) => p.id === base.id || p.id.startsWith(`${base.id}-red-`));
    const noRed = variants.find((p) => visible(p).every((tile) => tile[0] !== "0"))!;
    const redIndicator = variants.find((p) => p.doraIndicators.includes("0p"))!;
    const redHand = variants.find((p) => p.concealed.includes("0p"))!;
    expect(new Set([noRed.patternNumber, redIndicator.patternNumber, redHand.patternNumber]).size).toBe(3);
    expect(redIndicator.han).toBe(noRed.han);
    expect(redHand.han).toBe(noRed.han + 1);
    expect(noRed.patternNumber).toBe(base.patternNumber);
  });

  it("keeps physical-copy probability rather than sampling visible variants uniformly", () => {
    const base = baseProblems.find((p) => p.id === "pinfu-ron-child")!;
    const variants = redFiveVariants(base);
    expect(variants.map((v) => [visible(v.problem).includes("0p"), v.weight])).toEqual([[false, 1], [true, 3]]);
    for (const p of baseProblems) {
      const variants = redFiveVariants(p);
      const total = variants.reduce((sum, v) => sum + v.weight, 0);
      for (const five of ["5m", "5p", "5s"] as const) {
        const copies = visible(p).filter((tile) => tile === five).length;
        const red = `0${five[1]}` as TileCode;
        const weight = variants.filter((v) => visible(v.problem).includes(red)).reduce((sum, v) => sum + v.weight, 0);
        expect(weight / total, `${p.id}, ${five}`).toBe(copies / 4);
      }
    }
  });

  it("returns catalog entries with stable numbers across difficulty and practice runs", () => {
    for (const level of ["all", "basic", "intermediate", "advanced"] as const) {
      for (let seed = 1; seed <= 30; seed++) {
        let state = seed;
        const session = createSession(level, () => {
          state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
          return state / 2 ** 32;
        });
        expect(session).toHaveLength(10);
        for (const p of session) {
          expect(problems).toContain(p);
          expect(level === "all" || p.level === level).toBe(true);
        }
      }
    }
  });
});
