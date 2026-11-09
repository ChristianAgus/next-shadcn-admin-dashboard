import type { Category } from "@/types/category";
import type { Customer } from "@/types/customer";
import type { Order } from "@/types/order";
import type { Product } from "@/types/product";
import type { Role } from "@/types/role";
import type { AdminUser } from "@/types/user";

import { seedCategories } from "./categories.mock";
import { seedCustomers } from "./customers.mock";
import { seedOrders } from "./orders.mock";
import { seedProducts } from "./products.mock";
import { seedRoles } from "./roles.mock";
import { seedAdminUsers } from "./users.mock";

interface MockDatabase {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  users: AdminUser[];
  roles: Role[];
}

/**
 * In-memory mock database.
 *
 * Data resets when the browser/server process reloads. This is intentional:
 * replace the mock services with real API calls when the backend is ready.
 */
export const mockDb: MockDatabase = {
  products: [...seedProducts],
  categories: [...seedCategories],
  orders: [...seedOrders],
  customers: [...seedCustomers],
  users: [...seedAdminUsers],
  roles: [...seedRoles],
};
