import type { Problem, TileCode } from "./types";
import { sortTiles } from "./tiles";

/** Sample the one red physical copy of each suit, including copies used as indicators. */
export function withRedFives(problem: Problem, random: () => number): Problem {
  const visible = [
    ...problem.concealed, problem.winningTile,
    ...problem.melds.flatMap((meld) => meld.tiles), ...problem.doraIndicators,
  ];
  const redSlots = new Map<TileCode, number>();
  for (const five of ["5m", "5p", "5s"] as const) {
    if (!visible.includes(five)) continue;
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1)
      throw new RangeError("乱数は0以上1未満で指定してください。");
    redSlots.set(five, Math.floor(value * 4));
  }
  if (redSlots.size === 0) return problem;

  const occurrences = new Map<TileCode, number>();
  let changed = false;
  const convert = (tile: TileCode): TileCode => {
    if (!redSlots.has(tile)) return tile;
    const index = occurrences.get(tile) ?? 0;
    occurrences.set(tile, index + 1);
    if (index !== redSlots.get(tile)) return tile;
    changed = true;
    return `0${tile[1]}` as TileCode;
  };
  const concealed = sortTiles(problem.concealed.map(convert));
  const winningTile = convert(problem.winningTile);
  const melds = problem.melds.map((meld) => ({ ...meld, tiles: meld.tiles.map(convert) }));
  const doraIndicators = problem.doraIndicators.map(convert);
  if (!changed) return problem;

  // Copies inside the concealed hand are interchangeable, but the winning physical copy is not.
  const remainingRed = new Map<TileCode, number>();
  for (const tile of concealed) {
    if (tile[0] === "0") remainingRed.set(tile, (remainingRed.get(tile) ?? 0) + 1);
  }
  const winningGroup = problem.solution.winningGroup;
  const winningIndex = problem.solution.groups[winningGroup].lastIndexOf(problem.winningTile);
  const groups = problem.solution.groups.map((group, groupIndex) => group.map((tile, index) => {
    if (groupIndex === winningGroup && index === winningIndex) return winningTile;
    const red = `0${tile[1]}` as TileCode;
    if (tile[0] === "5" && (remainingRed.get(red) ?? 0) > 0) {
      remainingRed.set(red, remainingRed.get(red)! - 1);
      return red;
    }
    return tile;
  }));
  const redTiles = [...concealed, winningTile, ...melds.flatMap((meld) => meld.tiles)]
    .filter((tile) => tile[0] === "0");
  const yakuman = problem.yaku.some((yaku) => yaku.name.includes("（役満）"));
  const han = problem.han + (yakuman ? 0 : redTiles.length);
  const redNames = redTiles.map((tile) => `赤五${tile[1] === "m" ? "萬" : tile[1] === "p" ? "筒" : "索"}`);
  const redExplanation = redTiles.length === 0
    ? "赤五のドラ表示牌は通常の五と同じく六をドラにします。表示牌そのものの赤は翻に加えません。"
    : yakuman
      ? `${redNames.join("・")}を含みますが、通常の役満には赤ドラを加算しません。元の役満の点数で計算します。`
      : `${redNames.join("・")}の${redTiles.length}枚を赤ドラ${redTiles.length}翻として加算します。表示牌によるドラとは別に数え、赤ドラ加算前の${problem.han}翻から、今回は${han}翻になります。赤五は通常の五と同じ面子を作るため、待ちと符は変わらず${problem.fu}符です。今回の支払いはこの合計翻数で計算します。`;
  const indicatorExplanation = doraIndicators.some((tile) => tile[0] === "0") && redTiles.length > 0
    ? "赤五の表示牌は六をドラにし、表示牌自身の赤は加算しません。"
    : "";
  return {
    ...problem,
    concealed, winningTile, melds, doraIndicators,
    solution: { ...problem.solution, groups },
    han,
    level: problem.level === "advanced" && han >= 5 ? "intermediate" : problem.level,
    title: redTiles.length > 0 && !yakuman
      ? `赤ドラ${redTiles.length}枚を含む${problem.yaku.filter((yaku) => yaku.name !== "ドラ").map((yaku) => yaku.name).join("・")}`
      : problem.title,
    yaku: redTiles.length > 0 && !yakuman
      ? [...problem.yaku, { name: "赤ドラ", han: redTiles.length }]
      : problem.yaku,
    baseExplanation: problem.explanation,
    explanation: redExplanation + indicatorExplanation,
  };
}

/** Enumerate distinct visible questions, retaining the physical-copy probability as a weight. */
export function redFiveVariants(problem: Problem): { problem: Problem; weight: number }[] {
  const visible = [
    ...problem.concealed, problem.winningTile,
    ...problem.melds.flatMap((meld) => meld.tiles), ...problem.doraIndicators,
  ];
  const suits = ["5m", "5p", "5s"].filter((five) => visible.includes(five as TileCode)).length;
  const variants = new Map<string, { problem: Problem; weight: number }>();
  const slots: number[] = [];
  const enumerate = () => {
    if (slots.length < suits) {
      // Prefer no visible red for the original number; four visible copies necessarily include red.
      for (let slot = 3; slot >= 0; slot--) {
        slots.push(slot / 4);
        enumerate();
        slots.pop();
      }
      return;
    }
    let index = 0;
    const sampled = withRedFives(problem, () => slots[index++]);
    const melds = sampled.melds.map((meld) => ({ ...meld, tiles: sortTiles(meld.tiles) }));
    const key = JSON.stringify([
      sampled.concealed, sampled.winningTile, melds, sampled.doraIndicators,
    ]);
    const existing = variants.get(key);
    if (existing) existing.weight++;
    else variants.set(key, { problem: { ...sampled, melds }, weight: 1 });
  };
  enumerate();
  return [...variants.values()];
}
