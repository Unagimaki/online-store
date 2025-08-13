import { BASE_URL } from "@/shared/api/config";
import type { ProductType } from "../type";

export const getProductById = async (id: string): Promise<ProductType> => {
  const response = await fetch(`${BASE_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error(`Error fetching product with id ${id}`);
  }
  
  const product: ProductType = await response.json();
  return product;
}