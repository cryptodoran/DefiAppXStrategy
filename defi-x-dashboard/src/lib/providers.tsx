'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider } from '@/components/ui/toast';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds - data considered fresh
            gcTime: 5 * 60 * 1000, // 5 minutes cache
            refetchOnWindowFocus: true, // Refetch when user returns
            refetchOnReconnect: true, // Refetch on network reconnect
            retry: 2, // Retry failed requests
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
