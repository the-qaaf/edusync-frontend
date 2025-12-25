import { useState, useEffect, useCallback, useMemo } from "react";
import { Student } from "@/types";
import { useToast } from "@/shared/ui/Toast";
import { useQueryState, parseAsString } from "nuqs";
import { useAuth } from "@/features/auth/AuthContext";
import {
  useStudentsInfinite,
  useAddStudent,
  useUpdateStudent,
  useBatchAddStudents,
  useDeleteStudent,
} from "./useStudentQueries";

const PAGE_SIZE = 10;

export const useStudents = () => {
  const { toast } = useToast();
  const { schoolId } = useAuth(); // Get schoolId

  // Filters
  const [filterClass, setFilterClass] = useQueryState(
    "class",
    parseAsString.withDefault("")
  );
  const [filterSection, setFilterSection] = useQueryState(
    "section",
    parseAsString.withDefault("")
  );
  const [searchTerm, setSearchTerm] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State (client-side index of fetched pages)
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useStudentsInfinite(schoolId, PAGE_SIZE, {
      classGrade: filterClass || undefined,
      section: filterSection || undefined,
      search: debouncedSearch || undefined,
    });

  // Mutations
  const { mutateAsync: performAddStudent } = useAddStudent();
  const { mutateAsync: performUpdateStudent } = useUpdateStudent();
  const { mutateAsync: performBatchAdd } = useBatchAddStudents();
  const { mutateAsync: performDeleteStudent } = useDeleteStudent();

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    // React Query handles resetting the data when keys change automatically
  }, [filterClass, filterSection, debouncedSearch]);

  const students = useMemo(() => {
    return data?.pages[currentPage - 1]?.students || [];
  }, [data, currentPage]);

  const totalCount = data?.pages[0]?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const nextPage = () => {
    if (currentPage < totalPages) {
      if (currentPage === data?.pages.length) {
        fetchNextPage();
      }
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleAddStudent = async (
    studentData: Omit<Student, "id" | "schoolId">
  ) => {
    if (!schoolId) return false;
    try {
      await performAddStudent({
        schoolId,
        student: { ...studentData, schoolId },
      });
      toast("Student added successfully", "success");
      return true;
    } catch (error) {
      console.error(error);
      toast("Failed to add student", "error");
      return false;
    }
  };

  const handleUpdateStudent = async (id: string, data: Partial<Student>) => {
    if (!schoolId) return false;
    try {
      await performUpdateStudent({ schoolId, id, data });
      toast("Student updated successfully", "success");
      return true;
    } catch (error) {
      console.error(error);
      toast("Failed to update student", "error");
      return false;
    }
  };

  const handleImportStudents = async (data: any[]) => {
    if (!schoolId) return false;
    try {
      await performBatchAdd({ schoolId, students: data });
      toast(`Successfully imported ${data.length} students`, "success");
      setCurrentPage(1);
      return true;
    } catch (error) {
      console.error(error);
      toast("Failed to import students", "error");
      return false;
    }
  };

  const handleTransferStudent = async (
    id: string,
    newClass: string,
    newSection: string
  ) => {
    return handleUpdateStudent(id, {
      class: newClass,
      section: newSection,
      status: "Transferred",
    });
  };

  const handleMarkLeft = async (id: string) => {
    return handleUpdateStudent(id, { status: "Left" });
  };

  const handleDeleteStudent = async (id: string) => {
    if (!schoolId) return false;
    try {
      await performDeleteStudent({ schoolId, studentId: id });
      toast("Student deleted successfully", "success");
      return true;
    } catch (error) {
      console.error(error);
      toast("Failed to delete student", "error");
      return false;
    }
  };

  const clearFilters = useCallback(() => {
    setFilterClass(null);
    setFilterSection(null);
    setSearchTerm(null);
  }, [setFilterClass, setFilterSection, setSearchTerm]);

  return {
    students,
    loading: isLoading || isFetchingNextPage,
    totalCount,
    currentPage,
    totalPages,
    nextPage,
    prevPage,

    filterClass,
    setFilterClass,
    filterSection,
    setFilterSection,
    searchTerm,
    setSearchTerm,
    clearFilters,

    addStudent: handleAddStudent,
    updateStudent: handleUpdateStudent,
    importStudents: handleImportStudents,
    transferStudent: handleTransferStudent,
    markStudentAsLeft: handleMarkLeft,
    deleteStudent: handleDeleteStudent,
  };
};
