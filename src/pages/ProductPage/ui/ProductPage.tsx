import { Link, useParams } from "react-router-dom";
import { useGetProductByIdQuery } from "@/entities/product/api/productApi";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { addItem } from "@/features/cart/model/cartSlice";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch()
  const { data: product, isLoading, isError, refetch } = useGetProductByIdQuery(id || '', { skip: !id });

  // Если id появился (после навигации), перезапрашиваем данные
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  const addToCart = () => {
    if (product)
    dispatch(addItem(product));
  }

  if (!id) {
    return (
      <div className="text-center py-8">
        <h2>Товар не найден</h2>
        <p>Некорректный идентификатор товара</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Загрузка товара...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка загрузки товара
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        Товар с ID {id} не найден
      </div>
    );
  }

// Упрощенный return для основного контента
return (
  <div className="min-h-screen bg-gray-50">
    {/* Кнопка назад */}
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <Link to="/">
          <Button variant="ghost">← Назад к каталогу</Button>
        </Link>
      </div>
    </div>

    {/* Основная информация о товаре */}
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <ImageWithFallback 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
        
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.title}</p>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Описание</h2>
          <p className="text-gray-700">{product.description}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold text-blue-600">{product.price} ₽</span>
          <Button onClick={addToCart} size="lg">Добавить в корзину</Button>
        </div>
      </div>
    </div>
  </div>
);
}