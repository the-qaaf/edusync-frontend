import React, { useEffect } from "react";
import { Student } from "@/types";
import { Button, Modal, FileUpload } from "@/shared/ui";
import { useStudentImport } from "../hooks/useStudentImport";

interface ImportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onMockAdd: (students: Omit<Student, "id">[]) => void;
}

export const ImportStudentModal: React.FC<ImportStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onMockAdd,
}) => {
  const { importFile, setImportFile, isImporting, processImport } =
    useStudentImport(() => {
      onSuccess();
      onClose();
    }, onMockAdd);

  // Reset file when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setImportFile(null);
    }
  }, [isOpen, setImportFile]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Students"
      description="Bulk upload student records using CSV or Excel."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={processImport} disabled={!importFile || isImporting}>
            {isImporting ? "Processing..." : "Process Import"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={setImportFile}
          label="Student Records File"
          accept=".csv"
          templateName="Student_Import"
          templateContent="RollNumber,Name,Class,Section,ClassTeacher,ParentPhone,ParentEmail&#10;10A01,John Smith,10,A,Mrs. Sharma,555-0101,parent@example.com&#10;10A02,Jane Doe,10,A,Mrs. Sharma,555-0102,doe.fam@example.com"
        />
        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
          <p className="font-semibold mb-1">Required CSV Headers:</p>
          <code className="text-slate-800">
            RollNumber, Name, Class, Section, ParentPhone
          </code>
        </div>
      </div>
    </Modal>
  );
};
