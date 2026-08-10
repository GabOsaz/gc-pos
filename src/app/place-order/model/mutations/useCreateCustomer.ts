import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance, type ApiResponse } from "../../../../libs/instance";
import type { CreatePosCustomerBody, PosCustomerSummary } from "../types";

/**
 * `POST /pos/orders/customers` — creates a local customer only (no CleanCloud,
 * no virtual bank account). A duplicate email or phone comes back as a 409.
 * Resolves to the full envelope so the caller can toast the backend's message.
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreatePosCustomerBody) => {
      const res = await apiInstance.post<ApiResponse<PosCustomerSummary>>(
        "/pos/orders/customers",
        body
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "customers"] });
    },
  });
}
