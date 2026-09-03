import type { AddOrderForm } from "./addOrderForm";
import type {
  PosOrderItemInput,
  PosOrder,
  PosOrderItem,
  PosServiceItem,
  PosServiceItemModifier,
  PosServicePreferenceItem,
} from "../../../model/pos/types";

/* ---------------------------------------------------------------- modifiers */

/**
 * `exclusion_group` is a comma-separated list of incompatible modifier slugs.
 * A modifier is unavailable when it excludes something already picked, or when
 * something already picked excludes it. The backend stays authoritative — this
 * only stops the attendant from submitting a combination that will be rejected.
 */
export function conflictsWithSelection(
  modifier: PosServiceItemModifier,
  selectedIds: number[],
  allModifiers: PosServiceItemModifier[]
) {
  if (selectedIds.includes(modifier.id)) return false;

  const excluded = (m: PosServiceItemModifier) =>
    (m.exclusion_group ?? "")
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean);

  const selected = allModifiers.filter((m) => selectedIds.includes(m.id));

  return selected.some(
    (picked) =>
      excluded(modifier).includes(picked.slug) || excluded(picked).includes(modifier.slug)
  );
}

/* ------------------------------------------------------------ price preview */

function chargeAmount(
  base: number,
  pricingType: "FLAT_AMOUNT" | "PERCENTAGE",
  flatAmount: number | null,
  percentageRate: number | null
) {
  if (pricingType === "PERCENTAGE") {
    return Math.round((base * (percentageRate ?? 0)) / 100);
  }
  return flatAmount ?? 0;
}

/**
 * Pre-add preview of what one line will cost, in kobo. This is an estimate for
 * the modal only — once the item is on the draft, the server's cached totals are
 * the source of truth.
 */
export function estimateLinePrice(
  serviceItem: PosServiceItem | null,
  modifiers: PosServiceItemModifier[],
  preference: PosServicePreferenceItem | null
) {
  if (!serviceItem) return 0;
  const base = serviceItem.price;

  const modifierTotal = modifiers.reduce(
    (sum, m) =>
      sum + chargeAmount(base, m.pricing_type, m.flat_amount, m.percentage_rate),
    0
  );

  const preferenceTotal = preference
    ? chargeAmount(base, preference.pricing_type, preference.price, preference.percentage_rate)
    : 0;

  return base + modifierTotal + preferenceTotal;
}

/* ---------------------------------------------------------- form -> payload */

/**
 * Phase 1 captures attributes once per item, not per physical piece — the
 * backend hydrates them onto `item_attributes` and Phase 2 tagging is what
 * persists piece-specific values.
 */
export function buildItemPayload(form: AddOrderForm): PosOrderItemInput {
  return {
    service_item_id: form.serviceItemId,
    service_preference_item_id: form.preferenceItemId,
    service_item_modifier_ids: form.modifierIds,
    accessories: form.hasAccessories ? form.accessoryTypeIds : [],
    pos_note: form.posNote.trim() || null,
    piece_attributes: {
      color: form.color,
      fabric_type_id: form.fabricTypeId,
      defect_type_ids: form.defectTypeIds,
      stain_type_ids: form.stainTypeIds,
      is_high_value: form.isHighValue,
    },
  };
}

/**
 * There is no quantity field on the API — one `order_item` is one priced service
 * line. Quantity N becomes N identical items sharing the same attributes.
 */
export function repeatItem(item: PosOrderItemInput, quantity: number) {
  return Array.from({ length: Math.max(1, quantity) }, () => item);
}

/* --------------------------------------------------------- order -> payload */

/** Rebuild the add-item body from a persisted item, so `+` can repeat a line. */
export function payloadFromOrderItem(item: PosOrderItem): PosOrderItemInput {
  const attributes = item.item_attributes?.item;
  const accessories = item.item_attributes?.accessories ?? [];

  return {
    service_item_id: item.service_item_id,
    service_preference_item_id: item.preferences?.[0]?.service_preference_item_id ?? null,
    service_item_modifier_ids: (item.modifiers ?? []).map((m) => m.service_item_modifier_id),
    accessories: accessories.map((a) => a.accessory_type_id),
    customer_note: item.customer_note,
    pos_note: item.pos_note,
    piece_attributes: {
      color: attributes?.color ?? null,
      fabric_type_id: attributes?.fabric_type?.id ?? null,
      defect_type_ids: (attributes?.defects ?? []).map((d) => d.id),
      stain_type_ids: (attributes?.stains ?? []).map((s) => s.id),
      is_high_value: attributes?.is_high_value ?? false,
    },
  };
}

/* ------------------------------------------------------------ order -> rows */

export interface OrderSummaryLine {
  key: string;
  name: string;
  /** Preference, modifier, and accessory names shown under the item name. */
  tags: string[];
  quantity: number;
  /** Combined `line_subtotal_amount` for every item collapsed into this row. */
  amount: number;
  /** Item ids in the row, oldest first — `-` removes the newest. */
  itemIds: string[];
  payload: PosOrderItemInput;
}

/**
 * Identical items are separate `order_items` server side. Collapse ones that
 * share every attribute back into a single row with a quantity so the summary
 * reads the way an attendant expects.
 */
function lineSignature(item: PosOrderItem) {
  const attributes = item.item_attributes?.item;
  return JSON.stringify([
    item.service_item_id,
    item.preferences?.[0]?.service_preference_item_id ?? null,
    (item.modifiers ?? []).map((m) => m.service_item_modifier_id).sort(),
    (item.item_attributes?.accessories ?? []).map((a) => a.accessory_type_id).sort(),
    attributes?.color ?? null,
    attributes?.fabric_type?.id ?? null,
    (attributes?.defects ?? []).map((d) => d.id).sort(),
    (attributes?.stains ?? []).map((s) => s.id).sort(),
    attributes?.is_high_value ?? false,
    item.pos_note ?? null,
  ]);
}

export function toSummaryLines(
  order: PosOrder | undefined,
  /** Names for the ids the order response returns bare. */
  labels: {
    modifiers: PosServiceItemModifier[];
    preferences: PosServicePreferenceItem[];
  }
): OrderSummaryLine[] {
  if (!order?.order_items?.length) return [];

  const modifierName = (id: number) =>
    labels.modifiers.find((m) => m.id === id)?.name ?? "Modifier";

  // The order response carries preference charges by id only, so the name comes
  // from the catalog rather than the order itself.
  const preferenceName = (id: number) =>
    labels.preferences.find((p) => p.id === id)?.name ?? null;

  const rows = new Map<string, OrderSummaryLine>();

  order.order_items.forEach((item) => {
    const key = lineSignature(item);
    const existing = rows.get(key);

    if (existing) {
      existing.quantity += 1;
      existing.amount += item.line_subtotal_amount;
      existing.itemIds.push(item.id);
      return;
    }

    const preference = item.preferences?.[0]
      ? preferenceName(item.preferences[0].service_preference_item_id)
      : null;

    rows.set(key, {
      key,
      name: item.service_item?.name ?? "Item",
      tags: [
        ...(preference ? [preference] : []),
        ...(item.modifiers ?? []).map((m) => modifierName(m.service_item_modifier_id)),
        ...(item.item_attributes?.accessories ?? []).map((a) => a.accessory_type.name),
      ],
      quantity: 1,
      amount: item.line_subtotal_amount,
      itemIds: [item.id],
      payload: payloadFromOrderItem(item),
    });
  });

  return [...rows.values()];
}
