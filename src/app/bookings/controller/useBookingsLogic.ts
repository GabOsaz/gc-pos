import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "../../../common-hooks/useDebouncedValue";
import { appToast } from "../../../libs";
import apiErrFn from "../../../utils/apiErrFn";
import { useAbandonOrder } from "../../place-order/model/mutations/useOrderDraft";
import { useFinalizeInvoice } from "../../place-order/model/mutations/useFinalizeInvoice";
import { usePayOrder } from "../../place-order/model/mutations/usePayOrder";
import { usePosOrder } from "../../place-order/model/queries/usePosOrder";
import type { PosPaymentMethod } from "../../../model/pos/types";
import { posOrdersKey } from "../../../common-hooks/usePosOrders";
import {
  useSavedBookings,
  type PosOrderListRow,
} from "../model/queries/useSavedBookings";

const PAGE_SIZE = 6;

export const useBookingsLogic = () => {
  const queryClient = useQueryClient();

  /* ------------------------------------------------------------ list state */

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const { bookings, totalPages, totalCount, isLoading, isFetching } = useSavedBookings(
    page,
    PAGE_SIZE,
    {
      search: debouncedSearch.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }
  );

  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  // Paying or abandoning changes what belongs on every order list, not just this one.
  const refreshList = () =>
    queryClient.invalidateQueries({ queryKey: ["pos", posOrdersKey] });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
    setFilterOpen(false);
  };

  const applyFilters = () => {
    setPage(1);
    setFilterOpen(false);
  };

  const hasFilters = !!startDate || !!endDate;

  /* --------------------------------------------------------------- payment */

  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  // List rows omit `invoice`, so the payment modal needs the full order.
  const { data: payingOrder, isLoading: isLoadingOrder } = usePosOrder(payingOrderId);
  const finalizeInvoice = useFinalizeInvoice();
  const payOrder = usePayOrder();

  const handlePayment = async (method: PosPaymentMethod | null) => {
    if (!payingOrderId || !payingOrder?.invoice) return;
    try {
      const invoice =
        payingOrder.invoice.status === "DRAFT"
          ? await finalizeInvoice.mutateAsync({
              orderId: payingOrderId,
              invoiceId: payingOrder.invoice.id,
            })
          : payingOrder.invoice;

      const amount = invoice.amount_to_charge;
      const response = await payOrder.mutateAsync({
        orderId: payingOrderId,
        body: {
          invoice_id: invoice.id,
          payment_methods:
            method && amount > 0 ? [{ payment_method_id: method.id, amount }] : [],
        },
      });
      setPayingOrderId(null);
      await refreshList();
      appToast.success(response.message || "Payment successful");
    } catch (error) {
      apiErrFn(error, "Could not take payment for this booking");
    }
  };

  /* ------------------------------------------------------------- abandoning */

  const [orderToDelete, setOrderToDelete] = useState<PosOrderListRow | null>(null);
  const abandonOrder = useAbandonOrder();

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      const response = await abandonOrder.mutateAsync({ orderId: orderToDelete.id });
      setOrderToDelete(null);
      await refreshList();
      appToast.success(response.message || "Booking deleted");
    } catch (error) {
      apiErrFn(error, "Could not delete this booking");
    }
  };

  return {
    // List
    bookings,
    totalCount,
    page,
    totalPages,
    isLoading,
    isFetching,
    search,
    handleSearch,
    goToPreviousPage: () => setPage((p) => Math.max(1, p - 1)),
    goToNextPage: () => setPage((p) => Math.min(totalPages, p + 1)),

    // Filters
    filterOpen,
    setFilterOpen,
    filterRef,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    applyFilters,
    clearFilters,
    hasFilters,

    // Payment
    payingOrderId,
    payingOrder,
    isLoadingOrder,
    openPayment: (row: PosOrderListRow) => setPayingOrderId(row.id),
    closePayment: () => setPayingOrderId(null),
    handlePayment,
    isPaying: finalizeInvoice.isPending || payOrder.isPending,

    // Delete
    orderToDelete,
    setOrderToDelete,
    confirmDelete,
    isDeleting: abandonOrder.isPending,
  };
};
