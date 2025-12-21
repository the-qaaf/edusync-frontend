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
      // Fallback or toast could go here
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

    // Basic markdown cleanup (strip *, #, [, ])
    const textToSpeak = content
      .replace(/[*#`]/g, "") // Remove common markdown symbols
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links: [text](url) -> text
      .trim();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synth.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div
      className={twMerge(
        "flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2 gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Icon */}
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm mt-1",
          isUser
            ? "bg-indigo-100 text-indigo-600 border-indigo-200"
            : "bg-emerald-100 text-emerald-600 border-emerald-200"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div
        className={clsx(
          "flex flex-col max-w-[85%] sm:max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={twMerge(
            "w-full px-5 py-4 rounded-2xl text-base leading-relaxed shadow-sm overflow-hidden border",
            isUser
              ? "bg-white border-indigo-100 text-slate-800 rounded-tr-none"
              : "bg-white border-gray-100 text-slate-800 rounded-tl-none"
          )}
        >
          {isThinking ? (
            <div className="flex gap-1 items-center h-6">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {image && (
                <img
                  src={image}
                  alt="Uploaded content"
                  className="max-w-full rounded-lg border border-gray-200 shadow-sm max-h-[300px] object-contain bg-gray-50"
                />
              )}
              <div
                className={clsx(
                  "prose prose-sm max-w-none break-words",
                  // Use standard prose-slate for both to ensure black/dark-gray text
                  "prose-slate dark:prose-invert"
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <div className="rounded-md overflow-hidden my-2 shadow-sm border border-gray-200">
                          <div className="bg-gray-50 px-3 py-1 border-b border-gray-200 text-xs text-gray-500 font-mono">
                            {match[1]}
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            style={oneLight}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: 0,
                              fontSize: "0.85em",
                            }}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code
                          {...props}
                          className={clsx(
                            "rounded px-1.5 py-0.5 font-mono text-sm bg-gray-100 text-pink-600"
                          )}
                        >
                          {children}
                        </code>
                      );
                    },
                    // Enhance typography for educational content
                    strong: ({ children }) => (
                      <strong className="font-bold text-indigo-700 dark:text-indigo-400">
                        {children}
                      </strong>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
                      >
                        {children}
                      </a>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 space-y-1 my-2 text-slate-700">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 space-y-1 my-2 text-slate-700">
                        {children}
                      </ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-indigo-200 pl-4 py-1 italic text-slate-600 my-2 bg-slate-50 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3 border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-gray-50">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 border-t border-gray-100 text-slate-600">
                        {children}
                      </td>
                    ),
                    p: ({ children }) => (
                      <p className="text-slate-800 mb-2 last:mb-0 leading-7">
                        {children}
                      </p>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Visible on Group Hover */}
        {!isThinking && !isUser && (
          <div
            className={clsx(
              "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            <button
              onClick={handleSpeak}
              className={clsx(
                "p-1.5 hover:bg-gray-100 rounded-md transition-colors",
                isPlaying
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-400 hover:text-gray-600"
              )}
              title={isPlaying ? "Stop Speaking" : "Read Aloud"}
            >
              {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <div className="w-px h-3 bg-gray-200 mx-1"></div>

            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Copy"
            >
              {copied ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>

            {!isUser && (
              <>
                <button
                  onClick={handleShare}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Share"
                >
                  <Share2 size={14} />
                </button>
                <div className="w-px h-3 bg-gray-200 mx-1"></div>
                <button
                  onClick={() => handleFeedback("like")}
                  className={clsx(
                    "p-1.5 hover:bg-gray-100 rounded-md transition-colors",
                    feedback === "like"
                      ? "text-green-500"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  onClick={() => handleFeedback("dislike")}
                  className={clsx(
                    "p-1.5 hover:bg-gray-100 rounded-md transition-colors",
                    feedback === "dislike"
                      ? "text-red-500"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <ThumbsDown size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
