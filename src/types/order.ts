export type OrderStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  itemCount: number;
  total: number;
  currency: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderInput {
  customerId: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: string;
}
