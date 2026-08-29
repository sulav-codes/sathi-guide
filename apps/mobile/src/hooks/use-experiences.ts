import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  CreateExperienceDto,
  UpdateExperienceDto,
} from "@/types/api";
import { Category, IconSymbolName } from "@/types";

export const experienceKeys = {
  all: ["experiences"] as const,
  lists: () => [...experienceKeys.all, "list"] as const,
  list: (filters: string) => [...experienceKeys.lists(), { filters }] as const,
  details: () => [...experienceKeys.all, "detail"] as const,
  detail: (id: string) => [...experienceKeys.details(), id] as const,
  my: () => [...experienceKeys.all, "my"] as const,
  myList: (filters: string) => [...experienceKeys.my(), { filters }] as const,
};

export function useExperiences(params?: Record<string, any>) {
  return useQuery({
    queryKey: experienceKeys.list(JSON.stringify(params || {})),
    queryFn: () => apiClient.getExperiences(params),
  });
}

export function useNearbyExperiences(lat: number | null, lng: number | null, radius?: number) {
  return useQuery({
    queryKey: [...experienceKeys.lists(), "nearby", lat, lng, radius],
    queryFn: () => apiClient.getNearbyExperiences(lat!, lng!, radius),
    enabled: lat !== null && lng !== null,
  });
}

export function useExperience(id: string) {
  return useQuery({
    queryKey: experienceKeys.detail(id),
    queryFn: () => apiClient.getExperience(id),
    enabled: !!id,
  });
}

export function useMyExperiences(params?: Record<string, any>) {
  return useQuery({
    queryKey: experienceKeys.myList(JSON.stringify(params || {})),
    queryFn: () => apiClient.getMyExperiences(params),
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExperienceDto) => apiClient.createExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceKeys.all });
    },
  });
}

export function useUpdateExperience(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateExperienceDto) => apiClient.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: experienceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: experienceKeys.my() });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceKeys.all });
    },
  });
}

// Mapping from slug → display properties (frontend-only, no DB migration needed)
const CATEGORY_DISPLAY_MAP: Record<string, { icon: IconSymbolName; color: string }> = {
  culture:   { icon: "building.columns.fill",            color: "#EF4444" },
  hiking:    { icon: "figure.walk",                       color: "#2DBE6C" },
  food:      { icon: "fork.knife",                        color: "#F5820A" },
  nature:    { icon: "photo.on.rectangle.angled.fill",    color: "#10B981" },
  adventure: { icon: "figure.outdoor.cycle.circle.fill",  color: "#1A73E8" },
};

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const apiCats = await apiClient.getCategories();
      // Map API shape → Category shape expected by CategoryItem
      return apiCats.map((cat): Category => {
        const display = CATEGORY_DISPLAY_MAP[cat.slug] ?? { icon: "star.fill", color: "#6B7280" };
        return {
          id: cat.id,
          label: cat.name,
          // Use DB color if seeded, otherwise fall back to slug map
          color: cat.color ?? display.color,
          icon: (cat.iconKey as IconSymbolName) ?? display.icon,
          slug: cat.slug,
        };
      });
    },
    staleTime: 10 * 60 * 1000, // categories rarely change
  });
}
