import AppShell from "../../components/AppShell";
import CustomModal from "../../components/Modal";
import Table from "../../components/Table";
import TablePagination from "../../components/TablePagination";
import type { ColumnDef } from "../../components/Table";
import { formatDate } from "../../utils/date";
import { formatNaira } from "../../utils/money";
import MakePaymentModal from "../place-order/view/MakePaymentModal";
import { useBookingsLogic } from "./controller/useBookingsLogic";
import type { PosOrderListRow } from "./model/queries/useSavedBookings";

const BookingsPage = () => {
  const {
    bookings,
    totalCount,
    page,
    totalPages,
    isLoading,
    isFetching,
    search,
    handleSearch,
    goToPreviousPage,
    goToNextPage,

    filterOpen,
    setFilterOpen,
    filterRef,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    applyFilters,
    clearFilters,
    hasFilters,

    payingOrderId,
    payingOrder,
    isLoadingOrder,
    openPayment,
    closePayment,
    handlePayment,
    isPaying,

    orderToDelete,
    setOrderToDelete,
    confirmDelete,
    isDeleting,
  } = useBookingsLogic();

  const columns: ColumnDef<PosOrderListRow>[] = [
    {
      key: "customer",
      header: "Customer Name",
      render: (row) => (
        <div className="min-w-40">
          <p className="font-medium text-brand-black">{row.customer?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {row.customer?.email ?? row.customer?.phone}
          </p>
        </div>
      ),
    },
    {
      key: "order_number",
      header: "Booking ID",
      render: (row) => (
        <span className="text-brand-black font-medium whitespace-nowrap">
          #{row.order_number}
        </span>
      ),
    },
    {
      key: "store",
      header: "Store",
      render: (row) => (
        <div className="min-w-40">
          <p className="text-brand-black">{row.store?.name ?? "—"}</p>
          {row.store?.address && (
            <p className="text-xs text-gray-400 mt-0.5">{row.store.address}</p>
          )}
        </div>
      ),
    },
    {
      key: "grand_total",
      header: "Amount",
      render: (row) => (
        <span className="font-medium text-brand-black whitespace-nowrap">
          {formatNaira(row.grand_total)}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date Saved",
      render: (row) => (
        <span className="text-brand-black whitespace-nowrap">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      key: "due_by",
      header: "Due Date",
      render: (row) => (
        <span className="text-brand-black whitespace-nowrap">
          {formatDate(row.due_by) || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={() => openPayment(row)}
            className="flex items-center gap-1.5 text-brand-black text-xs font-medium hover:opacity-70 cursor-pointer whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Make Payment
          </button>
          <button
            type="button"
            onClick={() => setOrderToDelete(row)}
            className="flex items-center gap-1.5 text-brand-red text-xs font-medium hover:opacity-70 cursor-pointer whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete Order
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="px-4 sm:px-8 xl:px-24 py-6 sm:py-8">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Search + filter bar */}
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-5 border-b border-gray-100">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-brand-blue w-52 bg-white"
              />
            </div>

            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                  hasFilters
                    ? "border-brand-blue text-brand-blue"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                Filter
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {filterOpen && (
                <div className="absolute left-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-brand-black mb-1.5">
                      From
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-black mb-1.5">
                      To
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={applyFilters}
                      className="flex-1 bg-brand-blue text-white rounded-lg py-2 text-sm cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isLoading && (
              <span className="text-sm text-gray-400 ml-auto">
                {totalCount} saved booking{totalCount === 1 ? "" : "s"}
                {isFetching ? " · refreshing…" : ""}
              </span>
            )}
          </div>

          <Table
            columns={columns}
            data={bookings}
            keyExtractor={(row) => row.id}
            emptyText={isLoading ? "Loading bookings…" : "No saved bookings found"}
          />

          <div className="border-t border-gray-100">
            <TablePagination
              page={page}
              totalPages={totalPages}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
            />
          </div>
        </div>
      </div>

      {/* Keyed by order so the method selection resets between bookings */}
      <MakePaymentModal
        key={payingOrderId ?? "no-order"}
        isOpen={!!payingOrderId && !isLoadingOrder}
        order={payingOrder}
        onCancel={closePayment}
        onPay={handlePayment}
        isPaying={isPaying}
      />

      <CustomModal
        isOpen={!!orderToDelete}
        handleCancel={() => setOrderToDelete(null)}
        handleSave={confirmDelete}
        handleSaveBtnText="Delete Order"
        handleSaveBtnTextClassName="bg-brand-red!"
        isHandleSaveBtnLoading={isDeleting}
        title="Delete Order"
        subTitle="This abandons the draft order. It cannot be undone."
        canCloseAtTitle
        width="w-[440px]"
        centered
      >
        <div className="px-5 sm:px-8 py-6">
          <p className="text-sm text-gray-600">
            Delete booking{" "}
            <span className="font-semibold text-brand-black">
              #{orderToDelete?.order_number}
            </span>{" "}
            for {orderToDelete?.customer?.name}? The order and all of its items
            will be marked as abandoned.
          </p>
        </div>
      </CustomModal>
    </AppShell>
  );
};

export default BookingsPage;
