import { calculateScore, gradeAnswer } from "./scoring";
import type { Problem } from "./types";

export interface Attempt {
  problem: Problem;
  answers: number[];
  correct: boolean;
  hinted: boolean;
}

export interface GameState {
  problems: Problem[];
  index: number;
  attempts: Attempt[];
  hintVisible: boolean;
  finished: boolean;
}

type Action =
  | { type: "hint" }
  | { type: "answer"; answers: number[] }
  | { type: "next" }
  | { type: "restart"; problems: Problem[] };

export function createGame(problems: Problem[]): GameState {
  if (!problems.length) throw new Error("出題する問題が必要です。");
  return {
    problems,
    index: 0,
    attempts: [],
    hintVisible: false,
    finished: false,
  };
}

export function gameReducer(state: GameState, action: Action): GameState {
  if (action.type === "restart") return createGame(action.problems);
  if (state.finished) return state;
  const answered = state.attempts.length > state.index;
  if (action.type === "hint") {
    return answered || state.hintVisible
      ? state
      : { ...state, hintVisible: true };
  }
  if (action.type === "answer") {
    const problem = state.problems[state.index];
    const expected = calculateScore(problem).payments.length;
    if (
      answered ||
      action.answers.length !== expected ||
      action.answers.some((value) => !Number.isSafeInteger(value) || value <= 0)
    )
      return state;
    return {
      ...state,
      attempts: [
        ...state.attempts,
        {
          problem,
          answers: action.answers,
          correct: gradeAnswer(problem, action.answers),
          hinted: state.hintVisible,
        },
      ],
    };
  }
  if (!answered) return state;
  if (state.index === state.problems.length - 1)
    return { ...state, finished: true };
  return { ...state, index: state.index + 1, hintVisible: false };
}
