export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image?: string;
  description?: string;
}
