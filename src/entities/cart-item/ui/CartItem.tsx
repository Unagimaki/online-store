import { useDispatch } from "react-redux";
import type { CartItemType } from "../type"
import { Plus, Minus } from "lucide-react";
import type { AppDispatch } from "@/shared/store";
import { addItem, decreaseItem, removeItem } from "@/feature/cart/model/cartSlice";

export const CartItem = (product: CartItemType) => {
    const {description, price, imageUrl, title, amount, id} = product

    const dispatch = useDispatch<AppDispatch>();

    const addToCart = () => {
      dispatch(addItem({...product}));
    }
    const removeFromCart = () => {
      dispatch(removeItem(id))
    }
    const decreaseItemFromCart = () => {
      dispatch(decreaseItem(id))
    }
    
    return(
      <div className="size-120 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-48 object-cover"
              referrerPolicy="no-referrer"
            />
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
            {description}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold">{price} ₽</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="mt-4 flex items-center justify-between">
              <button onClick={decreaseItemFromCart} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                <Minus size={16} />
              </button>
              <span className="mx-4 text-lg font-medium">{amount}</span>
              <button onClick={addToCart} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
                <Plus size={16} />
              </button>
            </div>
            <button onClick={removeFromCart} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Удалить из корзины
            </button>
          </div>
        </div>
      </div>
    )
}
