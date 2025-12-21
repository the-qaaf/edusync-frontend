import React from "react";
import { Student } from "@/types";
import { User, ChevronRight, School, GraduationCap } from "lucide-react";

interface StudentSelectorProps {
  students: Student[];
  isOpen: boolean;
  onSelect: (student: Student) => void;
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({
  students,
  isOpen,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm shadow-inner box-border border border-white/30 text-white">
              <School size={24} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Select Child
            </h2>
            <p className="text-blue-100 text-sm mt-1 font-medium">
              We found multiple profiles linked to you.
            </p>
          </div>
        </div>

        {/* List Section */}
        <div className="p-4 bg-slate-50/50 max-h-[60vh] overflow-y-auto space-y-3">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => onSelect(student)}
              className="w-full group relative bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 hover:-translate-y-0.5 transition-all duration-200 text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-colors shadow-inner">
                <User size={20} className="stroke-[2.5]" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-base truncate pr-2 group-hover:text-blue-700 transition-colors">
                  {student.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                    Class {student.class}-{student.section}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap size={12} />
                    {student.rollNumber}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Tap a profile to view dashboard
          </p>
        </div>
      </div>
    </div>
  );
};
