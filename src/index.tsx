import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./shared/query-client";

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
