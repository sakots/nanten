import { describe, expect, it, vi } from "vitest";
import { createAdsController } from "./lifecycle";
import type { ConsentState, NantenAdsPlugin } from "./lifecycle";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const consent: ConsentState = {
  privacyOptionsRequired: true,
  adsAvailable: true,
};

function plugin(): NantenAdsPlugin {
  return {
    initialize: vi.fn(async () => consent),
    showInterstitial: vi.fn(async () => ({ shown: true })),
    showPrivacyOptions: vi.fn(async () => consent),
  };
}

describe("ネイティブ広告の状態", () => {
  it("初期化を共有し、同意確認が終わる前の結果表示を待たせない", async () => {
    const pending = deferred<ConsentState>();
    const bridge = plugin();
    bridge.initialize = vi.fn(() => pending.promise);
    const ads = createAdsController(bridge);
    const first = ads.initialize();
    expect(ads.initialize()).toBe(first);
    expect(await ads.showInterstitial()).toEqual({ shown: false });
    expect(bridge.showInterstitial).not.toHaveBeenCalled();
    pending.resolve(consent);
    await first;
    expect(bridge.initialize).toHaveBeenCalledTimes(1);
    expect(ads.getSnapshot()).toMatchObject(consent);
    expect(ads.initialize()).toBe(first);
  });

  it("プラグインなし・初期化失敗でも広告待ちにならず、失敗を再初期化しない", async () => {
    const unsupported = createAdsController(null);
    await unsupported.initialize();
    expect(unsupported.getSnapshot()).toMatchObject({ supported: false, message: "" });
    expect(await unsupported.showInterstitial()).toEqual({ shown: false });

    const bridge = plugin();
    bridge.initialize = vi.fn(async () => { throw new Error("consent unavailable"); });
    const ads = createAdsController(bridge);
    await ads.initialize();
    await ads.initialize();
    expect(bridge.initialize).toHaveBeenCalledTimes(1);
    expect(ads.getSnapshot()).toMatchObject({ adsAvailable: false, privacyOptionsRequired: false });
    expect(await ads.showInterstitial()).toEqual({ shown: false });
    expect(bridge.showInterstitial).not.toHaveBeenCalled();
  });

  it("全画面広告の重複表示と表示中のプライバシーフォームを防ぐ", async () => {
    const pending = deferred<{ shown: boolean }>();
    const bridge = plugin();
    bridge.showInterstitial = vi.fn(() => pending.promise);
    const ads = createAdsController(bridge);
    await ads.initialize();
    const first = ads.showInterstitial();
    expect(await ads.showInterstitial()).toEqual({ shown: false });
    await ads.showPrivacyOptions();
    expect(bridge.showPrivacyOptions).not.toHaveBeenCalled();
    pending.resolve({ shown: true });
    expect(await first).toEqual({ shown: true });
    expect(bridge.showInterstitial).toHaveBeenCalledTimes(1);
  });

  it("プライバシー設定中は全画面を出さず、変更された同意状態を以後の表示に反映する", async () => {
    const pending = deferred<ConsentState>();
    const bridge = plugin();
    bridge.showPrivacyOptions = vi.fn(() => pending.promise);
    const ads = createAdsController(bridge);
    await ads.initialize();
    const first = ads.showPrivacyOptions();
    expect(ads.showPrivacyOptions()).toBe(first);
    expect(ads.getSnapshot().privacyOptionsOpen).toBe(true);
    expect(await ads.showInterstitial()).toEqual({ shown: false });
    pending.resolve({ privacyOptionsRequired: false, adsAvailable: false });
    await first;
    expect(bridge.showPrivacyOptions).toHaveBeenCalledTimes(1);
    expect(ads.getSnapshot()).toMatchObject({
      privacyOptionsRequired: false,
      adsAvailable: false,
      privacyOptionsOpen: false,
    });
    expect(await ads.showInterstitial()).toEqual({ shown: false });
    expect(bridge.showInterstitial).not.toHaveBeenCalled();
  });

  it("設定の失敗後も必要な設定ボタンを残し、全画面の失敗後も次の練習を妨げない", async () => {
    const bridge = plugin();
    bridge.showPrivacyOptions = vi.fn(async () => { throw new Error("form failed"); });
    bridge.showInterstitial = vi.fn(async () => { throw new Error("show failed"); });
    const ads = createAdsController(bridge);
    await ads.initialize();
    await ads.showPrivacyOptions();
    expect(ads.getSnapshot()).toMatchObject({ privacyOptionsRequired: true, privacyOptionsOpen: false });
    await ads.showPrivacyOptions();
    expect(bridge.showPrivacyOptions).toHaveBeenCalledTimes(2);
    expect(await ads.showInterstitial()).toEqual({ shown: false });
    expect(await ads.showInterstitial()).toEqual({ shown: false });
    expect(bridge.showInterstitial).toHaveBeenCalledTimes(2);
  });

  it("同意状態と失敗の変更を購読者へ通知し、購読解除後は通知しない", async () => {
    const bridge = plugin();
    const ads = createAdsController(bridge);
    const listener = vi.fn();
    const unsubscribe = ads.subscribe(listener);
    const initial = ads.getSnapshot();
    await ads.initialize();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(ads.getSnapshot()).not.toBe(initial);
    unsubscribe();
    await ads.showPrivacyOptions();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
