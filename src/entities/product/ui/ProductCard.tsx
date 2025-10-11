import { Link } from "react-router-dom";
import type { ProductType } from "../type"
import { addItem } from "@/features/cart/model/cartSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/shared/store";
import img from '@/assets/no-image.jpg'
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
type ProductCardProps = ProductType & { inCartQty?: number };

export const ProductCard = ({inCartQty, ...product}: ProductCardProps) => {
  const { description, imageUrl, name, price, title, id } = product
  
  const dispatch = useDispatch<AppDispatch>();
  
  const addToCart = () => {
    dispatch(addItem(product));
  }

  return (
      <div className="relative border rounded-lg shadow-sm overflow-hidden flex flex-col">
          <Link to={`/product/${id}`}>
            <ImageWithFallback
              src={imageUrl || img}
              alt={title}
              className="w-full h-48 object-cover"
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
            <div>
              {inCartQty ? <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{inCartQty}</span> : null} 
            </div>
          </div>
        </div>
      </div>
  );
};
