import { describe, expect, it } from "vitest";
import { addItem, cartSlice } from "./cartSlice";
import type { CartItemType } from "@/entities/cart-item/type";

describe("cartSlice/addItem", () => {
    const product = { id: "1", name: "Product 1", price: 100, amount: 1, description: 'desc', imageUrl: 'imgUrl', title: 'title'}
    
    it("добавляет новый товар в корзину", () => {

        const state = { items: [] }

        const state1 = cartSlice.reducer(state, addItem( product as CartItemType))

        expect(state1.items.length).toBe(1);

    })
    it("увеличивает количество одинаковых товаров на 1", () => {
        const state0 = { items: [product] }

        const state1 = cartSlice.reducer(state0, addItem(product as CartItemType))

        expect(state1.items.length).toBe(1);
        expect(state1.items[0].amount).toBe(2);
    })
})