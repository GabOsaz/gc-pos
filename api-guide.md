# Frontend Handoff: POS Physical Order Flow Phase 1

This is the living client-application handoff for the POS Physical Order Flow. Update this document whenever a Phase 1 endpoint, response DTO, permission, or business rule changes.

Authoritative backend decision record: `docs/pos_phase1_tech_spec.md`.

## Phase Scope

Phase 1 ships POS and order intake:

- Customer lookup/create.
- Create a POS order draft.
- Break the order into order items and order item pieces.
- Capture POS physical attributes, defects, stains, notes, preferences, and modifiers.
- Compute bill totals.
- Apply loyalty/promo discounts.
- Take full, split, or approved part payment.
- Move paid orders into processing.

Not Phase 1 API work:

- Barcode tagging.
- Tagging verification.
- Basket, bag, waybill.
- Durable `customer_items` population.
- Returning-item scan/prefill.
- Factory processing and completion flows.

## Domain Model

Use these words consistently in the UI and client state:

- Order: the customer-facing visit/intake record.
- Order item: a service applied within an order. This is the pricing and work unit.
- Order item piece: one physical object in the order. Created once per physical thing.
- `order_item_piece_services`: the many-to-many link between physical pieces and service items. One shirt with dry-cleaning, button repair, and tear repair is one physical piece with three service links.
- Physical piece count: count `order_item_pieces`.
- Service/revenue count: count `order_items`.
- Accessory: an unpriced physical piece grouped with a main item, flagged as `is_accessory`.
- Set: multiple pieces processed together as one priced item in this order.
- Bringer: the customer on the order/piece lifecycle.
- Owner: the durable owner of a `customer_item`, populated in later phases.

## Money Rules

