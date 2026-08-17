"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/lib/errors/ApiError";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.statusCode === 401) {
                return false;
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 10000), // 1s, 2s, 4s
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  function isPublicPage() {
    const path = window.location.pathname;
    return path === "/" || path === "/login" || path === "/register";
  }

  // Global 401 handler — only redirect if not already on an auth page
  queryClient.getQueryCache().config.onError = (error) => {
    if (error instanceof ApiError && error.statusCode === 401) {
      if (!isPublicPage()) {
        window.location.href = "/login";
      }
    }
  };

  queryClient.getMutationCache().config.onError = (error) => {
    if (error instanceof ApiError && error.statusCode === 401) {
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }
  };

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
