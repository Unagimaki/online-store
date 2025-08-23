import type { ProductType } from "../product/type";

export type CartItemType = ProductType & { amount: number };
