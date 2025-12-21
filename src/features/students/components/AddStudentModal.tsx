import React, { useState } from "react";
import { Student } from "@/types";
import { Button, Modal, Input, Select } from "@/shared/ui";
import { useToast } from "@/shared/ui/Toast";
import { useAuth } from "@/features/auth/AuthContext";
import { ACADEMIC_CLASSES, ACADEMIC_SECTIONS } from "@/shared/constants";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (student: Omit<Student, "id" | "status">) => Promise<void>;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const { toast } = useToast();
  const [newStudent, setNewStudent] = useState({
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
  const { schoolId } = useAuth();

  const handleSubmit = async () => {
    if (
      !newStudent.name ||
      !newStudent.class ||
      !newStudent.section ||
      !newStudent.rollNumber
    ) {
      toast("Please fill in all required fields", "error");
      return;
    }
    setLoading(true);
    try {
      await onAdd({
        name: newStudent.name,
        rollNumber: newStudent.rollNumber,
        class: newStudent.class,
        section: newStudent.section,
        classTeacher: newStudent.classTeacher,
        parentPhone: newStudent.parentPhone,
        alternateParentPhone: newStudent.alternateParentPhone,
        parentEmail: newStudent.parentEmail,
        schoolId,
      });
      setNewStudent({
        name: "",
        rollNumber: "",
        class: "",
        section: "",
        classTeacher: "",
        parentPhone: "",
        alternateParentPhone: "",
        parentEmail: "",
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
      title="Add New Student"
      description="Enter the details of the student to register."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Student"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={newStudent.name}
            onChange={(e) =>
              setNewStudent({ ...newStudent, name: e.target.value })
            }
          />
          <Input
            label="Roll Number"
            placeholder="e.g. 10A05"
            value={newStudent.rollNumber}
            onChange={(e) =>
              setNewStudent({ ...newStudent, rollNumber: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Class"
            placeholder="Select Class"
            options={ACADEMIC_CLASSES.map((c) => ({ value: c, label: c }))}
            value={newStudent.class}
            onChange={(val) => setNewStudent({ ...newStudent, class: val })}
          />
          <Select
            label="Section"
            placeholder="Select Section"
            options={ACADEMIC_SECTIONS.map((s) => ({ value: s, label: s }))}
            value={newStudent.section}
            onChange={(val) => setNewStudent({ ...newStudent, section: val })}
          />
        </div>
        <Input
          label="Class Teacher"
          placeholder="Optional"
          value={newStudent.classTeacher}
          onChange={(e) =>
            setNewStudent({ ...newStudent, classTeacher: e.target.value })
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Parent Phone"
            placeholder="+1 ..."
            value={newStudent.parentPhone}
            onChange={(e) =>
              setNewStudent({ ...newStudent, parentPhone: e.target.value })
            }
          />
          <Input
            label="Alternate Phone"
            placeholder="Optional"
            value={newStudent.alternateParentPhone}
            onChange={(e) =>
              setNewStudent({
                ...newStudent,
                alternateParentPhone: e.target.value,
              })
            }
          />
        </div>
        <Input
          label="Parent Email"
          placeholder="Optional"
          value={newStudent.parentEmail}
          onChange={(e) =>
            setNewStudent({ ...newStudent, parentEmail: e.target.value })
          }
        />
      </div>
    </Modal>
  );
};
