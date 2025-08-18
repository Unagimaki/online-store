import type { CartItemType } from "@/entities/cart-item/type";
import { describe, expect, it } from "vitest";
import { createOrder } from "./createOrder";

const items: CartItemType[] = [
    { id: "1", name: "Product 1", price: 100, amount: 2, description: "Description 1", imageUrl: "url1", title: "Title 1" },
    { id: "2", name: "Product 2", price: 350, amount: 1, description: "Description 2", imageUrl: "url2", title: "Title 2" },
    { id: "3", name: "Product 2", price: 50, amount: 5, description: "Description 3", imageUrl: "url3", title: "Title 3" },
]

describe('createOrder', () => {
    it('создаеь заказ с товарами и подстчетом общей стоимости', () => {
        const order = createOrder(items);

        expect(order?.items).toHaveLength(3)
        expect(order?.totalPrice).toBe(800)
        expect(typeof order?.createdAt).toBe('string')

    })

    it('не создает заказ, если корзина пуста', () => {
        const order = createOrder([]);

        expect(order).toBeUndefined();
    });
})