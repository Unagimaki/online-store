import { CartItem } from "@/entities/cart-item/ui/CartItem";
import type { RootState } from "@/shared/store";
import { useSelector } from "react-redux";

export const CartPage = () => {

    const items = useSelector((state: RootState) => state.cart.items);

    return(
        <div className="flex gap-15">
            {
                items.length > 0 ? (
                    items.map((product) => (
                        <CartItem {...product}/>
                    ))
                ) : (
                    <p>Your cart is empty</p>
                )
            }
        </div>
    )
}