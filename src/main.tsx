import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const PwaUpdate = __NANTEN_PLATFORM__ === "web"
  ? lazy(() => import("./PwaUpdate").then((module) => ({ default: module.PwaUpdate })))
  : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    {PwaUpdate && <Suspense fallback={null}><PwaUpdate /></Suspense>}
  </StrictMode>,
);
