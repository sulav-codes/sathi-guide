import { createTRPCReact, httpBatchLink, TRPCLink } from "@trpc/react-query";
import { QueryClient } from "@tanstack/react-query";
import type { AppRouter } from "@sathiguide/backend";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

// Custom link to add auth token to requests
const authLink: TRPCLink<AppRouter> = () => {
  return ({ op, next }) => {
    const token = SecureStore.getItem("accessToken");

    op.headers = {
      ...op.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    };

    return next(op);
  };
};

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

export const trpcClient = trpc.createClient({
  links: [
    authLink,
    httpBatchLink({
      url: `${API_URL}/api/v1/trpc`,
      headers: async () => {
        const token = await SecureStore.getItemAsync("accessToken");
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
});
