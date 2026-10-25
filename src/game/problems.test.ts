import { describe, expect, it } from "vitest";
import { createSession, problems } from "./problems";
import { calculateScore, gradeAnswer } from "./scoring";
import type { Problem, TileCode } from "./types";
import { normalizeTile } from "./tiles";

const honors: TileCode[] = [
  "east",
  "south",
  "west",
  "north",
  "white",
  "green",
  "red",
];
const windCodes = { 東: "east", 南: "south", 西: "west", 北: "north" } as const;
const terminal = (tile: TileCode) =>
  honors.includes(tile) || /^[19]/.test(tile);
const number = (tile: TileCode) => Number(normalizeTile(tile)[0]);
const count = (tiles: TileCode[], tile: TileCode) =>
  tiles.filter((value) => normalizeTile(value) === normalizeTile(tile)).length;
const allTiles = (p: Problem) => [
  ...p.concealed,
  p.winningTile,
  ...p.melds.flatMap((m) => m.tiles),
];
function dora(indicator: TileCode): TileCode {
  if (!honors.includes(indicator))
    return `${(number(indicator) % 9) + 1}${indicator[1]}` as TileCode;
  const cycle: TileCode[] =
    honors.indexOf(indicator) < 4 ? honors.slice(0, 4) : honors.slice(4);
  return cycle[(cycle.indexOf(indicator) + 1) % cycle.length];
}

type Group = {
  tiles: TileCode[];
  open: boolean;
  sequence: boolean;
  kan: boolean;
};
type Partition = { groups: Group[]; pair: TileCode };
function partitions(tiles: TileCode[], groups: Group[] = []): Partition[] {
  if (tiles.length === 2 && tiles[0] === tiles[1])
    return [{ groups, pair: tiles[0] }];
  const results: Partition[] = [];
  for (const tile of new Set(tiles)) {
    const remove = (values: TileCode[]) => {
      const rest = [...tiles];
      for (const value of values) {
        const index = rest.indexOf(value);
        if (index < 0) return;
        rest.splice(index, 1);
      }
      return rest;
    };
    const choices: TileCode[][] = [[tile, tile, tile]];
    if (!honors.includes(tile) && number(tile) <= 7)
      choices.push([
        tile,
        `${number(tile) + 1}${tile[1]}` as TileCode,
        `${number(tile) + 2}${tile[1]}` as TileCode,
      ]);
    for (const choice of choices) {
      const rest = remove(choice);
      if (rest)
        results.push(
          ...partitions(rest, [
            ...groups,
            {
              tiles: choice,
              open: false,
              sequence: choice[0] !== choice[1],
              kan: false,
            },
          ]),
        );
    }
  }
  return results;
}

