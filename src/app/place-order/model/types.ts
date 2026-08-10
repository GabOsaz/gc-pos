/**
 * POS Phase 1 API contract. Mirrors `api-guide.md` — keep the two in sync.
 * Every money value is an integer number of kobo.
 */

/** A lookup value hydrated for display, e.g. a fabric/defect/stain/accessory type. */
export interface PosLookupRef {
  id: number;
  name: string;
  slug: string;
}

/** Shape returned by the fabric/defect/stain type lookups. */
export interface PosTypeLookup extends PosLookupRef {
  is_active?: boolean;
  sort_order?: number;
}

export interface PosAccessoryType extends PosLookupRef {
  is_active: boolean;
  sort_order: number;
}

export interface PosItemPiece extends PosLookupRef {
  description: string | null;
  is_accessory: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface PosServicePreferenceItem {
  id: number;
  name: string;
  price: number;
  pricing_type: PricingType;
  percentage_rate: number | null;
  service_preference_id: number | null;
  service_preference: { id: number; name: string } | null;
  is_active: boolean;
}

export type PricingType = "FLAT_AMOUNT" | "PERCENTAGE";

export interface PosServiceItemModifier extends PosLookupRef {
  description: string | null;
  pricing_type: PricingType;
  flat_amount: number | null;
  /** Human percentage value — `50` means 50%. */
  percentage_rate: number | null;
  /** Comma-separated list of incompatible modifier slugs. */
  exclusion_group: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface PosServiceItem {
  id: number;
  name: string;
  price: number;
  pieces: number;
  frequency: number | null;
  item_ccloud_id: string | null;
  is_delicate: boolean;
  service_id: number;
  service_subcategory_id: number | null;
  service_item_category_id: number | null;
  is_active: boolean;
  preferences: PosServicePreferenceItem[];
  item_pieces: PosItemPiece[];
}

export interface PosServiceGroup {
  id: number;
  name: string;
  is_active: boolean;
  service_subcategories: Array<{ id: number; name: string; is_active: boolean }>;
  service_item_categories: Array<{ id: number; name: string; is_active: boolean }>;
  service_items: PosServiceItem[];
}

/** Seeded channels: cash, card, transfer, wallet, and the internal voucher. */
export type PaymentChannel = string;

export interface PosPaymentMethod {
  id: number;
  store_id: number | null;
  name: string;
  payment_channel: PaymentChannel;
  bank_name: string | null;
  account_number: string | null;
  is_active: boolean;
  /** Backend-only methods (voucher). Submitting one is rejected. */
  is_system_internal: boolean;
  sort_order: number;
}

export interface PayOrderBody {
  payment_type: "FULL" | "PART";
  /** Required when `payment_type` is PART, disallowed when FULL. */
  order_approval_id?: string | null;
  /** Max 2 entries, no duplicate `payment_method_id`. */
  payment_methods: Array<{
    payment_method_id: number;
    amount: number;
    channel_last4_digit?: string | null;
  }>;
}

export interface PosTaxConfig {
  type: "PERCENTAGE" | "FLAT_FEE";
  percentage: number | null;
  flat_fee: number | null;
}

export interface PosConfig {
  tax_config: PosTaxConfig;
}

/* ------------------------------------------------------------------ customers */

export interface PosCustomerSummary {
  id: number;
  customer_ccloud_id: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email: string;
  address: string | null;
  city: string | null;
  is_active: boolean;
  outstanding_balance: number;
  wallet_balance: number;
  voucher_balance: number;
  loyalty_points_balance: number;
  created_at: string;
  updated_at: string;
}

export interface PosCustomerSearchResponse {
  rows: PosCustomerSummary[];
  page: number;
  page_total: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface CreatePosCustomerBody {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address?: string;
}

/* --------------------------------------------------------------------- orders */

export interface CreatePosOrderPieceAttribute {
  color?: string | null;
  fabric_type_id?: number | null;
  defect_type_ids?: number[];
  stain_type_ids?: number[];
  is_high_value?: boolean;
}

/**
 * Item shape accepted by both create-order and add-item. `service_preference_item_id`
 * is a single id on both — the guide's plural `service_preference_item_ids` on
 * create-order is wrong and gets rejected.
 */
export interface PosOrderItemInput {
  service_item_id: number;
  service_preference_item_id?: number | null;
  service_item_modifier_ids?: number[];
  accessories?: number[];
  customer_note?: string | null;
  pos_note?: string | null;
  piece_attributes?: CreatePosOrderPieceAttribute;
}

export interface CreatePosOrderBody {
  customer_id: number;
  customer_note?: string | null;
  items: PosOrderItemInput[];
}

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "ABANDONED";
export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface PosOrderAdjustment {
  id: string;
  order_id: string;
  customer_id: number;
  /** Backend enum is untyped in the guide, e.g. `LOYALTY_REDEMPTION`. */
  adjustment_type: string;
  direction: "CREDIT" | "DEBIT";
  amount: number;
  source: string;
  source_reference_id: string | null;
  source_snapshot: Record<string, unknown>;
}

export interface PosOrderItemServiceSnapshot {
  id: number;
  name: string;
  price: number;
  pieces: number;
  frequency: number | null;
  is_delicate: boolean;
  service_id: number;
  service: { id: number; name: string } | null;
  service_subcategory_id: number | null;
  service_subcategory: { id: number; name: string } | null;
  service_item_category_id: number | null;
  service_item_category: { id: number; name: string } | null;
  item_pieces: PosItemPiece[];
}

/**
 * Draft POS capture, held at the item level. Phase 1 does not persist
 * fabric/defect/stain/colour onto individual pieces — Phase 2 tagging does.
 */
export interface PosOrderItemAttributes {
  item: {
    color: string | null;
    fabric_type: PosLookupRef | null;
    defects: PosLookupRef[];
    stains: PosLookupRef[];
    is_high_value: boolean;
  };
  accessories: Array<{
    accessory_type_id: number;
    accessory_type: PosLookupRef;
  }>;
}

export interface PosOrderItemPiece {
  id: string;
  order_id: string;
  item_piece_id: number | null;
  accessory_type_id: number | null;
  status: string;
  is_set_member: boolean;
  is_accessory: boolean;
  is_delicate: boolean;
  color: string | null;
  fabric_type_id: number | null;
  is_high_value: boolean;
}

export interface PosOrderItemCharge {
  order_item_id: string;
  pricing_type: PricingType;
  flat_amount: number | null;
  percentage_rate: number | null;
  base_amount: number;
  amount: number;
}

export interface PosOrderItem {
  id: string;
  order_id: string;
  customer_id: number;
  service_item_id: number;
  service_item: PosOrderItemServiceSnapshot;
  status: string;
  pieces_count: number;
  price: number;
  modifier_amount: number;
  preference_amount: number;
  line_subtotal_amount: number;
  customer_note: string | null;
  pos_note: string | null;
  item_attributes: PosOrderItemAttributes;
  created_at: string;
  /** Note: the API returns `order_item_pieces`, not `pieces`. */
  order_item_pieces: PosOrderItemPiece[];
  modifiers: Array<PosOrderItemCharge & { service_item_modifier_id: number }>;
  preferences: Array<PosOrderItemCharge & { service_preference_item_id: number }>;
}

export interface PosOrder {
  id: string;
  order_number: string;
  customer_id: number;
  store_id: number | null;
  pos_attendant_id: number | null;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  items_subtotal: number;
  modifiers_total: number;
  preferences_total: number;
  fees_total: number;
  discount_total: number;
  taxable_amount: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  refunded_amount: number;
  balance_due: number;
  intake_at: string | null;
  due_by: string | null;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    voucher_balance: number;
  };
  store: { id: number; name: string; address: string | null } | null;
  pos_attendant: { id: number; name: string } | null;
  order_adjustments: PosOrderAdjustment[];
  order_items: PosOrderItem[];
}
