import { describe, expect, it } from "vitest";
import { createGame, gameReducer } from "./session";
import type { Problem } from "./types";

const problem: Problem = {
  id: "session-fixture",
  patternNumber: 1,
  title: "平和",
  level: "advanced",
  concealed: [
    "1m",
    "2m",
    "3m",
    "4m",
    "5m",
    "6m",
    "2p",
    "3p",
    "4p",
    "6s",
    "7s",
    "5p",
    "5p",
  ],
  winningTile: "8s",
  solution: {
    groups: [["1m", "2m", "3m"], ["4m", "5m", "6m"], ["2p", "3p", "4p"], ["6s", "7s", "8s"], ["5p", "5p"]],
    winningGroup: 3,
    wait: "両面",
  },
  melds: [],
  win: "ron",
  dealer: false,
  roundWind: "東",
  seatWind: "南",
  doraIndicators: ["north"],
  han: 1,
  fu: 30,
  yaku: [{ name: "平和", han: 1 }],
  fuDetails: [
    { label: "副底", fu: 20 },
    { label: "門前ロン", fu: 10 },
  ],
  explanation: "",
};

describe("練習の進行", () => {
  it("回答するまで次に進めず、同じ問題への重複回答で成績が変わらない", () => {
    const state = createGame([problem, { ...problem, id: "second" }]);
    expect(gameReducer(state, { type: "next" })).toBe(state);
    const answered = gameReducer(state, { type: "answer", answers: [1000] });
    expect(answered.attempts[0].correct).toBe(true);
    expect(gameReducer(answered, { type: "answer", answers: [2000] })).toBe(
      answered,
    );
    const next = gameReducer(answered, { type: "next" });
    expect(next.index).toBe(1);
    expect(next.attempts).toHaveLength(1);
    expect(next.finished).toBe(false);
  });

  it("空・負数・小数・余分な支払いを回答として受け付けない", () => {
    const state = createGame([problem]);
    for (const answers of [
      [],
      [0],
      [-100],
      [1000.5],
      [NaN],
      [Infinity],
      [1000, 1000],
    ]) {
      expect(gameReducer(state, { type: "answer", answers })).toBe(state);
    }
  });

  it("ヒントを記録し、次問では隠し、最終問の解説後に結果を表示する", () => {
    let state = createGame([problem, { ...problem, id: "second" }]);
    state = gameReducer(state, { type: "hint" });
    state = gameReducer(state, { type: "answer", answers: [2000] });
    expect(state.attempts[0]).toMatchObject({
      correct: false,
      hinted: true,
      answers: [2000],
    });
    state = gameReducer(state, { type: "next" });
    expect(state.hintVisible).toBe(false);
    state = gameReducer(state, { type: "answer", answers: [1000] });
    expect(state.finished).toBe(false);
    state = gameReducer(state, { type: "next" });
    expect(state.finished).toBe(true);
    expect(gameReducer(state, { type: "answer", answers: [1000] })).toBe(state);
    const restarted = gameReducer(state, {
      type: "restart",
      problems: [problem],
    });
    expect(restarted.attempts).toEqual([]);
    expect(restarted.finished).toBe(false);
    expect(restarted.index).toBe(0);
  });
});
