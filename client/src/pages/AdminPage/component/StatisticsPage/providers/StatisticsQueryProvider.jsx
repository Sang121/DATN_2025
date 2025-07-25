import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Cấu hình QueryClient với các setting tối ưu cho statistics
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5 phút
      cacheTime: 600000, // 10 phút
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Retry tối đa 2 lần cho API calls
        if (failureCount < 2) {
          return true;
        }
        // Không retry cho lỗi 401, 403
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});

const StatisticsQueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ReactQuery DevTools - có thể enable khi cần debug */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

export default StatisticsQueryProvider;
