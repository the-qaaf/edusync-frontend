import React, { memo, useState } from "react";
import { MessageSquare, Plus, Sparkles, Trash2, X, Check } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface SidebarProps {
  settings: any;
  sessions: any[];
  activeSessionId: string | null;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
}

export const Sidebar = memo(
  ({
    settings,
    sessions,
    activeSessionId,
    isSidebarOpen,
    onCloseSidebar,
    onSelectSession,
    onCreateSession,
    onDeleteSession,
  }: SidebarProps) => {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setConfirmDeleteId(id);
    };

    const confirmDelete = (e: React.MouseEvent) => {
      if (confirmDeleteId) onDeleteSession(e, confirmDeleteId);
      setConfirmDeleteId(null);
    };

    const cancelDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmDeleteId(null);
    };

    return (
      <>
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={onCloseSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={twMerge(
            "fixed inset-y-0 left-0 w-[280px] bg-slate-50/80 backdrop-blur-xl border-r border-slate-200/60 z-50 transition-all duration-300 ease-[bezier(0.19,1,0.22,1)] md:static flex flex-col items-stretch",
            isSidebarOpen
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full md:translate-x-0 md:shadow-none"
          )}
        >
          {/* Header */}
          <div className="px-5 py-6 flex flex-col gap-6">
            <div className="flex items-center gap-3 select-none">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-xl"></div>
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    className="relative w-10 h-10 rounded-xl object-contain bg-white shadow-sm border border-slate-100"
                    alt="Logo"
                  />
                ) : (
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Sparkles size={20} className="text-white/90" />
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-800 tracking-tight leading-snug">
                  {settings?.schoolName || "Lumina"}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Personalized Learning
                </span>
              </div>
            </div>

            <button
              onClick={onCreateSession}
              className="group relative w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
              <Plus
                size={18}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="px-3 pb-2 pt-1 text-xs font-bold text-slate-400 uppercase tracking-wider select-none flex justify-between items-center">
              <span>History</span>
              <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                {sessions.length}
              </span>
            </div>

            <div className="space-y-1 mt-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (sessions.length > 1) {
                      handleDeleteClick(e, session.id);
                    }
                  }}
                  className={twMerge(
                    "group relative flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
                    activeSessionId === session.id
                      ? "bg-white border-slate-200 shadow-sm text-slate-900"
                      : "text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900"
                  )}
                >
                  <div
                    className={twMerge(
                      "w-1 h-5 bg-blue-600 absolute left-0 rounded-r-full transition-all duration-300 opacity-0 scale-y-50",
                      activeSessionId === session.id &&
                        "opacity-100 scale-y-100"
                    )}
                  />

                  <MessageSquare
                    size={18}
                    className={twMerge(
                      "transition-colors shrink-0",
                      activeSessionId === session.id
                        ? "text-blue-600"
                        : "text-slate-300 group-hover:text-slate-500"
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium leading-5">
                      {session.title}
                    </div>
                    <div className="truncate text-[10px] text-slate-400 font-normal">
                      {new Date(session.updatedAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>

                  {/* Delete Actions */}
                  {confirmDeleteId === session.id ? (
                    <div
                      className="flex items-center gap-1 animate-in fade-in zoom-in duration-200 absolute right-2 bg-white/90 backdrop-blur shadow-sm p-1 rounded-lg border border-red-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={confirmDelete}
                        className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    sessions.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteClick(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all absolute right-2"
                      >
                        <Trash2 size={15} />
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </>
    );
  }
);

Sidebar.displayName = "Sidebar";
