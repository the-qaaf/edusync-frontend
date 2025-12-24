import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Bot,
  User,
  Copy,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  image?: string;
  isThinking?: boolean;
  initialFeedback?: "like" | "dislike";
  onFeedback?: (type: "like" | "dislike") => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  content,
  image,
  isThinking,
  initialFeedback,
  onFeedback,
}) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | undefined>(
    initialFeedback
  );
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    setFeedback(initialFeedback);
  }, [initialFeedback]);

  // Cleanup speech on unmount
  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleFeedback = (type: "like" | "dislike") => {
    const newFeedback = feedback === type ? undefined : type;
    setFeedback(newFeedback);
    if (onFeedback && newFeedback) onFeedback(newFeedback);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Tutor Response",
          text: content,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleSpeak = () => {
    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = content
      .replace(/[*#`]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synth.speak(utterance);
    setIsPlaying(true);
  };

  if (isUser) {
    return (
      <div className="flex w-full mb-8 flex-row-reverse gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
          <User size={18} />
        </div>

        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[70%]">
          <div className="px-5 py-3.5 rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md">
            {image && (
              <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                <img
                  src={image}
                  alt="Upload"
                  className="max-w-full max-h-[200px] object-cover"
                />
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed text-[15px] selection:bg-white/30">
              {content}
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 mr-1">
            You
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full mb-8 flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 group">
      {/* AI Avatar */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-slate-100 shadow-sm bg-white text-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50/50"></div>
        <Bot size={20} className="relative z-10" />
      </div>

      <div className="flex flex-col items-start max-w-[90%] sm:max-w-[80%]">
        <div className="w-full px-6 py-5 rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] text-slate-800">
          {isThinking ? (
            <div className="flex gap-2 items-center h-6">
              <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="text-xs text-slate-400 ml-2 font-medium animate-pulse">
                Thinking...
              </span>
            </div>
          ) : (
            <div className="prose prose-slate prose-headings:font-semibold prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-900 max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="rounded-xl overflow-hidden my-4 shadow-sm border border-slate-200">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs text-slate-500 font-mono flex items-center justify-between">
                          <div className="flex item-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            </div>
                            <span className="ml-2">{match[1]}</span>
                          </div>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(String(children))
                            }
                            className="hover:text-blue-600 transition-colors"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <SyntaxHighlighter
                          {...props}
                          style={oneLight}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            fontSize: "0.9em",
                            padding: "1rem",
                          }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code
                        {...props}
                        className="rounded-md px-1.5 py-0.5 font-mono text-sm bg-slate-100 text-blue-700 border border-slate-200/50"
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isThinking && (
          <div className="flex items-center gap-2 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <span className="text-[10px] text-slate-400 font-medium mr-2 flex items-center gap-1">
              <Sparkles size={10} className="text-blue-500" /> Lumina
            </span>

            <div className="flex items-center bg-white border border-slate-100 rounded-full px-1 py-0.5 shadow-sm">
              <button
                onClick={handleSpeak}
                className={clsx(
                  "p-1.5 hover:bg-slate-50 rounded-full transition-colors",
                  isPlaying ? "text-blue-600" : "text-slate-400"
                )}
              >
                {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <div className="w-px h-3 bg-slate-200 mx-1"></div>
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
              <div className="w-px h-3 bg-slate-200 mx-1"></div>
              <button
                onClick={() => handleFeedback("like")}
                className={clsx(
                  "p-1.5 hover:bg-slate-50 rounded-full transition-colors",
                  feedback === "like" ? "text-emerald-500" : "text-slate-400"
                )}
              >
                <ThumbsUp size={14} />
              </button>
              <button
                onClick={() => handleFeedback("dislike")}
                className={clsx(
                  "p-1.5 hover:bg-slate-50 rounded-full transition-colors",
                  feedback === "dislike" ? "text-red-500" : "text-slate-400"
                )}
              >
                <ThumbsDown size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
