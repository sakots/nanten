import type { Problem, Score, Win } from "./types";

/** Four-player riichi, no kiriage, honba or deposits; counted yakuman is capped at one. */
export function calculateScore(input: {
  han: number;
  fu: number;
  dealer: boolean;
  win: Win;
}): Score {
  const { han, fu, dealer, win } = input;
  if (
    !Number.isSafeInteger(han) ||
    han < 1 ||
    !Number.isSafeInteger(fu) ||
    fu < 20 ||
    (fu !== 25 && fu % 2 !== 0) ||
    typeof dealer !== "boolean" ||
    (win !== "ron" && win !== "tsumo") ||
    (fu === 20 && (win !== "tsumo" || han < 2)) ||
    (fu === 25 && (han < 2 || (win === "tsumo" && han < 3)))
  ) {
    throw new RangeError("翻・符・和了方法の組み合わせが不正です。");
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
  } else if (han === 5 || roundedFu * 2 ** (han + 2) >= 2000) {
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
            points: Math.ceil((basePoints * (dealer ? 6 : 4)) / 100) * 100,
          },
        ]
      : dealer
        ? [
            {
              label: "子（各家）",
              points: Math.ceil((basePoints * 2) / 100) * 100,
            },
          ]
        : [
            { label: "子（各家）", points: Math.ceil(basePoints / 100) * 100 },
            { label: "親", points: Math.ceil((basePoints * 2) / 100) * 100 },
          ];
  const total =
    win === "ron"
      ? payments[0].points
      : dealer
        ? payments[0].points * 3
        : payments[0].points * 2 + payments[1].points;
  return { basePoints, limit, payments, total };
}

export function gradeAnswer(problem: Problem, answers: number[]): boolean {
  const { payments } = calculateScore(problem);
  return (
    answers.length === payments.length &&
    answers.every(
      (answer, index) =>
        Number.isSafeInteger(answer) &&
        answer > 0 &&
        answer === payments[index].points,
    )
  );
}
