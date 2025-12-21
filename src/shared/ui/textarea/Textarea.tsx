import React from "react";
import { cn } from "@/shared/utils/cn";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}
export const Textarea: React.FC<TextareaProps> = ({
  label,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium leading-none text-slate-900">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 resize-none",
          className
        )}
        {...props}
      />
    </div>
  );
};
