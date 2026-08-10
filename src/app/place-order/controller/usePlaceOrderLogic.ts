import { useCallback, useEffect, useMemo, useState } from "react";
import { appToast } from "../../../libs";
import apiErrFn from "../../../utils/apiErrFn";
import { defaultAddOrderForm, type AddOrderForm } from "../model/addOrderForm";
import {
  buildItemPayload,
  repeatItem,
  toSummaryLines,
  type OrderSummaryLine,
} from "../model/orderMapping";
import {
  useAbandonOrder,
  useAddOrderItem,
  useCreateOrder,
  useRemoveOrderItem,
} from "../model/mutations/useOrderDraft";
import { usePayOrder } from "../model/mutations/usePayOrder";
import { useCatalog } from "../model/queries/useCatalog";
import { useServiceItemModifiers } from "../model/queries/useLookups";
import { usePosOrder } from "../model/queries/usePosOrder";
import type {
  PosCustomerSummary,
  PosPaymentMethod,
  PosServiceItem,
} from "../model/types";

/** Survives a page reload so an in-progress draft isn't orphaned server side. */
const DRAFT_STORAGE_KEY = "pos:draft-order-id";

const ALL_CATEGORIES = "All";

/** The subset of customer detail the summary panel renders, from either source. */
export interface SelectedCustomer {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  voucher_balance: number;
}

function fromCustomerSummary(customer: PosCustomerSummary): SelectedCustomer {
  return {
    id: customer.id,
    name: customer.full_name,
    address: customer.address,
    phone: customer.phone,
    email: customer.email,
    voucher_balance: customer.voucher_balance,
  };
}

