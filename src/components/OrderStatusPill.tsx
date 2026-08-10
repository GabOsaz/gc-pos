import type { OrderStatus } from "../utils/orderStatus";

const statusStyles: Record<OrderStatus, string> = {
  "Pending Tag": "border-[#DD9105] text-[#DD9105]",
  Tagged: "border-brand-light-blue-1 text-brand-light-blue-1",
  "Ready for Pickup": "border-brand-gray text-brand-dark-gray",
  Completed: "border-brand-green text-brand-green",
  Cancelled: "border-brand-red text-brand-red",
};

interface OrderStatusPillProps {
  status: OrderStatus;
}

const OrderStatusPill = ({ status }: OrderStatusPillProps) => (
  <span
    className={`inline-flex items-center justify-center border rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap ${statusStyles[status]}`}
  >
    {status}
  </span>
);

export default OrderStatusPill;
