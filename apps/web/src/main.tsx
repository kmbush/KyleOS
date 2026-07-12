import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadConfig } from "./lib/config";
import { contentQuery } from "./lib/useContent";
import "./styles/theme.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root is missing from index.html");
const root = createRoot(container);

// content.json is served with max-age=60; align staleTime and skip retries so a
// boot failure surfaces immediately rather than after three attempts.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: false } },
});

// Boot gate (ADR-006, DESIGN §9): load runtime config, then prefetch the content
// document so the shell renders against a warm cache with no loading state
// (DESIGN §10). Either fetch failing shows an error instead of a broken OS.
loadConfig()
  .then(() => queryClient.ensureQueryData(contentQuery))
  .then(() =>
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </StrictMode>,
    ),
  )
  .catch((error: unknown) => {
    console.error(error);
    root.render(
      <StrictMode>
        <p style={{ padding: "2rem", fontFamily: "monospace" }}>
          KyleOS could not start: runtime data is unavailable.
        </p>
      </StrictMode>,
    );
  });
