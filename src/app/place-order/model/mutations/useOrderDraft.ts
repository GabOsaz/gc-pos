import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance, type ApiResponse } from "../../../../libs/instance";
import { posOrderKey } from "../queries/usePosOrder";
import type { CreatePosOrderBody, PosOrder, PosOrderItemInput } from "../../../../model/pos/types";

/**
 * Draft mutations resolve to the full `{ status, message, code, data }` envelope
 * so callers can surface the backend's own message. The refreshed order in
 * `data` is written straight into the order cache instead of triggering a refetch.
 */
function useOrderCacheWriter() {
  const queryClient = useQueryClient();
  return (response: ApiResponse<PosOrder>) => {
    const order = response?.data;
    if (order?.id) queryClient.setQueryData(posOrderKey(order.id), order);
  };
}

/** `POST /pos/orders` — creates the unpaid draft. Requires at least one item. */
export function useCreateOrder() {
  const writeOrder = useOrderCacheWriter();

  return useMutation({
    mutationFn: async (body: CreatePosOrderBody) => {
      const res = await apiInstance.post<ApiResponse<PosOrder>>("/pos/orders", body);
      return res.data;
    },
    onSuccess: writeOrder,
  });
}

/** `PUT /pos/orders/:order_id/item` — adds exactly one item to an unpaid draft. */
export function useAddOrderItem() {
  const writeOrder = useOrderCacheWriter();

  return useMutation({
    mutationFn: async ({
      orderId,
      item,
    }: {
      orderId: string;
      item: PosOrderItemInput;
    }) => {
      const res = await apiInstance.post<ApiResponse<PosOrder>>(
        `/pos/orders/${orderId}/item`,
        item
      );
      return res.data;
    },
    onSuccess: writeOrder,
  });
}

/**
 * `DELETE /pos/orders/:order_id/item/:item_id`. The backend rejects removing the
 * last remaining item — discard the whole draft instead.
 */
export function useRemoveOrderItem() {
  const writeOrder = useOrderCacheWriter();

  return useMutation({
    mutationFn: async ({ orderId, itemId }: { orderId: string; itemId: string }) => {
      const res = await apiInstance.delete<ApiResponse<PosOrder>>(
        `/pos/orders/${orderId}/item/${itemId}`
      );
      return res.data;
    },
    onSuccess: writeOrder,
  });
}

/** `POST /pos/orders/:order_id/abandon` — only valid while PENDING + UNPAID. */
export function useAbandonOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const res = await apiInstance.post<ApiResponse<PosOrder>>(
        `/pos/orders/${orderId}/abandon`,
        { reason: reason ?? null }
      );
      return res.data;
    },
    onSuccess: (response) => {
      const order = response?.data;
      if (order?.id) queryClient.removeQueries({ queryKey: posOrderKey(order.id) });
    },
  });
}
