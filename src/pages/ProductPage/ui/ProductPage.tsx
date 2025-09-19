import { useProduct } from "@/entities/product/model/useProduct";
import { addItem } from "@/features/cart/model/cartSlice";
import type { AppDispatch } from "@/shared/store";
import { useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error, refetch } = useProduct(id);
  const dispatch = useDispatch<AppDispatch>()

  const addToCart = () => {
    if (!product) return;
    // Проверяем, что product имеет необходимые поля
    dispatch(addItem({...product, amount: 1}));
  }

  if (!id) return <p>Некорректный URL: нет id</p>;
  if (loading) return <p>Загрузка…</p>;

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-red-500">Ошибка: {error}</p>
        <button onClick={refetch} className="underline">Повторить</button>
        <Link to="/" className="underline block">Вернуться к каталогу</Link>
      </div>
    );
  }

  

  if (!product) return <p>Товар не найден</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <img
        src={product.imageUrl}
        alt={product.title || product.name}
        className="w-full h-80 object-cover rounded-lg"
        referrerPolicy="no-referrer"
      />
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold mb-2">{product.title || product.name}</h1>
        <div className="text-xl mb-4">{product.price} ₽</div>
        <p className="text-neutral-600 mb-6">{product.description}</p>
        <button onClick={addToCart} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
          Добавить в корзину
        </button>
        <Link to="/" className="underline">← Назад к каталогу</Link>
      </div>
    </div>
  );
}
