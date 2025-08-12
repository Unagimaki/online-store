import { useProduct } from "@/entities/product/model/useProduct";
import { useParams, Link } from "react-router-dom";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error, refetch } = useProduct(id);

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
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.title || product.name}</h1>
        <div className="text-xl mb-4">{product.price} ₽</div>
        <p className="text-neutral-600 mb-6">{product.description}</p>
        <Link to="/" className="underline">← Назад к каталогу</Link>
      </div>
    </div>
  );
}
