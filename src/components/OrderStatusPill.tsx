import {
  posOrderStatusLabels,
  posPaymentStatusLabels,
  type OrderStatus,
  type PosOrderStatus,
  type PosPaymentStatus,
} from "../utils/orderStatus";

type AnyStatus = OrderStatus | PosOrderStatus | PosPaymentStatus;

const statusStyles: Record<AnyStatus, string> = {
  // Pipeline labels used by the pickup screens
  "Pending Tag": "border-[#DD9105] text-[#DD9105]",
  Tagged: "border-brand-light-blue-1 text-brand-light-blue-1",
  "Ready for Pickup": "border-brand-gray text-brand-dark-gray",
  Completed: "border-brand-green text-brand-green",
  Cancelled: "border-brand-red text-brand-red",

  // `order_status` from the API
  PENDING: "border-[#DD9105] text-[#DD9105]",
  PROCESSING: "border-brand-light-blue-1 text-brand-light-blue-1",
  COMPLETED: "border-brand-green text-brand-green",
  ABANDONED: "border-brand-red text-brand-red",

  // `payment_status` from the API
  UNPAID: "border-brand-red text-brand-red",
  PARTIALLY_PAID: "border-[#DD9105] text-[#DD9105]",
  PAID: "border-brand-green text-brand-green",
};

/** API status values render with a human label; UI labels render as-is. */
const displayLabel = (status: AnyStatus) =>
  posOrderStatusLabels[status as PosOrderStatus] ??
  posPaymentStatusLabels[status as PosPaymentStatus] ??
  status;

interface OrderStatusPillProps {
  status: AnyStatus;
}

const OrderStatusPill = ({ status }: OrderStatusPillProps) => (
  <span
    className={`inline-flex items-center justify-center border rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap ${statusStyles[status]}`}
  >
    {displayLabel(status)}
  </span>
);

export default OrderStatusPill;
