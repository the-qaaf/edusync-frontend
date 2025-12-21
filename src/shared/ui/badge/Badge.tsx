import React from "react";
import { cn } from "@/shared/utils/cn";

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "success" | "warning" | "neutral" | "error";
}> = ({ children, variant = "neutral" }) => {
  const styles = {
    success: "border-transparent bg-green-50 text-green-700 hover:bg-green-100",
    warning: "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100",
    error: "border-transparent bg-red-50 text-red-700 hover:bg-red-100",
    neutral:
      "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        styles[variant]
      )}
    >
      {children}
    </div>
  );
};
