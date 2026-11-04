import type { Problem, Score, Win } from "./types";

/** Four-player riichi settlement; counted yakuman is capped at one. */
export function calculateScore(
  input: {
    han: number;
    fu: number;
    dealer: boolean;
    win: Win;
    honba?: number;
    riichiSticks?: number;
  },
  kiriage = false,
): Score {
  const { han, fu, dealer, win, honba = 0, riichiSticks = 0 } = input;
  if (
    !Number.isSafeInteger(han) ||
    han < 1 ||
    !Number.isSafeInteger(fu) ||
    fu < 20 ||
    (fu !== 25 && fu % 2 !== 0) ||
    !Number.isSafeInteger(honba) ||
    honba < 0 ||
    !Number.isSafeInteger(riichiSticks) ||
    riichiSticks < 0 ||
    typeof dealer !== "boolean" ||
    (win !== "ron" && win !== "tsumo") ||
    (fu === 20 && (win !== "tsumo" || han < 2)) ||
    (fu === 25 && (han < 2 || (win === "tsumo" && han < 3)))
  ) {
    throw new RangeError("翻・符・和了方法・本場・供託の組み合わせが不正です。");
  }
  // Accept the pre-rounded fu sum as well as an already-rounded value. Chiitoitsu stays 25.
  const roundedFu = fu === 25 ? 25 : Math.ceil(fu / 10) * 10;
  let basePoints: number;
  let limit: string | null;
  if (han >= 13) {
    basePoints = 8000;
    limit = "役満";
  } else if (han >= 11) {
    basePoints = 6000;
    limit = "三倍満";
  } else if (han >= 8) {
    basePoints = 4000;
    limit = "倍満";
  } else if (han >= 6) {
    basePoints = 3000;
    limit = "跳満";
  } else if (
    han === 5 ||
    roundedFu * 2 ** (han + 2) >= 2000 ||
    (kiriage &&
      ((han === 4 && roundedFu === 30) || (han === 3 && roundedFu === 60)))
  ) {
    basePoints = 2000;
    limit = "満貫";
  } else {
    basePoints = roundedFu * 2 ** (han + 2);
    limit = null;
  }

  const payments: Score["payments"] =
    win === "ron"
      ? [
          {
            label: "放銃者",
            points: Math.ceil((basePoints * (dealer ? 6 : 4)) / 100) * 100 + honba * 300,
          },
        ]
      : dealer
        ? [
            {
              label: "子（各家）",
              points: Math.ceil((basePoints * 2) / 100) * 100 + honba * 100,
            },
          ]
        : [
            { label: "子（各家）", points: Math.ceil(basePoints / 100) * 100 + honba * 100 },
            { label: "親", points: Math.ceil((basePoints * 2) / 100) * 100 + honba * 100 },
          ];
  const depositPoints = riichiSticks * 1000;
  const total =
    (win === "ron"
      ? payments[0].points
      : dealer
        ? payments[0].points * 3
        : payments[0].points * 2 + payments[1].points) + depositPoints;
  const answers =
    riichiSticks > 0
      ? [...payments, { label: "受取合計（供託込み）", points: total }]
      : payments;
  return { basePoints, limit, payments, depositPoints, total, answers };
}

export function gradeAnswer(
  problem: Problem,
  answers: number[],
  kiriage = false,
): boolean {
  const expected = calculateScore(problem, kiriage).answers;
  return (
    answers.length === expected.length &&
    answers.every(
      (answer, index) =>
        Number.isSafeInteger(answer) &&
        answer > 0 &&
        answer === expected[index].points,
    )
  );
}
