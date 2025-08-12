import type { RootState } from "@/shared/store";
import { useSelector } from "react-redux";

export const CartPage = () => {

    const items = useSelector((state: RootState) => state.cart.items);

    return(
        <div>
            {
                items.length > 0 ? (
                    items.map(item => {
                        return<div>
                            <h1>{item.title}</h1>
                            
                        </div>
                    })
                ) : (
                    <p>Your cart is empty</p>
                )
            }
        </div>
    )
}