import { useState } from "react";
import AppShell from "../../components/AppShell";
import Table from "../../components/Table";
import type { ColumnDef } from "../../components/Table";

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  bookingId: string;
  deliveryType: string;
  deliveryLocation: string;
  quantity: number;
  amount: number;
  deliveryDate: string;
}

const mockBookings: Booking[] = [
  { id: "1", customerName: "Michael Hess Asane", customerEmail: "mikehasane@gmail.com", bookingId: "#ORD30N31249", deliveryType: "Customer Pickup", deliveryLocation: "HQ Store", quantity: 20, amount: 50000, deliveryDate: "20th June 2025" },
  { id: "2", customerName: "Anna Brew", customerEmail: "annabrew231@gmail.com", bookingId: "#ORD30N31249", deliveryType: "Delivery by rider", deliveryLocation: "24, Okkuku street Illupeju Lagos", quantity: 20, amount: 50000, deliveryDate: "20th June 2025" },
  { id: "3", customerName: "Sandy Meverek", customerEmail: "sandymev233@outlook.com", bookingId: "#ORD30N31249", deliveryType: "Customer Pickup", deliveryLocation: "HQ Store", quantity: 20, amount: 50000, deliveryDate: "20th June 2025" },
  { id: "4", customerName: "Andrew Eyo", customerEmail: "andeyo@gmail.com", bookingId: "#ORD30N31249", deliveryType: "Delivery by rider", deliveryLocation: "24, Okkuku street Illupeju Lagos", quantity: 20, amount: 50000, deliveryDate: "20th June 2025" },
  { id: "5", customerName: "Sandy Meverek", customerEmail: "sandymev233@outlook.com", bookingId: "#ORD30N31249", deliveryType: "Customer Pickup", deliveryLocation: "HQ Store", quantity: 20, amount: 50000, deliveryDate: "20th June 2025" },
  { id: "6", customerName: "Andrew Eyo", customerEmail: "andeyo@gmail.com", bookingId: "#ORD30N31249", deliveryType: "Delivery by rider", deliveryLocation: "24, Okkuku street Illupeju Lagos", quantity: 20, amount: 50000, deliveryDate: "20th June 2025" },
];

const PAGE_SIZE = 6;

function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

const BookingsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = mockBookings.filter(
    (b) =>
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnDef<Booking>[] = [
    {
      key: "customerName",
      header: "Customer Name",
      render: (row) => (
        <div>
          <p className="font-medium text-brand-black">{row.customerName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "bookingId",
      header: "Booking ID",
      render: (row) => (
        <span className="text-brand-black font-medium">{row.bookingId}</span>
      ),
    },
    {
      key: "deliveryType",
      header: "Delivery Details",
      render: (row) => (
        <div>
          <p className="text-brand-black">{row.deliveryType}</p>
          <p className="text-xs text-gray-400 mt-0.5">{row.deliveryLocation}</p>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row) => <span className="text-brand-black">{row.quantity}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => <span className="font-medium text-brand-black">{fmt(row.amount)}</span>,
    },
    {
      key: "deliveryDate",
      header: "Delivery Date",
      render: (row) => <span className="text-brand-black">{row.deliveryDate}</span>,
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1.5 text-brand-black text-xs font-medium hover:opacity-70 cursor-pointer whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Make Payment
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-brand-red text-xs font-medium hover:opacity-70 cursor-pointer whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete Order
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="px-24 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Search + Filter bar */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-brand-blue w-52 bg-white"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Filter
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            data={paginated}
            keyExtractor={(row) => row.id}
            emptyText="No bookings found"
          />

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Previous
            </button>

            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default BookingsPage;
