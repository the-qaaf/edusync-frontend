import React from "react";
import { cn } from "@/shared/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary:
      "bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 border border-transparent",
    secondary:
      "bg-white text-slate-900 shadow-sm border border-slate-200 hover:bg-slate-100 hover:text-slate-900",
    outline:
      "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900",
    destructive:
      "bg-red-600 text-slate-50 shadow-sm hover:bg-red-600/90 border border-transparent",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 py-2",
    lg: "h-10 px-8",
    icon: "h-9 w-9",
  };

  const appliedVariant =
    variant === "secondary"
      ? variants.secondary
      : variants[variant] || variants.primary;

  return (
    <button
      className={cn(baseStyle, appliedVariant, sizes[size], className)}
      {...props}
    />
  );
};
