import AppShell from "../../components/AppShell";
import OrderTable from "../../components/OrderTable";
import { useOrderHistoryLogic } from "./controller/useOrderHistoryLogic";

const OrderHistoryPage = () => {
  const { table, rowActions, handleRowAction, handleGenerateReport } =
    useOrderHistoryLogic();

  return (
    <AppShell>
      <div className="px-24 py-8">
        <OrderTable
          table={table}
          rowActions={rowActions}
          onRowAction={handleRowAction}
          headerAction={
            <button
              type="button"
              onClick={handleGenerateReport}
              className="bg-white border border-brand-neutral rounded-lg px-5 py-2.5 text-sm text-brand-black hover:bg-brand-lighter-gray cursor-pointer whitespace-nowrap"
            >
              Generate End of Day Report
            </button>
          }
        />
      </div>
    </AppShell>
  );
};

export default OrderHistoryPage;
