import { useEffect, useReducer, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Tile } from "./components/Tile";
import { createSession } from "./game/problems";
import { calculateScore } from "./game/scoring";
import { createGame, gameReducer } from "./game/session";
import type { Level, Problem, Score } from "./game/types";
import { version } from "../package.json";

const levels: { value: Level; label: string; detail: string }[] = [
  { value: "all", label: "すべて", detail: "いろいろな点数に挑戦" },
  { value: "basic", label: "初級", detail: "満貫未満" },
  { value: "advanced", label: "中上級", detail: "満貫以上" },
];
const number = (value: number) => value.toLocaleString("ja-JP");

function PaymentSummary({ score }: { score: Score }) {
  return (
    <div className="payment-summary">
      {score.payments.map((payment) => (
        <div key={payment.label}>
          <span>{payment.label}</span>
          <strong>
            {number(payment.points)}
            <small>点</small>
          </strong>
        </div>
      ))}
    </div>
  );
}

function Hand({ problem }: { problem: Problem }) {
  return (
    <div className="table-surface">
      <div className="table-heading">
        <span>手牌</span>
        <span>
          {problem.melds.some((meld) => meld.open) ? "副露あり" : "門前"} ·{" "}
          {problem.win === "ron" ? "ロン和了" : "ツモ和了"}
        </span>
      </div>
      <div className="hand-scroll" role="group" aria-label="手牌">
        <div className="hand-tiles">
          {problem.concealed.map((tile, index) => (
            <Tile key={index} code={tile} />
          ))}
          {problem.melds.map((meld, index) => (
            <div
              className="meld"
              key={index}
              style={{ flexGrow: meld.tiles.length }}
            >
              <div className="meld-tiles">
                {meld.tiles.map((tile, tileIndex) => (
                  <Tile
                    key={tileIndex}
                    code={tile}
                    back={
                      !meld.open &&
                      meld.kind === "kan" &&
                      (tileIndex === 0 || tileIndex === 3)
                    }
                  />
                ))}
              </div>
              <span>
                {meld.kind === "kan"
                  ? meld.open
                    ? "明槓"
                    : "暗槓"
                  : meld.kind === "pon"
                    ? "ポン"
                    : "チー"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="table-bottom">
        <div className="winning-tile">
          <div>
            <span className="table-caption">和了牌</span>
            <strong>{problem.win === "ron" ? "ロン" : "ツモ"}</strong>
          </div>
          <Tile code={problem.winningTile} />
        </div>
        <div className="dora">
          <div>
            <span className="table-caption">ドラ表示牌</span>
            <small>この牌の次がドラ</small>
          </div>
          <div className="dora-tiles">
            {problem.doraIndicators.map((tile, index) => (
              <Tile key={index} code={tile} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Breakdown({
  problem,
  score,
  hint = false,
}: {
  problem: Problem;
  score: Score;
  hint?: boolean;
}) {
  return (
    <div className="breakdown">
      <div className="breakdown-title">
        <h3>役と符の内訳</h3>
        <strong>
          {problem.han}翻 {problem.fu}符{score.limit ? ` · ${score.limit}` : ""}
        </strong>
      </div>
      <div className="breakdown-columns">
        <div>
          <h4>成立役・ドラ</h4>
          <dl>
            {problem.yaku.map((yaku, index) => (
              <div key={index}>
                <dt>{yaku.name}</dt>
                <dd>{yaku.han}翻</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h4>符の計算</h4>
          <dl>
            {problem.fuDetails.map((detail, index) => (
              <div key={index}>
                <dt>{detail.label}</dt>
                <dd>{detail.fu}符</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {!hint && (
        <>
          <p className="explanation">{problem.explanation}</p>
          <div className="calculation">
            <span>基本点</span>
            <code>
              {score.limit
                ? `${score.limit} = ${number(score.basePoints)}`
                : `${problem.fu} × 2^(${problem.han} + 2) = ${number(score.basePoints)}`}
            </code>
            <small>
              {problem.win === "ron"
                ? `基本点 × ${problem.dealer ? 6 : 4}（${problem.dealer ? "親" : "子"}のロン）`
                : problem.dealer
                  ? "基本点 × 2 を子3人がそれぞれ支払い"
                  : "子は基本点 × 1、親は基本点 × 2 を支払い"}
            </small>
            <small>
              支払いごとに100点単位で切り上げ · 合計 {number(score.total)}点
            </small>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [level, setLevel] = useState<Level>("all");
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createGame(createSession("all")),
  );
  const [answers, setAnswers] = useState<string[]>(["", ""]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const problem = state.problems[state.index];
  const score = calculateScore(problem);
  const attempt = state.attempts[state.index];
  const correctCount = state.attempts.filter((item) => item.correct).length;
  const hintCount = state.attempts.filter((item) => item.hinted).length;

  useEffect(() => {
    if (state.finished) resultRef.current?.focus();
    else if (attempt) nextRef.current?.focus();
  }, [attempt, state.finished]);

  function restart(nextLevel: Level) {
    setLevel(nextLevel);
    dispatch({ type: "restart", problems: createSession(nextLevel) });
    setAnswers(["", ""]);
    setError("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (attempt) return;
    const values = score.payments.map((_, index) => answers[index].trim());
    if (
      values.some(
        (value) =>
          !/^\d+$/.test(value) ||
          !Number.isSafeInteger(Number(value)) ||
          Number(value) <= 0,
      )
    ) {
      setError("すべての回答欄に、1以上の整数で点数を入力してください。");
      inputRef.current?.focus();
      return;
    }
    setError("");
    dispatch({ type: "answer", answers: values.map(Number) });
  }

  function next() {
    dispatch({ type: "next" });
    setAnswers(["", ""]);
    setError("");
    if (state.index < state.problems.length - 1)
      requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <>
      <a className="skip-link" href="#game">
        ゲームへスキップ
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="./" aria-label="nanten ホーム">
            <span className="brand-mark" aria-hidden="true">
              南
            </span>
            <span>
              nanten<span className="brand-sub">麻雀点数トレーニング</span>
            </span>
          </a>
          <a className="header-help" href="#rules">
            遊び方・ルール <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
      <main className={`page-shell${attempt && !state.finished ? " has-feedback" : ""}`}>
        <section className="intro">
          <div>
            <p className="eyebrow">MAHJONG SCORING PRACTICE</p>
            <h1>
              牌を読む。<span>運値を育てる。</span>
            </h1>
            <p className="intro-copy">
              その手、何点？ 一日10問、点数計算を自分のものに。
            </p>
          </div>
          <div className="intro-stamp" aria-hidden="true">
            日々
            <br />
            精進
          </div>
        </section>
        <div className="workspace">
          <section className="game-panel" id="game" aria-label="点数計算ゲーム">
            <div className="level-bar">
              <span className="section-label">出題範囲</span>
              <div className="level-options" role="group" aria-label="出題範囲">
                {levels.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={level === item.value}
                    onClick={() => {
                      if (item.value !== level) restart(item.value);
                    }}
                    title={item.detail}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="level-note">
              {levels.find((item) => item.value === level)?.detail} ·
              範囲を変えると1問目から始まります
            </p>
            {state.finished ? (
              <section className="results">
                <p className="eyebrow">PRACTICE COMPLETE</p>
                <h2 tabIndex={-1} ref={resultRef}>
                  おつかれさまでした。
                </h2>
                <div className="result-number">
                  <strong>{correctCount}</strong>
                  <span>/ {state.problems.length} 問正解</span>
                </div>
                <div className="result-stats">
                  <span>
                    正答率{" "}
                    <strong>
                      {Math.round((correctCount / state.problems.length) * 100)}
                      %
                    </strong>
                  </span>
                  <span>
                    ヒント利用 <strong>{hintCount}問</strong>
                  </span>
                </div>
                <p>
                  {correctCount === state.problems.length
                    ? "全問正解！ この調子で、点数感覚を磨いていきましょう。"
                    : "間違えた点数こそ、次の一歩。内訳を振り返ってみましょう。"}
                </p>
                <button
                  className="primary-button"
                  onClick={() => restart(level)}
                >
                  もう一度、10問に挑戦 <span aria-hidden="true">↻</span>
                </button>
                {state.attempts.some((item) => !item.correct) && (
                  <div className="review-list">
                    <h3>間違えた問題の振り返り</h3>
                    {state.attempts.map(
                      (item, index) =>
                        !item.correct && (
                          <details key={item.problem.id}>
                            <summary>
                              <span>
                                第{index + 1}問 ·{" "}
                                {item.problem.dealer ? "親" : "子"}の
                                {item.problem.win === "ron" ? "ロン" : "ツモ"}
                              </span>
                              <span>
                                {item.problem.han}翻 {item.problem.fu}符
                              </span>
                            </summary>
                            <div className="review-body">
                              <Hand problem={item.problem} />
                              <p>
                                あなたの回答：
                                {item.answers.map(number).join(" / ")}点
                              </p>
                              <PaymentSummary
                                score={calculateScore(item.problem)}
                              />
                              <Breakdown
                                problem={item.problem}
                                score={calculateScore(item.problem)}
                              />
                            </div>
                          </details>
                        ),
                    )}
                  </div>
                )}
              </section>
            ) : (
              <>
                <div className="progress-heading">
                  <div>
                    <span className="question-number">
                      {String(state.index + 1).padStart(2, "0")}
                    </span>
                    <span className="question-total">
                      {" "}
                      / {state.problems.length} 問
                    </span>
                  </div>
                  <div className="score-counter">
                    <span className="status-dot" />
                    正解 <strong>{correctCount}</strong>
                    <span> / {state.attempts.length}問</span>
                  </div>
                </div>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-label="回答済みの問題数"
                  aria-valuenow={state.attempts.length}
                  aria-valuemin={0}
                  aria-valuemax={state.problems.length}
                >
                  <div
                    style={{
                      width: `${(state.attempts.length / state.problems.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="question-heading">
                  <h2>この手の点数は？</h2>
                  <span
                    className={`win-badge ${problem.dealer ? "dealer" : ""}`}
                  >
                    {problem.dealer ? "親" : "子"}の
                    {problem.win === "ron" ? "ロン" : "ツモ"}
                  </span>
                </div>
                <div className="context-row">
                  <span>
                    場風 <strong>{problem.roundWind}</strong>
                  </span>
                  <span>
                    自風 <strong>{problem.seatWind}</strong>
                  </span>
                  <span>0本場 · 供託なし</span>
                </div>
                <Hand problem={problem} />
                {!attempt && (
                  <form onSubmit={submit} noValidate className="answer-form">
                    <div className="answer-heading">
                      <h3>支払い点を入力</h3>
                      <button
                        className="text-button"
                        type="button"
                        disabled={state.hintVisible}
                        onClick={() => dispatch({ type: "hint" })}
                      >
                        {state.hintVisible ? "ヒント表示中" : "ヒントを見る"}{" "}
                        <span aria-hidden="true">?</span>
                      </button>
                    </div>
                    <p className="answer-guide">
                      {problem.win === "ron"
                        ? "放銃した1人が支払う点数を答えてください。"
                        : problem.dealer
                          ? "子1人あたりが支払う点数を答えてください。"
                          : "子1人あたり・親が支払う点数をそれぞれ答えてください。"}
                    </p>
                    <div className="answer-inputs">
                      {score.payments.map((payment, index) => (
                        <label
                          key={`${problem.id}-${index}`}
                          htmlFor={`answer-${index}`}
                        >
                          <span>{payment.label}</span>
                          <div className="input-with-unit">
                            <input
                              ref={index === 0 ? inputRef : undefined}
                              id={`answer-${index}`}
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              value={answers[index]}
                              onChange={(event) => {
                                setAnswers((previous) =>
                                  previous.map((value, answerIndex) =>
                                    answerIndex === index
                                      ? event.target.value
                                      : value,
                                  ),
                                );
                                if (error) setError("");
                              }}
                              placeholder="例：2000"
                              aria-invalid={!!error}
                              aria-describedby={
                                error ? "answer-error" : undefined
                              }
                              disabled={!!attempt}
                            />
                            <span>点</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {error && (
                      <p id="answer-error" className="form-error" role="alert">
                        {error}
                      </p>
                    )}
                    <button className="primary-button" type="submit">
                      答え合わせ <span aria-hidden="true">→</span>
                    </button>
                  </form>
                )}
                {attempt && (
                  <section
                    className={`feedback ${attempt.correct ? "correct" : "incorrect"}`}
                    aria-label="回答結果"
                  >
                    <div
                      className="feedback-heading"
                      role="status"
                      aria-atomic="true"
                    >
                      {attempt.correct && (
                        <svg
                          className="feedback-confetti"
                          viewBox="0 0 600 180"
                          preserveAspectRatio="xMidYMid slice"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <g>
                            <path d="M30 30h10v18H30z M190 18l12 6-10 10z M420 46h16v7h-16z M540 100l12 8-13 7z" />
                            <circle cx="320" cy="26" r="5" />
                          </g>
                          <g>
                            <path d="M90 120l12-8 5 14z M255 45h7v16h-7z M460 20l12 10-15 4z M570 48h8v18h-8z" />
                            <circle cx="365" cy="135" r="4" />
                          </g>
                          <g>
                            <path d="M65 70h16v6H65z M220 145l10-10 5 14z M380 60l12-8 3 15z M495 140h8v16h-8z" />
                            <circle cx="145" cy="28" r="4" />
                          </g>
                        </svg>
                      )}
                      <span className="feedback-symbol" aria-hidden="true">
                        {attempt.correct ? "○" : "×"}
                      </span>
                      <div className="feedback-copy">
                        <p className="feedback-kicker" aria-hidden="true">
                          {attempt.correct ? "NICE ANSWER!" : "KEEP TRYING!"}
                        </p>
                        <h3>{attempt.correct ? "正解！" : "不正解"}</h3>
                        <p>
                          {attempt.correct
                            ? "点数をしっかりつかめています。"
                            : `あなたの回答：${attempt.answers.map(number).join(" / ")}点`}
                          {attempt.hinted ? "（ヒント利用）" : ""}
                          {!attempt.correct && (
                            <span className="feedback-guidance">
                              正しい点数をチェック！
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <PaymentSummary score={score} />
                    <Breakdown problem={problem} score={score} />
                    <div className="feedback-actions">
                      <button
                        className="primary-button"
                        ref={nextRef}
                        onClick={next}
                      >
                        {state.index === state.problems.length - 1
                          ? "結果を見る"
                          : "次の問題へ"}{" "}
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </section>
                )}
                {!attempt && state.hintVisible && (
                  <section className="hint-box" aria-label="ヒント">
                    <span className="eyebrow">HINT</span>
                    <Breakdown problem={problem} score={score} hint />
                  </section>
                )}
              </>
            )}
          </section>
          <aside className="sidebar">
            <section className="note-card" id="rules">
              <p className="eyebrow">HOW TO PLAY</p>
              <h2>
                一問ずつ、
                <br />
                点数感覚を育てる。
              </h2>
              <ol>
                <li>
                  <span>01</span>
                  <div>
                    <strong>牌姿を読む</strong>
                    <p>
                      役・ドラ・符を数えましょう。和了牌と待ちの形も忘れずに。
                    </p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>点数を答える</strong>
                    <p>ロンは放銃者、ツモは各プレイヤーの支払い点を入力。</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>内訳で確かめる</strong>
                    <p>役と符の解説を読んで、次の一問に活かしましょう。</p>
                  </div>
                </li>
              </ol>
              <div className="rule-chips">
                <span>四人麻雀</span>
                <span>全10問</span>
                <span>時間制限なし</span>
              </div>
            </section>
            <section className="tip-card">
              <span className="tip-icon" aria-hidden="true">
                点
              </span>
              <p className="eyebrow">SCORING NOTE</p>
              <h3>
                「翻」と「符」が、
                <br />
                点数のものさし。
              </h3>
              <p>
                基本点は{" "}
                <strong>
                  符 × 2<sup>翻 + 2</sup>
                </strong>
                。親のロンは6倍、子のロンは4倍。最後に100点単位で切り上げます。
              </p>
              <details>
                <summary>採用ルールを確認</summary>
                <ul>
                  <li>切り上げ満貫なし</li>
                  <li>数え役満あり（13翻以上）</li>
                  <li>本場・供託・赤ドラなし</li>
                  <li>ダブル役満・ローカル役なし</li>
                  <li>自由入力の手牌判定ではなく問題集形式</li>
                  <li>成績はリロードでリセット</li>
                </ul>
              </details>
            </section>
          </aside>
        </div>
        <footer className="site-footer">
          <span>nanten</span>
          <p>積み重ねた一問が、自信になる。</p>
          <div className="footer-meta">
            <small>四人リーチ麻雀 · 点数計算の練習帳</small>
            <span aria-label={`バージョン ${version}`}>v{version}</span>
            <a
              href="https://github.com/sakots/nanten"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub<span className="sr-only">（新しいタブで開く）</span>
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
