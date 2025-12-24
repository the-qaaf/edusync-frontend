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
  usePageTitle("Lumina");
  const { schoolId } = useParams({ from: "/ai-tutor/$schoolId" });

  const {
    settings,
    sessions,
    activeSessionId,
    setActiveSessionId,
    input,
    setInput,
    isLoading,
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
  }, [isLoading, imagePreview, messages.length]);

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

  if (!schoolId || (!settings && !isLoading && !sessions.length)) {
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

  // --- Main Render ---

  return (
    <div className="flex h-screen bg-[#F0F4F8] font-sans antialiased text-slate-900 overflow-hidden">
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
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-[#F8FAFC]">
        {/* Decorative background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Minimal Header */}
        <header className="z-10 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-white hover:shadow rounded-xl transition-all"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-bold text-slate-800 text-lg leading-tight tracking-tight break-words line-clamp-2 md:line-clamp-none">
                  {activeSessionTitle || "New Conversation"}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-3 mr-1">
              Powered by Google
            </span>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 z-10 overflow-y-auto px-4 sm:px-8 py-6 scroll-smooth">
          <ChatList
            messages={messages}
            isLoading={isLoading}
            activeSessionId={activeSessionId}
            onUpdateFeedback={updateFeedback}
            messagesEndRef={messagesEndRef}
          />
        </main>

        {/* Input Area */}
        <footer className="z-20 p-4 sm:p-6 mb-2">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Quick Prompts */}
            {messages.length < 3 && !isLoading && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mask-fade-right justify-center">
                <QuickPrompt
                  icon={BookOpen}
                  text="Summarize this topic"
                  onClick={() =>
                    handleSend(
                      "Can you provide a concise summary of this topic?"
                    )
                  }
                />
                <QuickPrompt
                  icon={GraduationCap}
                  text="Practice Question"
                  onClick={() =>
                    handleSend(
                      "Give me a challenging practice question on this subject."
                    )
                  }
                />
                <QuickPrompt
                  icon={Sparkles}
                  text="Create Study Plan"
                  onClick={() =>
                    handleSend(
                      "Create a structured study plan for this week for me."
                    )
                  }
                />
                <QuickPrompt
                  icon={HelpCircle}
                  text="Explain like I'm 5"
                  onClick={() =>
                    handleSend(
                      "Explain this concept simply, as if I were 5 years old."
                    )
                  }
                />
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-4 inline-block animate-in fade-in slide-in-from-bottom-2">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg max-w-[180px]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-40 object-cover bg-white"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {isRecognizing && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold backdrop-blur-sm bg-black/30">
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Scanning...
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 shadow-md border border-slate-100 transition-colors"
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

            <p className="text-center text-[11px] text-slate-400 font-medium">
              Lumina can make mistakes. Verify important information.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AITutorPage;
