import AppShell from "../../../components/AppShell";
import BackBtn from "../../../components/BackBtn";
import CustomButton from "../../../components/CustomButton";
import FilterDropdown from "../../../components/FilterDropdown";
import OrderStatusPill from "../../../components/OrderStatusPill";
import SearchInput from "../../../components/SearchInput";
import Table from "../../../components/Table";
import type { ColumnDef } from "../../../components/Table";
import TablePagination from "../../../components/TablePagination";
import type { OrderItemRow } from "../../../utils/mockOrders";
import { usePickupDetailsLogic } from "./controller/usePickupDetailsLogic";

function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

const SummaryField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="px-6 py-5 border-l border-brand-neutral first:border-l-0 first:pl-0 min-w-0">
    <p className="text-xs text-brand-logan-grey">{label}</p>
    <div className="text-sm text-brand-black mt-2 truncate">{children}</div>
  </div>
);

const PickupDetailsPage = () => {
  const {
    order,
    items,
    search,
    typeFilter,
    filterOpen,
    page,
    totalPages,
    filterRef,
    setFilterOpen,
    handleSearch,
    handleTypeFilter,
    handleMarkAsDone,
    handlePrintReceipt,
    goBack,
    goToPreviousPage,
    goToNextPage,
    typeOptions,
  } = usePickupDetailsLogic();

  const columns: ColumnDef<OrderItemRow>[] = [
    {
      key: "item",
      header: "Item",
      render: (row) => <span className="text-brand-black">{row.item}</span>,
    },
    {
      key: "category",
      header: "Item category",
      render: (row) => <span className="text-brand-black">{row.category}</span>,
    },
    {
      key: "colour",
      header: "Colour",
      render: (row) => <span className="text-brand-black">{row.colour}</span>,
    },
    {
      key: "serviceType",
      header: "Service Type",
      render: (row) => <span className="text-brand-black">{fmt(row.serviceType)}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <div>
          <p className="text-brand-black">{row.type}</p>
          {row.typeDate && (
            <p className="text-xs text-brand-logan-grey mt-0.5">{row.typeDate}</p>
          )}
        </div>
      ),
    },
    {
      key: "unitPrice",
      header: "Unit Price",
      render: (row) => <span className="text-brand-black">{fmt(row.unitPrice)}</span>,
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row) => <span className="text-brand-black">{row.quantity}</span>,
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      render: (row) => <span className="text-brand-black">{fmt(row.totalAmount)}</span>,
    },
  ];

  return (
    <AppShell>
      <div className="px-24 py-8">
        <BackBtn hasBackBtn label="Go Back" backBtnFn={goBack} />

        {/* Order summary */}
        <div className="bg-brand-lighter-gray border border-brand-neutral rounded-2xl px-8 py-7 mt-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl text-brand-black">{order.customerName}</h2>
              <p className="text-sm text-brand-logan-grey mt-1">
                {order.customerEmail}
              </p>
            </div>
            <CustomButton
              title="Mark as Done"
              onClick={handleMarkAsDone}
              noShadow
              className="rounded-lg"
            />
          </div>

          <div className="border-t border-brand-neutral mt-6">
            <div className="grid grid-cols-5">
              <SummaryField label="Order ID">{order.orderId}</SummaryField>
              <SummaryField label="Delivery Address">
                {order.deliveryLocation}
              </SummaryField>
              <SummaryField label="Delivery Date">{order.deliveryDate}</SummaryField>
              <SummaryField label="Date Created">{order.dateCreated}</SummaryField>
              <SummaryField label="No. of Items">
                {order.itemCount} Items
              </SummaryField>
            </div>
          </div>

          <div className="border-t border-brand-neutral">
            <div className="grid grid-cols-5">
              <SummaryField label="Delivery Type">{order.deliveryType}</SummaryField>
              <SummaryField label="Amount">{fmt(order.totalAmount)}</SummaryField>
              <SummaryField label="CRO Name">{order.croName}</SummaryField>
              <SummaryField label="Store Location">
                {order.storeLocation}
              </SummaryField>
              <SummaryField label="Status">
                <OrderStatusPill status={order.status} />
              </SummaryField>
            </div>
          </div>
        </div>

        {/* Items in order */}
        <div className="bg-brand-lighter-gray border border-brand-neutral rounded-2xl mt-6">
          <div className="flex items-center justify-between gap-3 px-6 py-5">
            <h3 className="text-base font-medium text-brand-black">Items in Order</h3>

            <div className="flex items-center gap-3">
              <SearchInput value={search} onChange={handleSearch} width="w-80" />
              <FilterDropdown
                value={typeFilter}
                options={typeOptions}
                onSelect={(type) => handleTypeFilter(type as typeof typeFilter)}
                open={filterOpen}
                onToggle={() => setFilterOpen(!filterOpen)}
                containerRef={filterRef}
                allLabel="All Types"
              />
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-2 bg-white border border-brand-neutral rounded-lg px-5 py-2.5 text-sm text-brand-black hover:bg-brand-lighter-gray cursor-pointer whitespace-nowrap"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9V3h12v6" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                  <path d="M6 14h12v7H6z" />
                </svg>
                Print Receipt
              </button>
            </div>
          </div>

          <Table
            columns={columns}
            data={items}
            keyExtractor={(row) => row.id}
            emptyText="No items in this order"
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

export default PickupDetailsPage;