// Independently derive the yaku and raw fu for every possible placement of the winning tile.
// Riichi is explicit context; ippatsu and last-tile circumstances are absent.
function interpretations(
  p: Problem,
): { han: number; fu: number; rawFu: number }[] {
  const redHan = allTiles(p).filter((tile) => tile[0] === "0").length;
  p = {
    ...p,
    concealed: p.concealed.map(normalizeTile),
    winningTile: normalizeTile(p.winningTile),
    melds: p.melds.map((meld) => ({ ...meld, tiles: meld.tiles.map(normalizeTile) })),
    doraIndicators: p.doraIndicators.map(normalizeTile),
  };
  const tiles = allTiles(p);
  const closed = !p.melds.some((m) => m.open);
  const riichiHan = Number(closed && p.yaku.some((yaku) => yaku.name === "立直"));
  const doraHan = redHan + p.doraIndicators.reduce(
    (sum, indicator) => sum + count(tiles, dora(indicator)),
    0,
  );
  const flush =
    new Set(tiles.filter((t) => !honors.includes(t)).map((t) => t[1])).size ===
    1;
  const hasHonors = tiles.some((t) => honors.includes(t));
  const flushHan = flush ? (hasHonors ? (closed ? 3 : 2) : closed ? 6 : 5) : 0;
  const result: { han: number; fu: number; rawFu: number }[] = [];
  if (
    closed &&
    new Set(tiles).size === 7 &&
    [...new Set(tiles)].every((t) => count(tiles, t) === 2)
  ) {
    result.push({
      han:
        2 +
        flushHan +
        riichiHan +
        Number(p.win === "tsumo") +
        doraHan +
        Number(tiles.every((t) => !terminal(t))) +
        (tiles.every(terminal) ? 2 : 0),
      fu: 25,
      rawFu: 25,
    });
  }
  for (const split of partitions([...p.concealed, p.winningTile])) {
    const fixed = p.melds.map((m) => ({
      tiles: m.tiles,
      open: m.open,
      sequence: m.kind === "chi",
      kan: m.kind === "kan",
    }));
    const groups = [...split.groups, ...fixed];
    if (groups.length !== 4) continue;
    const possibleWins = split.groups
      .map((g, index) => (g.tiles.includes(p.winningTile) ? index : -2))
      .filter((index) => index !== -2);
    if (split.pair === p.winningTile) possibleWins.push(-1);
    for (const winningGroup of possibleWins) {
      const pairFu =
        Number(split.pair === windCodes[p.roundWind]) * 2 +
        Number(split.pair === windCodes[p.seatWind]) * 2 +
        Number(honors.slice(4).includes(split.pair)) * 2;
      const group = split.groups[winningGroup];
      const waitFu =
        winningGroup === -1 ||
        (group?.sequence &&
          (group.tiles[1] === p.winningTile ||
            (number(group.tiles[0]) === 1 && number(p.winningTile) === 3) ||
            (number(group.tiles[0]) === 7 && number(p.winningTile) === 7)))
          ? 2
          : 0;
      const pinfu =
        closed &&
        groups.every((g) => g.sequence) &&
        pairFu === 0 &&
        waitFu === 0;
      const concealedTriplets = groups.filter(
        (g, index) =>
          !g.sequence &&
          !g.open &&
          !(p.win === "ron" && index === winningGroup),
      ).length;
      const tripletTiles = groups
        .filter((g) => !g.sequence)
        .map((g) => g.tiles[0]);
      const dragons = honors
        .slice(4)
        .filter((t) => tripletTiles.includes(t)).length;
      const yakuman = dragons === 3 || tiles.every((t) => honors.includes(t))
        || concealedTriplets === 4
        || tiles.every((t) => !honors.includes(t) && /^[19]/.test(t));
      let han = yakuman
        ? 13
        : flushHan +
          doraHan +
          riichiHan +
          Number(closed && p.win === "tsumo") +
          Number(pinfu) +
          Number(tiles.every((t) => !terminal(t))) +
          dragons +
          Number(tripletTiles.includes(windCodes[p.roundWind])) +
          Number(tripletTiles.includes(windCodes[p.seatWind])) +
          (groups.every((g) => !g.sequence) ? 2 : 0) +
          (concealedTriplets === 3 ? 2 : 0);
      if (!yakuman) {
        const sequences = groups.filter((g) => g.sequence);
        const sequenceCounts = new Map<string, number>();
        for (const g of sequences) {
          const key = g.tiles.join(" ");
          sequenceCounts.set(key, (sequenceCounts.get(key) ?? 0) + 1);
        }
        if (closed) {
          const identicalPairs = [...sequenceCounts.values()]
            .reduce((sum, n) => sum + Math.floor(n / 2), 0);
          han += identicalPairs === 2 ? 3 : identicalPairs === 1 ? 1 : 0;
        }
        if (Array.from({ length: 7 }, (_, i) => i + 1).some((start) =>
          ["m", "p", "s"].every((suit) => sequences.some((g) =>
            g.tiles[0] === `${start}${suit}`)))) han += closed ? 2 : 1;
        if (groups.every((g) => g.tiles.some(terminal)) && terminal(split.pair)) {
          if (sequences.length > 0) han += hasHonors ? (closed ? 2 : 1) : (closed ? 3 : 2);
          else han += 2;
        }
        if (dragons === 2 && honors.slice(4).includes(split.pair)) han += 2;
        if (Array.from({ length: 9 }, (_, i) => i + 1).some((rank) =>
          ["m", "p", "s"].every((suit) => tripletTiles.includes(`${rank}${suit}` as TileCode)))) han += 2;
        if (groups.filter((g) => g.kan).length === 3) han += 2;
      }
      if (!yakuman) {
        for (const suit of ["m", "p", "s"]) {
          const starts = groups
            .filter((g) => g.sequence && g.tiles[0][1] === suit)
            .map((g) => number(g.tiles[0]));
          if ([1, 4, 7].every((n) => starts.includes(n))) han += closed ? 2 : 1;
        }
      }
      let rawFu =
        20 +
        pairFu +
        waitFu +
        (closed && p.win === "ron" ? 10 : 0) +
        (p.win === "tsumo" ? 2 : 0);
      groups.forEach((g, index) => {
        if (g.sequence) return;
        const exposed = g.open || (p.win === "ron" && index === winningGroup);
        rawFu +=
          (exposed ? 2 : 4) * (terminal(g.tiles[0]) ? 2 : 1) * (g.kan ? 4 : 1);
      });
      if (pinfu && p.win === "tsumo") rawFu = 20;
      else if (rawFu === 20) rawFu = 30; // Explicit open-hand minimum, not ordinary rounding.
      const fu = rawFu === 20 ? 20 : Math.ceil(rawFu / 10) * 10;
      result.push({ han, fu, rawFu });
    }
  }
  return result;
}