- All money amounts are integer kobo.
- `CREDIT` means money in to the business.
- `DEBIT` means money out of the business.
- Vouchers are payment instruments, not discounts.
- Voucher redemption is a payment tender: `VOUCHER -> REVENUE`.
- Voucher must be auto-applied first when the customer has available voucher balance.
- Loyalty redemption and promo discounts are bill adjustments, not payment methods.
- The bill is cached transactionally by the backend. The client should display returned totals, not recompute authoritative totals.
- `tax_amount` is set as soon as the order/items exist — it is **not** `0` in draft, and it does not accumulate from payments. Adding/removing items or adjustments recomputes it immediately, along with the rest of the money caches.
- Voucher balance lives on the customer, not the order: `customer.voucher_balance` (returned on every order response's nested `customer` object). An applied voucher shows up as a `payment_transactions` row (`source_account: 'VOUCHER'`) once a payment is made.

Canonical bill composition (`OrderMoneyHelper.computeOrderAmounts`, recomputed on create, add-item, and remove-item):

```txt
items_subtotal    = sum(order_items.price)
modifiers_total   = sum(order_items.modifier_amount)
preferences_total = sum(order_items.preference_amount), currently expected to be 0
fees_total        = sum(order_adjustments.amount) where direction = CREDIT
discount_total    = sum(order_adjustments.amount) where direction = DEBIT
taxable_amount    = max(items_subtotal + modifiers_total + preferences_total + fees_total - discount_total, 0)
tax_amount        = configured tax (percentage or flat fee, see "Get POS Config") on taxable_amount
grand_total       = taxable_amount + tax_amount
balance_due       = max(grand_total - paid_amount + refunded_amount, 0)
```

`paid_amount` and `refunded_amount` only change on payment (`/payments/pos/...`), never on item/adjustment changes; `balance_due` reflects both. `tax_amount` is the order's full tax target, fixed independently of payment — individual `payment_transactions.tax` rows are that same amount prorated across payments for ledger purposes, not summed back onto the order.

## Editability Rules

- Draft order/payment status `UNPAID`: modifiers and preferences can be added and removed freely.
- Paid or part-paid order/payment status not `UNPAID`: replace/remove is blocked, but attach is allowed.
- A post-payment attach is a new add-on charge when priced. The backend will append the row, recompute caches, and move affected item/pieces to `PENDING_PAYMENT` until the delta is paid.
- Preferences remain free and exempt from the freeze either way.
- `order_adjustments` remain editable at any payment status.

## Statuses

Order statuses:

- `PENDING`: draft/pre-payment.
- `PROCESSING`: paid and entered the pipeline.
- `COMPLETED`: all items delivered/picked up, later phase.
- `ABANDONED`: unpaid order abandoned.

Payment statuses:

- `UNPAID`
- `PARTIALLY_PAID`
- `PAID`

Item and piece statuses:

- `CREATED`
- `PENDING_BARCODE_TAGGING`
- `PENDING_TAGGING`
- `TAGGED`
- `IN_BASKET`
- `IN_BAG`
- `PENDING_PAYMENT`
- `ABANDONED`

Phase 1 reaches:

- Order: `PENDING -> PROCESSING` after first successful payment.
- Items/pieces: `CREATED -> PENDING_BARCODE_TAGGING` after successful payment.

## Authentication And Permissions

Admin POS endpoints are split across three path prefixes:

```txt
/api/v1/pos/orders          # orders, order items, part-payment approvals, customers, catalog/lookup
/api/v1/payments/pos         # taking a payment against an order
/api/v1/admins/orders        # item history (unrelated admin/orders router, unchanged)
```

Use the admin JWT bearer token, except for the two credential-based part-payment approval endpoints (approve/reject), which take email/password in the body instead.

Relevant permissions:

- `order:view`: read POS lookup data, search POS customers, list/view orders.
- `order:create`: create POS customers and POS orders, add/remove order items, request or edit part-payment approvals.
- `order:delete`: abandon a draft POS order.
- `payment:view`: read payment methods.
- `payment:create`: take payments (`/payments/pos/...`).
- `order:approve-part-payment`: approve or reject POS part-payment requests by email/password.

For endpoints that list payment methods, an admin with either `payment:view` or `order:view` can read them.

Part-payment approval itself is a credential action, not a JWT action. The approving admin enters their email and password and must have `order:approve-part-payment`.

## Available Now: POS Customer APIs

These endpoints are implemented and documented in Swagger.

### Search Customers

```http
GET /api/v1/pos/orders/customers/search
Authorization: Bearer <admin-token>
Permission: order:view
```

Query params:

- `search: string`
- `page?: number` (default `1`)
- `per_page?: number` (default `20`, max `200`)

Search matches:

- customer name
- email
- phone
- normalized Nigerian phone
- whitespace-insensitive full name

Response:

```ts
type PosCustomerSummary = {
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
};

type PosCustomerSearchResponse = {
  rows: PosCustomerSummary[];
  page: number;
  page_total: number;
  per_page: number;
  total_count: number;
  total_pages: number;
};
```

### Create Customer

```http
POST /api/v1/pos/orders/customers
Authorization: Bearer <admin-token>
Permission: order:create
```

Request:

```ts
type CreatePosCustomer = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address?: string;
};
```

Behavior:

- Creates only a local customer account.
- Assigns a generated default password internally.
- Does not call CleanCloud.
- Creates a local `wallets` row with `balance = 0`, `currency = 'NGN'`, and `virtual_bank_account_id = null`.
- Does not call Paystack or create a virtual bank account.
- New POS-created customers return `customer_ccloud_id = null`.
- Duplicate email or phone returns `409`.
- Creation is audited by the backend.

## Available Now: POS Order APIs

These endpoints are implemented and documented in Swagger. All order paths
moved from `/admins/pos/orders...` to `/pos/orders...`; payment moved out of
this router entirely into its own `/payments/pos...` endpoints (see "Pay POS
Order" below).

### List Orders

```http
GET /api/v1/pos/orders
Authorization: Bearer <admin-token>
Permission: order:view
```

Optional query:

```ts
type PosOrdersQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  order_status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ABANDONED';
  order_payment_status?: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
};
```

Returns a paginated list of lightweight POS orders. Rows include the order
header, customer, store, and pos_attendant only — `order_adjustments` and
`order_items` are intentionally excluded from this list view.

### Create Order

```http
POST /api/v1/pos/orders
Authorization: Bearer <admin-token>
Permission: order:create
```

The store is always the logged-in admin's `store_id`. Do not send `store_id`.

Request:

```ts
type CreatePosOrderPieceAttribute = {
  color?: string | null;
  fabric_type_id?: number | null;
  defect_type_ids?: number[];
  stain_type_ids?: number[];
  is_high_value?: boolean;
};

type CreatePosOrderItem = {
  service_item_id: number;
  service_preference_item_id?: number | null;
  service_item_modifier_ids?: number[];
  accessories?: number[];
  customer_note?: string | null;
  pos_note?: string | null;
  piece_attributes?: CreatePosOrderPieceAttribute;
};

type CreatePosOrder = {
  customer_id: number;
  customer_note?: string | null;
  items: CreatePosOrderItem[];
};
```

Behavior:

- `items` must contain at least one service item.
- The backend infers physical pieces from each submitted `service_item_id`.
- If the service item has linked `item_pieces`, one `order_item_piece` is created per linked piece.
- If the service item has no linked `item_pieces`, one physical piece is created with `item_piece_id = null`.
- `piece_attributes`, when supplied, is hydrated by the backend and saved on `order_items[].item_attributes.item` as draft POS capture. The stored item attributes contain hydrated `fabric_type`, `defects[]`, and `stains[]`; they do not duplicate `fabric_type_id`, `defect_type_ids`, or `stain_type_ids`.
- `accessories[]` is an array of active `accessory_types.id` values. Each ID adds one accessory physical piece under the same `order_item`, inherits the order item's draft attributes, and is not separately priced. `order_items[].item_attributes.accessories[]` stores the hydrated accessory type only.
- POS create does not persist fabric/defect/stain/color capture onto individual `order_item_pieces`; Phase 2 tagging verifies and saves piece-specific values.
- Additional services are not accepted on create-order; the future add-service endpoint will attach a service to explicit existing pieces.
- `is_set_member`, `is_accessory`, and `is_delicate` are inferred by the backend.
- `tagger_note` is not accepted here; tagging endpoints own tagger notes.
- This endpoint creates an unpaid draft only. If the customer has loyalty balance, the backend automatically adds a draft `LOYALTY_REDEMPTION` order adjustment capped at the current bill before discount. There is no create-order opt-in/opt-out field. It does not take payment or write voucher/loyalty/payment ledger rows.
- Draft create writes `ItemHistory` `CREATE` rows for pieces but writes no audit rows. The first order/item audit is the full committed order snapshot at first successful payment, or the full dropped-draft snapshot if the order is abandoned.

Response:

```ts
type PosOrderCustomerDetails = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  voucher_balance: number;
};

type PosOrderStoreDetails = {
  id: number;
  name: string;
  address: string | null;
};

type PosOrderAttendantDetails = {
  id: number;
  name: string;
};

type PosOrderAdjustment = {
  id: string;
  order_id: string;
  customer_id: number;
  adjustment_type: string; // e.g. 'LOYALTY_REDEMPTION'
  direction: 'CREDIT' | 'DEBIT';
  amount: number;
  source: string;
  source_reference_id: string | null;
  source_snapshot: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

// A lookup value hydrated for display, e.g. a fabric/defect/stain/accessory type.
type PosLookupRef = { id: number; name: string; slug: string };

type PosOrderItemServiceSnapshot = {
  id: number;
  name: string;
  price: number;
  pieces: number;
  frequency: number | null;
  item_ccloud_id: string | null;
  is_delicate: boolean;
  service_id: number;
  service: { id: number; name: string } | null;
  service_subcategory_id: number | null;
  service_subcategory: { id: number; name: string } | null;
  service_item_category_id: number | null;
  service_item_category: { id: number; name: string } | null;
  item_pieces: Array<PosLookupRef & {
    description: string | null;
    is_accessory: boolean;
    is_active: boolean;
    sort_order: number;
  }>;
};

// Draft POS capture, held at the item level (not per-piece — see note below).
type PosOrderItemAttributes = {
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
};

// Physical piece row. Phase 1 only reads/writes item_piece_id, accessory_type_id,
// fabric_type_id, color, is_high_value, is_set_member, is_accessory, is_delicate
// here — it does NOT carry hydrated item_piece/accessory_type/fabric_type objects
// or defects/stains; those live on the item's item_attributes above until Phase 2
// tagging verifies and saves piece-specific values.
type PosOrderItemPiece = {
  id: string;
  order_id: string;
  customer_id: number;
  item_piece_id: number | null;
  accessory_type_id: number | null;
  customer_item_id: string | null;
  status: string;
  is_set_member: boolean;
  is_accessory: boolean;
  is_delicate: boolean;
  color: string | null;
  fabric_type_id: number | null;
  is_high_value: boolean;
  is_present: boolean;
  present_verified_at: string | null;
  tagger_note: string | null;
  tagged_at: string | null;
  in_basket_at: string | null;
  in_bag_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type PosOrderItemCharge = {
  order_item_id: string;
  pricing_type: 'FLAT_AMOUNT' | 'PERCENTAGE';
  flat_amount: number | null;
  percentage_rate: number | null;
  base_amount: number;
  amount: number;
  created_at: string;
};

type PosOrderItem = {
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
  due_at: string | null;
  intake_at: string | null;
  pos_attendant_id: number | null;
  customer_note: string | null;
  pos_note: string | null;
  item_attributes: PosOrderItemAttributes;
  tagged_at: string | null;
  in_basket_at: string | null;
  in_bag_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  order_item_pieces: PosOrderItemPiece[]; // NOT `pieces`
  modifiers: Array<PosOrderItemCharge & { service_item_modifier_id: number }>;
  preferences: Array<PosOrderItemCharge & { service_preference_item_id: number }>;
};

type CreatePosOrderResponse = {
  id: string;
  order_number: string;
  customer_id: number;
  store_id: number | null;
  pos_attendant_id: number | null;
  order_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ABANDONED';
  payment_status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
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
  config_snapshot: Record<string, unknown>;
  customer_note: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  customer: PosOrderCustomerDetails;
  store: PosOrderStoreDetails | null;
  pos_attendant: PosOrderAttendantDetails | null;
  order_adjustments: PosOrderAdjustment[];
  order_items: PosOrderItem[];
};
```

The response `data` is the order object itself. `tax_amount` is populated from create onward, not `0` in draft (see Money Rules). `customer.voucher_balance` supports billing decisions. The nested arrays are formatted for display: `order_items[]`, each item has `service_item`, `item_attributes`, `order_item_pieces[]`, `modifiers[]`, and `preferences[]`. Hydrated fabric/defect/stain/accessory-type detail lives on the item's `item_attributes` (captured once per item at create/add-item time), not per-piece — each entry in `order_item_pieces[]` only carries the raw `item_piece_id`/`accessory_type_id`/`fabric_type_id` foreign keys plus its own status/flags; Phase 2 tagging is what verifies and persists piece-specific values.

### Get POS Order

```http
GET /api/v1/pos/orders/:order_id
Authorization: Bearer <admin-token>
Permission: order:view
```

`order_id` is the UUID primary key returned from create-order. This endpoint is not draft-only; it returns the current persisted order state. It takes no query parameters — the previous `start_date`/`end_date` item filter was removed; use "Get Item History" if you need a filtered slice of pieces.

Response:

```ts
type PosOrderDetailsResponse = CreatePosOrderResponse;
```

### Request Part-Payment Approval

```http
POST /api/v1/pos/orders/:order_id/order-approval
Authorization: Bearer <admin-token>
Permission: order:create
```

Request:

```ts
type RequestPartPaymentApproval = {
  approved_amount: number; // kobo, must be less than current balance_due
  reason?: string | null;
};
```

Behavior:

- Creates one pending `PART_PAYMENT` approval for an unpaid draft order or a partially paid processing order with remaining `balance_due`.
- Rejects if the order already has a pending approval or an approved unused approval.
- Captures the current `order.balance_due` as `order_amount`.
- Writes one `OrderApproval` CREATE audit snapshot.

### Get Part-Payment Approvals

```http
GET /api/v1/pos/orders/:order_id/order-approvals
Authorization: Bearer <admin-token>
Permission: order:create
```

Approvals are now always scoped to one order (`order_id` is a path param, not a filter). Optional query:

```ts
type OrderApprovalQuery = {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'USED' | 'ABANDONED';
};
```

### Edit / Re-Request Part-Payment Approval

```http
PATCH /api/v1/pos/orders/:order_id/order-approval/:order_approval_id
Authorization: Bearer <admin-token>
Permission: order:create
```

This single endpoint replaces the old separate "edit pending" and "re-request approved" endpoints — its behavior branches on the approval's current status.

Request:

```ts
type UpdatePartPaymentApproval = {
  approved_amount: number; // kobo
  reason?: string | null;
};
```

Behavior:

- If the approval is unused `PENDING`: updates `approved_amount`/`reason` against the current order balance. Writes no audit row (pending request cleanup only).
- If the approval is unused `APPROVED`: re-requests it by moving the same row back to `PENDING` with the new amount/reason and clearing `approved_by_id`/`approved_at`. Writes one `OrderApproval` UPDATE audit row.
- Only the POS attendant who created the order can update its approvals.

### Approve Part-Payment Approval

```http
POST /api/v1/pos/orders/:order_id/order-approval/:order_approval_id/approve
Permission: order:approve-part-payment
```

This endpoint does not use the admin JWT. The approving admin enters credentials in the body.

Request:

```ts
type ApprovePartPaymentApproval = {
  email: string;
  password: string;
};
```

Behavior:

- Verifies email/password for an active admin.
- Requires the approving admin to have `order:approve-part-payment`.
- Approves only `PENDING`, unused part-payment approvals.
- Writes one `OrderApproval` UPDATE audit row.
- Later part-payment must pay exactly `approved_amount`.

### Reject Part-Payment Approval

```http
POST /api/v1/pos/orders/:order_id/order-approval/:order_approval_id/reject
Permission: order:approve-part-payment
```

Same credential-based auth as approve — no admin JWT.

Request:

```ts
type RejectPartPaymentApproval = {
  email: string;
  password: string;
  reason?: string | null;
};
```

Behavior:

- Verifies email/password for an active admin with `order:approve-part-payment`.
- Rejects only `PENDING`, unused part-payment approvals.
- Writes one `OrderApproval` UPDATE audit row.

### Pay POS Order

```http
POST /api/v1/payments/pos/orders/:order_id
Authorization: Bearer <admin-token>
Permission: payment:create
```

Payment moved out of the order router entirely into its own module. The request contract also changed: `tenders` is now `payment_methods` (max 2 entries), and a required `payment_type` field replaces the old "presence of `order_approval_id`" convention for choosing full vs. part payment. The backend still automatically applies the customer's voucher balance first; submit only the remaining user-selected payment methods. Do not submit system/internal payment methods, including the voucher payment method; the API rejects them as not allowed.

Request:

```ts
type PayOrder = {
  payment_type: 'FULL' | 'PART';
  order_approval_id?: string | null; // required when payment_type = 'PART', disallowed when 'FULL'
  payment_methods: Array<{
    payment_method_id: number;
    amount: number; // kobo
    channel_last4_digit?: string | null;
  }>; // max 2, no duplicate payment_method_id
};
```

Notes:

- `payment_methods` may be empty only when voucher fully settles the amount being paid.
- For `payment_type: 'FULL'`, `sum(payment_methods.amount)` must equal `order.balance_due - voucher_applied_by_backend`.
- For `payment_type: 'PART'`, `order_approval_id` is required and `sum(payment_methods.amount)` must equal `order_approval.approved_amount - voucher_applied_by_backend`.
- A successful part payment marks the approval `USED`, updates `payment_status = PARTIALLY_PAID`, and leaves the remaining `balance_due` on the order/customer outstanding balance.
- Additional part payments use the same flow: request/approve a new approval for the current remaining balance, then call this endpoint with that approval — or use "Pay POS Order Balance" below once the order is partially paid.
- On first successful payment, `order_status = PROCESSING`, order `intake_at` is stamped, and pieces move to `PENDING_BARCODE_TAGGING`; the pipeline-entry audit snapshot is written once. Later additional payments only write payment transactions/status history, loyalty earn, and balance caches.
- The admin must be assigned to a store, and must be the POS attendant who created the order.

Response:

```ts
type PayOrderResponse = {
  status: 'success';
  message: string;
};
```

Unlike the old endpoint, this does not return the refreshed order in the response — re-fetch via "Get POS Order" if you need the updated state.

### Pay POS Order Balance

```http
POST /api/v1/payments/pos/:order_id/balance
Authorization: Bearer <admin-token>
Permission: payment:create
```

A convenience endpoint for settling what's left on an already partially paid order — no `order_approval_id` needed. Only usable when the order is `payment_status = PARTIALLY_PAID` and `order_status = PROCESSING`.

Request:

```ts
type PayOrderBalance = {
  payment_method_id?: number;
  amount?: number; // kobo — must be provided together with payment_method_id, or both omitted
  channel_last4_digit?: string | null;
};
```

Behavior:

- Settles the entire remaining `order.balance_due` in one call.
- Accepts at most one payment method; omit both fields if voucher alone covers the remaining balance.
- Same response shape as "Pay POS Order" above.

### Add POS Order Item

```http
PUT /api/v1/pos/orders/:order_id/item
Authorization: Bearer <admin-token>
Permission: order:create
```

`order_id` is the UUID primary key returned from create-order. For this first pass, the order must still be unpaid; paid and part-paid add-on handling will be completed with the payment flow. This now adds **one** item per call (was a bulk `items[]` array before) and the method changed from `POST` to `PUT`.

Request:

```ts
type AddPosOrderItem = {
  service_item_id: number;
  service_preference_item_id?: number | null; // same singular field as create-order
  service_item_modifier_ids?: number[];
  accessories?: number[];
  customer_note?: string | null;
  pos_note?: string | null;
  piece_attributes?: CreatePosOrderPieceAttribute;
};
```

Behavior:

- Adds one new priced `order_item` to the existing order.
- Infers physical pieces and accessories the same way create-order does.
- Saves draft POS capture in the new `order_items[].item_attributes`.
- Recomputes draft DEBIT discounts such as loyalty redemption, then recomputes order money caches transactionally.
- Writes one `ItemHistory` `CREATE` row per new physical piece.
- Writes no audit rows while the order is still a draft.

Response:

```ts
type AddPosOrderItemResponse = CreatePosOrderResponse;
```

The response `data` is the refreshed order object with `order_adjustments[]` and full detailed `order_items[]`.

### Remove POS Order Item

```http
DELETE /api/v1/pos/orders/:order_id/item/:item_id
Authorization: Bearer <admin-token>
Permission: order:create
```

`item_id` (was `order_item_id`) is the order item's UUID. For this first pass, the order must still be unpaid. Removing the last item is rejected so an order cannot become empty.

Behavior:

- Removes one draft `order_item`.
- Hard-deletes unshared physical pieces that only belonged to that item.
- If a physical piece is shared with another service, the piece survives and only the removed item's service link is deleted.
- Recomputes draft DEBIT discounts, order money caches, and `due_by` transactionally.
- Writes no new `ItemHistory` rows. Draft-created history for hard-deleted pieces is removed with the piece.
- Writes no audit rows while the order is still a draft. Removed items are intentionally absent from the later pipeline-entry snapshot; if the draft is abandoned instead, the abandonment snapshot preserves what remained at abandonment time.

Response:

```ts
type RemoveOrderItemResponse = CreatePosOrderResponse;
```

The response `data` is the refreshed order object with `order_adjustments[]` and full detailed `order_items[]`.

### Abandon POS Order

```http
POST /api/v1/pos/orders/:order_id/abandon
Authorization: Bearer <admin-token>
Permission: order:delete
```

Request:

```ts
type AbandonOrder = {
  reason?: string | null;
};
```

Behavior:

- Only works for unpaid draft orders: `order_status = PENDING` and `payment_status = UNPAID`.
- Rejects if any payment transaction exists for the order.
- Marks order, order items, and order item pieces as `ABANDONED`.
- Marks active part-payment approvals as `ABANDONED`.
- Sets order `balance_due = 0` but keeps quote totals for historical readability.
- Does not refresh or update `customers.outstanding_balance`; draft orders do not affect that cache.
- Writes one `ItemHistory` `ORDER_ABANDONED` row per physical piece.
- Writes one order `DELETE` audit snapshot with the dropped draft order, items, approvals, and abandonment metadata.

Response:

```ts
type AbandonOrderResponse = CreatePosOrderResponse;
```

The response `data` is the refreshed abandoned order object with `order_adjustments[]` and full detailed `order_items[]`.

### Get Item History

```http
GET /api/v1/admins/orders/item-history
Authorization: Bearer <admin-token>
Permission: order:view
```

Query:

```ts
type ItemHistoryQuery = {
  page?: number;
  per_page?: number;
  order_item_piece_id?: string;
  order_item_id?: string;
  order_id?: string;
  customer_id?: number;
  action?: 'CREATE' | 'ORDER_PAYMENT' | 'ORDER_ABANDONED';
  new_status?: string;
  start_date?: string;
  end_date?: string;
};
```

Response is paginated `ItemHistory` rows from `order_item_piece_history`. `ItemHistory` is the pipeline spine for a physical order item piece. For Phase 1 draft create rows, `action = 'CREATE'` and `event_data = {}`; creation detail is captured later by the full pipeline-entry audit snapshot if paid, or by the abandonment snapshot if dropped.

## Available Now: POS Lookup APIs

These endpoints are implemented and documented in Swagger.

### Get Service Catalog

```http
GET /api/v1/pos/orders/catalog
Authorization: Bearer <admin-token>
Permission: order:view
```

Query params:

- `service_id?: number`
- `service_subcategory_id?: number`
- `service_item_category_id?: number`
- `search?: string`

Response shape:

```ts
type PosCatalogResponse = {
  status: 'success';
  message: string;
  code: number;
  data: Array<{
    id: number;
    name: string;
    is_active: boolean;
    service_subcategories: Array<{
      id: number;
      name: string;
      is_active: boolean;
    }>;
    service_item_categories: Array<{
      id: number;
      name: string;
      is_active: boolean;
    }>;
    service_items: Array<{
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
    }>;
  }>;
};
```

Display notes:

- Top-level services are sorted by `id`, so seeded display order is preserved.
- Service-item prices are kobo.
- `item_pieces` inside each service item are the physical pieces expected for that service item.
- Empty `item_pieces` can be valid for service items where the catalog does not define explicit piece names.

### Get Item Pieces

```http
GET /api/v1/pos/orders/catalog/item-pieces
Authorization: Bearer <admin-token>
Permission: order:view
```

Query params:

- `search?: string`

Response item:

```ts
type PosItemPiece = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_accessory: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};
```

Display notes:

- Items are sorted by `id`.
- Item pieces are garment/service physical pieces. Accessories use the accessory-types lookup.

### Get Accessory Types

```http
GET /api/v1/pos/orders/catalog/accessory-types
Authorization: Bearer <admin-token>
Permission: order:view
```

Query params:

- `search?: string`

Response item:

```ts
type PosAccessoryType = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};
```

Seeded values include `Scarf`, `Belt`, and `Wrapper`.

### Get Fabric Types

```http
GET /api/v1/pos/orders/catalog/fabric-types
Authorization: Bearer <admin-token>
Permission: order:view
```

Query params:

- `search?: string`

Returns active fabric lookup values.

### Get Defect Types

```http
GET /api/v1/pos/orders/catalog/defect-types
Authorization: Bearer <admin-token>
Permission: order:view
```

Query params:

- `search?: string`

Returns active defect lookup values.

### Get Stain Types

```http
GET /api/v1/pos/orders/catalog/stain-types
Authorization: Bearer <admin-token>
Permission: order:view
```

Query params:

- `search?: string`

Returns active stain lookup values.

### Get Service Preference Items

```http
GET /api/v1/pos/orders/catalog/service-preference-items
Authorization: Bearer <admin-token>
Permission: order:view
```

Query params:

- `service_preference_id?: number`
- `search?: string`

Response item:

```ts
type PosServicePreferenceItem = {
  id: number;
  name: string;
  price: number;
  pricing_type: 'FLAT_AMOUNT' | 'PERCENTAGE';
  percentage_rate: number | null;
  service_preference_id: number | null;
  service_preference: {
    id: number;
    name: string;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
```

Current packaging preference items:

- `Fold`
- `Folded over Hanger`
- `Hang`

### Get Service Item Modifiers

```http
GET /api/v1/pos/orders/catalog/service-item-modifiers
Authorization: Bearer <admin-token>
Permission: order:view
```

Query params:

- `search?: string`

Response item:

```ts
type PosServiceItemModifier = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  pricing_type: 'FLAT_AMOUNT' | 'PERCENTAGE';
  flat_amount: number | null;
  percentage_rate: number | null;
  exclusion_group: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};
```

Modifier conflict rules:

- `exclusion_group` is a comma-separated list of incompatible modifier slugs.
- `percentage_rate` is the human percentage value; `50` means 50%.
- The frontend may use this to disable conflicting choices, but the backend remains authoritative.
- `Heavily Soiled` and `Heavy Starch` are stackable.

Current modifier seeds:

| Name | Slug | Pricing | Conflicts |
|---|---|---|---|
| Express | `express` | `PERCENTAGE`, `50` | `same-day,express-press-only` |
| Same-Day | `same-day` | `PERCENTAGE`, `100` | `express,same-day-press-only` |
| Press-only | `press-only` | `PERCENTAGE`, `50` | `express-press-only,same-day-press-only` |
| Express Press-only | `express-press-only` | `PERCENTAGE`, `75` | `express,press-only` |
| Same-Day Press-only | `same-day-press-only` | `PERCENTAGE`, `100` | `same-day,press-only` |
| Heavily Soiled | `heavily-soiled` | `FLAT_AMOUNT`, `250000` kobo | none |
| Heavy Starch | `heavy-starch` | `FLAT_AMOUNT`, `250000` kobo | none |

### Get Payment Methods

```http
GET /api/v1/pos/orders/catalog/payment-methods
Authorization: Bearer <admin-token>
Permission: payment:view OR order:view
```

Query params:

- `store_id?: number`

Response item:

```ts
type PosPaymentMethod = {
  id: number;
  store_id: number | null;
  name: string;
  payment_channel: string;
  bank_name: string | null;
  account_number: string | null;
  is_active: boolean;
  is_system_internal: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
```

Store-scope behavior:

- Non-super admin: backend ignores query `store_id` and uses the logged-in admin's `store_id`.
- Super admin: backend uses query `store_id` when supplied.
- Super admin with no `store_id`: backend returns all active payment methods.
- Store-scoped reads include store-specific methods and global methods where `store_id = null`.
- Non-super admin reads hide system/internal methods. Super admins may inspect all methods, including system/internal methods.
- System/internal payment methods are backend-only. Do not submit their IDs in payment requests; the API rejects them as `payment method not allowed`.

Payment channel is a code-level enum concept. Current seeded channels include:

- `cash`
- `card`
- `transfer`
- `wallet`
- `voucher` (system/internal; backend-applied only)

Transfer methods may include:

- `bank_name`
- `account_number`

### Get POS Config

```http
GET /api/v1/pos/orders/catalog/config
Authorization: Bearer <admin-token>
Permission: order:view
```

Response:

```ts
type PosConfigResponse = {
  status: 'success';
  message: string;
  code: number;
  data: {
    tax_config: {
      type: 'PERCENTAGE' | 'FLAT_FEE';
      percentage: number | null;
      flat_fee: number | null;
    };
  };
};
```

Current seed:

```ts
{
  tax_config: {
    type: 'PERCENTAGE',
    percentage: 7.5,
    flat_fee: null
  }
}
```

Future config groups, such as store config, should be added as sibling object fields inside `data`.

## Phase 1 Intake Flow For UI Design

These APIs are still being built. Do not wire production UI calls to these until this document marks them available.

Expected UI flow:

1. Search customer by phone, email, or name.
2. Create customer if not found.
3. Start POS order draft.
4. Select service items from catalog.
5. Materialize physical pieces once per object.
6. Link each piece to one or more service items.
7. Capture physical attributes:
   - color
   - fabric type
   - high value flag
   - delicate flag
   - accessory flag
   - set member flag
   - defects
   - stains
   - POS notes
8. Attach item-level preferences.
9. Attach item-level modifiers.
10. Review bill.
11. Apply loyalty/promo adjustments where allowed.
12. Pay using voucher first when available, then wallet/cash/card/transfer.
13. On successful payment, show order in `PROCESSING` and pieces in `PENDING_BARCODE_TAGGING`.

## Client State Guidance

Model draft state with separate arrays for:

- `items`: selected service/work lines.
- `pieces`: physical objects in the order.
- `links`: item-to-piece relationships.
- `piece_defects`: piece-level selected defect ids.
- `piece_stains`: piece-level selected stain ids.
- `item_preferences`: item-level selected preference ids.
- `item_modifiers`: item-level selected modifier ids.
- `adjustments`: order-level loyalty/promo/fee rows.
- `payments`: tender rows.

Avoid duplicating one physical object just because multiple services apply to it. Use one piece and multiple links.

## Known Frontend Caveats

- Use backend returned ids as stable keys.
- Do not assume lookup ids are hard-coded across environments.
- Do not calculate final bill totals authoritatively on the client.
- Do not let users decline voucher balance when the backend says voucher is available.
- Do not expose Phase 2/3 statuses as actionable steps yet.
- Use `created_at` as draft creation time.
- Use `intake_at` as pipeline/TAT start time once returned by order endpoints.
- Money values are kobo; render naira only for display.
