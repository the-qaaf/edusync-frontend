import { useState } from "react";
import { Student } from "@/types";
import { isFirebaseConfigured } from "@/services/firebase";
import { useToast } from "@/shared/ui/Toast";
import { useAuth } from "@/features/auth/AuthContext";
import { useBatchAddStudents } from "./useStudentQueries";

export const useStudentImport = (
  onSuccess: () => void,
  onMockAdd: (students: Omit<Student, "id">[]) => void
) => {
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { schoolId } = useAuth();
  const { mutateAsync: performBatchAdd } = useBatchAddStudents();

  const validateCSVHeader = (headers: string[]) => {
    const required = ["RollNumber", "Name", "Class", "Section", "ParentPhone"];
    const missing = required.filter((h) => !headers.includes(h));
    return missing;
  };

  const processImport = async () => {
    if (!importFile) return;
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l);

      if (lines.length < 2) {
        toast("File is empty or invalid format", "error");
        setIsImporting(false);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const missingHeaders = validateCSVHeader(headers);

      if (missingHeaders.length > 0) {
        toast(
          `Missing required columns: ${missingHeaders.join(", ")}`,
          "error"
        );
        setIsImporting(false);
        return;
      }

      const studentsToAdd: Omit<Student, "id">[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length !== headers.length) {
          errors.push(`Line ${i + 1}: Column count mismatch`);
          continue;
        }

        const studentObj: any = {};
        headers.forEach((h, index) => {
          studentObj[h] = values[index];
        });

        if (!studentObj.Name || !studentObj.Class || !studentObj.RollNumber) {
          errors.push(`Line ${i + 1}: Missing mandatory fields`);
          continue;
        }

        studentsToAdd.push({
          name: studentObj.Name,
          rollNumber: studentObj.RollNumber,
          class: studentObj.Class,
          section: studentObj.Section,
          classTeacher: studentObj.ClassTeacher || "Unassigned",
          parentPhone: studentObj.ParentPhone || "",
          parentEmail: studentObj.ParentEmail || "",
          alternateParentPhone: studentObj.AlternateParentPhone || "",
          schoolId: schoolId || "",
          status: "Active",
        });

        if (studentsToAdd.length > 500) {
          toast(
            "Batch limit exceeded! Maximum 500 students per import.",
            "error"
          );
          setIsImporting(false);
          return;
        }
      }

      if (studentsToAdd.length === 0) {
        toast("No valid students found to import", "error");
        setIsImporting(false);
        return;
      }

      try {
        if (isFirebaseConfigured() && schoolId) {
          await performBatchAdd({ schoolId, students: studentsToAdd });
          toast(
            `Successfully imported ${studentsToAdd.length} students`,
            "success"
          );
          onSuccess();
        } else {
          onMockAdd(studentsToAdd);
          toast(
            `Imported ${studentsToAdd.length} students (Mock Mode)`,
            "success"
          );
          onSuccess();
        }
      } catch (error) {
        console.error(error);
        toast("Failed to import students to database", "error");
      } finally {
        setIsImporting(false);
        setImportFile(null);
      }
    };

    reader.readAsText(importFile);
  };

  return {
    importFile,
    setImportFile,
    isImporting,
    processImport,
  };
};