describe("curated hands", () => {
  it("lets beginners determine every payment without calculating fu", () => {
    for (const problem of problems.filter((p) => p.level === "basic")) {
      const expected = calculateScore(problem).payments;
      for (const fu of [30, 40, 110]) {
        expect(calculateScore({ ...problem, fu }).payments, `${problem.id}, ${fu}fu`).toEqual(expected);
      }
    }
  });

  it("uses one non-dora yaku in beginner practice", () => {
    for (const problem of problems.filter((p) => p.level === "basic")) {
      expect(problem.yaku.filter((yaku) => yaku.name !== "ドラ" && yaku.name !== "赤ドラ"), problem.id).toHaveLength(1);
    }
  });

  it("moves previous beginner hands and high-han combinations into intermediate practice", () => {
    for (const id of [
      "open-chinitsu-child",
      "daisangen-dealer",
      "suuankou-shanpon-tsumo-child",
      "sanbaiman-ryanpeikou-ron-child",
      "kazoe-tanyao-tsumo-dealer",
    ]) {
      expect(problems.find((problem) => problem.id === id)?.level, id).toBe("intermediate");
    }
  });

  it("preserves published pattern numbers when more hands are appended", () => {
    for (const [key, patternNumber] of [
      ["pinfu-ron", 1],
      ["kanchan-tanyao-ron", 18],
      ["sanbaiman-ryanpeikou-ron", 30],
      ["sanbaiman-tanyao-sanankou-ron", 35],
      ["beginner-chinroutou-open-kan-shanpon", 71],
    ] as const) {
      for (const seat of ["child", "dealer"]) {
        expect(problems.find((p) => p.id === `${key}-${seat}`)?.patternNumber).toBe(patternNumber);
      }
    }
  });

  it("explains the actual completed hand and winning wait without losing or adding tiles", () => {
    for (const p of problems) {
      const { groups, winningGroup, wait } = p.solution;
      expect([...groups.flat()].sort(), p.id).toEqual(
        [...p.concealed, p.winningTile].sort(),
      );
      const pairs = groups.filter((g) => g.length === 2);
      const sevenPairs = p.yaku.some((y) => y.name === "七対子");
      expect(pairs.length, p.id).toBe(sevenPairs ? 7 : 1);
      expect(groups.length + p.melds.length, p.id).toBe(sevenPairs ? 7 : 5);
      for (const original of groups) {
        const group = original.map(normalizeTile);
        if (group.length === 2 || group[0] === group[1]) {
          expect(new Set(group).size, p.id).toBe(1);
        } else {
          expect(group.length, p.id).toBe(3);
          expect(new Set(group.map((t) => t[1])).size, p.id).toBe(1);
          expect(group.map(number), p.id).toEqual([
            number(group[0]), number(group[0]) + 1, number(group[0]) + 2,
          ]);
        }
      }
      const winning = groups[winningGroup].map(normalizeTile);
      const winningTile = normalizeTile(p.winningTile);
      expect(groups[winningGroup], p.id).toContain(p.winningTile);
      const expectedWait = winning.length === 2 ? "単騎"
        : winning[0] === winning[1] ? "シャンポン"
        : winning[1] === winningTile ? "嵌張"
        : (number(winning[0]) === 1 && number(winningTile) === 3) ||
          (number(winning[0]) === 7 && number(winningTile) === 7) ? "辺張"
        : "両面";
      expect(wait, p.id).toBe(expectedWait);
    }
  });

  it("keeps every concealed hand in suit and honor order", () => {
    const order = [
      ...["m", "p", "s"].flatMap((s) => Array.from({ length: 9 }, (_, i) => `${i + 1}${s}`)),
      ...honors,
    ];
    for (const p of problems) {
      const ranks = p.concealed.map((t) => order.indexOf(normalizeTile(t)));
      expect(ranks, p.id).toEqual([...ranks].sort((a, b) => a - b));
    }
  });

  it("provides ten distinct physical hands per difficulty without relying on parent-child duplicates", () => {
    for (const level of ["basic", "intermediate", "advanced"]) {
      const shapes = problems.filter((p) => p.level === level).map((p) =>
        JSON.stringify([
          [...p.concealed, p.winningTile].sort(),
          p.melds,
        ]));
      expect(new Set(shapes).size, level).toBeGreaterThanOrEqual(10);
    }
    expect(new Set(problems.map((p) => p.id)).size).toBe(problems.length);
  });

  it("uses physically possible hands, with winning tile separate and kans counted as four", () => {
    for (const p of problems) {
      const tiles = allTiles(p);
      expect(p.concealed.length + 1 + p.melds.length * 3, p.id).toBe(14);
      expect(tiles.length, p.id).toBe(
        14 + p.melds.filter((m) => m.kind === "kan").length,
      );
      for (const tile of new Set(tiles))
        expect(count(tiles, tile), `${p.id}: ${tile}`).toBeLessThanOrEqual(4);
      const visible = [...tiles, ...p.doraIndicators];
      for (const tile of new Set(visible))
        expect(
          count(visible, tile),
          `${p.id} including indicators: ${tile}`,
        ).toBeLessThanOrEqual(4);
      for (const meld of p.melds) {
        expect(meld.tiles.length).toBe(meld.kind === "kan" ? 4 : 3);
        if (meld.kind !== "chi") expect(new Set(meld.tiles.map(normalizeTile)).size).toBe(1);
        else {
          expect(new Set(meld.tiles.map((t) => t[1])).size).toBe(1);
          expect(meld.tiles.map(number)).toEqual([
            number(meld.tiles[0]),
            number(meld.tiles[0]) + 1,
            number(meld.tiles[0]) + 2,
          ]);
        }
      }
      expect(p.dealer).toBe(p.seatWind === "東");
    }
  });

  it("derives declared han and rounded fu from the actual tiles, calls, wait and winds", () => {
    for (const p of problems) {
      expect(
        p.yaku.reduce((sum, yaku) => sum + yaku.han, 0),
        p.id,
      ).toBe(p.han);
      const doraHan = p.doraIndicators.reduce(
        (sum, indicator) => sum + count(allTiles(p), dora(indicator)),
        0,
      );
      expect(
        p.yaku
          .filter((y) => y.name === "ドラ")
          .reduce((sum, y) => sum + y.han, 0),
        p.id,
      ).toBe(p.yaku.some((y) => y.name.includes("（役満）")) ? 0 : doraHan);
      const raw = p.fuDetails.reduce((sum, detail) => sum + detail.fu, 0);
      const candidates = interpretations(p);
      expect(candidates, p.id).toContainEqual({
        han: p.han,
        fu: p.fu,
        rawFu: raw,
      });
      const bestBase = Math.max(...candidates.filter((candidate) => candidate.han > 0).map((candidate) =>
        calculateScore({ ...p, han: candidate.han, fu: candidate.fu }).basePoints));
      expect(calculateScore(p).basePoints, `${p.id}: best scoring interpretation`).toBe(bestBase);
      expect(
        p.fu === 25 || p.fu === 20
          ? raw
          : Math.max(30, Math.ceil(raw / 10) * 10),
        p.id,
      ).toBe(p.fu);
      expect(p.level === "advanced", p.id).toBe(p.han <= 4);
    }
  });
});

