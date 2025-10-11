import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { useGetProductsQuery } from "@/entities/product/api/productApi";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { selectCartQtyMap } from "@/features/cart/model/selectors";

const LIMIT = 3;

export function CatalogPage() {
  const [page, setPage] = useState(1);
  const { data: products = [], isLoading, isError, isFetching } = useGetProductsQuery({ limit: LIMIT, page });
  
  const cartQtyMap = useSelector(selectCartQtyMap);

  const nextPage = () => {
    if (products.length === LIMIT) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const hasNextPage = products.length === LIMIT;
  const hasPrevPage = page > 1;

  if (isLoading || isFetching) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">Ошибка загрузки</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">Каталог</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard 
              key={product.id}
              inCartQty={cartQtyMap[product.id] || 0} 
              {...product} 
              // Передаем количество товара в корзине в компонент ProductCard
            />
          ))}
        </div>

        {products.length === 0 && page === 1 && (
          <div className="text-center py-16 text-gray-500">
            Товары не найдены
          </div>
        )}
      </main>

      <footer className="bg-gray-50 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-6">
            <Button 
              onClick={prevPage} 
              disabled={!hasPrevPage}
              variant="outline"
            >
              Назад
            </Button>
            
            <span className="font-medium">Страница {page}</span>
            
            <Button 
              onClick={nextPage} 
              disabled={!hasNextPage}
              variant="outline"
            >
              Вперед
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}