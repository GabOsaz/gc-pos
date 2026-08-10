import AppShell from "../../components/AppShell";
import OrderTable from "../../components/OrderTable";
import { useTodaysPickupLogic } from "./controller/useTodaysPickupLogic";

const TodaysPickupPage = () => {
  const { table, rowActions, handleRowAction, openDetails } = useTodaysPickupLogic();

  return (
    <AppShell>
      <div className="px-24 py-8">
        <OrderTable
          table={table}
          rowActions={rowActions}
          onRowAction={handleRowAction}
          onRowClick={openDetails}
          emptyText="No pickups for today"
        />
      </div>
    </AppShell>
  );
};

export default TodaysPickupPage;
