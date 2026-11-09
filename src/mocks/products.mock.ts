import type { Product } from "@/types/product";

const createdAt = "2026-02-02T08:00:00.000Z";

function product(
  id: string,
  name: string,
  sku: string,
  categoryId: string,
  categoryName: string,
  price: number,
  stock: number,
  sold: number,
  status: Product["status"],
): Product {
  return {
    id,
    name,
    sku,
    categoryId,
    categoryName,
    price,
    stock,
    sold,
    status,
    image: `https://picsum.photos/seed/${sku}/96/96`,
    description: `${name} from the ${categoryName.toLowerCase()} collection.`,
    createdAt,
    updatedAt: createdAt,
  };
}

export const seedProducts: Product[] = [
  product("p01", "Organic Cotton Crew Tee", "CL-TEE-101", "cat-clothing", "Clothing", 29, 184, 1248, "active"),
  product("p02", "Relaxed Linen Shirt", "CL-SHT-102", "cat-clothing", "Clothing", 68, 52, 436, "active"),
  product("p03", "Everyday Straight Jeans", "CL-JNS-103", "cat-clothing", "Clothing", 89, 76, 682, "active"),
  product("p04", "Merino Wool Cardigan", "CL-KNT-104", "cat-clothing", "Clothing", 129, 0, 0, "draft"),
  product("p05", "Court Leather Sneakers", "FW-SNK-201", "cat-footwear", "Footwear", 119, 38, 824, "active"),
  product("p06", "Trail Running Shoes", "FW-RUN-202", "cat-footwear", "Footwear", 145, 7, 392, "active"),
  product("p07", "Suede Slip-on Loafers", "FW-LOF-203", "cat-footwear", "Footwear", 98, 0, 256, "active"),
  product("p08", "Classic Canvas High-tops", "FW-CNV-204", "cat-footwear", "Footwear", 65, 0, 918, "archived"),
  product("p09", "Everyday Crossbody Bag", "AC-BAG-301", "cat-accessories", "Accessories", 79, 64, 547, "active"),
  product("p10", "Recycled Canvas Tote", "AC-TOT-302", "cat-accessories", "Accessories", 24, 212, 1632, "active"),
  product("p11", "Polarized Acetate Sunglasses", "AC-SUN-303", "cat-accessories", "Accessories", 85, 9, 283, "active"),
  product("p12", "Minimal Leather Wallet", "AC-WLT-304", "cat-accessories", "Accessories", 49, 36, 0, "draft"),
  product("p13", "Stoneware Mug Set", "HM-MUG-401", "cat-home", "Home & Living", 42, 96, 728, "active"),
  product("p14", "Linen Duvet Cover", "HM-BED-402", "cat-home", "Home & Living", 159, 24, 184, "active"),
  product("p15", "Rechargeable Desk Lamp", "HM-LMP-403", "cat-home", "Home & Living", 74, 41, 362, "active"),
  product("p16", "Amber & Cedar Soy Candle", "HM-CND-404", "cat-home", "Home & Living", 32, 128, 1046, "active"),
  product("p17", "Daily Hydrating Cleanser", "BT-CLN-501", "cat-beauty", "Beauty", 22, 165, 2164, "active"),
  product("p18", "Vitamin C Brightening Serum", "BT-SRM-502", "cat-beauty", "Beauty", 38, 5, 1382, "active"),
  product("p19", "Mineral Sunscreen SPF 50", "BT-SPF-503", "cat-beauty", "Beauty", 28, 0, 946, "active"),
  product("p20", "Botanical Hand Cream", "BT-HND-504", "cat-beauty", "Beauty", 16, 0, 584, "archived"),
  product(
    "p21",
    "Wireless Noise-canceling Earbuds",
    "EL-EAR-601",
    "cat-electronics",
    "Electronics",
    99,
    72,
    638,
    "active",
  ),
  product("p22", "Magnetic Wireless Charger", "EL-CHG-602", "cat-electronics", "Electronics", 39, 118, 874, "active"),
  product("p23", "Portable Bluetooth Speaker", "EL-SPK-603", "cat-electronics", "Electronics", 69, 26, 412, "active"),
  product("p24", "Pocket Power Bank 10000", "EL-PWR-604", "cat-electronics", "Electronics", 45, 60, 0, "draft"),
];
