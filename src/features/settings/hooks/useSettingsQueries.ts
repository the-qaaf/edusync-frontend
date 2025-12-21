import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSchoolSettings,
  updateSchoolSettings,
  SchoolSettings,
} from "@/services/firebase/settings";

export const settingsKeys = {
  all: ["settings"] as const,
  detail: (schoolId: string) =>
    [...settingsKeys.all, "detail", schoolId] as const,
};

export function useSchoolSettingsQuery(schoolId?: string) {
  return useQuery({
    queryKey: schoolId ? settingsKeys.detail(schoolId) : ["settings", "temp"],
    queryFn: () => getSchoolSettings(schoolId!),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useUpdateSchoolSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schoolId,
      settings,
    }: {
      schoolId: string;
      settings: Partial<SchoolSettings>;
    }) => updateSchoolSettings(schoolId, settings),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.detail(schoolId),
      });
    },
  });
}
