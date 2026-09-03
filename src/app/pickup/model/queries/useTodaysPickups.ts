import {
  usePosOrders,
  type PosOrderListRow,
  type PosOrdersFilters,
} from "../../../../common-hooks/usePosOrders";
import { todayIso } from "../../../../utils/date";

export type { PosOrderListRow };

export type TodaysPickupFilters = Pick<
  PosOrdersFilters,
  "search" | "orderStatus" | "paymentStatus"
>;

export const todaysPickupKey = "todays-pickup";

export function useTodaysPickups(
  page: number,
  perPage: number,
  filters: TodaysPickupFilters
) {
  const today = todayIso();

  const query = usePosOrders(todaysPickupKey, page, perPage, {
    ...filters,
    startDate: today,
    // endDate: today,
  });

  return { ...query, pickups: query.orders };
}
