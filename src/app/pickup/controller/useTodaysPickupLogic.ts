import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDebouncedValue } from "../../../common-hooks/useDebouncedValue";
import { appToast } from "../../../libs";
import {
  posOrderStatusLabels,
  posOrderStatuses,
  type PosOrderStatus,
} from "../../../utils/orderStatus";
import {
  useTodaysPickups,
  type PosOrderListRow,
} from "../model/queries/useTodaysPickups";

const PAGE_SIZE = 6;
const ALL = "All";

const rowActions = ["View Details", "Mark as Delivered"] as const;

const orderStatusByLabel = new Map<string, PosOrderStatus>(
  posOrderStatuses.map((status) => [posOrderStatusLabels[status], status])
);

export const useTodaysPickupLogic = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusLabel, setStatusLabel] = useState<string>(ALL);
  const [filterOpen, setFilterOpen] = useState(false);
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const { pickups, totalPages, totalCount, isLoading, isFetching } =
    useTodaysPickups(page, PAGE_SIZE, {
      search: debouncedSearch.trim() || undefined,
      orderStatus: orderStatusByLabel.get(statusLabel),
    });

  useEffect(() => {
    if (!filterOpen && !openRowMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (filterOpen && !filterRef.current?.contains(target)) {
        setFilterOpen(false);
      }
      if (openRowMenu && !rowMenuRef.current?.contains(target)) {
        setOpenRowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen, openRowMenu]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (label: string) => {
    setStatusLabel(label);
    setFilterOpen(false);
    setPage(1);
  };

  const openDetails = (order: PosOrderListRow) => {
    setOpenRowMenu(null);
    navigate({ to: "/pickup/$id", params: { id: order.id } });
  };

  const handleRowAction = (action: string, order: PosOrderListRow) => {
    setOpenRowMenu(null);

    if (action === "View Details") {
      openDetails(order);
      return;
    }

    appToast.info("Marking a pickup as delivered is not available yet");
  };

  return {
    pickups,
    totalCount,
    page,
    totalPages,
    isLoading,
    isFetching,
    goToPreviousPage: () => setPage((p) => Math.max(1, p - 1)),
    goToNextPage: () => setPage((p) => Math.min(totalPages, p + 1)),

    search,
    handleSearch,
    statusLabel,
    handleStatusFilter,
    filterOpen,
    setFilterOpen,
    filterRef,
    statusOptions: [ALL, ...posOrderStatuses.map((s) => posOrderStatusLabels[s])],

    openRowMenu,
    rowMenuRef,
    toggleRowMenu: (id: string) =>
      setOpenRowMenu((prev) => (prev === id ? null : id)),
    rowActions,
    handleRowAction,
    openDetails,
  };
};
