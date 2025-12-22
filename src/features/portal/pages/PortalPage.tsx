import React, { useEffect, useState } from "react";
import {
  BookOpen,
  User,
  Calendar,
  Bell,
  ShieldAlert,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { usePortal } from "../hooks/usePortal";
import { StudentSelector } from "../components/StudentSelector";
import { Button } from "@/shared/ui";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

import { useParams } from "@tanstack/react-router";

const PortalPage: React.FC = () => {
  usePageTitle("Parent Portal");
  const { schoolId } = useParams({ from: "/portal/$schoolId" });

  const {
    loading,
    students,
    selectedStudent,
    setSelectedStudent,
    dailyUpdates,
    broadcasts,
    phone,
  } = usePortal(schoolId);

  const [config, setConfig] = useState<{
    whatsappNumber: string;
    welcomeMessage: string;
    schoolName: string;
  } | null>({
    whatsappNumber: "918833027815",
    welcomeMessage:
      "Welcome to the Parent Portal. Check here for daily updates and alerts.",
    schoolName: "EduSync",
  });

  const handleWhatsAppRedirect = () => {
    if (!config?.whatsappNumber) return;
    window.open(`https://wa.me/${config.whatsappNumber}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Loading your portal...
          </p>
        </div>
      </div>
    );
  }

  // Access Denied State
  if (!students.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Access Restricted
        </h1>
        <p className="text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
          We couldn't find any student profiles linked to this phone number.
        </p>
        {phone && (
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-600 shadow-sm">
            {phone}
          </div>
        )}
        <div className="mt-8">
          <Button variant="outline" onClick={handleWhatsAppRedirect}>
            Contact Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-100">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
              E
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight leading-tight">
                {config?.schoolName || "EduSync"}
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Parent Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {students.length > 1 && (
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-full transition-all duration-200"
                title="Switch Student"
              >
                <MoreHorizontal size={20} />
              </button>
            )}
            {selectedStudent && (
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm">
                <User size={16} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Welcome Section */}
        {selectedStudent && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-white rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5 border border-white/50 overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Live Updates
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
                    Hi, Parent
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Here is{" "}
                    <span className="text-indigo-600 font-semibold">
                      {selectedStudent.name.split(" ")[0]}'s
                    </span>{" "}
                    activity for today.
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-semibold text-slate-600 bg-slate-50/80 p-2 rounded-2xl backdrop-blur-sm md:bg-transparent md:p-0">
                  <div className="px-3 py-2 bg-white md:bg-slate-50 rounded-xl border border-slate-100 shadow-sm flex-1 text-center min-w-[90px]">
                    <span className="block text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">
                      Class
                    </span>
                    {selectedStudent.class}-{selectedStudent.section}
                  </div>
                  <div className="px-3 py-2 bg-white md:bg-slate-50 rounded-xl border border-slate-100 shadow-sm flex-1 text-center min-w-[90px]">
                    <span className="block text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">
                      Roll No
                    </span>
                    {selectedStudent.rollNumber}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message from School Banner */}
        {config?.welcomeMessage && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 text-amber-900 items-start shadow-sm shadow-amber-900/5">
            <div className="bg-amber-100 p-2 rounded-full shrink-0">
              <Bell size={16} className="text-amber-600" />
            </div>
            <div className="text-sm leading-relaxed">
              <strong className="block font-bold text-amber-800 mb-0.5">
                Note from School
              </strong>
              {config.welcomeMessage}
            </div>
          </div>
        )}

        {/* Content Tabs / Sections */}
        <div className="space-y-6">
          {/* Alerts Section */}
          {broadcasts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 px-1 mb-3">
                <div className="w-1 h-5 bg-red-400 rounded-full"></div>
                <h3 className="font-bold text-slate-800 text-lg">Key Alerts</h3>
              </div>
              <div className="space-y-3">
                {broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          b.template === "EMERGENCY"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {b.template || "Notice"}
                      </span>
                      <span className="text-xs text-slate-400 tabular-nums font-medium">
                        {new Date(b.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {b.message}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Homework Section */}
          <section>
            <div className="flex items-center gap-2 px-1 mb-3">
              <div className="w-1 h-5 bg-indigo-400 rounded-full"></div>
              <h3 className="font-bold text-slate-800 text-lg">
                Homework & Classwork
              </h3>
            </div>

            {dailyUpdates.length === 0 ? (
              <div className="bg-white border text-center border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                  <Calendar size={24} />
                </div>
                <h4 className="text-slate-900 font-semibold mb-1">
                  All Caught Up!
                </h4>
                <p className="text-slate-500 text-sm">
                  No homework posted for today yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {dailyUpdates.map((update, idx) => (
                  <div
                    key={update.id}
                    className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-indigo-900/5 transition-all duration-300"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner">
                            {update.subject.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">
                              {update.subject}
                            </h4>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                              By {update.teacherName}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          {new Date(update.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100/80">
                        <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 break-words">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {update.homework}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {update.notes && (
                        <div className="mt-3 flex gap-2 items-center justify-start bg-yellow-50/50 p-2.5 rounded-lg">
                          <span className="text-yellow-500 shrink-0">ℹ️</span>
                          <div className="text-xs text-slate-600 font-medium leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 break-words">
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                              {update.notes}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Floating Action Button for WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50 animate-in zoom-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-backwards">
        <button
          onClick={handleWhatsAppRedirect}
          className="group flex items-center gap-0 overflow-hidden hover:gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:pr-6"
        >
          <MessageCircle size={26} className="fill-white" />
          <span className="w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300 font-bold whitespace-nowrap overflow-hidden">
            Chat / Support
          </span>
        </button>
      </div>

      {/* Student Selector Drawer */}
      <StudentSelector
        students={students}
        isOpen={students.length > 1 && !selectedStudent}
        onSelect={setSelectedStudent}
      />
    </div>
  );
};

export default PortalPage;
