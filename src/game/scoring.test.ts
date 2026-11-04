import { describe, expect, it } from "vitest";
import { calculateScore, gradeAnswer } from "./scoring";
import { problems } from "./problems";

const score = (
  han: number,
  fu: number,
  dealer = false,
  win: "ron" | "tsumo" = "ron",
  kiriage = false,
) => calculateScore({ han, fu, dealer, win }, kiriage);

describe("four-player score payments", () => {
  it.each([
    [1, 30, false, "ron", [1000], 1000],
    [1, 30, true, "ron", [1500], 1500],
    [2, 20, false, "tsumo", [400, 700], 1500],
    [2, 20, true, "tsumo", [700], 2100],
    [2, 25, false, "ron", [1600], 1600],
    [3, 25, false, "tsumo", [800, 1600], 3200],
    [1, 32, false, "ron", [1300], 1300],
    [5, 30, false, "tsumo", [2000, 4000], 8000],
    [5, 30, true, "tsumo", [4000], 12000],
  ] as const)("%ihan %ifu %s %s", (han, fu, dealer, win, payments, total) => {
    const result = score(han, fu, dealer, win);
    expect(result.payments.map((payment) => payment.points)).toEqual(payments);
    expect(result.total).toBe(total);
    expect(result.answers).toEqual(result.payments);
  });

  it.each([
    [1, 30, false, "ron", false, 2, 3, [1600], 4600, 240, null],
    [1, 30, true, "ron", false, 2, 3, [2100], 5100, 240, null],
    [2, 20, false, "tsumo", false, 2, 3, [600, 900], 5100, 320, null],
    [2, 20, true, "tsumo", false, 2, 3, [900], 5700, 320, null],
    [4, 30, false, "ron", false, 1, 0, [8000], 8000, 1920, null],
    [4, 30, false, "ron", true, 1, 2, [8300], 10300, 2000, "満貫"],
    [13, 30, true, "tsumo", true, 3, 1, [16300], 49900, 8000, "役満"],
  ] as const)(
    "settles %ihan %ifu dealer=%s %s kiriage=%s honba=%i deposits=%i",
    (han, fu, dealer, win, kiriage, honba, riichiSticks, payments, total, basePoints, limit) => {
      const result = calculateScore(
        { han, fu, dealer, win, honba, riichiSticks },
        kiriage,
      );
      expect(result.payments.map((payment) => payment.points)).toEqual(payments);
      expect(result.depositPoints).toBe(riichiSticks * 1000);
      expect(result.total).toBe(total);
      expect(result.basePoints).toBe(basePoints);
      expect(result.limit).toBe(limit);
    },
  );

  it.each(["honba", "riichiSticks"] as const)(
    "rejects invalid %s counts",
    (field) => {
      for (const count of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        expect(() =>
          calculateScore({ han: 1, fu: 30, dealer: false, win: "ron", [field]: count }),
        ).toThrow(RangeError);
      }
    },
  );

  it.each([
    [3, 70, 2000, "満貫"],
    [4, 40, 2000, "満貫"],
    [5, 30, 2000, "満貫"],
    [6, 30, 3000, "跳満"],
    [7, 30, 3000, "跳満"],
    [8, 30, 4000, "倍満"],
    [10, 30, 4000, "倍満"],
    [11, 30, 6000, "三倍満"],
    [12, 30, 6000, "三倍満"],
    [13, 30, 8000, "役満"],
    [26, 30, 8000, "役満"],
  ] as const)("caps %ihan %ifu at %i base points (%s)", (han, fu, base, limit) => {
    for (const kiriage of [false, true]) {
      const result = score(han, fu, false, "ron", kiriage);
      expect(result.basePoints).toBe(base);
      expect(result.limit).toBe(limit);
    }
  });

  describe.each([
    [4, 30],
    [3, 60],
    [4, 22],
    [3, 52],
  ])("kiriage boundary %ihan %ifu (rounded when necessary)", (han, fu) => {
    it.each([
      [false, "ron", [7700], 7700, [8000], 8000],
      [true, "ron", [11600], 11600, [12000], 12000],
      [false, "tsumo", [2000, 3900], 7900, [2000, 4000], 8000],
      [true, "tsumo", [3900], 11700, [4000], 12000],
    ] as const)(
      "scores dealer=%s %s with kiriage off and on",
      (dealer, win, offPayments, offTotal, onPayments, onTotal) => {
        for (const [kiriage, payments, total] of [
          [false, offPayments, offTotal],
          [true, onPayments, onTotal],
        ] as const) {
          const result = score(han, fu, dealer, win, kiriage);
          expect(result.payments.map((payment) => payment.points)).toEqual(payments);
          expect(result.total).toBe(total);
          expect(result.basePoints).toBe(kiriage ? 2000 : 1920);
          expect(result.limit).toBe(kiriage ? "満貫" : null);
        }
      },
    );
  });

  it.each([
    [4, 20, "tsumo", 1280, null],
    [4, 25, "ron", 1600, null],
    [3, 50, "ron", 1600, null],
    [3, 70, "ron", 2000, "満貫"],
    [3, 30, "ron", 960, null],
    [4, 40, "ron", 2000, "満貫"],
    [2, 60, "ron", 960, null],
    [5, 60, "ron", 2000, "満貫"],
  ] as const)("leaves adjacent %ihan %ifu %s unchanged", (han, fu, win, base, limit) => {
    for (const dealer of [false, true]) {
      const off = score(han, fu, dealer, win);
      expect(off.basePoints).toBe(base);
      expect(off.limit).toBe(limit);
      expect(score(han, fu, dealer, win, true)).toEqual(off);
    }
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

  it.each([
    [false, "ron", [1600, 3600]],
    [true, "ron", [2100, 4100]],
    [false, "tsumo", [600, 900, 4100]],
    [true, "tsumo", [900, 4700]],
  ] as const)(
    "requires every payment and the deposited total for dealer=%s %s",
    (dealer, win, expected) => {
      const problem = {
        ...problems[0],
        han: win === "ron" ? 1 : 2,
        fu: win === "ron" ? 30 : 20,
        dealer,
        win,
        honba: 2,
        riichiSticks: 2,
      };
      expect(gradeAnswer(problem, [...expected])).toBe(true);
      const wrongPayment: number[] = [...expected];
      wrongPayment[0] += 100;
      const wrongTotal: number[] = [...expected];
      wrongTotal[wrongTotal.length - 1] += 100;
      for (const invalid of [
        wrongPayment,
        wrongTotal,
        expected.slice(0, -1),
        [...expected, 100],
      ]) {
        expect(gradeAnswer(problem, invalid)).toBe(false);
      }
    },
  );
});
