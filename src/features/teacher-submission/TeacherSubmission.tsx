import React, { useState, useEffect } from "react";
import {
  School,
  Send,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Card, Button, Input, Select } from "@/shared/ui";
import { useToast } from "@/shared/ui/Toast";
import { Link, useParams } from "@tanstack/react-router";
import { useAddDailyUpdate } from "@/features/daily-updates/hooks/useDailyUpdatesQueries";
import { isFirebaseConfigured } from "@/services/firebase";
import { useAuth } from "@/features/auth/AuthContext";
import { ACADEMIC_CLASSES, ACADEMIC_SECTIONS } from "@/shared/constants";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useStudentsInfinite } from "@/features/students/hooks/useStudentQueries";
import { cn } from "@/shared/utils/cn";
import { Student } from "@/types";

const TeacherSubmission: React.FC = () => {
  usePageTitle("Teacher Submission");
  const { toast } = useToast();
  const { user, loginAnonymously, isLoading: authLoading } = useAuth();
  const { mutateAsync: submitUpdate, isPending: isSubmitting } =
    useAddDailyUpdate();

  // Get schoolId from URL parameters
  const params = useParams({ strict: false }) as { schoolId: string };
  const schoolId = params.schoolId;

  const [submitted, setSubmitted] = useState(false);
  const [isInit, setIsInit] = useState(true);
  const [activeTab, setActiveTab] = useState<"daily" | "remark">("daily");

  const [formData, setFormData] = useState({
    name: "",
    classGrade: "",
    section: "",
    subject: "",
    homework: "",
    notes: "",
  });

  // Remark State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [remarkContent, setRemarkContent] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Student Query
  const { data: studentsData, isLoading: isSearching } = useStudentsInfinite(
    schoolId,
    20,
    { search: debouncedSearch }
  );

  const flatStudents = studentsData?.pages.flatMap((p) => p.students) || [];

  // Ensure public access by signing in anonymously if not logged in
  useEffect(() => {
    const initAuth = async () => {
      if (!authLoading && !user && isFirebaseConfigured()) {
        try {
          await loginAnonymously();
        } catch (e) {
          console.error("Failed to sign in anonymously", e);
          toast("Connection error. Submission might fail.", "error");
        }
      }
      setIsInit(false);
    };
    initAuth();
  }, [user, authLoading, loginAnonymously, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      toast("School ID not found in URL. Cannot submit.", "error");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const baseUpdate = {
        teacherName: formData.name,
        subject: formData.subject,
        date: today,
      };

      let finalUpdate;

      if (activeTab === "daily") {
        if (!formData.classGrade || !formData.section) {
          toast("Please select Class and Section", "error");
          return;
        }
        finalUpdate = {
          ...baseUpdate,
          type: "homework" as const,
          classGrade: formData.classGrade,
          section: formData.section,
          homework: formData.homework,
          notes: formData.notes,
        };
      } else {
        if (!selectedStudent) {
          toast("Please select a student", "error");
          return;
        }
        finalUpdate = {
          ...baseUpdate,
          type: "remark" as const,
          studentName: selectedStudent.name,
          studentId: selectedStudent.id,
          classGrade: selectedStudent.class,
          section: selectedStudent.section,
          homework: "",
          notes: remarkContent,
        };
      }

      if (isFirebaseConfigured()) {
        await submitUpdate({
          schoolId,
          update: finalUpdate,
        });
      } else {
        // Mock delay
        await new Promise((r) => setTimeout(r, 1000));
      }

      setSubmitted(true);
      toast("Submitted successfully!", "success");
    } catch (error) {
      console.error(error);
      toast("Failed to submit update. Please try again.", "error");
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery(student.name);
    setIsSearchOpen(false);
  };

  if (authLoading || isInit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Submission Received
          </h2>
          <p className="text-slate-600 mb-8">
            Thank you! Your {activeTab === "daily" ? "daily log" : "remark"} has
            been recorded.
          </p>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSubmitted(false);
                setFormData((prev) => ({
                  ...prev,
                  homework: "",
                  notes: "",
                }));
                setRemarkContent("");
                setSelectedStudent(null);
                setSearchQuery("");
              }}
            >
              Submit Another
            </Button>
            <Link to="/login" className="block w-full">
              <Button variant="ghost" className="w-full">
                Back to Portal
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-sky-600 text-white rounded-lg flex items-center justify-center shadow-lg">
            <School size={24} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Teacher Submission Portal
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Greenfield Public School • Academic Year 2023-24
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-lg border-t-4 border-t-sky-600">
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setActiveTab("daily")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                activeTab === "daily"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Daily Class Log
            </button>
            <button
              onClick={() => setActiveTab("remark")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                activeTab === "remark"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Student Remark
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
              <Input
                label="Teacher Name"
                placeholder="e.g. Mrs. Sharma"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Subject"
                placeholder="e.g. Math, English"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>

            {activeTab === "daily" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Class"
                    placeholder="Select Class"
                    options={ACADEMIC_CLASSES.map((c) => ({
                      value: c,
                      label: c,
                    }))}
                    value={formData.classGrade}
                    onChange={(val) =>
                      setFormData({ ...formData, classGrade: val })
                    }
                  />
                  <Select
                    label="Section"
                    placeholder="Select Section"
                    options={ACADEMIC_SECTIONS.map((s) => ({
                      value: s,
                      label: s,
                    }))}
                    value={formData.section}
                    onChange={(val) =>
                      setFormData({ ...formData, section: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Homework / Assignment
                  </label>
                  <div className="bg-white">
                    <ReactQuill
                      theme="snow"
                      value={formData.homework}
                      onChange={(val) =>
                        setFormData({ ...formData, homework: val })
                      }
                      className="rounded-md"
                      placeholder="Describe the homework..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Class Notes / Remarks (Optional)
                  </label>
                  <div className="bg-white">
                    <ReactQuill
                      theme="snow"
                      value={formData.notes}
                      onChange={(val) =>
                        setFormData({ ...formData, notes: val })
                      }
                      className="rounded-md"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Auto Complete Student Search */}
                <div className="space-y-1.5 relative">
                  <label className="block text-sm font-medium text-slate-700">
                    Search Student
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Type name, class or section..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                    />
                    {isSearchOpen && searchQuery.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-slate-500 text-sm">
                            <Loader2 className="animate-spin inline mr-2 h-4 w-4" />{" "}
                            Searching...
                          </div>
                        ) : flatStudents.length === 0 ? (
                          <div className="p-4 text-center text-slate-500 text-sm">
                            No students found
                          </div>
                        ) : (
                          flatStudents.map((s) => (
                            <div
                              key={s.id}
                              className="px-4 py-2 hover:bg-sky-50 cursor-pointer border-b border-slate-100 last:border-0"
                              onClick={() => handleStudentSelect(s)}
                            >
                              <div className="font-semibold text-slate-900">
                                {s.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                Class {s.class} - {s.section} | Roll:{" "}
                                {s.rollNumber}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {selectedStudent && (
                    <div className="bg-sky-50 border border-sky-100 rounded-md p-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sky-800 text-sm">
                          {selectedStudent.name}
                        </p>
                        <p className="text-xs text-sky-600">
                          Class {selectedStudent.class}{" "}
                          {selectedStudent.section}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedStudent(null)}
                        type="button"
                      >
                        <X size={14} className="text-sky-600" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Remark / Observation
                  </label>
                  <div className="bg-white">
                    <ReactQuill
                      theme="snow"
                      value={remarkContent}
                      onChange={setRemarkContent}
                      className="rounded-md"
                      placeholder="Enter remark about the student..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <Link to="/login">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-500"
                >
                  <ArrowLeft size={16} className="mr-2" /> Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    {activeTab === "daily" ? "Submit Log" : "Save Remark"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} SchoolConnect AI. All rights
          reserved.
        </p>
      </div>
    </div>
  );
};

export default TeacherSubmission;
