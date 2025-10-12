import { Button } from "@/components/ui/button"
import { OrderCard } from "@/entities/order/ui/OrderItem"
import { removeOrder } from "@/features/orders/model/ordersSlice"
import type { AppDispatch, RootState } from "@/shared/store"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"

export const OrdersPage = () => {
  const orders = useSelector((state: RootState) => state.orders.orders)
  const dispatch = useDispatch<AppDispatch>()

  const handleDeleteOrder = (id: string) => {
    dispatch(removeOrder(id))
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Заказов нет</h2>
          <p className="text-gray-600 mb-6">
            Оформите заказ в корзине, чтобы сделать заказ
          </p>
          <Link to="/">
            <Button>Вернуться к покупкам</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Мои заказы</h1>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onDelete={handleDeleteOrder} />
      ))}
    </div>
  )
}
