import AppShell from "../../components/AppShell";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import EmptyState from "../../components/EmptyState";
import { formatNaira } from "../../utils/money";
import AddOrderModal from "./view/AddOrderModal";
import SelectCustomerModal from "./view/SelectCustomerModal";
import AddCustomerModal from "./view/AddCustomerModal";
import MakePaymentModal from "./view/MakePaymentModal";
import { usePlaceOrderLogic } from "./controller/usePlaceOrderLogic";

/** Loyalty and promo rows come back as DEBIT adjustments on the order. */
function adjustmentLabel(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const PlaceOrderPage = () => {
  const {
    activeCategory,
    search,
    services,
    categories,
    isLoadingServices,
    setActiveCategory,
    setSearch,

    selectedCustomer,
    isCustomerLocked,
    selectCustomerOpen,
    addCustomerOpen,
    setSelectCustomerOpen,
    setAddCustomerOpen,
    chooseCustomer,
    clearCustomer,

    selectedProduct,
    addOrderForm,
    openAddOrderModal,
    closeAddOrderModal,
    patchForm,
    handleAddToOrder,
    isSavingItem,

    order,
    orderLines,
    isLoadingOrder,
    isMutatingDraft,
    increaseLine,
    decreaseLine,
    removeLine,
    discardDraft,
    saveOrder,

    paymentOpen,
    openPayment,
    closePayment,
    handlePayment,
    isPaying,
  } = usePlaceOrderLogic();

  return (
    <AppShell>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 px-4 sm:px-8 xl:px-24 py-6 sm:py-8 flex-1 min-h-0">
        {/* Left: product selection */}
        <div className="w-full lg:w-[65%]">
          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 mb-5">
            <h2 className="text-lg font-semibold shrink-0">New Order</h2>
            <div className="relative w-full sm:w-auto sm:min-w-70 sm:max-w-lg">
              <CustomInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-[#D0D5DD] outline-none focus:border-brand-blue"
                showSearchIcon
                placeholder="Search"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "border-brand-blue text-brand-blue"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoadingServices
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl overflow-hidden aspect-4/5 bg-gray-200 animate-pulse"
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
                      <div className="h-3 w-20 bg-gray-300 rounded" />
                      <div className="h-2.5 w-10 bg-gray-300 rounded" />
                    </div>
                  </div>
                ))
              : services.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => openAddOrderModal(product)}
                    className="relative rounded-xl overflow-hidden aspect-4/5 bg-[#1B2540] text-white text-left cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-end justify-between">
                        <span className="text-sm font-medium">{product.name}</span>
                        {!!product.pieces && (
                          <span className="text-xs text-white/60">
                            {product.pieces} Piece
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/70">
                        {formatNaira(product.price)}
                      </span>
                    </div>
                  </button>
                ))}
          </div>

          {!isLoadingServices && services.length === 0 && (
            <p className="text-sm text-gray-400 mt-6">
              No service items match this search or category.
            </p>
          )}
        </div>

        {/* Right: order summary */}
        <div className="w-full lg:w-[35%] lg:shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-brand-black">Order Summary</h2>
            {order && (
              <span className="text-xs text-gray-400">#{order.order_number}</span>
            )}
          </div>
          <hr className="my-6 border-gray-200" />

          {selectedCustomer ? (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-black">
                  {selectedCustomer.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {selectedCustomer.phone ?? selectedCustomer.address ?? ""}
                </p>
                {selectedCustomer.voucher_balance > 0 && (
                  <p className="text-xs text-brand-green">
                    Voucher {formatNaira(selectedCustomer.voucher_balance)} — applied
                    automatically at payment
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={clearCustomer}
                title={
                  isCustomerLocked
                    ? "Discard the draft to change the customer"
                    : "Remove customer"
                }
                className={`shrink-0 ${
                  isCustomerLocked
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-gray-600 cursor-pointer"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex gap-3 mb-4 w-full">
              <button
                type="button"
                onClick={() => setSelectCustomerOpen(true)}
                className="flex-1 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 cursor-pointer"
              >
                Select Registered Customer
              </button>
              <button
                type="button"
                onClick={() => setAddCustomerOpen(true)}
                className="flex-1 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 cursor-pointer"
              >
                Add a New Customer
              </button>
            </div>
          )}

          {orderLines.length === 0 ? (
            <div className="mt-10">
              {isLoadingOrder ? (
                <p className="text-sm text-gray-400 text-center">Loading draft…</p>
              ) : (
                <EmptyState
                  title="You have not added an order yet"
                  subTitle="Orders you add would be listed here"
                />
              )}
            </div>
          ) : (
            <div className={`mt-4 ${isMutatingDraft ? "opacity-60 pointer-events-none" : ""}`}>
              {/* Items card */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-5">
                {orderLines.map((line, i) => (
                  <div
                    key={line.key}
                    className={`flex flex-wrap items-center gap-3 px-4 py-4 ${
                      i < orderLines.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-black truncate">
                        {line.name}
                      </p>
                      {line.tags.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {line.tags.join(" • ")}
                        </p>
                      )}
                    </div>
                    {/* Qty stepper — each step is one add/remove item call */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => decreaseLine(line)}
                        className="text-gray-500 hover:text-gray-800 leading-none cursor-pointer w-4 text-center text-base"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {String(line.quantity).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={() => increaseLine(line)}
                        className="text-gray-500 hover:text-gray-800 leading-none cursor-pointer w-4 text-center text-base"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-brand-black w-20 text-right shrink-0">
                      {formatNaira(line.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(line)}
                      className="text-brand-red hover:opacity-70 cursor-pointer shrink-0"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals — all values come from the order's cached amounts */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatNaira(order?.items_subtotal)}</span>
                </div>
                {!!order?.modifiers_total && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Modifiers</span>
                    <span>{formatNaira(order.modifiers_total)}</span>
                  </div>
                )}
                {!!order?.preferences_total && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Preferences</span>
                    <span>{formatNaira(order.preferences_total)}</span>
                  </div>
                )}
                {!!order?.fees_total && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Fees</span>
                    <span>{formatNaira(order.fees_total)}</span>
                  </div>
                )}
                {order?.order_adjustments
                  ?.filter((adjustment) => adjustment.direction === "DEBIT")
                  .map((adjustment) => (
                    <div
                      key={adjustment.id}
                      className="flex justify-between text-sm text-brand-red"
                    >
                      <span>{adjustmentLabel(adjustment.adjustment_type)}</span>
                      <span>-{formatNaira(adjustment.amount)}</span>
                    </div>
                  ))}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax</span>
                  <span>{formatNaira(order?.tax_amount)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-brand-black">Total</span>
                <span className="text-xl font-bold text-brand-black">
                  {formatNaira(order?.grand_total)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={discardDraft}
                  className="text-brand-red text-sm font-medium cursor-pointer shrink-0"
                >
                  Discard
                </button>
                <CustomButton
                  title="Save Order"
                  noShadow
                  onClick={saveOrder}
                  className="bg-white! border border-gray-300 flex-1"
                  textColor="text-brand-black"
                />
                <CustomButton
                  title="Make Payment"
                  noShadow
                  onClick={openPayment}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AddCustomerModal
        isOpen={addCustomerOpen}
        onCancel={() => setAddCustomerOpen(false)}
        onAddCustomer={chooseCustomer}
      />

      <SelectCustomerModal
        isOpen={selectCustomerOpen}
        onCancel={() => setSelectCustomerOpen(false)}
        onProceed={chooseCustomer}
      />

      <AddOrderModal
        product={selectedProduct}
        form={addOrderForm}
        onPatch={patchForm}
        onCancel={closeAddOrderModal}
        onAddToOrder={handleAddToOrder}
        isSaving={isSavingItem}
      />

      <MakePaymentModal
        isOpen={paymentOpen}
        order={order}
        onCancel={closePayment}
        onPay={handlePayment}
        isPaying={isPaying}
      />
    </AppShell>
  );
};

export default PlaceOrderPage;
