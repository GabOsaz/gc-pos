import { useQuery } from "@tanstack/react-query";
import { apiInstance, unwrap } from "../../../../libs/instance";

/**
 * A row from `order_item_piece_history` — the pipeline spine for one physical
 * piece. The guide names the query params and the `action` values but does not
 * document the row shape, so these fields are inferred and read defensively.
 */
export interface ItemHistoryRow {
  id: string;
  order_id: string | null;
  order_item_id: string | null;
  order_item_piece_id: string | null;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  event_data: Record<string, unknown>;
  created_at: string;
}

interface PaginatedBody {
  rows?: ItemHistoryRow[];
  data?: ItemHistoryRow[];
  total_count?: number;
  total_pages?: number;
}

/**
 * `GET /admins/orders/item-history` — note this lives on the admin/orders
 * router, not the POS one.
 */
export function useItemHistory(orderId: string | null) {
  const query = useQuery({
    queryKey: ["pos", "item-history", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await apiInstance.get("/admins/orders/item-history", {
        params: { order_id: orderId, per_page: 100 },
      });
      const body = unwrap<PaginatedBody | ItemHistoryRow[]>(res.data);
      return Array.isArray(body) ? body : (body?.rows ?? body?.data ?? []);
    },
  });

  return { ...query, history: query.data ?? [] };
}
