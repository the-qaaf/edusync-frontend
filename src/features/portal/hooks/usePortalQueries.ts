import { useQuery } from "@tanstack/react-query";
import {
  getStudentsByParentPhone,
  getStudentUpdates,
  getStudentBroadcasts,
} from "@/services/firebase/portal";
import { Student } from "@/types";

export const portalKeys = {
  students: (phone: string) => ["portal", "students", phone] as const,
  dashboard: (studentId: string) => ["portal", "dashboard", studentId] as const,
};

export function usePortalStudents(
  schoolId: string | null,
  phone: string | null
) {
  return useQuery({
    queryKey:
      schoolId && phone
        ? portalKeys.students(schoolId + phone)
        : ["portal", "students", "temp"],
    queryFn: () => getStudentsByParentPhone(schoolId!, phone!),
    enabled: !!schoolId && !!phone,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePortalDashboard(student: Student | null) {
  return useQuery({
    queryKey: student
      ? portalKeys.dashboard(student.id)
      : ["portal", "dashboard", "temp"],
    queryFn: async () => {
      if (!student || !student.schoolId) return { updates: [], broadcasts: [] };
      const [updates, broadcasts] = await Promise.all([
        getStudentUpdates(
          student.schoolId,
          student.class,
          student.section,
          new Date().toISOString().split("T")[0]
        ),
        getStudentBroadcasts(student.schoolId),
      ]);
      return { updates, broadcasts };
    },
    enabled: !!student,
  });
}
