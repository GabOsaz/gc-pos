import Table from "../Table";
import type { ColumnDef } from "../Table";
import OrderStatusPill from "../OrderStatusPill";
import SearchInput from "../SearchInput";
import FilterDropdown from "../FilterDropdown";
import TablePagination from "../TablePagination";
import type { OrderRow, OrderTableState } from "../../common-hooks/useOrderTable";

function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

interface OrderTableProps<T extends OrderRow> {
  table: OrderTableState<T>;
  /** Labels rendered in each row's "..." menu. */
  rowActions: readonly string[];
  onRowAction: (action: string, row: T) => void;
  /** Rendered on the right of the search bar, e.g. an export button. */
  headerAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  idHeader?: string;
  emptyText?: string;
}

function OrderTable<T extends OrderRow>({
  table,
  rowActions,
  onRowAction,
  headerAction,
  onRowClick,
  idHeader = "Order ID",
  emptyText = "No orders found",
}: OrderTableProps<T>) {
  const {
    search,
    statusFilter,
    filterOpen,
    openRowMenu,
    orders,
    page,
    totalPages,
    filterRef,
    rowMenuRef,
    setFilterOpen,
    handleSearch,
    handleStatusFilter,
    toggleRowMenu,
    goToPreviousPage,
    goToNextPage,
    statusOptions,
  } = table;

  const columns: ColumnDef<T>[] = [
    {
      key: "customerName",
      header: "Customer Name",
      render: (row) => (
        <div>
          <p className="text-brand-black">{row.customerName}</p>
          <p className="text-xs text-brand-logan-grey mt-0.5">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "orderId",
      header: idHeader,
      render: (row) => <span className="text-brand-black">{row.orderId}</span>,
    },
    {
      key: "deliveryType",
      header: "Delivery Details",
      render: (row) => (
        <div>
          <p className="text-brand-black">{row.deliveryType}</p>
          <p className="text-xs text-brand-logan-grey mt-0.5">{row.deliveryLocation}</p>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row) => <span className="text-brand-black">{row.quantity}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => <span className="text-brand-black">{fmt(row.amount)}</span>,
    },
    {
      key: "deliveryDate",
      header: "Delivery Date",
      render: (row) => <span className="text-brand-black">{row.deliveryDate}</span>,
    },
    {
      key: "status",
      header: "Order Status",
      render: (row) => <OrderStatusPill status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        // Stop clicks here from bubbling into the row's own click handler.
        <div
          className="relative flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Actions for order ${row.orderId}`}
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
                  onClick={() => onRowAction(action, row)}
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
    <div className="bg-brand-lighter-gray border border-brand-neutral rounded-2xl">
      {/* Search + Filter + optional header action */}
      <div className="flex items-center justify-between gap-3 px-6 py-5">
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={handleSearch} />
          <FilterDropdown
            value={statusFilter}
            options={statusOptions}
            onSelect={(status) => handleStatusFilter(status as typeof statusFilter)}
            open={filterOpen}
            onToggle={() => setFilterOpen(!filterOpen)}
            containerRef={filterRef}
            allLabel="All Statuses"
          />
        </div>

        {headerAction}
      </div>

      <Table
        columns={columns}
        data={orders}
        keyExtractor={(row) => row.id}
        emptyText={emptyText}
        overflowVisible
        onRowClick={onRowClick}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
      />
    </div>
  );
}

export default OrderTable;
