import { useMutation } from "@tanstack/react-query";
import { apiInstance, unwrap, type ApiResponse } from "../../../../libs/instance";
import type { PosInvoice } from "../../../../model/pos/types";

export function useFinalizeInvoice() {
  return useMutation({
    mutationFn: async ({
      orderId,
      invoiceId,
    }: {
      orderId: string;
      invoiceId: string;
    }) => {
      const res = await apiInstance.post<ApiResponse<PosInvoice>>(
        `/pos/orders/${orderId}/invoice/${invoiceId}/finalize`
      );
      return unwrap<PosInvoice>(res.data);
    },
  });
}
