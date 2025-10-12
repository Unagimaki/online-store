import React from "react"
import type { OrderType } from "../type"

type OrderCardProps = {
  order: OrderType
  onDelete: (id: string) => void
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onDelete }) => {
  const { id, items, totalPrice, createdAt } = order

  const formattedDate = new Date(createdAt).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex items-center justify-between rounded-xl border p-4 shadow-sm bg-white">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Заказ №{id}</span>
        <span className="text-base font-medium text-gray-800">
          {items.length} товаров
        </span>
        <span className="text-sm text-gray-600">от {formattedDate}</span>
        <span className="text-lg font-semibold text-gray-900 mt-1">
          {totalPrice} ₽
        </span>
      </div>

      <button
        onClick={() => onDelete(id)}
        className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
      >
        Отменить заказ
      </button>
    </div>
  )
}
