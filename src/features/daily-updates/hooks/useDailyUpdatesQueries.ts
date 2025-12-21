import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDailyUpdates,
  addDailyUpdate,
} from "@/services/firebase/daily-updates";
import { DailyUpdate } from "@/types";

export const dailyUpdateKeys = {
  all: ["daily-updates"] as const,
  list: (schoolId: string) =>
    [...dailyUpdateKeys.all, "list", schoolId] as const,
};

export function useDailyUpdates(schoolId?: string) {
  return useQuery({
    queryKey: schoolId
      ? dailyUpdateKeys.list(schoolId)
      : ["daily-updates", "temp"],
    queryFn: () => getDailyUpdates(schoolId!, 20),
    enabled: !!schoolId,
  });
}

export function useAddDailyUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schoolId,
      update,
    }: {
      schoolId: string;
      update: Omit<DailyUpdate, "id">;
    }) => addDailyUpdate(schoolId, update),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({
        queryKey: dailyUpdateKeys.list(schoolId),
      });
    },
  });
}
