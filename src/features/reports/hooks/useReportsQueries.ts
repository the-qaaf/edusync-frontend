import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getReportsByClassAndTerm,
  saveReportCards,
  deleteReportCard,
  ReportCard,
} from "@/services/firebase/reports";

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (
    schoolId: string,
    filter: { class: string; section: string; term: string }
  ) => [...reportKeys.lists(), schoolId, filter] as const,
};

export function useReports(
  schoolId: string | undefined,
  filter: { class: string; section: string; term: string }
) {
  return useInfiniteQuery({
    queryKey: schoolId
      ? reportKeys.list(schoolId, filter)
      : ["reports", "temp"],
    queryFn: async ({ pageParam }) => {
      if (!schoolId) return { reports: [], lastVisible: null };
      return getReportsByClassAndTerm(
        schoolId,
        filter.class.replace(/\D/g, ""),
        filter.section,
        filter.term,
        20,
        pageParam
      );
    },
    initialPageParam: null as any,
    getNextPageParam: (lastPage) => lastPage?.lastVisible || undefined,
    enabled: !!(schoolId && filter.class && filter.section && filter.term),
  });
}

export function useSaveReportCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      schoolId,
      reports,
    }: {
      schoolId: string;
      reports: ReportCard[];
    }) => saveReportCards(schoolId, reports),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}

export function useDeleteReportCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      schoolId,
      reportId,
    }: {
      schoolId: string;
      reportId: string;
    }) => deleteReportCard(schoolId, reportId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
