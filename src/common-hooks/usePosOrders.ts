import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiInstance, unwrap } from "../libs/instance";
import type { OrderStatus, PaymentStatus, PosOrder } from "../model/pos/types";

/**
 * List rows are the order header plus customer/store/pos_attendant. The API
 * deliberately omits `order_items` and `invoice` from this view.
 */
export type PosOrderListRow = Omit<PosOrder, "order_items" | "invoice">;

export interface PosOrdersFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

/**
 * The guide documents this endpoint's query params but not its pagination
 * envelope, so the response is read tolerantly: a bare array, `rows`, or a
 * nested `data` array. Falls back to a single page when no meta is present.
 */
interface PaginatedBody {
  rows?: PosOrderListRow[];
  data?: PosOrderListRow[];
  page?: number;
  per_page?: number;
  total_count?: number;
  total_pages?: number;
}

export const posOrdersKey = "pos-orders";

/** `GET /pos/orders` — the shared paginated order list. */
export function usePosOrders(
  scope: string,
  page: number,
  perPage: number,
  filters: PosOrdersFilters
) {
  const query = useQuery({
    queryKey: ["pos", posOrdersKey, scope, page, perPage, filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await apiInstance.get("/pos/orders", {
        params: {
          page,
          per_page: perPage,
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.startDate ? { start_date: filters.startDate } : {}),
          ...(filters.endDate ? { end_date: filters.endDate } : {}),
          ...(filters.orderStatus ? { order_status: filters.orderStatus } : {}),
          ...(filters.paymentStatus
            ? { order_payment_status: filters.paymentStatus }
            : {}),
        },
      });

      const body = unwrap<PaginatedBody | PosOrderListRow[]>(res.data);
      const rows = Array.isArray(body) ? body : (body?.rows ?? body?.data ?? []);
      const meta = Array.isArray(body) ? {} : (body ?? {});

      return {
        rows,
        page: meta.page ?? page,
        totalPages: Math.max(1, meta.total_pages ?? 1),
        totalCount: meta.total_count ?? rows.length,
      };
    },
  });

  return {
    ...query,
    orders: query.data?.rows ?? [],
    totalPages: query.data?.totalPages ?? 1,
    totalCount: query.data?.totalCount ?? 0,
  };
}
