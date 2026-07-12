import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadConfig } from "./lib/config";
import "./styles/theme.css";

// Config is fetched before the first paint (ADR-006). Nothing renders against a
// half-initialized app; Phases 3–4 (Cognito, the write API) read this config.
const container = document.getElementById("root");
if (!container) throw new Error("Root element #root is missing from index.html");
const root = createRoot(container);

loadConfig()
  .then(() =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
  .catch((error: unknown) => {
    console.error(error);
    root.render(
      <StrictMode>
        <p style={{ padding: "2rem", fontFamily: "monospace" }}>
          KyleOS could not start: runtime configuration is unavailable.
        </p>
      </StrictMode>,
    );
  });
