import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, MoreHorizontal, MoreVertical } from "lucide-react";

interface DropdownProps {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

interface DropdownItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  danger?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger || (
          <button className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500">
            <MoreVertical size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as any, {
                  onClick: (...args: any[]) => {
                    (child as any).props.onClick?.(...args);
                    setIsOpen(false);
                  },
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
  onClick,
  children,
  className = "",
  danger = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-700"
      } ${className}`}
      role="menuitem"
    >
      {children}
    </button>
  );
};
