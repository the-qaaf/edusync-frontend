import React, { useState, useEffect } from "react";
import { School, Send, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
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

  const [formData, setFormData] = useState({
    name: "",
    classGrade: "",
    section: "",
    subject: "",
    homework: "",
    notes: "",
  });

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

      if (isFirebaseConfigured()) {
        await submitUpdate({
          schoolId,
          update: {
            teacherName: formData.name,
            classGrade: formData.classGrade,
            section: formData.section,
            subject: formData.subject,
            homework: formData.homework,
            notes: formData.notes,
            date: today,
          },
        });
      } else {
        // Mock delay
        await new Promise((r) => setTimeout(r, 1000));
      }

      setSubmitted(true);
      toast("Daily update submitted successfully!", "success");
    } catch (error) {
      console.error(error);
      toast("Failed to submit update. Please try again.", "error");
    }
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
            Thank you! Your daily update has been logged successfully.
          </p>
          <div className="space-y-3">
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
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-sky-600 text-white rounded-lg flex items-center justify-center shadow-lg">
            <School size={24} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Daily Teacher Log
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Greenfield Public School • Academic Year 2023-24
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-lg border-t-4 border-t-sky-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="e.g. Math, English, Science"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>

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
                onChange={(val) => setFormData({ ...formData, section: val })}
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
                  onChange={(val) => setFormData({ ...formData, notes: val })}
                  className="rounded-md"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

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
                    <Send size={16} className="mr-2" /> Submit Log
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
