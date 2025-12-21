import React, { useRef, useEffect } from "react";
import { Send, Mic, MicOff, Image as ImageIcon } from "lucide-react";
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
  hasImageOrInput: boolean; // Controls send button state
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
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
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
    <div className="relative group py-2 shadow-lg rounded-2xl bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      <div className="flex items-end pl-28 pr-14">
        <div className="flex-1 min-h-[20px] max-h-[200px] py-1">
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent pt-2 border-none p-0 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 resize-none overflow-y-auto leading-relaxed"
            placeholder={isRecognizing ? "Scanning image..." : "Ask a doubt..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            style={{ height: "auto" }}
          />
        </div>
      </div>

      {/* Mic & Image Buttons - Pushed left */}
      <div className="absolute left-2 bottom-2 flex gap-0.5 items-center">
        <button
          onClick={onToggleListening}
          className={twMerge(
            "aspect-square rounded-xl flex items-center justify-center transition-all w-10 h-10",
            isListening
              ? "bg-red-100 text-red-600 animate-pulse"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          )}
          disabled={isLoading}
          title="Speak"
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square rounded-xl flex items-center justify-center transition-all w-10 h-10 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
          disabled={isLoading}
          title="Attach Image"
        >
          <ImageIcon size={20} />
        </button>
      </div>

      <button
        onClick={() => onSend()}
        disabled={isLoading || !hasImageOrInput}
        className={twMerge(
          "absolute right-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all w-10 h-10",
          hasImageOrInput && !isLoading
            ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        <Send size={20} />
      </button>
    </div>
  );
};
