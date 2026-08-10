import { useEffect, useMemo, useRef, useState } from "react";
import { orderStatuses, type OrderStatus } from "../utils/orderStatus";

export interface OrderRow {
  id: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  deliveryType: string;
  deliveryLocation: string;
  quantity: number;
  amount: number;
  deliveryDate: string;
  status: OrderStatus;
}

export type StatusFilter = OrderStatus | "All";

interface UseOrderTableOptions<T extends OrderRow> {
  data: T[];
  pageSize?: number;
}

/**
 * Search / status filter / pagination / row-menu state shared by the order
 * listing screens (Order History, Today's Pickup).
 */
export const useOrderTable = <T extends OrderRow>({
  data,
  pageSize = 6,
}: UseOrderTableOptions<T>) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filterRef = useRef<HTMLDivElement | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen && !openRowMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (filterOpen && filterRef.current && !filterRef.current.contains(target)) {
        setFilterOpen(false);
      }
      if (openRowMenu && rowMenuRef.current && !rowMenuRef.current.contains(target)) {
        setOpenRowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen, openRowMenu]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((order) => {
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      const matchesSearch =
        !query ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.orderId.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [data, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const orders = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    setFilterOpen(false);
    setPage(1);
  };

  const toggleRowMenu = (id: string) =>
    setOpenRowMenu((prev) => (prev === id ? null : id));

  const closeRowMenu = () => setOpenRowMenu(null);

  return {
    // State
    search,
    statusFilter,
    filterOpen,
    openRowMenu,
    orders,
    page: currentPage,
    totalPages,

    // Refs
    filterRef,
    rowMenuRef,

    // Setters
    setFilterOpen,

    // Methods
    handleSearch,
    handleStatusFilter,
    toggleRowMenu,
    closeRowMenu,
    goToPreviousPage: () => setPage(Math.max(1, currentPage - 1)),
    goToNextPage: () => setPage(Math.min(totalPages, currentPage + 1)),

    // Constants
    statusOptions: ["All", ...orderStatuses] as const,
  };
};

export type OrderTableState<T extends OrderRow> = ReturnType<typeof useOrderTable<T>>;
