import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.js";
import { AppProvider } from "./store.js";

// BlockNote editor styles — imported before styles.css so the Helix token
// overrides (.bn-*) in styles.css win the cascade.
import "@blocknote/mantine/style.css";
import "@blocknote/mantine/blocknoteStyles.css";

import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <App />
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>,
);
