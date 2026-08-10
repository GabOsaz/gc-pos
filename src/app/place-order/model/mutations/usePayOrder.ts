import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance, type ApiResponse } from "../../../../libs/instance";
import { posOrderKey } from "../queries/usePosOrder";
import type { PayOrderBody } from "../types";

/**
 * `POST /payments/pos/orders/:order_id` — takes payment against an order.
 *
 * The backend applies the customer's voucher balance first; only the remaining
 * user-selected methods go in `payment_methods`. This endpoint does not return
 * the refreshed order, so the cached copy is dropped on success.
 */
export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, body }: { orderId: string; body: PayOrderBody }) => {
      const res = await apiInstance.post<ApiResponse<unknown>>(
        `/payments/pos/orders/${orderId}`,
        body
      );
      return res.data;
    },
    onSuccess: (_response, { orderId }) => {
      // Payment moves the order to PROCESSING; it is no longer an editable draft.
      queryClient.removeQueries({ queryKey: posOrderKey(orderId) });
    },
  });
}
