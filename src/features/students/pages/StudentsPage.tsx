import React, { useState } from "react";
import { Upload, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card } from "@/shared/ui";
import { useStudents } from "../hooks/useStudents";
import { StudentTable } from "../components/StudentTable";
import { StudentFilters } from "../components/StudentFilters";
import { AddStudentModal } from "../components/AddStudentModal";
import { ImportStudentModal } from "../components/ImportStudentModal";
import { TransferStudentModal } from "../components/TransferStudentModal";
import { Student } from "@/types";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

const StudentsPage: React.FC = () => {
  usePageTitle("Students");
  const {
    students,
    loading,
    filterClass,
    setFilterClass,
    filterSection,
    setFilterSection,
    searchTerm,
    setSearchTerm,
    totalCount,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    clearFilters,

    addStudent,
    transferStudent,
    markStudentAsLeft,
  } = useStudents();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleTransferClick = (student: Student) => {
    setSelectedStudent(student);
    setIsTransferOpen(true);
  };

  const handleMarkLeft = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to mark this student as 'Left'? This will archive their records."
      )
    ) {
      markStudentAsLeft(id);
    }
  };

  return (
    <div>
      <div className="flex mb-6 space-y-2 flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Student Management
          </h2>
          <p className="text-sm text-slate-500">
            View students, handle transfers, and manage enrollment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
            <Upload size={16} className="mr-2" /> Import Students
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Student
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-md">
        <StudentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterClass={filterClass}
          onFilterClassChange={setFilterClass}
          filterSection={filterSection}
          onFilterSectionChange={setFilterSection}
          onRefresh={() => {}} // No external refresh needed as hook handles it locally or we can expose a reload if needed
          onClear={clearFilters}
          loading={loading}
        />

        <StudentTable
          students={students}
          loading={loading}
          onTransfer={handleTransferClick}
          onMarkLeft={handleMarkLeft}
        />

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-500">
            Showing {students.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
            {Math.min(currentPage * 10, totalCount)} of {totalCount} students
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <div className="text-xs font-medium text-slate-700 min-w-[60px] text-center">
              Page {currentPage} of {Math.max(1, totalPages)}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= totalPages || loading}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={async (data) => {
          await addStudent({ ...data, status: "Active" });
        }}
      />

      <ImportStudentModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          /* Hook updates automatically on import success */
        }}
        // Removed mock logic
        onMockAdd={() => {}}
      />

      <TransferStudentModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        student={selectedStudent}
        onConfirm={async (student, targetClass, targetSection) => {
          await transferStudent(student.id, targetClass, targetSection);
        }}
      />
    </div>
  );
};

export default StudentsPage;
