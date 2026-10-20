import { useState } from "react";
import { calculateScore } from "../game/scoring";
import type { Score, Win } from "../game/types";
import "./ScoreTable.css";

const fuValues = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
const hanValues = [1, 2, 3, 4];
const limits = [
  { name: "満貫", condition: "5翻・または符による上限", han: 5 },
  { name: "跳満", condition: "6〜7翻", han: 6 },
  { name: "倍満", condition: "8〜10翻", han: 8 },
  { name: "三倍満", condition: "11〜12翻", han: 11 },
  { name: "役満", condition: "役満役・13翻以上の数え役満", han: 13 },
];

function buildChart(dealer: boolean, win: Win) {
  return {
    rows: fuValues.map((fu) => ({
      fu,
      scores: hanValues.map((han) => {
        if (
          (fu === 20 && (win === "ron" || han < 2)) ||
          (fu === 25 && (han < 2 || (win === "tsumo" && han < 3))) ||
          (fu === 110 && han === 1 && win === "tsumo")
        ) return null;
        return calculateScore({ fu, han, dealer, win });
      }),
    })),
    limits: limits.map((limit) => ({
      ...limit,
      score: calculateScore({ fu: 30, han: limit.han, dealer, win }),
    })),
  };
}

const charts = [false, true].map((dealer) => ({
  ron: buildChart(dealer, "ron"),
  tsumo: buildChart(dealer, "tsumo"),
}));

function Points({ score }: { score: Score }) {
  return (
    <span className="score-table-points">
      {score.payments.map((payment) => (
        <span key={payment.label}>
          <span className="sr-only">{payment.label} </span>
          {payment.points.toLocaleString("ja-JP")}<span className="sr-only">点</span>
        </span>
      ))}
    </span>
  );
}

export function ScoreTable() {
  const [dealer, setDealer] = useState(false);
  const [win, setWin] = useState<Win>("ron");
  const chart = charts[Number(dealer)][win];
  const title = `${dealer ? "親" : "子"}の${win === "ron" ? "ロン" : "ツモ"}`;

  return (
    <details className="score-reference" id="score-table">
      <summary>点数計算表</summary>
      <div className="score-table-body">
        <div className="score-table-options">
          <fieldset>
            <legend>和了者</legend>
            <button type="button" aria-pressed={!dealer} onClick={() => setDealer(false)}>子</button>
            <button type="button" aria-pressed={dealer} onClick={() => setDealer(true)}>親</button>
          </fieldset>
          <fieldset>
            <legend>和了方法</legend>
            <button type="button" aria-pressed={win === "ron"} onClick={() => setWin("ron")}>ロン</button>
            <button type="button" aria-pressed={win === "tsumo"} onClick={() => setWin("tsumo")}>ツモ</button>
          </fieldset>
        </div>
        <p className="score-table-guide">
          単位：点。本場・供託なし、切り上げ満貫なし。
          {win === "ron"
            ? "放銃者1人の支払いです。"
            : dealer
              ? "子1人あたりの支払いです。"
              : "上段は子1人、下段は親の支払いです。"}
          「—」は成立しない組み合わせです。
        </p>
        <table className="score-table-grid">
          <caption>{title} · 1〜4翻</caption>
          <thead>
            <tr>
              <th scope="col">符</th>
              {hanValues.map((han) => <th scope="col" key={han}>{han}翻</th>)}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map(({ fu, scores }) => (
              <tr key={fu}>
                <th scope="row">{fu}符</th>
                {scores.map((score, index) => (
                  <td key={hanValues[index]}>
                    {score === null ? <span aria-label="成立しない組み合わせ">—</span>
                      : score.limit ? <span className="score-table-limit">{score.limit}</span>
                        : <Points score={score} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="score-table-guide">表中の「満貫」は下表を参照してください。5翻以上は符によらず、以下の点数です。</p>
        <table className="score-table-limits">
          <caption>{title} · 満貫以上</caption>
          <thead><tr><th scope="col">区分・条件</th><th scope="col">支払い点</th></tr></thead>
          <tbody>
            {chart.limits.map(({ name, condition, score }) => (
              <tr key={name}>
                <th scope="row">{name}<small>{condition}</small></th>
                <td><Points score={score} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
