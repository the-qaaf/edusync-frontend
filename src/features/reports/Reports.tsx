import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Send,
  Printer,
  Upload,
  CheckCircle,
  Eye,
  Trash,
} from "lucide-react";
import {
  Card,
  Button,
  Select,
  Badge,
  FileUpload,
  Modal,
  Skeleton,
} from "@/shared/ui";

import { useToast } from "@/shared/ui/Toast";
import { Student } from "@/types";
import { ACADEMIC_CLASSES, ACADEMIC_SECTIONS } from "@/shared/constants";
import {
  useReportsLogic,
  EXCLUDED_REPORT_KEYS,
  normalizeKey,
} from "./useReportsLogic";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

// @ts-ignore
import html2pdf from "html2pdf.js";

interface SubjectMark {
  subject: string;
  maxMarks: number;
  obtained: number;
  grade: string;
}

const Reports: React.FC = () => {
  usePageTitle("Reports");
  const { toast } = useToast();

  const {
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    selectedTerm,
    setSelectedTerm,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isGenerated,
    isLoading,
    generatedStudents,
    reportCards,
    processingLogs,
    uploadedFile,
    setUploadedFile,
    settings,
    showDeleteModal,
    setShowDeleteModal,
    confirmDelete,
    requestDelete,
    handleProcessUpload,
    fetchReports,
    hasMore,
    sendReportsToParents,
    isSending,
  } = useReportsLogic();

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [studentMarks, setStudentMarks] = useState<SubjectMark[]>([]);

  const handleUploadClick = () => {
    if (!selectedClass || !selectedSection || !selectedTerm) {
      toast("Please select Class, Section and Term first", "error");
      return;
    }
    setIsUploadModalOpen(true);
  };

  const openPreview = (student: Student) => {
    setActiveStudent(student);
    const report = reportCards.find((r) => r.studentId === student.id);
    if (report) {
      setStudentMarks(
        report.subjects
          .filter((s) => !EXCLUDED_REPORT_KEYS.includes(normalizeKey(s.name)))
          .map((s) => ({
            subject: s.name,
            maxMarks: s.maxMarks,
            obtained: s.obtained,
            grade: s.grade,
          }))
      );
    } else {
      setStudentMarks([]);
    }
    setIsPreviewModalOpen(true);
  };

  const totalMax = studentMarks.reduce((acc, curr) => acc + curr.maxMarks, 0);
  const totalObtained = studentMarks.reduce(
    (acc, curr) => acc + curr.obtained,
    0
  );
  const percentage =
    totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : "0";

  const handleDownloadPDF = () => {
    const element = document.getElementById("report-card-preview");
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `${activeStudent?.name}_ReportCard.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    toast("Generating PDF...", "info");
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  // --- Dynamic Section Renderers ---
  const renderHeader = () => (
    <div className="p-12 pb-6 border-b border-slate-100 relative z-10">
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight font-serif">
            {settings?.schoolName || "Greenfield Public School"}
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium tracking-wide uppercase">
            {settings?.address || "Excellence in Education"}
          </p>
        </div>

        <div className="text-right">
          <div className="text-5xl font-black text-slate-900/25 absolute top-10 right-10 pointer-events-none">
            {Number(percentage) > 90
              ? "A+"
              : Number(percentage) > 80
              ? "A"
              : Number(percentage) > 70
              ? "B"
              : Number(percentage) > 60
              ? "C"
              : Number(percentage) > 50
              ? "D"
              : "F"}
          </div>
          <div className="text-xs text-black mt-4 font-mono uppercase">
            {selectedTerm} Report
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Session {settings?.academicYear}
          </p>
        </div>
      </div>
    </div>
  );

  const renderStudentInfo = () => (
    <div className="p-12 py-8 bg-slate-50/50">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-1">
        Student Details
      </h3>
      <div className="grid grid-cols-4 gap-y-6 gap-x-8">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Student Name
          </p>
          <p className="text-lg font-bold text-slate-900 capitalize">
            {activeStudent?.name}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Roll Number
          </p>
          <p className="text-lg font-mono font-medium text-slate-700">
            {activeStudent?.rollNumber}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Class / Section
          </p>
          <p className="text-lg font-medium text-slate-700">
            {activeStudent?.class} - {activeStudent?.section}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Date of Issue
          </p>
          <p className="text-lg font-medium text-slate-700">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );

  const renderAcademic = () => (
    <div className="p-12 py-6">
      <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-2 mb-6 uppercase tracking-wider w-full">
        Academic Performance
      </h3>

      <table className="w-full border-collapse">
        <thead className="bg-slate-100/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
          <tr>
            <th className="py-4 pl-4 rounded-l-md">Subject</th>
            <th className="py-4 text-center">Max Marks</th>
            <th className="py-4 text-center">Obtained</th>
            <th className="py-4 pr-4 rounded-r-md text-right">Grade</th>
          </tr>
        </thead>
        <tbody className="text-sm text-slate-700">
          {studentMarks.map((mark, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30 transition-colors"
            >
              <td className="py-4 pl-4 font-medium">{mark.subject}</td>
              <td className="py-4 text-center text-slate-400">
                {mark.maxMarks}
              </td>
              <td className="py-4 text-center font-bold text-slate-900">
                {mark.obtained}
              </td>
              <td
                className={`py-4 pr-4 text-right font-bold ${
                  mark.grade.startsWith("A")
                    ? "text-green-600"
                    : mark.grade.startsWith("F")
                    ? "text-red-500"
                    : "text-slate-600"
                }`}
              >
                {mark.grade}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-slate-900">
          <tr className="bg-slate-50">
            <td className="py-5 pl-4 font-bold text-slate-900 uppercase text-xs">
              Grand Total
            </td>
            <td className="py-5 text-center font-medium text-slate-500">
              {totalMax}
            </td>
            <td className="py-5 text-center font-extrabold text-xl text-slate-900">
              {totalObtained}
            </td>
            <td className="py-5 pr-4 text-right font-extrabold text-xl text-blue-600">
              {percentage}%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const renderRemarks = () => (
    <div className="px-12 pb-6">
      <div className="p-6 bg-blue-50/50 rounded-lg border border-blue-100/50">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">
          Class Teacher's Remarks
        </p>
        <p className="text-slate-700 italic text-sm leading-relaxed">
          {Number(percentage) > 85
            ? `An outstanding performance by ${
                activeStudent?.name.split(" ")[0]
              } this term. They have shown consistent dedication.`
            : Number(percentage) > 70
            ? `A very good effort by ${
                activeStudent?.name.split(" ")[0]
              }. With a little more focus, they can push their grades higher.`
            : `${
                activeStudent?.name.split(" ")[0]
              } has potential but needs to be more consistent.`}
        </p>
      </div>
    </div>
  );

  const renderSignatures = () => (
    <div className="p-12 mt-auto">
      <h4 className="text-xs font-bold text-slate-400 uppercase mb-8">
        Signatures
      </h4>
      <div className="grid grid-cols-3 gap-12 items-end pb-8">
        <div className="text-center">
          <div className="h-16 flex items-end justify-center pb-2">
            <span className="font-dancing text-2xl text-slate-600">
              {
                reportCards.find((r) => r.studentId === activeStudent?.id)
                  ?.classTeacher
              }
            </span>
          </div>
          <div className="border-t border-slate-300 pt-2">
            <p className="text-xs font-bold text-slate-900 uppercase">
              Class Teacher
            </p>
          </div>
        </div>
        <div className="text-center">
          {/* Empty for seal */}
          <div className="w-24 h-24 mx-auto border-4 border-double border-slate-200 rounded-full flex items-center justify-center opacity-50">
            <span className="text-[10px] text-slate-300 font-bold uppercase -rotate-12">
              {settings?.schoolName}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="h-16 flex items-end justify-center pb-2">
            <span className="font-dancing text-2xl text-slate-600">
              {
                reportCards.find((r) => r.studentId === activeStudent?.id)
                  ?.principal
              }
            </span>
          </div>
          <div className="border-t border-slate-300 pt-2">
            <p className="text-xs font-bold text-slate-900 uppercase">
              Principal
            </p>
          </div>
        </div>
      </div>

      <div className="text-center border-t border-slate-100 pt-6">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
          Generated via EduSync • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex mb-6 space-y-2 flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Report Card Generation
          </h2>
          <p className="text-sm text-slate-500">
            Generate and distribute academic reports.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            onClick={sendReportsToParents}
            disabled={!isGenerated || isSending}
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send size={16} className="mr-2" /> Send to Parents
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pb-6 border-b border-slate-100 items-end">
          <Select
            label="Class"
            placeholder="Select Class"
            options={ACADEMIC_CLASSES.map((cls) => ({
              value: cls,
              label: cls,
            }))}
            value={selectedClass}
            onChange={setSelectedClass}
          />
          <Select
            label="Section"
            placeholder="Select Section"
            options={ACADEMIC_SECTIONS.map((sec) => ({
              value: sec,
              label: sec,
            }))}
            value={selectedSection}
            onChange={setSelectedSection}
          />
          <Select
            label="Term"
            placeholder="Select Term"
            options={
              settings?.terms.map((t) => ({ value: t, label: t })) || [
                { value: "mid", label: "Mid-Term" },
                { value: "final", label: "Annual Examination" },
              ]
            }
            value={selectedTerm}
            onChange={setSelectedTerm}
          />

          <Button
            className="w-full"
            variant="outline"
            onClick={handleUploadClick}
          >
            {" "}
            <Upload size={16} className="mr-2" /> Upload Marks{" "}
          </Button>
          {isGenerated && (
            <div className="text-green-600 text-sm font-medium flex items-center justify-center h-9 bg-green-50 rounded border border-green-100">
              {" "}
              <CheckCircle size={14} className="mr-1" /> Generated{" "}
            </div>
          )}
        </div>

        {!isGenerated && !isLoading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              {" "}
              <FileText size={24} className="text-slate-300" />{" "}
            </div>
            <p className="font-medium text-slate-900">
              No reports generated yet
            </p>
            <p className="text-sm">
              Select criteria and upload marks sheet to generate preview.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Roll No</th>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading && generatedStudents.length === 0
                    ? Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-3">
                            <Skeleton className="h-4 w-12" />
                          </td>
                          <td className="px-6 py-3">
                            <Skeleton className="h-4 w-32" />
                          </td>
                          <td className="px-6 py-3">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex justify-end gap-2">
                              <Skeleton className="h-8 w-24" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </td>
                        </tr>
                      ))
                    : generatedStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-mono text-xs">
                            {student.rollNumber}
                          </td>
                          <td className="px-6 py-3 font-medium text-slate-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant="success">Ready</Badge>
                          </td>
                          <td className="px-6 py-3 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openPreview(student as any)}
                            >
                              <Eye size={14} className="mr-2" /> Preview Report
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => requestDelete(student.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                            >
                              <Trash size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
              {hasMore && (
                <div className="p-4 flex justify-center border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => fetchReports()}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Marks Sheet"
        description="Upload the compiled marks sheet for the selected class."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleProcessUpload} disabled={!uploadedFile}>
              Process & Preview
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <FileUpload
            onFileSelect={setUploadedFile}
            label="Marks CSV File"
            templateName="Marks_Template"
            templateContent="Roll Number,Student Name,Class,Class Teacher Name,Principal Name,Mathematics,Physics,Chemistry,English,Computer Science&#10;10A01,Aarav Sharma,10,Mrs. Verma,Dr. Smith,85,90,88,92,95&#10;10A02,Vihaan Gupta,10,Mrs. Verma,Dr. Smith,78,82,80,85,88"
          />
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
            <p>Ensure Roll Numbers match the Student Database.</p>
            <p className="mt-1 italic">Maximum 500 reports allowed per file.</p>
          </div>
          {processingLogs.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded p-3 text-xs text-amber-800 max-h-32 overflow-y-auto space-y-1">
              <p className="font-bold border-b border-amber-200 pb-1 mb-1">
                Processing Logs
              </p>
              {processingLogs.map((log, i) => (
                <p key={i}>{log}</p>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        description="Are you sure you want to delete this report card? This action cannot be undone."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Report
            </Button>
          </>
        }
      >
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
          This will permanently delete the report card from the database.
        </div>
      </Modal>

      {/* Full Screen Premium Report Card Preview */}
      {isPreviewModalOpen &&
        activeStudent &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-4 px-8 border-b border-white/10 bg-black/20 text-white shrink-0">
              <h3 className="font-semibold text-lg flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <span className="block text-sm font-normal text-slate-400">
                    Previewing Report for
                  </span>
                  {activeStudent.name}
                </div>
              </h3>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-slate-300 hover:text-white hover:bg-white/10"
                >
                  Close Esc
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                >
                  <Printer size={16} className="mr-2" /> Download PDF
                </Button>
              </div>
            </div>

            {/* Scrollable Preview Area */}
            <div
              className="flex-1 overflow-auto flex justify-center p-8 lg:p-12 cursor-default"
              onClick={(e) =>
                e.target === e.currentTarget && setIsPreviewModalOpen(false)
              }
            >
              {/* Actual Report A4 Container */}
              <div
                id="report-card-preview"
                className="bg-white text-slate-900 w-[210mm] min-h-[297mm] shadow-2xl relative overflow-hidden flex flex-col shrink-0 origin-top transform transition-transform"
                style={{ height: "297mm" }}
              >
                {renderHeader()}
                {renderStudentInfo()}
                {renderAcademic()}
                {renderRemarks()}
                {renderSignatures()}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
export default Reports;
