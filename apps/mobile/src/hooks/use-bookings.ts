import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CreateBookingDto } from "@/types/api";

export const bookingKeys = {
  all: ["bookings"] as const,
  my: () => [...bookingKeys.all, "my"] as const,
  myList: (filters: string) => [...bookingKeys.my(), { filters }] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  requests: () => [...bookingKeys.all, "requests"] as const,
  requestsList: (filters: string) => [...bookingKeys.requests(), { filters }] as const,
  upcoming: () => [...bookingKeys.all, "upcoming"] as const,
  upcomingList: (filters: string) => [...bookingKeys.upcoming(), { filters }] as const,
  history: () => [...bookingKeys.all, "history"] as const,
  historyList: (filters: string) => [...bookingKeys.history(), { filters }] as const,
};

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingDto) => apiClient.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.my() });
    },
  });
}

export function useMyBookings(params?: Record<string, any>) {
  return useQuery({
    queryKey: bookingKeys.myList(JSON.stringify(params || {})),
    queryFn: () => apiClient.getMyBookings(params),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => apiClient.getBooking(id),
    enabled: !!id,
  });
}

export function useCancelBooking(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { reason: string }) => apiClient.cancelBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.my() });
    },
  });
}

export function useBookingRequests(params?: Record<string, any>) {
  return useQuery({
    queryKey: bookingKeys.requestsList(JSON.stringify(params || {})),
    queryFn: () => apiClient.getBookingRequests(params),
  });
}

export function useUpcomingBookings(params?: Record<string, any>) {
  return useQuery({
    queryKey: bookingKeys.upcomingList(JSON.stringify(params || {})),
    queryFn: () => apiClient.getUpcomingBookings(params),
  });
}

export function useBookingHistory(params?: Record<string, any>) {
  return useQuery({
    queryKey: bookingKeys.historyList(JSON.stringify(params || {})),
    queryFn: () => apiClient.getBookingHistory(params),
  });
}

export function useAcceptBooking(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: { note?: string }) => apiClient.acceptBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.requests() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.upcoming() });
    },
  });
}

export function useRejectBooking(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { reasonCode: string; reason?: string }) => apiClient.rejectBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.requests() });
    },
  });
}

export function useActiveBookings() {
  return useQuery({
    queryKey: [...bookingKeys.all, "active"] as const,
    queryFn: () => apiClient.getActiveBookings(),
    refetchInterval: 30000, // re-check every 30s
  });
}

export function useStartTrip(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: { latitude?: number; longitude?: number; accuracy?: number }) =>
      apiClient.startTrip(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: [...bookingKeys.all, "active"] });
    },
  });
}

export function useCompleteTrip(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: { latitude?: number; longitude?: number; accuracy?: number }) =>
      apiClient.completeTrip(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: [...bookingKeys.all, "active"] });
      queryClient.invalidateQueries({ queryKey: bookingKeys.history() });
    },
  });
}

export function useMarkNoShow(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.markNoShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.upcoming() });
    },
  });
}

export function useCancelByGuide(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { reasonCode: string; note?: string }) =>
      apiClient.cancelByGuide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.upcoming() });
    },
  });
}
