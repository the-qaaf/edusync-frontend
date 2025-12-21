import { useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Menu,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useParams } from "@tanstack/react-router";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

// Hooks & Services
import { useAITutor } from "./hooks/useAITutor";

// Components
import { Sidebar } from "./components/Sidebar";
import { ChatList } from "./components/ChatList";
import { QuickPrompt } from "./components/QuickPrompt";
import { InputArea } from "./components/InputArea";

export const AITutorPage = () => {
  usePageTitle("AI Tutor");
  const { schoolId } = useParams({ from: "/ai-tutor/$schoolId" });

  const {
    settings,
    sessions,
    activeSessionId,
    setActiveSessionId,
    input,
    setInput,
    isLoading,
    initProgress,
    isReady,
    isSidebarOpen,
    setIsSidebarOpen,
    isListening,
    imageFile,
    imagePreview,
    isRecognizing,
    fileInputRef,
    toggleListening,
    handleFileSelect,
    handleRemoveImage,
    createNewSession,
    deleteSession,
    handleSend,
    updateFeedback,
    messages,
  } = useAITutor(schoolId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isLoading, imagePreview]);

  // Handlers for child components
  const handleSidebarClose = useCallback(
    () => setIsSidebarOpen(false),
    [setIsSidebarOpen]
  );
  const handleSessionSelect = useCallback(
    (id: string) => {
      setActiveSessionId(id);
      setIsSidebarOpen(false);
    },
    [setActiveSessionId, setIsSidebarOpen]
  );

  const activeSessionTitle = sessions.find(
    (s) => s.id === activeSessionId
  )?.title;

  // --- Render Loading/Error ---

  if (!schoolId || (!settings && !isLoading && isReady)) {
    if (!schoolId) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-sm w-full border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-sm ring-4 ring-red-50/50">
              <AlertCircle size={32} strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
              Link Invalid
            </h2>
          </div>
        </div>
      );
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 animate-pulse">
            <Sparkles size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Setting up your Tutor
          </h2>
          <p className="text-gray-500 mb-6">
            We're downloading the AI brain to your device. This happens only
            once!
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3"></div>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            {initProgress || "Initializing..."}
          </p>
        </div>
      </div>
    );
  }

  // --- Main Render ---

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-gray-900 overflow-hidden">
      <Sidebar
        settings={settings}
        sessions={sessions}
        activeSessionId={activeSessionId}
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={handleSidebarClose}
        onSelectSession={handleSessionSelect}
        onCreateSession={createNewSession}
        onDeleteSession={deleteSession}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#F8FAFC]">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100/50 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col">
              <h2 className="font-bold text-gray-900 text-lg leading-tight tracking-tight flex items-center gap-2">
                {activeSessionTitle || "New Session"}
              </h2>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5 mt-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                  <GraduationCap size={12} />
                  Universal AI Tutor
                </span>
                <span>•</span>
                <span>
                  {messages.filter((m) => m.role === "user").length} questions
                  asked
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              <span className="text-xs font-semibold text-gray-600">
                Model Active
              </span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
          <ChatList
            messages={messages}
            isLoading={isLoading}
            activeSessionId={activeSessionId}
            onUpdateFeedback={updateFeedback}
            messagesEndRef={messagesEndRef}
          />
        </main>

        {/* Input Area */}
        <footer className="p-4 sm:p-6 sticky bottom-0 z-10">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Quick Prompts */}
            {messages.length < 3 && !isLoading && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
                <QuickPrompt
                  icon={BookOpen}
                  text="Explain topic"
                  onClick={() =>
                    handleSend("Can you explain this topic simply?")
                  }
                />
                <QuickPrompt
                  icon={HelpCircle}
                  text="Quiz me"
                  onClick={() =>
                    handleSend("Ask me a question to test my knowledge.")
                  }
                />
                <QuickPrompt
                  icon={Sparkles}
                  text="Check answer"
                  onClick={() =>
                    handleSend(
                      "Is my answer correct? 'The sun rises in the east.'"
                    )
                  }
                />
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-2 inline-block">
                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-[150px]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-32 object-cover bg-white"
                  />
                  {isRecognizing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                      <Loader2 size={16} className="animate-spin mr-1" />
                      Scanning...
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-white text-gray-500 hover:text-red-500 rounded-full p-1 shadow-md border border-gray-100 transition-colors"
                  disabled={isLoading}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input Box */}
            <InputArea
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              isRecognizing={isRecognizing}
              isListening={isListening}
              onSend={() => handleSend()}
              onToggleListening={toggleListening}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              hasImageOrInput={!!input.trim() || !!imageFile}
            />

            <p className="text-center text-[10px] text-gray-400 mt-2">
              AI can make mistakes. Check important info.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-[10px] text-yellow-800 text-center mx-auto max-w-md">
              <span className="font-semibold">Performance Note:</span> For the
              fastest experience, we recommend using a Laptop or PC. This runs
              fully on your device, so generation might be slower on older
              mobile phones.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AITutorPage;
