import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance, type ApiResponse } from "../../../../libs/instance";
import { posOrderKey } from "../queries/usePosOrder";
import type { PayOrderBody } from "../../../../model/pos/types";

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ body }: { orderId: string; body: PayOrderBody }) => {
      const res = await apiInstance.post<ApiResponse<unknown>>(
        "/payments/pos/orders",
        body
      );
      return res.data;
    },
    onSuccess: (_response, { orderId }) => {
      queryClient.removeQueries({ queryKey: posOrderKey(orderId) });
    },
  });
}
