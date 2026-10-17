/// <reference types="vite-plugin-pwa/react" />
import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaUpdate() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW: (_, registered) => setRegistration(registered),
    onRegisterError: () => setMessage("更新の準備ができませんでした。オンラインで開き直してください。"),
  });

  async function checkUpdate() {
    if (!registration) return;
    setChecking(true);
    setMessage("");
    try {
      await registration.update();
      setMessage("更新を確認しました。新版の取得が完了すると通知します。");
    } catch {
      setMessage("更新を確認できませんでした。通信状態を確認してください。");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (!registration) return;
    const check = () => {
      if (document.visibilityState === "visible") {
        void registration.update().catch(() => {
          setMessage("更新を確認できませんでした。通信状態を確認してください。");
        });
      }
    };
    check();
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [registration]);

  if (!registration && !message) return null;
  return (
    <aside className={needRefresh ? "pwa-update pwa-update-ready" : "pwa-update"} aria-label="アプリの更新">
      {needRefresh ? (
        <>
          <p role="status"><strong>新しいバージョンがあります</strong></p>
          <p>更新すると途中の練習は初期化されます。</p>
          <button className="primary-button" onClick={() => {
            void updateServiceWorker(true).catch(() => setMessage("更新できませんでした。オンラインで再度お試しください。"));
          }}>更新する</button>
        </>
      ) : (
        <button disabled={!registration || checking} onClick={() => void checkUpdate()}>
          {checking ? "確認中…" : "更新を確認"}
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </aside>
  );
}
