import type { OrderStatus } from "./orderStatus";
import type { OrderRow } from "../common-hooks/useOrderTable";

const baseOrders: Omit<OrderRow, "id" | "status">[] = [
  {
    customerName: "Michael Hess Asane",
    customerEmail: "mikehasane@gmail.com",
    orderId: "#ORD30N31249",
    deliveryType: "Customer Pickup",
    deliveryLocation: "HQ Store",
    quantity: 20,
    amount: 50000,
    deliveryDate: "20th June 2025",
  },
  {
    customerName: "Anna Brew",
    customerEmail: "annabrew231@gmail.com",
    orderId: "#ORD30N31249",
    deliveryType: "Delivery by rider",
    deliveryLocation: "24, Okkuku street Illupeju Lagos",
    quantity: 20,
    amount: 50000,
    deliveryDate: "20th June 2025",
  },
  {
    customerName: "Sandy Meverek",
    customerEmail: "sandymev233@outlook.com",
    orderId: "#ORD30N31249",
    deliveryType: "Customer Pickup",
    deliveryLocation: "HQ Store",
    quantity: 20,
    amount: 50000,
    deliveryDate: "20th June 2025",
  },
  {
    customerName: "Andrew Eyo",
    customerEmail: "andeyo@gmail.com",
    orderId: "#ORD30N31249",
    deliveryType: "Delivery by rider",
    deliveryLocation: "24, Okkuku street Illupeju Lagos",
    quantity: 20,
    amount: 50000,
    deliveryDate: "20th June 2025",
  },
  {
    customerName: "Sandy Meverek",
    customerEmail: "sandymev233@outlook.com",
    orderId: "#ORD30N31249",
    deliveryType: "Customer Pickup",
    deliveryLocation: "HQ Store",
    quantity: 20,
    amount: 50000,
    deliveryDate: "20th June 2025",
  },
  {
    customerName: "Andrew Eyo",
    customerEmail: "andeyo@gmail.com",
    orderId: "#ORD30N31249",
    deliveryType: "Delivery by rider",
    deliveryLocation: "24, Okkuku street Illupeju Lagos",
    quantity: 20,
    amount: 50000,
    deliveryDate: "20th June 2025",
  },
];

/** Placeholder dataset until the order endpoints are wired up. */
export const buildMockOrders = (
  status: OrderStatus,
  rowCount = 60
): OrderRow[] =>
  Array.from({ length: rowCount }, (_, index) => ({
    ...baseOrders[index % baseOrders.length],
    id: `${index + 1}`,
    status,
  }));

export interface OrderDetail extends OrderRow {
  dateCreated: string;
  itemCount: number;
  croName: string;
  storeLocation: string;
  totalAmount: number;
}

/** Detail-screen fields the list rows do not carry. */
export const buildMockOrderDetail = (
  id: string,
  status: OrderStatus
): OrderDetail => {
  const orders = buildMockOrders(status);
  const order = orders.find((item) => item.id === id) ?? orders[0];

  return {
    ...order,
    deliveryDate: "02/06/2024",
    dateCreated: "02/06/2024",
    itemCount: 16,
    croName: order.customerName,
    storeLocation: "Illupeju Lagos",
    totalAmount: 280000,
  };
};

export interface OrderItemRow {
  id: string;
  item: string;
  category: string;
  colour: string;
  serviceType: number;
  type: "Express" | "Normal";
  typeDate?: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
}

const baseOrderItems: Omit<OrderItemRow, "id">[] = [
  {
    item: "Shirt",
    category: "For Home",
    colour: "Coloured",
    serviceType: 50000,
    type: "Express",
    typeDate: "20th, June 2025",
    unitPrice: 50000,
    quantity: 20,
    totalAmount: 50000,
  },
  {
    item: "Shirt",
    category: "Men's Wear",
    colour: "White",
    serviceType: 50000,
    type: "Normal",
    unitPrice: 50000,
    quantity: 20,
    totalAmount: 50000,
  },
  {
    item: "Bedsheet",
    category: "Men",
    colour: "Coloured",
    serviceType: 50000,
    type: "Express",
    typeDate: "20th, June 2025",
    unitPrice: 50000,
    quantity: 20,
    totalAmount: 50000,
  },
  {
    item: "Shirt",
    category: "Men's Wear",
    colour: "White",
    serviceType: 50000,
    type: "Normal",
    unitPrice: 50000,
    quantity: 20,
    totalAmount: 50000,
  },
  {
    item: "Bedsheet",
    category: "UNISEX",
    colour: "Coloured",
    serviceType: 50000,
    type: "Express",
    typeDate: "20th, June 2025",
    unitPrice: 50000,
    quantity: 20,
    totalAmount: 50000,
  },
  {
    item: "Shirt",
    category: "Men's Wear",
    colour: "White",
    serviceType: 50000,
    type: "Normal",
    unitPrice: 50000,
    quantity: 20,
    totalAmount: 50000,
  },
];

export const buildMockOrderItems = (rowCount = 60): OrderItemRow[] =>
  Array.from({ length: rowCount }, (_, index) => ({
    ...baseOrderItems[index % baseOrderItems.length],
    id: `${index + 1}`,
  }));
