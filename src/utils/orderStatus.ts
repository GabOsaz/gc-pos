export const orderStatuses = [
  "Pending Tag",
  "Tagged",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];
