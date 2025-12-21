import React, { useState, useEffect } from "react";
import { Button, Modal, Select } from "@/shared/ui";
import { Student } from "@/types";
import { ACADEMIC_CLASSES, ACADEMIC_SECTIONS } from "@/shared/constants";

interface TransferStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onConfirm: (
    student: Student,
    targetClass: string,
    targetSection: string
  ) => Promise<void>;
}

export const TransferStudentModal: React.FC<TransferStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onConfirm,
}) => {
  const [targetClass, setTargetClass] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setTargetClass(student.class);
      setTargetSection(student.section);
    }
  }, [student, isOpen]);

  const handleConfirm = async () => {
    if (!student) return;
    setLoading(true);
    try {
      await onConfirm(student, targetClass, targetSection);
      onClose();
    } catch (e) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Student"
      description="Move a student to a different class or section."
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Transfering..." : "Confirm Transfer"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {student && (
          <div className="p-4 bg-blue-50 text-blue-900 rounded-lg text-sm border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-blue-500 uppercase text-xs font-semibold tracking-wider">
                Moving Student
              </span>
              <p className="font-bold text-lg">{student.name}</p>
            </div>
            <div className="text-right">
              <span className="text-blue-500 uppercase text-xs font-semibold tracking-wider">
                Current
              </span>
              <p className="font-medium">
                {student.class} - {student.section}
              </p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-6 w-full mb-4">
          <Select
            label="Target Class"
            value={targetClass}
            onChange={setTargetClass}
            options={ACADEMIC_CLASSES.map((c) => ({ value: c, label: c }))}
          />
          <Select
            label="Target Section"
            value={targetSection}
            onChange={setTargetSection}
            options={ACADEMIC_SECTIONS.map((s) => ({ value: s, label: s }))}
          />
        </div>
      </div>
    </Modal>
  );
};
