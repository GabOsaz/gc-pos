import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
    },
    mutations: {
      // Never retry a mutation. None of the POS writes are idempotent and the
      // API takes no idempotency key, so a retry of create-order or take-payment
      // is a second order or a second payment, not a recovery.
      retry: 0,
    },
  },
})
