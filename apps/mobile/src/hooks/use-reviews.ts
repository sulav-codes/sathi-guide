import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export const reviewKeys = {
  all: ["reviews"] as const,
  guide: (guideId: string) => [...reviewKeys.all, "guide", guideId] as const,
  list: (guideId: string, filters: string) =>
    [...reviewKeys.guide(guideId), "list", { filters }] as const,
  summary: (guideId: string) =>
    [...reviewKeys.guide(guideId), "summary"] as const,
  canReview: (guideId: string) =>
    [...reviewKeys.guide(guideId), "canReview"] as const,
};

export const reportKeys = {
  all: ["reports"] as const,
};

export function useGuideReviews(guideId: string, params?: Record<string, any>) {
  return useQuery({
    queryKey: reviewKeys.list(guideId, JSON.stringify(params || {})),
    queryFn: () => apiClient.getGuideReviews(guideId, params),
    enabled: !!guideId,
  });
}

export function useReviewSummary(guideId: string) {
  return useQuery({
    queryKey: reviewKeys.summary(guideId),
    queryFn: () => apiClient.getReviewSummary(guideId),
    enabled: !!guideId,
  });
}

export function useCanReview(guideId: string) {
  return useQuery({
    queryKey: reviewKeys.canReview(guideId),
    queryFn: () => apiClient.canReviewGuide(guideId),
    enabled: !!guideId,
    retry: false, // Don't retry if it returns 403 or 400
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof apiClient.createReview>[0]) =>
      apiClient.createReview(data),
    onSuccess: (_, variables) => {
      // Invalidate bookings because booking status or canReview might change
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      // Note: we don't know the guideId here directly unless we pass it,
      // but invalidating reviews broadly might be fine, or the user can do it manually.
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useCreateReport() {
  return useMutation({
    mutationFn: (data: Parameters<typeof apiClient.createReport>[0]) =>
      apiClient.createReport(data),
  });
}
