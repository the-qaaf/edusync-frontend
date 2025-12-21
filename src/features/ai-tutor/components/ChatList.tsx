import React, { memo, useState, useEffect } from "react";
import { GraduationCap, ArrowDown } from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import { ChatMessage } from "../services/llm";

interface ChatListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activeSessionId: string | null;
  onUpdateFeedback: (index: number, type: "like" | "dislike") => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatList = memo(
  ({
    messages,
    isLoading,
    activeSessionId,
    onUpdateFeedback,
    messagesEndRef,
  }: ChatListProps) => {
    const [showScrollButton, setShowScrollButton] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setShowScrollButton(!entry.isIntersecting);
        },
        {
          root: null,
          threshold: 0.2,
          rootMargin: "400px",
        }
      );

      if (messagesEndRef.current) {
        observer.observe(messagesEndRef.current);
      }

      return () => observer.disconnect();
    }, [messagesEndRef]);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
      <div className="max-w-3xl mx-auto flex flex-col min-h-full relative">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <GraduationCap size={48} className="mb-4 opacity-50" />
            <p>Start asking questions...</p>
          </div>
        )}

        {messages
          .filter((m) => m.role !== "system")
          .map((msg, idx) => {
            // Re-calculate original index to match data
            const originalIndex = messages.findIndex((m) => m === msg);

            return (
              <ChatBubble
                key={idx}
                role={msg.role as "user" | "assistant"}
                content={msg.content}
                image={msg.image}
                onFeedback={(type) => {
                  if (activeSessionId && originalIndex !== -1) {
                    onUpdateFeedback(originalIndex, type);
                  }
                }}
              />
            );
          })}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <ChatBubble role="assistant" content="......" isThinking={true} />
        )}
        <div ref={messagesEndRef} />

        {/* Scroll To Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-32 right-6 md:right-12 p-3 bg-white text-blue-600 rounded-full shadow-lg border border-blue-100 hover:bg-blue-50 transition-all z-20 animate-in fade-in zoom-in duration-200"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={20} />
          </button>
        )}
      </div>
    );
  }
);

ChatList.displayName = "ChatList";
