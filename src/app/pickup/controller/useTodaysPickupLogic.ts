import { useNavigate } from "@tanstack/react-router";
import { useOrderTable, type OrderRow } from "../../../common-hooks/useOrderTable";
import { buildMockOrders } from "../../../utils/mockOrders";

const rowActions = ["View Details", "Mark as Delivered"] as const;

const mockPickups = buildMockOrders("Ready for Pickup");

export const useTodaysPickupLogic = () => {
  const navigate = useNavigate();
  const table = useOrderTable<OrderRow>({ data: mockPickups });

  const openDetails = (order: OrderRow) =>
    navigate({ to: "/pickup/$id", params: { id: order.id } });

  const handleRowAction = (action: string, order: OrderRow) => {
    table.closeRowMenu();

    if (action === "View Details") {
      openDetails(order);
      return;
    }

    // TODO: wire to pickup actions once the endpoints are available.
    console.info(`${action} -> ${order.orderId}`);
  };

  return {
    table,
    rowActions,
    handleRowAction,
    openDetails,
  };
};
