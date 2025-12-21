import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

// Custom Select Component
interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  className = "",
  placeholder = "Select option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value || "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const selectedOption = options.find((o) => o.value === internalValue);

  return (
    <div
      className={cn("flex flex-col gap-2 w-full", className)}
      ref={wrapperRef}
    >
      {label && (
        <label className="text-sm font-medium leading-none text-slate-900">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
        >
          <span className={!selectedOption ? "text-slate-500" : ""}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 opacity-50 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-900 shadow-md animate-in fade-in zoom-in-95">
            {options.map((opt) => (
              <div
                key={opt.value}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  internalValue === opt.value && "bg-slate-100 font-medium"
                )}
                onClick={() => {
                  setInternalValue(opt.value);
                  onChange?.(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
                {internalValue === opt.value && (
                  <Check className="ml-auto h-4 w-4 text-slate-900" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
