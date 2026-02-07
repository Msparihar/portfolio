import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 1,
      retryDelay: 2000,
    },
  },
});
