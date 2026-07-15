import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  CreateExperienceDto,
  UpdateExperienceDto,
} from "@/types/api";

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

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.getCategories(),
    staleTime: 10 * 60 * 1000, // categories rarely change
    initialData: [
      { id: "culture", name: "Culture", description: "Culture and Heritage", icon: "bank" } as any,
      { id: "hiking", name: "Hiking", description: "Trekking and Hiking", icon: "mountain" } as any,
      { id: "food", name: "Food", description: "Food and Culinary", icon: "restaurant" } as any,
      { id: "nature", name: "Nature", description: "Nature and Wildlife", icon: "leaf" } as any,
      { id: "adventure", name: "Adventure", description: "Adventure Sports", icon: "rocket" } as any,
    ],
  });
}
