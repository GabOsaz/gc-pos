import {
  usePosOrders,
  type PosOrderListRow,
  type PosOrdersFilters,
} from "../../../../common-hooks/usePosOrders";

export type { PosOrderListRow };

export type SavedBookingsFilters = Pick<
  PosOrdersFilters,
  "search" | "startDate" | "endDate"
>;

export const savedBookingsKey = "saved-bookings";

/**
 * `GET /pos/orders` pinned to unpaid drafts — an order that was saved but not
 * yet paid for is exactly what this screen calls a saved booking.
 */
export function useSavedBookings(
  page: number,
  perPage: number,
  filters: SavedBookingsFilters
) {
  const query = usePosOrders(savedBookingsKey, page, perPage, {
    ...filters,
    orderStatus: "PENDING",
    paymentStatus: "UNPAID",
  });

  return { ...query, bookings: query.orders };
}
