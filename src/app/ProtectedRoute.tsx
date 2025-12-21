import React from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { School } from "lucide-react";
import Layout from "@/shared/components/Layout";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, schoolId } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <School className="animate-pulse" size={48} />
          <p className="text-sm font-medium">Loading SchoolConnect...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but no schoolId, it means onboarding isn't complete (or failed)
  // Redirect to onboarding to force setup.
  if (!schoolId) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Layout />;
};