describe("riichi practice", () => {
  it.each([
    ["pinfu-ron", 2, 30, [2000], [2900]],
    ["pinfu-tsumo", 3, 20, [700, 1300], [1300]],
    ["chiitoi-ron", 3, 25, [3200], [4800]],
    ["concealed-kan", 4, 60, [2000, 4000], [4000]],
  ] as const)("includes riichi in %s payments without changing fu or adding deposits", (key, han, fu, child, dealer) => {
    for (const [seat, payments] of [["child", child], ["dealer", dealer]] as const) {
      const p = problems.find((p) => p.id === `${key}-${seat}`)!;
      expect(p.han).toBe(han);
      expect(p.fu).toBe(fu);
      expect(calculateScore(p).payments.map((payment) => payment.points)).toEqual(payments);
      expect(gradeAnswer(p, [...payments])).toBe(true);
      expect(gradeAnswer(p, payments.map((points) => points + 1000))).toBe(false);
    }
  });

  it("keeps riichi closed and excludes unrelated situational bonuses", () => {
    const riichi = problems.filter((p) => p.yaku.some((yaku) => yaku.name === "立直"));
    expect(riichi.some((p) => p.melds.some((meld) => meld.kind === "kan"))).toBe(true);
    for (const p of riichi) {
      expect(p.melds.some((meld) => meld.open), p.id).toBe(false);
      expect(p.yaku.some((yaku) => /一発|ダブル立直|裏ドラ/.test(yaku.name)), p.id).toBe(false);
      expect(p.level, p.id).toBe(p.han <= 4 ? "advanced" : "intermediate");
    }
  });

  it("mixes riichi and non-riichi hands into repeated sessions", () => {
    const contexts = new Set<boolean>();
    for (let seed = 1; seed <= 30; seed++) {
      let state = seed;
      for (const p of createSession("all", () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 2 ** 32;
      })) contexts.add(p.yaku.some((yaku) => yaku.name === "立直"));
    }
    expect(contexts).toEqual(new Set([true, false]));
  });
});

