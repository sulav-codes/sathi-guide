import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export const guideKeys = {
  all: ["guides"] as const,
  lists: () => [...guideKeys.all, "list"] as const,
  list: (filters: string) => [...guideKeys.lists(), { filters }] as const,
  details: () => [...guideKeys.all, "detail"] as const,
  detail: (id: string) => [...guideKeys.details(), id] as const,
  myProfile: () => [...guideKeys.all, "myProfile"] as const,
};

export function useGuides(params?: Record<string, any>) {
  return useQuery({
    queryKey: guideKeys.list(JSON.stringify(params || {})),
    queryFn: () => apiClient.getGuides(params),
  });
}

export function useGuide(id: string) {
  return useQuery({
    queryKey: guideKeys.detail(id),
    queryFn: () => apiClient.getGuide(id),
    enabled: !!id,
  });
}

export function useMyGuideProfile() {
  return useQuery({
    queryKey: guideKeys.myProfile(),
    queryFn: () => apiClient.getMyGuideProfile(),
  });
}

export function useUpdateGuideProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.updateGuideProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guideKeys.myProfile() });
    },
  });
}
