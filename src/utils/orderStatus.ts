export const orderStatuses = [
  "Pending Tag",
  "Tagged",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

/* --------------------------------------------------------------- API values */

/** `order_status` as returned by the POS API. */
export const posOrderStatuses = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "ABANDONED",
] as const;

export type PosOrderStatus = (typeof posOrderStatuses)[number];

/** `payment_status` as returned by the POS API. */
export const posPaymentStatuses = ["UNPAID", "PARTIALLY_PAID", "PAID"] as const;

export type PosPaymentStatus = (typeof posPaymentStatuses)[number];

/** A `PENDING` order is a saved draft that has not been paid for yet. */
export const posOrderStatusLabels: Record<PosOrderStatus, string> = {
  PENDING: "Draft",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  ABANDONED: "Abandoned",
};

export const posPaymentStatusLabels: Record<PosPaymentStatus, string> = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Part Paid",
  PAID: "Paid",
};
