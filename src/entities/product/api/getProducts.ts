import { BASE_URL } from "@/shared/api/config";
import type { ProductType } from "../type";

export type GetProductsParams = { page: number; limit: number };
export type GetProductsResult = { items: ProductType[]; hasMore: boolean };

export async function getProducts({ page, limit }: GetProductsParams): Promise<GetProductsResult> {
  const res = await fetch(`${BASE_URL}/products?page=${page}&limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Error fetching products: ${res.status}`);
  }
  const items: ProductType[] = await res.json();
  
  // простая эвристика: есть ли следующая страница
  const hasMore = items.length === limit;
  return { items, hasMore };
}
