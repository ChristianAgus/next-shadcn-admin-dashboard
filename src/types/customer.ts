export type CustomerStatus = "active" | "blocked";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  ordersCount: number;
  totalSpent: number;
  status: CustomerStatus;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: CustomerStatus;
}
