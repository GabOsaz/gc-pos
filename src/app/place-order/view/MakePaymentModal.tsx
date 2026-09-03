import { useMemo, useState } from "react";
import CustomModal from "../../../components/Modal";
import { formatNaira } from "../../../utils/money";
import {
  channelLabel,
  channelPickerLabel,
  usePaymentMethods,
} from "../model/queries/usePaymentMethods";
import type { PosOrder, PosPaymentMethod } from "../../../model/pos/types";

interface MakePaymentModalProps {
  isOpen: boolean;
  order: PosOrder | undefined;
  onCancel: () => void;
  onPay: (method: PosPaymentMethod | null) => void;
  isPaying?: boolean;
}

const selectClass =
  "w-full bg-gray-100 rounded-lg px-4 py-3.5 text-sm text-brand-black outline-none appearance-none cursor-pointer";

const labelClass = "block text-sm text-brand-black mb-2";

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "muted" | "negative";
}) {
  return (
    <div
      className={`flex justify-between text-sm ${
        tone === "negative" ? "text-brand-red" : "text-gray-600"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function MakePaymentModal({
  isOpen,
  order,
  onCancel,
  onPay,
  isPaying,
}: MakePaymentModalProps) {
  const { byChannel, isLoading } = usePaymentMethods(isOpen);

  const [channel, setChannel] = useState("");
  const [methodId, setMethodId] = useState<number | null>(null);

  const channels = useMemo(() => [...byChannel.keys()], [byChannel]);
  const channelMethods = byChannel.get(channel) ?? [];

  // With a single method on the channel there is nothing to disambiguate, so the
  // second dropdown is skipped and that method is used directly.
  const selectedMethod =
    channelMethods.length === 1
      ? channelMethods[0]
      : channelMethods.find((m) => m.id === methodId) ?? null;

  const invoice = order?.invoice ?? null;
  const voucherApplied = invoice?.voucher_amount ?? 0;
  const amountDue = invoice?.amount_to_charge ?? 0;
  const voucherCoversAll = amountDue === 0 && voucherApplied > 0;

  const discounts = invoice?.discounts ?? [];

  const reset = () => {
    setChannel("");
    setMethodId(null);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handlePay = () => {
    onPay(voucherCoversAll ? null : selectedMethod);
  };

  const canPay = !!invoice && (voucherCoversAll || !!selectedMethod);

  return (
    <CustomModal
      isOpen={isOpen}
      handleCancel={handleCancel}
      handleSave={handlePay}
      // The design shows "Proceed" until a method is chosen, then "Approve Payment".
      handleSaveBtnText={canPay ? "Approve Payment" : "Proceed"}
      isHandleSaveBtnDisabled={!canPay}
      isHandleSaveBtnLoading={isPaying}
      title="Make Payment"
      subTitle="Generate bill to be sent to the customer for this order"
      width="w-[1180px]"
      centered
    >
      <div className="px-5 sm:px-8 lg:px-12 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: method selection */}
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Payment Method</label>
            <div className="relative">
              <select
                value={channel}
                onChange={(e) => {
                  setChannel(e.target.value);
                  setMethodId(null);
                }}
                disabled={isLoading}
                className={selectClass}
              >
                <option value="">
                  {isLoading ? "Loading methods…" : "Select Option"}
                </option>
                {channels.map((value) => (
                  <option key={value} value={value}>
                    {channelLabel(value)}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Second dropdown only when the channel has more than one method */}
          {channelMethods.length > 1 && (
            <div>
              <label className={labelClass}>{channelPickerLabel(channel)}</label>
              <div className="relative">
                <select
                  value={methodId ?? ""}
                  onChange={(e) =>
                    setMethodId(e.target.value ? Number(e.target.value) : null)
                  }
                  className={selectClass}
                >
                  <option value="">{channelPickerLabel(channel)}</option>
                  {channelMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          )}

          {/* Transfer methods carry the account the customer should pay into */}
          {selectedMethod?.account_number && (
            <div className="border border-gray-200 rounded-xl px-4 sm:px-5 py-4 text-center">
              {selectedMethod.bank_name && (
                <p className="text-sm text-brand-black">{selectedMethod.bank_name}</p>
              )}
              <p className="text-sm text-brand-black mt-1">{selectedMethod.name}</p>
              <p className="bg-gray-100 rounded-lg mt-4 px-2 py-4 text-base sm:text-xl font-semibold text-brand-black tracking-[0.15em] sm:tracking-[0.25em] break-all">
                {selectedMethod.account_number}
              </p>
            </div>
          )}

          {channel && channelMethods.length === 0 && (
            <p className="text-sm text-gray-400">
              No payment methods configured for this channel.
            </p>
          )}

          {voucherCoversAll && (
            <p className="text-sm text-brand-green">
              The customer's voucher balance covers this order in full. No payment
              method is needed.
            </p>
          )}
        </div>

        {/* Right: bill breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-brand-black mb-4">
            Payment Summary
          </h3>

          <div className="space-y-2.5 mb-6">
            <SummaryRow label="Subtotal" value={formatNaira(order?.items_subtotal)} />
            {!!order?.modifiers_total && (
              <SummaryRow label="Modifiers" value={formatNaira(order.modifiers_total)} />
            )}
            {!!order?.preferences_total && (
              <SummaryRow
                label="Preferences"
                value={formatNaira(order.preferences_total)}
              />
            )}
            <SummaryRow label="Service Fee" value={formatNaira(order?.fees_total)} />
            {discounts.map((discount) => (
              <SummaryRow
                key={discount.id}
                label={discount.description}
                value={`-${formatNaira(discount.amount)}`}
                tone="negative"
              />
            ))}
            <SummaryRow label="Tax" value={formatNaira(order?.tax_amount)} />
            {!!order?.paid_amount && (
              <SummaryRow
                label="Already paid"
                value={`-${formatNaira(order.paid_amount)}`}
                tone="negative"
              />
            )}
            {voucherApplied > 0 && (
              <SummaryRow
                label="Voucher (applied automatically)"
                value={`-${formatNaira(voucherApplied)}`}
                tone="negative"
              />
            )}
          </div>

          <div className="bg-[#101B3D] rounded-xl px-4 py-6 sm:py-8 text-center">
            <p className="text-sm text-white/60">Total Amount</p>
            <p className="text-white mt-1">
              <span className="text-2xl sm:text-3xl font-bold break-all">
                {formatNaira(amountDue)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}

export default MakePaymentModal;
