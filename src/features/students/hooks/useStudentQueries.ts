import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAllParentContacts,
  getStudents,
  addStudent,
  updateStudent,
  batchAddStudents,
} from "@/services/firebase/students";
import { Student } from "@/types";

export const studentKeys = {
  all: ["students"] as const,
  contacts: (schoolId: string) =>
    [...studentKeys.all, "contacts-v2", schoolId] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (schoolId: string, filters: any) =>
    [...studentKeys.lists(), schoolId, filters] as const,
};

export function useParentContacts(schoolId?: string) {
  return useQuery({
    queryKey: schoolId
      ? studentKeys.contacts(schoolId)
      : ["students", "contacts", "temp"],
    queryFn: () => getAllParentContacts(schoolId!),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}

export function useStudentsInfinite(
  schoolId: string | undefined,
  pageSize: number,
  filters: { classGrade?: string; section?: string; search?: string }
) {
  return useInfiniteQuery({
    queryKey: schoolId
      ? studentKeys.list(schoolId, filters)
      : ["students", "list", "temp"],
    queryFn: async ({ pageParam }) => {
      if (!schoolId) return { students: [], lastDoc: null, totalCount: 0 };
      return getStudents(schoolId, pageSize, pageParam, filters);
    },
    initialPageParam: null as any,
    getNextPageParam: (lastPage) => lastPage.lastDoc || undefined,
    enabled: !!schoolId,
  });
}

export function useAddStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, student }: { schoolId: string; student: any }) =>
      addStudent(schoolId, student),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schoolId,
      id,
      data,
    }: {
      schoolId: string;
      id: string;
      data: Partial<Student>;
    }) => updateStudent(schoolId, id, data),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}

export function useBatchAddStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schoolId,
      students,
    }: {
      schoolId: string;
      students: any[];
    }) => batchAddStudents(schoolId, students),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}
