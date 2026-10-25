import { describe, expect, it } from "vitest";
import { calculateScore, gradeAnswer } from "./scoring";
import { problems } from "./problems";

const score = (
  han: number,
  fu: number,
  dealer = false,
  win: "ron" | "tsumo" = "ron",
) => calculateScore({ han, fu, dealer, win });

describe("four-player score payments", () => {
  it.each([
    [1, 30, false, "ron", [1000], 1000],
    [1, 30, true, "ron", [1500], 1500],
    [2, 20, false, "tsumo", [400, 700], 1500],
    [2, 20, true, "tsumo", [700], 2100],
    [2, 25, false, "ron", [1600], 1600],
    [3, 25, false, "tsumo", [800, 1600], 3200],
    [3, 60, false, "ron", [7700], 7700],
    [4, 30, true, "ron", [11600], 11600],
    [1, 32, false, "ron", [1300], 1300],
    [5, 30, false, "tsumo", [2000, 4000], 8000],
    [5, 30, true, "tsumo", [4000], 12000],
  ] as const)("%ihan %ifu %s %s", (han, fu, dealer, win, payments, total) => {
    const result = score(han, fu, dealer, win);
    expect(result.payments.map((payment) => payment.points)).toEqual(payments);
    expect(result.total).toBe(total);
  });

  it.each([
    [3, 70, 2000],
    [4, 40, 2000],
    [5, 30, 2000],
    [6, 30, 3000],
    [7, 30, 3000],
    [8, 30, 4000],
    [10, 30, 4000],
    [11, 30, 6000],
    [12, 30, 6000],
    [13, 30, 8000],
    [26, 30, 8000],
  ])("caps %ihan %ifu at %i base points", (han, fu, base) => {
    expect(score(han, fu).basePoints).toBe(base);
    expect(score(han, fu).limit).not.toBeNull();
  });

  it("does not use kiriage mangan", () => {
    expect(score(3, 60).basePoints).toBe(1920);
    expect(score(4, 30).limit).toBeNull();
  });

  it.each([
    [0, 30],
    [-1, 30],
    [1.5, 30],
    [NaN, 30],
    [Infinity, 30],
    [1, 0],
    [1, 19],
    [1, 25],
    [1, 20],
    [2, 20],
    [2, 21],
    [2, 27],
    [2, 30.5],
    [2, NaN],
    [2, Infinity],
  ])("rejects impossible ron arguments %i %i", (han, fu) => {
    expect(() => score(han, fu)).toThrow();
  });

  it("rejects chiitoitsu tsumo without its mandatory tsumo han", () => {
    expect(() => score(2, 25, false, "tsumo")).toThrow();
  });
});

describe("answer grading", () => {
  it("requires exactly the ordered, finite, positive integer payments", () => {
    const ron = problems.find((problem) => problem.id === "pinfu-ron-child")!;
    const tsumo = problems.find(
      (problem) => problem.id === "pinfu-tsumo-child",
    )!;
    expect(gradeAnswer(ron, [2000])).toBe(true);
    expect(gradeAnswer(tsumo, [700, 1300])).toBe(true);
    for (const invalid of [
      [],
      [700],
      [700, 1300, 100],
      [1300, 700],
      [NaN, 1300],
      [Infinity, 1300],
      [0, 1300],
      [-700, 1300],
      [700.5, 1300],
    ]) {
      expect(gradeAnswer(tsumo, invalid)).toBe(false);
    }
    expect(gradeAnswer(ron, [1300])).toBe(false);
  });
});
