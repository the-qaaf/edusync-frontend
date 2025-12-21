import React, { memo } from "react";
import { MessageSquare, Plus, Sparkles, Trash2 } from "lucide-react";
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
  }: SidebarProps) => (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={onCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={twMerge(
          "fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col shadow-xl md:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                className="w-10 h-10 rounded-lg object-contain bg-white shadow-md shadow-slate-200 border border-slate-100"
                alt="Logo"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                <Sparkles size={18} fill="currentColor" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900 tracking-tight leading-none truncate max-w-[160px]">
                {settings?.schoolName || "Scholr"}
              </span>
              <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">
                powered by EduSync
              </span>
            </div>
          </div>
          <button
            onClick={onCreateSession}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition-all font-medium text-sm shadow-sm hover:shadow active:scale-[0.98]"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Recent Chats
          </div>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={twMerge(
                "group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all",
                activeSessionId === session.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <MessageSquare
                size={18}
                className={
                  activeSessionId === session.id
                    ? "text-blue-600"
                    : "text-gray-400"
                }
              />
              <div className="flex-1 truncate text-sm font-medium">
                {session.title}
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => onDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200"></div>
      </aside>
    </>
  )
);

Sidebar.displayName = "Sidebar";
