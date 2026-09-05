import { QueryCache, QueryClient } from '@tanstack/react-query'
import apiErrFn from '../utils/apiErrFn'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => apiErrFn(error, 'Could not load data'),
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
