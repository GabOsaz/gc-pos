import AppShell from "../../components/AppShell";
import FilterDropdown from "../../components/FilterDropdown";
import OrderStatusPill from "../../components/OrderStatusPill";
import SearchInput from "../../components/SearchInput";
import Table from "../../components/Table";
import TablePagination from "../../components/TablePagination";
import type { ColumnDef } from "../../components/Table";
import type { PosOrderListRow } from "../../common-hooks/usePosOrders";
import { formatDate } from "../../utils/date";
import { formatNaira } from "../../utils/money";
import { useTodaysPickupLogic } from "./controller/useTodaysPickupLogic";

const TodaysPickupPage = () => {
  const {
    pickups,
    totalCount,
    page,
    totalPages,
    isLoading,
    isFetching,
    goToPreviousPage,
    goToNextPage,

    search,
    handleSearch,
    statusLabel,
    handleStatusFilter,
    filterOpen,
    setFilterOpen,
    filterRef,
    statusOptions,

    openRowMenu,
    rowMenuRef,
    toggleRowMenu,
    rowActions,
    handleRowAction,
    openDetails,
  } = useTodaysPickupLogic();

  const columns: ColumnDef<PosOrderListRow>[] = [
    {
      key: "customer",
      header: "Customer Name",
      render: (row) => (
        <div className="min-w-40">
          <p className="text-brand-black">{row.customer?.name}</p>
          <p className="text-xs text-brand-logan-grey mt-0.5">
            {row.customer?.email ?? row.customer?.phone}
          </p>
        </div>
      ),
    },
    {
      key: "order_number",
      header: "Order ID",
      render: (row) => (
        <span className="text-brand-black whitespace-nowrap">#{row.order_number}</span>
      ),
    },
    {
      key: "store",
      header: "Store",
      render: (row) => (
        <div className="min-w-32">
          <p className="text-brand-black">{row.store?.name ?? "—"}</p>
          {row.pos_attendant?.name && (
            <p className="text-xs text-brand-logan-grey mt-0.5">
              {row.pos_attendant.name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <div className="whitespace-nowrap">
          <p className="text-brand-black">{formatNaira(row.grand_total)}</p>
          {row.balance_due > 0 && (
            <p className="text-xs text-brand-red mt-0.5">
              {formatNaira(row.balance_due)} due
            </p>
          )}
        </div>
      ),
    },
    {
      key: "due_by",
      header: "Pickup Date",
      render: (row) => (
        <span className="text-brand-black whitespace-nowrap">
          {formatDate(row.due_by) || "—"}
        </span>
      ),
    },
    {
      key: "payment_status",
      header: "Payment",
      render: (row) => <OrderStatusPill status={row.payment_status} />,
    },
    {
      key: "order_status",
      header: "Order Status",
      render: (row) => <OrderStatusPill status={row.order_status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div
          className="relative flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Actions for order ${row.order_number}`}
            onClick={() => toggleRowMenu(row.id)}
            className="text-brand-dark-gray hover:text-brand-black cursor-pointer px-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>

          {openRowMenu === row.id && (
            <div
              ref={rowMenuRef}
              className="absolute right-0 top-8 z-20 w-48 bg-white border border-brand-neutral rounded-lg shadow-lg divide-y divide-brand-neutral overflow-hidden"
            >
              {rowActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleRowAction(action, row)}
                  className="w-full text-left px-4 py-3 text-sm text-brand-black hover:bg-brand-lighter-gray cursor-pointer"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="px-4 sm:px-8 xl:px-24 py-6 sm:py-8">
        <div className="bg-brand-lighter-gray border border-brand-neutral rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-5">
            <SearchInput value={search} onChange={handleSearch} />
            <FilterDropdown
              value={statusLabel}
              options={statusOptions}
              onSelect={handleStatusFilter}
              open={filterOpen}
              onToggle={() => setFilterOpen(!filterOpen)}
              containerRef={filterRef}
              placeholder="Order Status"
              allLabel="All Statuses"
            />
            {!isLoading && (
              <span className="text-sm text-brand-logan-grey">
                {totalCount} order{totalCount === 1 ? "" : "s"} today
                {isFetching ? " · refreshing…" : ""}
              </span>
            )}
          </div>

          <Table
            columns={columns}
            data={pickups}
            keyExtractor={(row) => row.id}
            emptyText={isLoading ? "Loading pickups…" : "No pickups for today"}
            overflowVisible
            onRowClick={openDetails}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        </div>
      </div>
    </AppShell>
  );
};

export default TodaysPickupPage;
