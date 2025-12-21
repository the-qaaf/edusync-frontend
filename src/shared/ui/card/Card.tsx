import React from "react";
import { cn } from "@/shared/utils/cn";

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}> = ({ children, className = "", title, action }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm",
        className
      )}
    >
      {(title || action) && (
        <div className="flex flex-col space-y-1.5 p-6 pb-4 border-b border-slate-100/50">
          <div className="flex justify-between items-center">
            {title && (
              <h3 className="font-semibold leading-none tracking-tight text-slate-900">
                {title}
              </h3>
            )}
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
