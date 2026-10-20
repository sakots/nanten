import { describe, expect, it, vi } from "vitest";
import { createResultsTransition } from "./resultsTransition";

function pendingAd() {
  let dismiss!: () => void;
  const promise = new Promise<void>((resolve) => { dismiss = resolve; });
  return { show: vi.fn(() => promise), dismiss };
}

describe("結果ボタンからの広告と結果表示", () => {
  it("連打と表示完了後の再実行で全画面広告も結果遷移も重複させない", async () => {
    const transition = createResultsTransition();
    const ad = pendingAd();
    const complete = vi.fn();
    const first = transition.run(ad.show, complete);
    await transition.run(ad.show, complete);
    expect(ad.show).toHaveBeenCalledTimes(1);
    expect(complete).not.toHaveBeenCalled();
    ad.dismiss();
    await first;
    await transition.run(ad.show, complete);
    expect(ad.show).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("広告の読み込み不足・拒否・同期エラーでも結果へ進める", async () => {
    for (const show of [
      async () => ({ shown: false }),
      async () => { throw new Error("native show rejected"); },
      () => { throw new Error("plugin unavailable"); },
    ]) {
      const complete = vi.fn();
      await createResultsTransition().run(show, complete);
      expect(complete).toHaveBeenCalledTimes(1);
    }
  });

  it("出題範囲変更・再挑戦で古い遷移を無効化し、新しい練習は通常どおり終了する", async () => {
    const transition = createResultsTransition();
    const oldAd = pendingAd();
    const oldResults = vi.fn();
    const oldRequest = transition.run(oldAd.show, oldResults);
    transition.cancel();
    const newResults = vi.fn();
    await transition.run(async () => ({ shown: false }), newResults);
    oldAd.dismiss();
    await oldRequest;
    expect(oldResults).not.toHaveBeenCalled();
    expect(newResults).toHaveBeenCalledTimes(1);
  });

  it("アンマウント後の失敗を受けても古い結果へ遷移しない", async () => {
    let reject!: (error: Error) => void;
    const promise = new Promise<void>((_, rejectPromise) => { reject = rejectPromise; });
    const transition = createResultsTransition();
    const complete = vi.fn();
    const request = transition.run(() => promise, complete);
    transition.cancel();
    reject(new Error("activity closed"));
    await request;
    expect(complete).not.toHaveBeenCalled();
  });
});
