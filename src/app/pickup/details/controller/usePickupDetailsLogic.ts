import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { appToast } from "../../../../libs";
import { useServiceItemModifiers } from "../../../place-order/model/queries/useLookups";
import { usePosOrder } from "../../../place-order/model/queries/usePosOrder";
import {
  NORMAL_TYPE,
  toPickupItemRows,
  toPickupSummary,
  type PickupItemRow,
} from "../model/pickupDetailMapping";

const ALL = "All";
const PAGE_SIZE = 6;

export const usePickupDetailsLogic = () => {
  const { id } = useParams({ from: "/pickup/$id" });
  const navigate = useNavigate();

  const { data: posOrder, isLoading, isError } = usePosOrder(id);
  const { data: modifiers = [] } = useServiceItemModifiers();

  const order = useMemo(
    () => (posOrder ? toPickupSummary(posOrder) : null),
    [posOrder]
  );

  const allItems = useMemo(
    () => toPickupItemRows(posOrder, modifiers),
    [posOrder, modifiers]
  );

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    allItems.forEach((row) => types.add(row.type));
    const sorted = [...types].sort((a, b) =>
      a === NORMAL_TYPE ? -1 : b === NORMAL_TYPE ? 1 : a.localeCompare(b)
    );
    return [ALL, ...sorted];
  }, [allItems]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filterRef = useRef<HTMLDivElement | null>(null);

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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allItems.filter((row) => {
      const matchesType = typeFilter === ALL || row.type === typeFilter;
      const matchesSearch =
        !query ||
        row.item.toLowerCase().includes(query) ||
        row.category.toLowerCase().includes(query) ||
        row.colour.toLowerCase().includes(query) ||
        row.serviceType.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [allItems, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items: PickupItemRow[] = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    setFilterOpen(false);
    setPage(1);
  };

  const handleMarkAsDone = () => {
    appToast.info("Completing an order is not available yet");
  };

  const handlePrintReceipt = () => {
    appToast.info("Receipt printing is not available yet");
  };

  const goBack = () => navigate({ to: "/pickup" });

  return {
    order,
    items,
    isLoading,
    isError,

    search,
    typeFilter,
    filterOpen,
    page: currentPage,
    totalPages,

    filterRef,

    setFilterOpen,

    handleSearch,
    handleTypeFilter,
    handleMarkAsDone,
    handlePrintReceipt,
    goBack,
    goToPreviousPage: () => setPage(Math.max(1, currentPage - 1)),
    goToNextPage: () => setPage(Math.min(totalPages, currentPage + 1)),

    typeOptions,
  };
};
