import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PwaUpdate } from "./PwaUpdate";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <PwaUpdate />
  </StrictMode>,
);
