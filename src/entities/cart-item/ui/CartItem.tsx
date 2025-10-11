import { useDispatch } from "react-redux";
import type { CartItemType } from "../type";
import { Plus, Minus, X } from "lucide-react";
import type { AppDispatch } from "@/shared/store";
import { addItem, decreaseItem, removeItem } from "@/features/cart/model/cartSlice";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export const CartItem = (product: CartItemType) => {
    const { description, price, imageUrl, title, amount, id } = product;
    const dispatch = useDispatch<AppDispatch>();

    const addToCart = () => dispatch(addItem({...product}));
    const removeFromCart = () => dispatch(removeItem(id));
    const decreaseItemFromCart = () => dispatch(decreaseItem(id));

    return (
        <div className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
            {/* Изображение */}
            <div className="flex-shrink-0">
                <ImageWithFallback
                    src={imageUrl}
                    alt={title}
                    className="w-16 h-16 object-cover rounded-md"
                />
            </div>

            {/* Информация о товаре */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{title}</h3>
                <p className="text-xs text-gray-600 truncate mb-1">{description}</p>
                <span className="text-lg font-bold">{price} ₽</span>
            </div>

            {/* Управление количеством */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={decreaseItemFromCart}
                    className="cursor-pointer p-1 rounded hover:bg-gray-200 transition-colors"
                    disabled={amount <= 1}
                >
                    <Minus size={14} />
                </button>
                
                <span className="font-medium w-8 text-center">{amount}</span>
                
                <button 
                    onClick={addToCart}
                    className="cursor-pointer p-1 rounded hover:bg-gray-200 transition-colors"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Общая стоимость и удаление */}
            <div className="flex items-center gap-4">
                <span className="font-bold text-lg min-w-[80px] text-right">
                    {price * amount} ₽
                </span>
                <button 
                    onClick={removeFromCart}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Удалить из корзины"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};