export const usePlaceOrderLogic = () => {
  /* ------------------------------------------------------------- catalogue */

  const [search, setSearch] = useState("");
  const { items, subcategories, isLoading: isLoadingServices } = useCatalog();
  const { data: modifiers = [] } = useServiceItemModifiers();

  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...subcategories.map((sub) => sub.name)],
    [subcategories]
  );

  const services = useMemo(() => {
    const term = search.trim().toLowerCase();
    const sub = subcategories.find((s) => s.name === activeCategory);

    return items.filter((item) => {
      const inCategory =
        activeCategory === ALL_CATEGORIES || !sub || item.service_subcategory_id === sub.id;
      const matchesSearch = !term || item.name.toLowerCase().includes(term);
      return inCategory && matchesSearch;
    });
  }, [items, subcategories, activeCategory, search]);

  /* ----------------------------------------------------------------- draft */

  const [storedOrderId, setStoredOrderId] = useState<string | null>(() =>
    sessionStorage.getItem(DRAFT_STORAGE_KEY)
  );
  const { data: fetchedOrder, isLoading: isLoadingOrder } = usePosOrder(storedOrderId);

  // A recovered draft may have been paid or abandoned elsewhere. Only a PENDING
  // order is still editable from this screen; anything else is dropped.
  const order = fetchedOrder?.order_status === "PENDING" ? fetchedOrder : undefined;
  const orderId = order?.id ?? null;

  useEffect(() => {
    if (fetchedOrder && fetchedOrder.order_status !== "PENDING") {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [fetchedOrder]);

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    setStoredOrderId(null);
  }, []);

  const startDraft = useCallback((id: string) => {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, id);
    setStoredOrderId(id);
  }, []);

  /* -------------------------------------------------------------- customer */

  const [pendingCustomer, setPendingCustomer] = useState<SelectedCustomer | null>(null);
  const [selectCustomerOpen, setSelectCustomerOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  // Once a draft exists the order owns the customer — there is no endpoint to
  // move a draft to a different customer.
  const selectedCustomer = useMemo<SelectedCustomer | null>(() => {
    if (!order) return pendingCustomer;
    return {
      id: order.customer.id,
      name: order.customer.name,
      address: order.customer.address,
      phone: order.customer.phone,
      email: order.customer.email,
      voucher_balance: order.customer.voucher_balance,
    };
  }, [order, pendingCustomer]);

  const isCustomerLocked = !!order;

  const chooseCustomer = (customer: PosCustomerSummary) => {
    setPendingCustomer(fromCustomerSummary(customer));
    setSelectCustomerOpen(false);
    setAddCustomerOpen(false);
  };

  const clearCustomer = () => {
    if (isCustomerLocked) {
      appToast.info("Discard the draft order to change the customer");
      return;
    }
    setPendingCustomer(null);
  };

  /* ------------------------------------------------------------- item form */

  const [selectedProduct, setSelectedProduct] = useState<PosServiceItem | null>(null);
  const [addOrderForm, setAddOrderForm] = useState<AddOrderForm>(defaultAddOrderForm);

  const patchForm = (patch: Partial<AddOrderForm>) =>
    setAddOrderForm((prev) => ({ ...prev, ...patch }));

  const closeAddOrderModal = () => {
    setSelectedProduct(null);
    setAddOrderForm(defaultAddOrderForm);
  };

  const openAddOrderModal = (product: PosServiceItem) => {
    // Adding before a recovered draft has loaded would start a second order.
    if (storedOrderId && isLoadingOrder) {
      appToast.info("Loading your draft order…");
      return;
    }
    if (!selectedCustomer) {
      appToast.info("Select a customer before adding items");
      setSelectCustomerOpen(true);
      return;
    }
    setSelectedProduct(product);
    setAddOrderForm({ ...defaultAddOrderForm, serviceItemId: product.id });
  };

  /* ---------------------------------------------------------- draft writes */

  const createOrder = useCreateOrder();
  const addOrderItem = useAddOrderItem();
  const removeOrderItem = useRemoveOrderItem();
  const abandonOrder = useAbandonOrder();

  const isSavingItem = createOrder.isPending || addOrderItem.isPending;
  const isMutatingDraft = isSavingItem || removeOrderItem.isPending || abandonOrder.isPending;

  /**
   * Quantity has no API equivalent — N of the same thing is N `order_items`.
   * Create-order takes them in one call; add-item only accepts one at a time.
   */
  const addItems = useCallback(
    async (item: ReturnType<typeof buildItemPayload>, quantity: number) => {
      if (orderId) {
        let message = "";
        for (const payload of repeatItem(item, quantity)) {
          // Sequential, not parallel: each response carries recomputed totals.
          const response = await addOrderItem.mutateAsync({ orderId, item: payload });
          message = response.message;
        }
        // One message for the whole batch, not one per repeated item.
        return message;
      }

      if (!selectedCustomer) throw new Error("No customer selected");

      const response = await createOrder.mutateAsync({
        customer_id: selectedCustomer.id,
        items: repeatItem(item, quantity),
      });
      if (response.data?.id) startDraft(response.data.id);
      return response.message;
    },
    [orderId, selectedCustomer, addOrderItem, createOrder, startDraft]
  );

  const handleAddToOrder = async () => {
    if (!selectedProduct) return;
    try {
      const message = await addItems(buildItemPayload(addOrderForm), addOrderForm.quantity);
      appToast.success(message || "Item added to the order");
      closeAddOrderModal();
    } catch (error) {
      apiErrFn(error, "Could not add the item to this order");
    }
  };

  /* --------------------------------------------------------- summary lines */

  const preferences = useMemo(
    () => items.flatMap((item) => item.preferences ?? []),
    [items]
  );

  const orderLines = useMemo(
    () => toSummaryLines(order, { modifiers, preferences }),
    [order, modifiers, preferences]
  );

  const increaseLine = async (line: OrderSummaryLine) => {
    if (!orderId) return;
    try {
      await addOrderItem.mutateAsync({ orderId, item: line.payload });
    } catch (error) {
      apiErrFn(error, "Could not add another of this item");
    }
  };

  const decreaseLine = async (line: OrderSummaryLine) => {
    if (!orderId) return;
    // The backend rejects removing the last item so an order can't become empty.
    if (order?.order_items.length === 1) {
      appToast.info("Discard the draft to remove the last item");
      return;
    }
    const newestItemId = line.itemIds[line.itemIds.length - 1];
    try {
      await removeOrderItem.mutateAsync({ orderId, itemId: newestItemId });
    } catch (error) {
      apiErrFn(error, "Could not remove this item");
    }
  };

  const removeLine = async (line: OrderSummaryLine) => {
    if (!orderId) return;
    if (order && line.itemIds.length === order.order_items.length) {
      appToast.info("Discard the draft to remove every item");
      return;
    }
    try {
      let message = "";
      // Newest first, so the remaining ids stay valid as the order shrinks.
      for (const itemId of [...line.itemIds].reverse()) {
        const response = await removeOrderItem.mutateAsync({ orderId, itemId });
        message = response.message;
      }
      appToast.success(message || `${line.name} removed from the order`);
    } catch (error) {
      apiErrFn(error, "Could not remove this item");
    }
  };

  const discardDraft = async () => {
    if (!orderId) {
      setPendingCustomer(null);
      return;
    }
    try {
      const response = await abandonOrder.mutateAsync({ orderId });
      clearDraft();
      setPendingCustomer(null);
      appToast.success(response.message || "Draft order discarded");
    } catch (error) {
      apiErrFn(error, "Could not discard this draft");
    }
  };

  /* --------------------------------------------------------------- payment */

  const [paymentOpen, setPaymentOpen] = useState(false);
  const payOrder = usePayOrder();

  const openPayment = () => {
    if (!order) return;
    setPaymentOpen(true);
  };

  /**
   * Full payment only. `amount` is the balance left after the voucher the
   * backend applies for us; when the voucher settles everything, `method` is
   * null and `payment_methods` goes up empty, which the API allows.
   */
  const handlePayment = async (method: PosPaymentMethod | null, amount: number) => {
    if (!orderId) return;
    try {
      const response = await payOrder.mutateAsync({
        orderId,
        body: {
          payment_type: "FULL",
          payment_methods:
            method && amount > 0
              ? [{ payment_method_id: method.id, amount }]
              : [],
        },
      });
      setPaymentOpen(false);
      clearDraft();
      setPendingCustomer(null);
      appToast.success(response.message || "Payment successful");
    } catch (error) {
      apiErrFn(error, "Could not take payment for this order");
    }
  };

  /**
   * The draft is already persisted, so "save" just hands the terminal back to
   * the attendant — the order stays PENDING until it is paid for.
   */
  const saveOrder = () => {
    if (!order) return;
    appToast.success(`Order ${order.order_number} saved as a draft`);
    clearDraft();
    setPendingCustomer(null);
  };

  return {
    // Catalogue
    activeCategory,
    search,
    services,
    categories,
    isLoadingServices,
    setActiveCategory,
    setSearch,

    // Customer
    selectedCustomer,
    isCustomerLocked,
    selectCustomerOpen,
    addCustomerOpen,
    setSelectCustomerOpen,
    setAddCustomerOpen,
    chooseCustomer,
    clearCustomer,

    // Item modal
    selectedProduct,
    addOrderForm,
    openAddOrderModal,
    closeAddOrderModal,
    patchForm,
    handleAddToOrder,
    isSavingItem,

    // Draft
    order,
    orderLines,
    isLoadingOrder,
    isMutatingDraft,
    increaseLine,
    decreaseLine,
    removeLine,
    discardDraft,
    saveOrder,

    // Payment
    paymentOpen,
    openPayment,
    closePayment: () => setPaymentOpen(false),
    handlePayment,
    isPaying: payOrder.isPending,
  };
};
