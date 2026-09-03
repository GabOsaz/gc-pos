import type {
  PosOrder,
  PosServiceItemModifier,
} from "../../../../model/pos/types";
import type { PosOrderStatus } from "../../../../utils/orderStatus";
import { formatDate } from "../../../../utils/date";

const DASH = "—";

export interface PickupOrderSummary {
  customerName: string;
  customerEmail: string;
  orderId: string;
  deliveryType: string;
  deliveryLocation: string;
  deliveryDate: string;
  dateCreated: string;
  itemCount: number;
  pieceCount: number;
  totalAmount: number;
  croName: string;
  storeLocation: string;
  status: PosOrderStatus;
}

export interface PickupItemRow {
  id: string;
  item: string;
  category: string;
  colour: string;
  serviceType: string;
  type: string;
  typeDate?: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
}

export function toPickupSummary(order: PosOrder): PickupOrderSummary {
  const pieceCount = (order.order_items ?? []).reduce(
    (total, item) => total + (item.pieces_count ?? 0),
    0
  );

  return {
    customerName: order.customer?.name ?? DASH,
    customerEmail: order.customer?.email ?? order.customer?.phone ?? "",
    orderId: `#${order.order_number}`,
    deliveryType: DASH,
    deliveryLocation: order.customer?.address ?? DASH,
    deliveryDate: formatDate(order.due_by) || DASH,
    dateCreated: formatDate(order.created_at) || DASH,
    itemCount: order.order_items?.length ?? 0,
    pieceCount,
    totalAmount: order.grand_total,
    croName: order.pos_attendant?.name ?? DASH,
    storeLocation: order.store?.address ?? order.store?.name ?? DASH,
    status: order.order_status,
  };
}

export const NORMAL_TYPE = "Normal";

export function toPickupItemRows(
  order: PosOrder | undefined,
  modifiers: PosServiceItemModifier[]
): PickupItemRow[] {
  if (!order?.order_items?.length) return [];

  const modifierName = (id: number) =>
    modifiers.find((modifier) => modifier.id === id)?.name;

  return order.order_items.map((item) => {
    const names = (item.modifiers ?? [])
      .map((modifier) => modifierName(modifier.service_item_modifier_id))
      .filter((name): name is string => !!name);

    return {
      id: item.id,
      item: item.service_item?.name ?? DASH,
      category:
        item.service_item?.service_item_category?.name ??
        item.service_item?.service_subcategory?.name ??
        DASH,
      colour: item.item_attributes?.item?.color || DASH,
      serviceType: item.service_item?.service?.name ?? DASH,
      type: names.length ? names.join(", ") : NORMAL_TYPE,
      typeDate: formatDate(item.due_at) || undefined,
      unitPrice: item.price,
      quantity: item.pieces_count,
      totalAmount: item.line_subtotal_amount,
    };
  });
}
