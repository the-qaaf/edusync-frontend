import React from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/react";
import { AuthProvider } from "@/features/auth/AuthContext";
import { SchoolSettingsProvider } from "@/features/settings/SchoolSettingsContext";
import { routeTree } from "./routes";

const router = createRouter({
  routeTree,
} as any);

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SchoolSettingsProvider>
        <NuqsAdapter>
          <RouterProvider router={router} />
        </NuqsAdapter>
      </SchoolSettingsProvider>
    </AuthProvider>
  );
};

export default App;
