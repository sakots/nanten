import { Capacitor, registerPlugin } from "@capacitor/core";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Ref } from "react";
import { createAdsController } from "./lifecycle";
import type { NantenAdsPlugin } from "./lifecycle";
import { createResultsTransition } from "./resultsTransition";

const plugin = Capacitor.isNativePlatform() &&
  Capacitor.getPlatform() === "android" &&
  Capacitor.isPluginAvailable("NantenAds")
  ? registerPlugin<NantenAdsPlugin>("NantenAds")
  : null;
const ads = createAdsController(plugin);

export function PrivacySettings() {
  const state = useSyncExternalStore(ads.subscribe, ads.getSnapshot);

  useEffect(() => {
    void ads.initialize();
  }, []);

  if (!state.supported) return null;
  return (
    <>
      {state.privacyOptionsRequired && (
        <button
          type="button"
          className="ad-privacy-button"
          disabled={state.privacyOptionsOpen}
          aria-busy={state.privacyOptionsOpen}
          onClick={() => { void ads.showPrivacyOptions(); }}
        >
          広告のプライバシー設定
        </button>
      )}
      {state.message && <span className="ad-status" role="status">{state.message}</span>}
    </>
  );
}

export function ResultsButton({
  onContinue,
  buttonRef,
}: {
  onContinue: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}) {
  const [transition] = useState(createResultsTransition);
  const [pending, setPending] = useState(false);

  useEffect(() => () => transition.cancel(), [transition]);

  return (
    <button
      type="button"
      className="primary-button"
      ref={buttonRef}
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        setPending(true);
        void transition.run(ads.showInterstitial, onContinue);
      }}
    >
      {pending ? "結果を準備中…" : "結果を見る"}{" "}
      <span aria-hidden="true">→</span>
    </button>
  );
}
