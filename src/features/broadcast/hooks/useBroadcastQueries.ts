import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBroadcastLogs,
  addBroadcast,
  CreateBroadcastParams,
} from "@/services/firebase/broadcast";

export const broadcastKeys = {
  all: ["broadcasts"] as const,
  lists: (schoolId: string) =>
    [...broadcastKeys.all, "list", schoolId] as const,
};

export function useBroadcastLogs(schoolId?: string) {
  return useQuery({
    queryKey: schoolId ? broadcastKeys.lists(schoolId) : ["broadcasts", "temp"],
    queryFn: () => getBroadcastLogs(schoolId!),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useAddBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      schoolId,
      params,
    }: {
      schoolId: string;
      params: CreateBroadcastParams;
    }) => addBroadcast(schoolId, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: broadcastKeys.lists(variables.schoolId),
      });
    },
  });
}
