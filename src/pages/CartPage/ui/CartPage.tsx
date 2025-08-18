import { CartItem } from "@/entities/cart-item/ui/CartItem";
import { createOrder } from "@/feature/order/create/createOrder";
import type { RootState } from "@/shared/store";
import { useSelector } from "react-redux";

export const CartPage = () => {

    const items = useSelector((state: RootState) => state.cart.items);

    return(
        <div className="flex gap-15">
            {
                items.length > 0 ? (
                    items.map((product) => (
                        <CartItem key={product.id} {...product}/>
                    ))
                ) : (
                    <p>Your cart is empty</p>
                )
            }
            <div className="flex flex-col gap-5">
                {
                    items.length > 0 && (
                        <div className="flex justify-end">
                            <p>Total: {items.reduce((total, item) => total + item.price, 0)}₽</p>
                        </div>
                    )
                }
                {
                    items.length > 0 && (
                        <button onClick={() => createOrder(items)} className="rounded-lg cursor-pointer p-2 border-2 btn btn-primary">Оформить заказ</button>
                    )
                }
            </div>
        </div>
    )
}