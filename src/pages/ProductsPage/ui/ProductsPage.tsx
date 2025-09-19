import { useEffect, useState } from "react";
import { getProducts } from "@/entities/product/api/getProducts";
import type { ProductType } from "@/entities/product/type";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { selectCartQtyMap } from "@/features/cart/model/selectors";

const LIMIT = 3;

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ProductType[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qtyMap = useSelector(selectCartQtyMap);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getProducts({ page, limit: LIMIT })
      .then(({ items, hasMore }) => {
        setHasMore(hasMore);
        setItems(items);
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [page]);

  

  if (loading && items.length === 0) return <p>Загрузка…</p>;
  if (error) return (
    <div className="space-y-2">
      <p className="text-red-500">Ошибка: {error}</p>
      <Button onClick={() => setPage(p => p)}>Повторить</Button>
    </div>
  );
  if (!loading && !error && items.length === 0) return <p>Ничего не найдено</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Каталог</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map(p => <ProductCard key={p.id} {...p} inCartQty={qtyMap[p.id] ?? 0}/>)}
      </div>

      <div className="mt-6 flex gap-2 justify-center">
        <Button disabled={loading || page === 1} onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0 }); }}>
          Назад
        </Button>
        <Button disabled={loading || !hasMore} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0 }); }}>
          Вперёд
        </Button>
      </div>
    </div>
  );
}
