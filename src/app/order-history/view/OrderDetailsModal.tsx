import CustomModal from "../../../components/Modal";
import OrderStatusPill from "../../../components/OrderStatusPill";
import { formatDate } from "../../../utils/date";
import { formatNaira } from "../../../utils/money";
import { usePosOrder } from "../../place-order/model/queries/usePosOrder";
import { useItemHistory } from "../model/queries/useItemHistory";

interface OrderDetailsModalProps {
  orderId: string | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-brand-black">{value}</span>
    </div>
  );
}

/** Turns `PENDING_BARCODE_TAGGING` / `ORDER_ABANDONED` into readable text. */
const humanise = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
  const { data: order, isLoading } = usePosOrder(orderId);
  const { history, isLoading: isLoadingHistory } = useItemHistory(orderId);

  return (
    <CustomModal
      isOpen={!!orderId}
      handleCancel={onClose}
      title={order ? `Order #${order.order_number}` : "Order Details"}
      subTitle={
        order
          ? `${order.customer?.name ?? ""} · ${formatDate(order.created_at)}`
          : "Loading order…"
      }
      canCloseAtTitle
      width="w-[820px]"
    >
      <div className="px-5 sm:px-8 py-6 space-y-6">
        {isLoading && <p className="text-sm text-gray-400">Loading order…</p>}

        {order && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusPill status={order.order_status} />
              <OrderStatusPill status={order.payment_status} />
              {order.store?.name && (
                <span className="text-xs text-gray-400 ml-auto">
                  {order.store.name}
                </span>
              )}
            </div>

            {/* Items */}
            <div>
              <h3 className="text-sm font-semibold text-brand-black mb-3">
                Items ({order.order_items?.length ?? 0})
              </h3>
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                {(order.order_items ?? []).map((item) => {
                  const attributes = item.item_attributes?.item;
                  const tags = [
                    ...(attributes?.fabric_type ? [attributes.fabric_type.name] : []),
                    ...(attributes?.defects ?? []).map((d) => d.name),
                    ...(attributes?.stains ?? []).map((s) => s.name),
                    ...(item.item_attributes?.accessories ?? []).map(
                      (a) => a.accessory_type.name
                    ),
                    ...(attributes?.is_high_value ? ["High value"] : []),
                  ];
                  return (
                    <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-black">
                          {item.service_item?.name}
                        </p>
                        {tags.length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {tags.join(" • ")}
                          </p>
                        )}
                        {item.pos_note && (
                          <p className="text-xs text-gray-400 mt-0.5 italic">
                            {item.pos_note}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-brand-black">
                          {formatNaira(item.line_subtotal_amount)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.pieces_count} piece
                          {item.pieces_count === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <Row label="Subtotal" value={formatNaira(order.items_subtotal)} />
              {!!order.modifiers_total && (
                <Row label="Modifiers" value={formatNaira(order.modifiers_total)} />
              )}
              {!!order.fees_total && (
                <Row label="Fees" value={formatNaira(order.fees_total)} />
              )}
              {(order.invoice?.discounts ?? []).map((discount) => (
                <Row
                  key={discount.id}
                  label={discount.description}
                  value={`-${formatNaira(discount.amount)}`}
                />
              ))}
              <Row label="Tax" value={formatNaira(order.tax_amount)} />
              <Row label="Paid" value={formatNaira(order.paid_amount)} />
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-brand-black">
                  {order.balance_due > 0 ? "Balance due" : "Total"}
                </span>
                <span className="text-base font-bold text-brand-black">
                  {formatNaira(
                    order.balance_due > 0 ? order.balance_due : order.grand_total
                  )}
                </span>
              </div>
            </div>

            {/* Piece history */}
            <div>
              <h3 className="text-sm font-semibold text-brand-black mb-3">
                Item History
              </h3>
              {isLoadingHistory ? (
                <p className="text-sm text-gray-400">Loading history…</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No history recorded for this order yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {history.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2"
                    >
                      <span className="text-brand-black">
                        {humanise(entry.action)}
                        {entry.new_status && (
                          <span className="text-gray-400">
                            {" "}
                            → {humanise(entry.new_status)}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatDate(entry.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
}

export default OrderDetailsModal;
