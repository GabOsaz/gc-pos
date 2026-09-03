import { useState } from "react";
import CustomModal from "../../../components/Modal";
import { useDebouncedValue } from "../../../common-hooks/useDebouncedValue";
import { formatNaira } from "../../../utils/money";
import { useCustomerSearch } from "../model/queries/useCustomerSearch";
import type { PosCustomerSummary } from "../../../model/pos/types";

interface SelectCustomerModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onProceed: (customer: PosCustomerSummary) => void;
}

function SelectCustomerModal({ isOpen, onCancel, onProceed }: SelectCustomerModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PosCustomerSummary | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const { customers, isFetching, canSearch, minSearchLength } = useCustomerSearch(
    debouncedSearch,
    isOpen
  );

  const reset = () => {
    setSearch("");
    setSelected(null);
  };

  const handleProceed = () => {
    if (!selected) return;
    reset();
    onProceed(selected);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleCancel={handleCancel}
      handleSave={handleProceed}
      handleSaveBtnText="Proceed"
      isHandleSaveBtnDisabled={!selected}
      title="Select Registered Customer"
      subTitle="Search by name, phone number, or email"
      canCloseAtTitle
      width="w-[440px]"
      centered
    >
      <div className="px-5 sm:px-8 py-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">
            Customer
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelected(null);
            }}
            placeholder="Search name, phone or email"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-blue bg-gray-50"
          />
        </div>

        <div className="max-h-64 overflow-y-auto -mx-1 px-1">
          {!canSearch && (
            <p className="text-sm text-gray-400 py-2">
              Type at least {minSearchLength} characters to search.
            </p>
          )}

          {canSearch && isFetching && customers.length === 0 && (
            <p className="text-sm text-gray-400 py-2">Searching…</p>
          )}

          {canSearch && !isFetching && customers.length === 0 && (
            <p className="text-sm text-gray-400 py-2">
              No customer matches “{debouncedSearch.trim()}”.
            </p>
          )}

          <ul className="space-y-2">
            {customers.map((customer) => {
              const isSelected = selected?.id === customer.id;
              return (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(customer)}
                    className={`w-full text-left border rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-brand-blue bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-medium text-brand-black">
                      {customer.full_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {customer.phone}
                      {customer.email ? ` · ${customer.email}` : ""}
                    </p>
                    {customer.voucher_balance > 0 && (
                      <p className="text-xs text-brand-green mt-0.5">
                        Voucher balance {formatNaira(customer.voucher_balance)}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </CustomModal>
  );
}

export default SelectCustomerModal;
