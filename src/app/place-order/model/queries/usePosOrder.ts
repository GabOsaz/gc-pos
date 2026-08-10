import { useQuery } from "@tanstack/react-query";
import { apiInstance, unwrap } from "../../../../libs/instance";
import type { PosOrder } from "../types";

export const posOrderKey = (orderId: string | null) => ["pos", "order", orderId] as const;

/**
 * `GET /pos/orders/:order_id` — the current persisted order. Used to recover a
 * draft after a page reload; add/remove-item mutations write straight into this
 * cache entry, so the summary panel never has to refetch on every edit.
 */
export function usePosOrder(orderId: string | null) {
  return useQuery({
    queryKey: posOrderKey(orderId),
    enabled: !!orderId,
    // The draft is only ever mutated by this tab; mutation responses keep it fresh.
    staleTime: Infinity,
    queryFn: async () => {
      const res = await apiInstance.get(`/pos/orders/${orderId}`);
      return unwrap<PosOrder>(res.data);
    },
  });
}
