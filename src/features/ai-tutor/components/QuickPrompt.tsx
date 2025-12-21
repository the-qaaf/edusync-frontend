import React, { memo } from "react";

interface QuickPromptProps {
  icon: any;
  text: string;
  onClick: () => void;
}

export const QuickPrompt = memo(
  ({ icon: Icon, text, onClick }: QuickPromptProps) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm whitespace-nowrap"
    >
      <Icon size={16} />
      {text}
    </button>
  )
);

QuickPrompt.displayName = "QuickPrompt";