describe("ten-question sessions", () => {

  it.each(["basic", "intermediate", "advanced"] as const)(
    "varies the set of physical %s hands across repeated practice sessions",
    (level) => {
      const sets = new Set<string>();
      for (let seed = 1; seed <= 5; seed++) {
        let state = seed;
        const session = createSession(level, () => {
          state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
          return state / 2 ** 32;
        });
        sets.add(JSON.stringify(session.map((p) => JSON.stringify([
          allTiles(p).sort(), p.melds,
        ])).sort()));
      }
      expect(sets.size, `${level}: practice must vary the hands, not just their order or seats`).toBeGreaterThan(1);
    },
  );

  it.each(["all", "basic", "intermediate", "advanced"] as const)(
    "does not repeat a physical hand as a different seat or win method in %s sessions",
    (level) => {
      for (let seed = 1; seed <= 20; seed++) {
        let state = seed;
        const session = createSession(level, () => {
          state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
          return state / 2 ** 32;
        });
        const shapes = session.map((p) => JSON.stringify([
          allTiles(p).map(normalizeTile).sort(),
          p.melds.map((m) => [m.kind, m.open, m.tiles.map(normalizeTile)]),
        ]));
        expect(session, `${level}, seed=${seed}`).toHaveLength(10);
        expect(new Set(shapes).size, `${level}, seed=${seed}`).toBe(10);
      }
    },
  );

  it.each(["all", "basic", "intermediate", "advanced"] as const)(
    "selects ten unique %s problems deterministically without mutation",
    (level) => {
      const ids = problems.map((p) => p.id);
      const first = createSession(level, () => 0.375);
      expect(first).toHaveLength(10);
      expect(new Set(first.map((p) => p.id)).size).toBe(10);
      expect(createSession(level, () => 0.375)).toEqual(first);
      expect(problems.map((p) => p.id)).toEqual(ids);
      expect(
        first.every(
          (p) => problems.includes(p) && (level === "all" || p.level === level),
        ),
      ).toBe(true);
    },
  );
});
