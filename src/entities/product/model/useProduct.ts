import { useEffect, useState, useCallback } from "react";
import type { ProductType } from "../type";
import { getProductById } from "../api/getProductById";

export function useProduct(id?: string) {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const fetchProduct = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getProductById(id)
      .then(setProduct)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}
