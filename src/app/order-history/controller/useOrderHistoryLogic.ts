import { useOrderTable, type OrderRow } from "../../../common-hooks/useOrderTable";
import { buildMockOrders } from "../../../utils/mockOrders";

const rowActions = ["View Details", "Print Tag", "Reprint Receipt"] as const;

const mockOrders = buildMockOrders("Pending Tag");

export const useOrderHistoryLogic = () => {
  const table = useOrderTable<OrderRow>({ data: mockOrders });

  const handleRowAction = (action: string, order: OrderRow) => {
    // TODO: wire to order actions once the endpoints are available.
    console.info(`${action} -> ${order.orderId}`);
    table.closeRowMenu();
  };

  const handleGenerateReport = () => {
    // TODO: wire to end of day report endpoint.
    console.info("Generate end of day report");
  };

  return {
    table,
    rowActions,
    handleRowAction,
    handleGenerateReport,
  };
};
