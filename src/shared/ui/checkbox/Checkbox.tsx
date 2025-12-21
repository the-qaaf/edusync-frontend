import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className = "",
  ...props
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-slate-900 checked:border-slate-900 focus:outline-none transition-all cursor-pointer",
            className
          )}
          {...props}
        />
        <Check
          size={12}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
        />
      </div>
      {label && (
        <span className="text-sm text-slate-600 group-hover:text-slate-900 select-none">
          {label}
        </span>
      )}
    </label>
  );
};
