import { Link } from "react-router-dom";
import type { ProductType } from "../type"
import { addItem, increase } from "@/feature/cart/model/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/shared/store";

export const ProductCard = (product: ProductType) => {
  const { description, imageUrl, name, price, title, id } = product

  const dispatch = useDispatch<AppDispatch>();

  const addToCart = () => {
    console.log('work');
    dispatch(addItem(product));
    dispatch(increase())
  }

const count = useSelector((s: any) => s.cart.items.length);
console.log("cart count", count);


  return (
      <div className="border rounded-lg shadow-sm overflow-hidden flex flex-col">
          <Link to={`/product/${id}`}>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-48 object-cover"
              referrerPolicy="no-referrer"
            />
          </Link>
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
  );
};
