import { Link } from "react-router-dom";
import type { ProductType } from "../type"
import { useDispatch } from "react-redux";
import { addItem } from "@/feature/cart/model/cartSlice";

export const ProductCard = (product: ProductType) => {
  const { description, imageUrl, name, price, title, id } = product

  const dispatch = useDispatch();

  const addToCart = () => {
    dispatch(addItem(product));
  }

  return (
    <Link to={`/product/${id}`}>
      <div className="border rounded-lg shadow-sm overflow-hidden flex flex-col">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-1">{title || name}</h3>
          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
            {description}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold">{price} ₽</span>
            <button onClick={addToCart} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
              В корзину
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
