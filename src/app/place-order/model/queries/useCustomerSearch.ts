import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiInstance, unwrap } from "../../../../libs/instance";
import type { PosCustomerSearchResponse } from "../types";

/** The endpoint requires a `search` term, so don't fire on an empty box. */
const MIN_SEARCH_LENGTH = 2;

/**
 * `GET /pos/orders/customers/search` — matches name, email, phone, normalised
 * Nigerian phone, and whitespace-insensitive full name.
 */
export function useCustomerSearch(search: string, enabled = true) {
  const term = search.trim();
  const canSearch = enabled && term.length >= MIN_SEARCH_LENGTH;

  const query = useQuery({
    queryKey: ["pos", "customers", term],
    enabled: canSearch,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await apiInstance.get("/pos/orders/customers/search", {
        params: { search: term, per_page: 20 },
      });
      return unwrap<PosCustomerSearchResponse>(res.data);
    },
  });

  return {
    ...query,
    customers: query.data?.rows ?? [],
    canSearch,
    minSearchLength: MIN_SEARCH_LENGTH,
  };
}
