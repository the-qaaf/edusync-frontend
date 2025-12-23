import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { ReportCard } from "@/services/firebase/reports";
import { getStudents } from "@/services/firebase/students";
import { useSchoolSettings } from "@/features/settings/SchoolSettingsContext";
import { useToast } from "@/shared/ui/Toast";

import { useAuth } from "@/features/auth/AuthContext";
import {
  useReports,
  useSaveReportCards,
  useDeleteReportCard,
} from "./hooks/useReportsQueries";

export const useReportsLogic = () => {
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const { schoolId } = useAuth();

  // Filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  // React Query
  const {
    data,
    isLoading: isQueryLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReports(schoolId, {
    class: selectedClass,
    section: selectedSection,
    term: selectedTerm,
  });

  const { mutateAsync: saveReports } = useSaveReportCards();
  const { mutateAsync: deleteReport } = useDeleteReportCard();

  // Derived State
  const reportCards = useMemo(() => {
    return data?.pages.flatMap((page) => page.reports) || [];
  }, [data]);

  const generatedStudents = useMemo(() => {
    return reportCards.map((r) => ({
      id: r.studentId,
      name: r.studentName,
      rollNumber: r.rollNumber,
      class: r.class,
      section: r.section,
      admissionNumber: "",
      gender: "Male" as const,
      dob: "",
      parentName: "",
      phone: "",
      address: "",
      classTeacher: r.classTeacher,
      parentPhone: "",
      parentEmail: "",
      status: "Active" as const,
    }));
  }, [reportCards]);

  const isGenerated = reportCards.length > 0;
  const isLoading = isQueryLoading || isFetchingNextPage;

  // UI State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentIdToDelete, setStudentIdToDelete] = useState<string | null>(
    null
  );

  // --- Upload Logic ---
  const normalizeKey = (key: string) =>
    key.toLowerCase().replace(/[^a-z0-9]/g, "");

  const handleProcessUpload = async () => {
    if (!uploadedFile || !schoolId) return;

    try {
      toast("Reading file...", "info");
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast("File is empty", "error");
        return;
      }

      // Fetch roster for validation
      // Optimization: This is still largely manual, but could be a query.
      // Keeping it as async for now as it's a specific validation step.
      const { students: classRoster } = await getStudents(schoolId, 200, null, {
        classGrade: selectedClass.replace(/\D/g, ""),
        section: selectedSection,
      });

      if (classRoster.length === 0) {
        toast(
          `No students found in DB for Class ${selectedClass} - ${selectedSection}. Aborting.`,
          "error"
        );
        return;
      }

      const newReportCards: ReportCard[] = [];
      const logs: string[] = [];
      let processedCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        const getRowVal = (k: string) =>
          row[
            Object.keys(row).find(
              (key) => normalizeKey(key) === normalizeKey(k)
            ) || ""
          ];

        const rollNo = String(
          getRowVal("Roll Number") || getRowVal("RollNo") || ""
        ).trim();
        const className = String(getRowVal("Class") || "").trim();
        const classTeacher =
          getRowVal("Class Teacher Name") || getRowVal("Class Teacher");
        const principal = getRowVal("Principal Name") || getRowVal("Principal");

        // Validation
        const normalizedFileClass = className.replace(/\D/g, "");
        const normalizedSelectedClass = selectedClass.replace(/\D/g, "");

        if (className && normalizedFileClass !== normalizedSelectedClass) {
          logs.push(`⚠ Skipped Roll ${rollNo}: Class mismatch.`);
          errorCount++;
          continue;
        }

        const student = classRoster.find((s) => s.rollNumber === rollNo);
        if (!student) {
          logs.push(`⚠ Skipped Roll ${rollNo}: Be sure student is in DB.`);
          errorCount++;
          continue;
        }

        // Extract Dynamic Subjects
        const fixedKeys = [
          "rollnumber",
          "rollno",
          "studentname",
          "name",
          "class",
          "section",
          "classteachername",
          "classteacher",
          "principalname",
          "principal",
        ];
        const subjectKeys = Object.keys(row).filter(
          (k) => !fixedKeys.includes(normalizeKey(k))
        );

        const subjectsData = subjectKeys.map((subKey) => {
          const obtained = Number(row[subKey]);
          const maxMarks = 100; // Default Mvp
          let grade = "F";
          const pct = (obtained / maxMarks) * 100;
          if (pct >= 91) grade = "A1";
          else if (pct >= 81) grade = "A2";
          else if (pct >= 71) grade = "B1";
          else if (pct >= 61) grade = "B2";
          else if (pct >= 51) grade = "C1";
          else if (pct >= 41) grade = "C2";
          else if (pct >= 33) grade = "D";

          return {
            name: subKey.trim(),
            obtained: isNaN(obtained) ? 0 : obtained,
            maxMarks,
            grade,
          };
        });

        const totalObtained = subjectsData.reduce(
          (acc, c) => acc + c.obtained,
          0
        );
        const totalMax = subjectsData.reduce((acc, c) => acc + c.maxMarks, 0);
        const percentage =
          totalMax > 0
            ? Number(((totalObtained / totalMax) * 100).toFixed(2))
            : 0;

        let overallGrade = "F";
        if (percentage >= 90) overallGrade = "A+";
        else if (percentage >= 80) overallGrade = "A";
        else if (percentage >= 70) overallGrade = "B";
        else if (percentage >= 60) overallGrade = "C";
        else if (percentage >= 50) overallGrade = "D";

        const report: ReportCard = {
          studentId: student.id,
          studentName: student.name,
          rollNumber: rollNo,
          class: selectedClass.replace(/\D/g, ""),
          section: selectedSection,
          term: selectedTerm,
          academicYear:
            (settings as any)?.currentAcademicYear ||
            new Date().getFullYear().toString(),
          subjects: subjectsData,
          totalMax,
          totalObtained,
          percentage,
          overallGrade,
          classTeacher: classTeacher || "N/A",
          principal: principal || "N/A",
        };

        newReportCards.push(report);
        processedCount++;

        if (newReportCards.length > 500) {
          toast("Batch limit exceeded! Maximum 500 reports per file.", "error");
          return;
        }
      }

      setProcessingLogs(logs);

      if (newReportCards.length > 0) {
        await saveReports({ schoolId, reports: newReportCards });
        setIsUploadModalOpen(false);
        toast(`Processed ${processedCount} reports.`, "success");
      } else {
        toast("No valid reports found.", "error");
      }
    } catch (e: any) {
      console.error(e);
      toast("Error processing file: " + e.message, "error");
    }
  };

  // --- Delete Logic ---
  const requestDelete = (studentId: string) => {
    setStudentIdToDelete(studentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studentIdToDelete || !schoolId) return;

    const report = reportCards.find((r) => r.studentId === studentIdToDelete);
    if (report && report.id) {
      try {
        await deleteReport({ schoolId, reportId: report.id });
        toast("Report deleted", "success");
      } catch (e) {
        console.error(e);
        toast("Failed to delete", "error");
      }
    }
    setShowDeleteModal(false);
    setStudentIdToDelete(null);
  };

  return {
    // State
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

    // Delete Modal State
    showDeleteModal,
    setShowDeleteModal,
    confirmDelete,
    requestDelete,

    // Handlers
    handleProcessUpload,
    fetchReports: () => fetchNextPage(),
    hasMore: hasNextPage,
  };
};
