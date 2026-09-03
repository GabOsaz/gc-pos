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
import { useOrderHistoryLogic } from "./controller/useOrderHistoryLogic";
import OrderDetailsModal from "./view/OrderDetailsModal";

const OrderHistoryPage = () => {
  const {
    orders,
    totalCount,
    page,
    totalPages,
    isLoading,
    isFetching,
    goToPreviousPage,
    goToNextPage,

    search,
    handleSearch,
    orderStatusLabel,
    paymentStatusLabel,
    handleOrderStatusFilter,
    handlePaymentStatusFilter,
    statusFilterOpen,
    setStatusFilterOpen,
    paymentFilterOpen,
    setPaymentFilterOpen,
    statusFilterRef,
    paymentFilterRef,
    orderStatusOptions,
    paymentStatusOptions,

    openRowMenu,
    rowMenuRef,
    toggleRowMenu,
    detailsOrderId,
    openDetails,
    closeDetails,

    handleGenerateReport,
  } = useOrderHistoryLogic();

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
      key: "created_at",
      header: "Date",
      render: (row) => (
        <span className="text-brand-black whitespace-nowrap">
          {formatDate(row.created_at)}
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
              className="absolute right-0 top-8 z-20 w-48 bg-white border border-brand-neutral rounded-lg shadow-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => openDetails(row.id)}
                className="w-full text-left px-4 py-3 text-sm text-brand-black hover:bg-brand-lighter-gray cursor-pointer"
              >
                View Details
              </button>
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
          {/* Search + filters + report action */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput value={search} onChange={handleSearch} />
              <FilterDropdown
                value={orderStatusLabel}
                options={orderStatusOptions}
                onSelect={handleOrderStatusFilter}
                open={statusFilterOpen}
                onToggle={() => setStatusFilterOpen(!statusFilterOpen)}
                containerRef={statusFilterRef}
                placeholder="Order Status"
                allLabel="All Statuses"
              />
              <FilterDropdown
                value={paymentStatusLabel}
                options={paymentStatusOptions}
                onSelect={handlePaymentStatusFilter}
                open={paymentFilterOpen}
                onToggle={() => setPaymentFilterOpen(!paymentFilterOpen)}
                containerRef={paymentFilterRef}
                placeholder="Payment"
                allLabel="All Payments"
              />
              {!isLoading && (
                <span className="text-sm text-brand-logan-grey">
                  {totalCount} order{totalCount === 1 ? "" : "s"}
                  {isFetching ? " · refreshing…" : ""}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleGenerateReport}
              className="bg-white border border-brand-neutral rounded-lg px-5 py-2.5 text-sm text-brand-black hover:bg-brand-lighter-gray cursor-pointer whitespace-nowrap"
            >
              Generate End of Day Report
            </button>
          </div>

          <Table
            columns={columns}
            data={orders}
            keyExtractor={(row) => row.id}
            emptyText={isLoading ? "Loading orders…" : "No orders found"}
            overflowVisible
            onRowClick={(row) => openDetails(row.id)}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        </div>
      </div>

      <OrderDetailsModal orderId={detailsOrderId} onClose={closeDetails} />
    </AppShell>
  );
};

export default OrderHistoryPage;
