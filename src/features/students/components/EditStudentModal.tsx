import React, { useState, useEffect } from "react";
import { Student } from "@/types";
import { Button, Modal, Input, Select } from "@/shared/ui";
import { useToast } from "@/shared/ui/Toast";
import { useAuth } from "@/features/auth/AuthContext";
import { ACADEMIC_CLASSES, ACADEMIC_SECTIONS } from "@/shared/constants";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdate: (id: string, data: Partial<Student>) => Promise<void>;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    class: "",
    section: "",
    classTeacher: "",
    parentPhone: "",
    alternateParentPhone: "",
    parentEmail: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        rollNumber: student.rollNumber || "",
        class: student.class || "",
        section: student.section || "",
        classTeacher: student.classTeacher || "",
        parentPhone: student.parentPhone || "",
        alternateParentPhone: student.alternateParentPhone || "",
        parentEmail: student.parentEmail || "",
      });
    }
  }, [student]);

  const handleSubmit = async () => {
    if (!student) return;
    if (
      !formData.name ||
      !formData.class ||
      !formData.section ||
      !formData.rollNumber
    ) {
      toast("Please fill in all required fields", "error");
      return;
    }
    setLoading(true);
    try {
      await onUpdate(student.id, {
        name: formData.name,
        rollNumber: formData.rollNumber,
        class: formData.class,
        section: formData.section,
        classTeacher: formData.classTeacher,
        parentPhone: formData.parentPhone,
        alternateParentPhone: formData.alternateParentPhone,
        parentEmail: formData.parentEmail,
      });
      onClose();
    } catch (e) {
      // Error handling usually in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student"
      description="Update the details of the student."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Student"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Roll Number"
            placeholder="e.g. 10A05"
            value={formData.rollNumber}
            onChange={(e) =>
              setFormData({ ...formData, rollNumber: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Class"
            placeholder="Select Class"
            options={ACADEMIC_CLASSES.map((c) => ({ value: c, label: c }))}
            value={formData.class}
            onChange={(val) => setFormData({ ...formData, class: val })}
          />
          <Select
            label="Section"
            placeholder="Select Section"
            options={ACADEMIC_SECTIONS.map((s) => ({ value: s, label: s }))}
            value={formData.section}
            onChange={(val) => setFormData({ ...formData, section: val })}
          />
        </div>
        <Input
          label="Class Teacher"
          placeholder="Optional"
          value={formData.classTeacher}
          onChange={(e) =>
            setFormData({ ...formData, classTeacher: e.target.value })
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Parent Phone"
            placeholder="+1 ..."
            value={formData.parentPhone}
            onChange={(e) =>
              setFormData({ ...formData, parentPhone: e.target.value })
            }
          />
          <Input
            label="Alternate Phone"
            placeholder="Optional"
            value={formData.alternateParentPhone}
            onChange={(e) =>
              setFormData({
                ...formData,
                alternateParentPhone: e.target.value,
              })
            }
          />
        </div>
        <Input
          label="Parent Email"
          placeholder="Optional"
          value={formData.parentEmail}
          onChange={(e) =>
            setFormData({ ...formData, parentEmail: e.target.value })
          }
        />
      </div>
    </Modal>
  );
};
