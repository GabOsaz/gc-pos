import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  buildMockOrderDetail,
  buildMockOrderItems,
  type OrderItemRow,
} from "../../../../utils/mockOrders";

const itemTypes = ["All", "Express", "Normal"] as const;
type ItemTypeFilter = (typeof itemTypes)[number];

const PAGE_SIZE = 6;
const mockItems = buildMockOrderItems();

export const usePickupDetailsLogic = () => {
  const { id } = useParams({ from: "/pickup/$id" });
  const navigate = useNavigate();

  const order = useMemo(
    () => buildMockOrderDetail(id, "Ready for Pickup"),
    [id]
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilter>("All");
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
    return mockItems.filter((row) => {
      const matchesType = typeFilter === "All" || row.type === typeFilter;
      const matchesSearch =
        !query ||
        row.item.toLowerCase().includes(query) ||
        row.category.toLowerCase().includes(query) ||
        row.colour.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items: OrderItemRow[] = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTypeFilter = (type: ItemTypeFilter) => {
    setTypeFilter(type);
    setFilterOpen(false);
    setPage(1);
  };

  const handleMarkAsDone = () => {
    // TODO: wire to the pickup completion endpoint.
    console.info(`Mark as done -> ${order.orderId}`);
  };

  const handlePrintReceipt = () => {
    // TODO: wire to the receipt printing flow.
    console.info(`Print receipt -> ${order.orderId}`);
  };

  const goBack = () => navigate({ to: "/pickup" });

  return {
    // Data
    order,
    items,

    // State
    search,
    typeFilter,
    filterOpen,
    page: currentPage,
    totalPages,

    // Refs
    filterRef,

    // Setters
    setFilterOpen,

    // Methods
    handleSearch,
    handleTypeFilter,
    handleMarkAsDone,
    handlePrintReceipt,
    goBack,
    goToPreviousPage: () => setPage(Math.max(1, currentPage - 1)),
    goToNextPage: () => setPage(Math.min(totalPages, currentPage + 1)),

    // Constants
    typeOptions: itemTypes,
  };
};
