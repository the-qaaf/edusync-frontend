import {
  createRootRoute,
  createRoute,
  Outlet,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { ToastProvider } from "@/shared/ui/Toast";
import Login from "@/features/auth/Login";
import { useAuth } from "@/features/auth/AuthContext";
import { Overview } from "@/features/overview";
import StudentsPage from "@/features/students/pages/StudentsPage";
import { Reports } from "@/features/reports";
import { Broadcast } from "@/features/broadcast";
import { Settings } from "@/features/settings";
import { DailyUpdates } from "@/features/daily-updates";
import { TeacherSubmission } from "@/features/teacher-submission";
import { ProtectedRoute } from "./ProtectedRoute";
import { Onboarding } from "@/features/onboarding";
import React from "react";

import { LandingPage } from "@/features/landing";
import PrivacyPolicy from "@/features/legal/PrivacyPolicy";
import TermsAndConditions from "@/features/legal/TermsAndConditions";
import { Loader2 } from "lucide-react";

export const rootRoute = createRootRoute({
  component: () => (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  ),
});

// Public Routes
export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  loader: async ({ context }: { context: any }) => {
    const token = localStorage.getItem("firebaseToken");
    if (token) {
    }
  },
  component: () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
      if (!isLoading && isAuthenticated) {
        navigate({ to: "/overview" });
      }
    }, [isAuthenticated, isLoading, navigate]);

    if (isAuthenticated || isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      );
    }
    return <LandingPage />;
  },
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

export const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: Onboarding,
});

export const submissionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/submission/$schoolId",
  component: TeacherSubmission,
});

export const aiTutorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-tutor/$schoolId",
  // Lazy load to avoid loading web-llm bundle on main pages
  component: React.lazy(() => import("@/features/ai-tutor")),
});

export const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy-policy",
  component: PrivacyPolicy,
});

export const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms-and-conditions",
  component: TermsAndConditions,
});

// Protected Dashboard Layout Route
export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard",
  component: ProtectedRoute,
});

// Protected Child Routes
export const overviewPage = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/overview",
  component: Overview,
});

export const studentsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/students",
  component: StudentsPage,
});

export const dailyUpdatesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/daily-updates",
  component: DailyUpdates,
});

// export const reportsRoute = createRoute({
//   getParentRoute: () => dashboardRoute,
//   path: "/reports",
//   component: Reports,
// });

export const broadcastRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/broadcast",
  component: Broadcast,
});

export const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/settings",
  component: Settings,
});

// Build Route Tree
export const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  onboardingRoute,
  submissionRoute,
  aiTutorRoute,

  privacyPolicyRoute,
  termsRoute,
  dashboardRoute.addChildren([
    overviewPage,
    studentsRoute,
    dailyUpdatesRoute,
    // reportsRoute,
    broadcastRoute,
    settingsRoute,
  ]),
]);
