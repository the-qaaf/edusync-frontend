import { useState, useEffect } from "react";
import { Student } from "@/types";
import { usePortalStudents, usePortalDashboard } from "./usePortalQueries";

export const usePortal = (schoolId?: string) => {
  const searchParams = new URLSearchParams(window.location.search);
  const rawPhone = searchParams.get("phone");
  // Normalize phone: strip spaces, remove leading + or 00
  const phone = rawPhone
    ? rawPhone.replace(/\s+/g, "").replace(/^(\+|00)/, "")
    : null;

  const { data: students = [], isLoading: loadingStudents } = usePortalStudents(
    schoolId || null,
    phone
  );
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Auto-select if only one student
  useEffect(() => {
    if (students.length === 1 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  const { data: dashboardData, isLoading: loadingDashboard } =
    usePortalDashboard(selectedStudent);

  return {
    loading: loadingStudents,
    students,
    selectedStudent,
    setSelectedStudent,
    dailyUpdates: dashboardData?.updates || [],
    broadcasts: dashboardData?.broadcasts || [],
    phone,
  };
};
