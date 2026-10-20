export interface ConsentState {
  privacyOptionsRequired: boolean;
  adsAvailable: boolean;
}

export interface NantenAdsPlugin {
  initialize(): Promise<ConsentState>;
  showInterstitial(): Promise<{ shown: boolean }>;
  showPrivacyOptions(): Promise<ConsentState>;
}

interface AdsState extends ConsentState {
  supported: boolean;
  privacyOptionsOpen: boolean;
  message: string;
}

export function createAdsController(plugin: NantenAdsPlugin | null) {
  let state: AdsState = {
    supported: plugin !== null,
    privacyOptionsRequired: false,
    adsAvailable: false,
    privacyOptionsOpen: false,
    message: "",
  };
  let initialization: Promise<void> | undefined;
  let privacyOptions: Promise<void> | undefined;
  let interstitial: Promise<{ shown: boolean }> | undefined;
  const listeners = new Set<() => void>();

  function update(next: Partial<AdsState>) {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  }

  function initialize() {
    if (!initialization) {
      initialization = Promise.resolve().then(async () => {
        if (!plugin) return;
        try {
          update(await plugin.initialize());
        } catch {
          update({ message: "広告を利用できません。練習はそのまま続けられます。" });
        }
      });
    }
    return initialization;
  }

  function showInterstitial(): Promise<{ shown: boolean }> {
    if (!plugin || !state.adsAvailable || state.privacyOptionsOpen || interstitial) {
      return Promise.resolve({ shown: false });
    }
    interstitial = Promise.resolve().then(async () => {
      try {
        return await plugin.showInterstitial();
      } catch {
        update({ message: "広告を表示できませんでした。練習はそのまま続けられます。" });
        return { shown: false };
      }
    }).finally(() => {
      interstitial = undefined;
    });
    return interstitial;
  }

  function showPrivacyOptions() {
    if (privacyOptions) return privacyOptions;
    if (!plugin || !state.privacyOptionsRequired || interstitial) return Promise.resolve();
    update({ privacyOptionsOpen: true, message: "" });
    privacyOptions = Promise.resolve().then(async () => {
      try {
        update(await plugin.showPrivacyOptions());
      } catch {
        update({ message: "広告のプライバシー設定を開けませんでした。時間をおいてお試しください。" });
      }
    }).finally(() => {
      privacyOptions = undefined;
      update({ privacyOptionsOpen: false });
    });
    return privacyOptions;
  }

  return {
    initialize,
    showInterstitial,
    showPrivacyOptions,
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}
