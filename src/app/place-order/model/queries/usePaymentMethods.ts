import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance, unwrap } from "../../../../libs/instance";
import type { PosPaymentMethod } from "../types";

/**
 * `GET /pos/orders/catalog/payment-methods` — store-scoped for non-super admins.
 * System/internal methods (the voucher) are filtered out: the backend applies
 * voucher itself and rejects the id if it is submitted.
 */
export function usePaymentMethods(enabled = true) {
  const query = useQuery({
    queryKey: ["pos", "payment-methods"],
    enabled,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const res = await apiInstance.get("/pos/orders/catalog/payment-methods");
      return unwrap<PosPaymentMethod[]>(res.data) ?? [];
    },
  });

  const methods = useMemo(
    () => (query.data ?? []).filter((m) => m.is_active && !m.is_system_internal),
    [query.data]
  );

  /** Grouped by channel, since the design picks a channel before a method. */
  const byChannel = useMemo(() => {
    const groups = new Map<string, PosPaymentMethod[]>();
    methods.forEach((method) => {
      const existing = groups.get(method.payment_channel) ?? [];
      groups.set(method.payment_channel, [...existing, method]);
    });
    return groups;
  }, [methods]);

  return { ...query, methods, byChannel };
}

const CHANNEL_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  transfer: "Bank Transfer",
  wallet: "Wallet",
};

export const channelLabel = (channel: string) =>
  CHANNEL_LABELS[channel] ??
  channel.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** The second dropdown's label depends on what is being picked. */
export const channelPickerLabel = (channel: string) => {
  if (channel === "card") return "Select POS";
  if (channel === "transfer") return "Select Account";
  return "Select Method";
};
