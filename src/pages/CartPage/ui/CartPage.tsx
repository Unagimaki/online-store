import { CartItem } from "@/entities/cart-item/ui/CartItem";
import { useCreateOrderMutation } from "@/entities/order/api/orderApi";
import type { OrderType } from "@/entities/order/type";
import type { RootState } from "@/shared/store";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CartPage = () => {
    const [createOrder, {isLoading, error, isSuccess, data: orderData}] = useCreateOrderMutation();
    const items = useSelector((state: RootState) => state.cart.items);

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Корзина пуста</h2>
                    <p className="text-gray-600 mb-6">Добавьте товары в корзину, чтобы сделать заказ</p>
                    <Link to="/">
                        <Button>Вернуться к покупкам</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const totalPrice = items.reduce((total, item) => total + (item.price * item.amount), 0);

    const handleOrder = async () => {
        const order: OrderType = {
            createdAt: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9), // Более надежный ID
            items: items,
            totalPrice: totalPrice, // Используем уже посчитанное значение
        };

        try {
            const result = await createOrder({order}).unwrap();
            console.log('Заказ создан:', result);
        } catch (err) {
            console.error('Ошибка создания заказа:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Корзина</h1>
                    <p className="text-gray-600">Товаров в корзине: {items.length}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Список товаров */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            {items.map((item) => (
                                <CartItem key={item.id} {...item} />
                            ))}
                        </div>
                    </div>

                    {/* Блок итогов и оформления */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Итоги заказа</h2>
                            
                            {/* Детали стоимости */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span>Товары ({items.reduce((acc, item) => acc + item.amount, 0)} шт.)</span>
                                    <span>{totalPrice} ₽</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Доставка</span>
                                    <span className="text-green-600">Бесплатно</span>
                                </div>
                                <hr />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Итого</span>
                                    <span>{totalPrice} ₽</span>
                                </div>
                            </div>

                            {/* Кнопка оформления */}
                            <Button 
                                onClick={handleOrder}
                                disabled={isLoading}
                                className="w-full py-3 text-lg"
                                size="lg"
                            >
                                {isLoading ? "Оформление..." : `Оформить заказ • ${totalPrice} ₽`}
                            </Button>

                            {/* Сообщения о статусе заказа */}
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    ❌ Ошибка при создании заказа. Попробуйте еще раз.
                                </div>
                            )}

                            {isSuccess && orderData && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                                    <div className="font-bold">✅ Заказ успешно создан!</div>
                                    <div>Номер заказа: #{orderData.id}</div>
                                    <div>Сумма: {orderData.totalPrice} ₽</div>
                                    <div>Статус: {orderData.status}</div>
                                    <Link to="/" className="inline-block mt-2 text-blue-600 hover:underline">
                                        Продолжить покупки
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ссылка для продолжения покупок */}
                <div className="mt-8 text-center">
                    <Link to="/">
                        <Button variant="outline">
                            ← Вернуться к покупкам
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};