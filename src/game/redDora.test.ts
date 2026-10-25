import { describe, expect, it } from "vitest";
import { baseProblems } from "./problems";
import { withRedFives } from "./redDora";
import { calculateScore, gradeAnswer } from "./scoring";
import { normalizeTile } from "./tiles";
import type { Problem, TileCode } from "./types";

const visible = (p: Problem) => [
  ...p.concealed, p.winningTile, ...p.melds.flatMap((m) => m.tiles), ...p.doraIndicators,
];
const hand = (id: string) => baseProblems.find((p) => p.id === `${id}-child`)!;

describe("one red five among four physical copies", () => {
  it.each(["m", "p", "s"] as const)("gives each visible %s five exactly one of four red slots without replacement", (suit) => {
    const five = `5${suit}` as TileCode;
    const red = `0${suit}` as TileCode;
    for (const copies of [1, 2, 3, 4]) {
      const p = baseProblems.find((p) => visible(p).filter((tile) => tile === five).length === copies)!;
      expect(p, `${suit}: ${copies} visible copies`).toBeDefined();
      const before = structuredClone(p);
      const variants = [0, 0.25, 0.5, 0.75].map((slot) => withRedFives(p, () => slot));
      expect(variants.filter((v) => visible(v).includes(red))).toHaveLength(copies);
      for (const v of variants) {
        expect(visible(v).filter((tile) => tile === red).length).toBeLessThanOrEqual(1);
        expect(visible(v).filter((tile) => tile === five).length).toBeLessThanOrEqual(3);
        expect(visible(v).map(normalizeTile)).toEqual(visible(p));
      }
      expect(p).toEqual(before);
    }
  });

  it("preserves the completed hand, winning occurrence, waits and fu in every curated variant", () => {
    for (const p of baseProblems) {
      for (const slot of [0, 0.25, 0.5, 0.75]) {
        const v = withRedFives(p, () => slot);
        expect(v.solution.groups.flat().sort(), p.id).toEqual([...v.concealed, v.winningTile].sort());
        expect(v.solution.groups[v.solution.winningGroup], p.id).toContain(v.winningTile);
        expect(v.solution.wait, p.id).toBe(p.solution.wait);
        expect(v.fu, p.id).toBe(p.fu);
        expect(v.fuDetails, p.id).toEqual(p.fuDetails);
        expect(v.patternNumber, p.id).toBe(p.patternNumber);
      }
    }
  });

  it("counts indicator dora and red dora together, promoting a four-han hand into intermediate practice", () => {
    const p = hand("chiitoitsu-two-dora-ron");
    const v = withRedFives(p, () => 0);
    expect(v.yaku).toContainEqual({ name: "ドラ", han: 2 });
    expect(v.yaku).toContainEqual({ name: "赤ドラ", han: 1 });
    expect(v.han).toBe(5);
    expect(v.level).toBe("intermediate");
    expect(v.fu).toBe(25);
    expect(calculateScore(v).payments).toEqual([{ label: "放銃者", points: 8000 }]);
    expect(gradeAnswer(v, [8000])).toBe(true);
    expect(gradeAnswer(v, [6400])).toBe(false);
    expect(v.baseExplanation).toBe(p.explanation);
  });

  it("adds all three colors but does not add an indicator's red to han", () => {
    const p = { ...hand("pinfu-ron"), doraIndicators: ["5m"] as TileCode[] };
    const v = withRedFives(p, () => 0);
    expect(v.doraIndicators).toEqual(["0m"]);
    expect(v.yaku).toContainEqual({ name: "赤ドラ", han: 1 });
    expect(v.han).toBe(p.han + 1);
    const draws = [0, 0.999];
    const indicatorOnly = withRedFives(p, () => draws.shift()!);
    expect(indicatorOnly.doraIndicators).toEqual(["0m"]);
    expect(indicatorOnly.han).toBe(p.han);
    expect(indicatorOnly.yaku).toEqual(p.yaku);
    const three: Problem = {
      ...p,
      concealed: ["3m", "4m", "5m", "3p", "4p", "5p", "3s", "4s", "6m", "7m", "8m", "2p", "2p"],
      winningTile: "5s", melds: [], doraIndicators: [], han: 4, fu: 30,
      yaku: [{ name: "三色同順", han: 2 }, { name: "断么九", han: 1 }, { name: "平和", han: 1 }],
      solution: {
        groups: [["3m", "4m", "5m"], ["3p", "4p", "5p"], ["3s", "4s", "5s"], ["6m", "7m", "8m"], ["2p", "2p"]],
        winningGroup: 2, wait: "両面",
      },
    };
    const allRed = withRedFives(three, () => 0);
    expect(allRed.yaku).toContainEqual({ name: "赤ドラ", han: 3 });
    expect(allRed.han).toBe(7);
    expect(calculateScore(allRed).payments[0].points).toBe(12000);
  });

  it("can make the winning tile red, including a five completing a triplet or a pair", () => {
    for (const p of baseProblems.filter((p) => /^5[mps]$/.test(p.winningTile))) {
      const same = p.concealed.filter((tile) => tile === p.winningTile).length;
      const v = withRedFives(p, () => same / 4);
      expect(v.winningTile, p.id).toBe(`0${p.winningTile[1]}`);
      expect(v.solution.groups[v.solution.winningGroup], p.id).toContain(v.winningTile);
    }
  });

  it("includes the compulsory red among four fives in open and concealed kans", () => {
    for (const id of ["sankantsu-mixed-kans-ninety-fu", "sanbaiman-open-chinitsu-kan-dora-seven"]) {
      const v = withRedFives(hand(id), () => 0.999);
      const kan = v.melds.find((m) => m.tiles.some((t) => t.startsWith("0")))!;
      expect(kan.kind).toBe("kan");
      expect(kan.tiles.filter((t) => t.startsWith("0"))).toHaveLength(1);
      expect(v.yaku).toContainEqual({ name: "赤ドラ", han: 1 });
    }
  });

  it("crosses the counted-yakuman boundary but never adds bonuses to an ordinary yakuman", () => {
    const counted = withRedFives(hand("sanbaiman-tanyao-ron"), () => 0);
    expect(counted.han).toBe(13);
    expect(calculateScore(counted).payments[0].points).toBe(32000);
    const alreadyCounted = withRedFives(hand("kazoe-tanyao-tsumo"), () => 0);
    expect(alreadyCounted.han).toBe(14);
    const ordinary = withRedFives(hand("beginner-daisangen-open-kan-concealed-dragon"), () => 0);
    expect(visible(ordinary)).toContain("0p");
    expect(ordinary.han).toBe(13);
    expect(ordinary.yaku).toEqual([{ name: "大三元（役満）", han: 13 }]);
  });

  it.each([NaN, -0.01, 1, Infinity])("rejects an invalid random draw %s", (value) => {
    expect(() => withRedFives(hand("pinfu-ron"), () => value)).toThrow(RangeError);
  });
});
