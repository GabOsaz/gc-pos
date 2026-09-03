import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "../../../common-hooks/useDebouncedValue";
import { usePosOrders } from "../../../common-hooks/usePosOrders";
import { appToast } from "../../../libs";
import {
  posOrderStatusLabels,
  posPaymentStatusLabels,
  posOrderStatuses,
  posPaymentStatuses,
  type PosOrderStatus,
  type PosPaymentStatus,
} from "../../../utils/orderStatus";

const PAGE_SIZE = 10;
const ALL = "All";

/** FilterDropdown works in display strings, so map labels back to API values. */
const orderStatusByLabel = new Map<string, PosOrderStatus>(
  posOrderStatuses.map((status) => [posOrderStatusLabels[status], status])
);
const paymentStatusByLabel = new Map<string, PosPaymentStatus>(
  posPaymentStatuses.map((status) => [posPaymentStatusLabels[status], status])
);

export const useOrderHistoryLogic = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [orderStatusLabel, setOrderStatusLabel] = useState<string>(ALL);
  const [paymentStatusLabel, setPaymentStatusLabel] = useState<string>(ALL);

  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [paymentFilterOpen, setPaymentFilterOpen] = useState(false);
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null);

  const statusFilterRef = useRef<HTMLDivElement | null>(null);
  const paymentFilterRef = useRef<HTMLDivElement | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const { orders, totalPages, totalCount, isLoading, isFetching } = usePosOrders(
    "history",
    page,
    PAGE_SIZE,
    {
      search: debouncedSearch.trim() || undefined,
      orderStatus: orderStatusByLabel.get(orderStatusLabel),
      paymentStatus: paymentStatusByLabel.get(paymentStatusLabel),
    }
  );

  useEffect(() => {
    if (!statusFilterOpen && !paymentFilterOpen && !openRowMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (statusFilterOpen && !statusFilterRef.current?.contains(target)) {
        setStatusFilterOpen(false);
      }
      if (paymentFilterOpen && !paymentFilterRef.current?.contains(target)) {
        setPaymentFilterOpen(false);
      }
      if (openRowMenu && !rowMenuRef.current?.contains(target)) {
        setOpenRowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [statusFilterOpen, paymentFilterOpen, openRowMenu]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleOrderStatusFilter = (label: string) => {
    setOrderStatusLabel(label);
    setStatusFilterOpen(false);
    setPage(1);
  };

  const handlePaymentStatusFilter = (label: string) => {
    setPaymentStatusLabel(label);
    setPaymentFilterOpen(false);
    setPage(1);
  };

  const handleGenerateReport = () => {
    // No end-of-day report endpoint exists in Phase 1.
    appToast.info("End of day reports are not available yet");
  };

  return {
    // List
    orders,
    totalCount,
    page,
    totalPages,
    isLoading,
    isFetching,
    goToPreviousPage: () => setPage((p) => Math.max(1, p - 1)),
    goToNextPage: () => setPage((p) => Math.min(totalPages, p + 1)),

    // Search + filters
    search,
    handleSearch,
    orderStatusLabel,
    paymentStatusLabel,
    handleOrderStatusFilter,
    handlePaymentStatusFilter,
    statusFilterOpen,
    setStatusFilterOpen,
    paymentFilterOpen,
    setPaymentFilterOpen,
    statusFilterRef,
    paymentFilterRef,
    orderStatusOptions: [ALL, ...posOrderStatuses.map((s) => posOrderStatusLabels[s])],
    paymentStatusOptions: [
      ALL,
      ...posPaymentStatuses.map((s) => posPaymentStatusLabels[s]),
    ],

    // Row menu + details
    openRowMenu,
    rowMenuRef,
    toggleRowMenu: (id: string) =>
      setOpenRowMenu((prev) => (prev === id ? null : id)),
    detailsOrderId,
    openDetails: (id: string) => {
      setDetailsOrderId(id);
      setOpenRowMenu(null);
    },
    closeDetails: () => setDetailsOrderId(null),

    handleGenerateReport,
  };
};
