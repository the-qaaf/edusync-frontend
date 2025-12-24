import React, { useRef, useEffect } from "react";
import {
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isRecognizing: boolean;
  isListening: boolean;
  onSend: () => void;
  onToggleListening: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasImageOrInput: boolean;
}

export const InputArea = ({
  input,
  setInput,
  isLoading,
  isRecognizing,
  isListening,
  onSend,
  onToggleListening,
  fileInputRef,
  handleFileSelect,
  hasImageOrInput,
}: InputAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isListening) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Floating Modern Container */}
      <div
        className={twMerge(
          "relative bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-3xl transition-all duration-300 ease-out p-1.5 pl-4",
          "focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50/50",
          isLoading && "opacity-70 pointer-events-none"
        )}
      >
        <div className="flex items-end gap-3 min-h-[52px]">
          {/* Main Input Area */}
          <div className="flex-1 py-3.5">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none p-0 text-[15px] relative top-1 leading-relaxed text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 resize-none overflow-y-auto max-h-[180px]"
              placeholder={
                isRecognizing
                  ? "Wait, analyzing image..."
                  : "Ask your question..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
          </div>

          {/* Actions Cluster */}
          <div className="flex items-center gap-1.5 pb-1.5 pr-1.5">
            {/* Image Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
              title="Attach Image"
            >
              <Paperclip
                size={18}
                className="group-hover:stroke-[2.5px] transition-all"
              />
            </button>

            {/* Voice Input */}
            <button
              onClick={onToggleListening}
              className={twMerge(
                "flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300",
                isListening
                  ? "bg-red-50 text-red-500 ring-2 ring-red-100 ring-offset-1 animate-pulse"
                  : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              )}
              title={isListening ? "Stop Listening" : "Start Speaking"}
            >
              {isListening ? (
                <div className="relative flex items-center justify-center">
                  <span className="w-full h-full absolute rounded-full bg-red-400 opacity-20 animate-ping"></span>
                  <MicOff size={18} />
                </div>
              ) : (
                <Mic size={18} />
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 mx-0.5"></div>

            {/* Send Button */}
            <button
              onClick={() => onSend()}
              disabled={isLoading || !hasImageOrInput}
              className={twMerge(
                "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 transform",
                hasImageOrInput && !isLoading
                  ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.05] active:scale-[0.95]"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Sparkles
                  size={18}
                  className="animate-spin"
                  style={{ animationDuration: "2s" }}
                />
              ) : (
                <Send
                  size={18}
                  className={twMerge(
                    "transition-all",
                    hasImageOrInput && "ml-0.5"
                  )}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
