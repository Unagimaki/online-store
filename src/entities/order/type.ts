import type { CartItemType } from "../cart-item/type"

export type OrderType = {
    items: CartItemType[],
    totalPrice: number,
    createdAt: string,
    id: string
}