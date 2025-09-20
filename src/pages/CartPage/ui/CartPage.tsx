import type { CartItemType } from "@/entities/cart-item/type";
import { CartItem } from "@/entities/cart-item/ui/CartItem";
import type { OrderType } from "@/entities/order/type";
import { useCreateOrderMutation } from "@/features/order/api/orderApi";
import type { RootState } from "@/shared/store";
import { useSelector } from "react-redux";

export const CartPage = () => {
    const [createOrder, {isLoading, error, isSuccess, data: orderData}] = useCreateOrderMutation()
    const items = useSelector((state: RootState) => state.cart.items);

    const handleOrder = async (data: CartItemType[]) => {
        const order: OrderType = {
            createdAt: new Date().toISOString(),
            id: Math.random().toString(),
            items: data,
            totalPrice: data.reduce((acc, item) => acc + item.amount * item.price, 0),
        }
    try {
        const result = await createOrder({ order }).unwrap()
        console.log('Заказ создан:', result)
        } catch (err) {
            console.error('Ошибка создания заказа:', err)
        }
    }

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
                        <button onClick={() => handleOrder(items)} className="rounded-lg cursor-pointer p-2 border-2 btn btn-primary">Оформить заказ</button>
                    )
                }
                {isLoading && (
                    <div className="loading">Заказ создается, подождите...</div>
                )}

                {/* Сообщение об ошибке */}
                {error && (
                    <div className="error">
                    ❌ Ошибка
                    </div>
                )}

                {/* Сообщение об успехе */}
                {isSuccess && (
                    <div className="success">
                    ✅ Заказ #{orderData.id} успешно создан!
                    <br />
                    Сумма: {orderData.totalPrice} ₽
                    <br />
                    Статус: {orderData.status}
                    </div>
                )}
            </div>
        </div>
    )
}