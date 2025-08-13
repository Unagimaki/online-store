import type { CartItemType } from "@/entities/cart-item/type";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartState {
    items: CartItemType[],
}

const initialState: CartState = {
  items: [],
}

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<CartItemType>) => {
            const existingItem = state.items.find(item => item.id === action.payload.id)
            existingItem ? existingItem.amount += 1 : state.items.push(action.payload);
        },
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        decreaseItem: (state, action: PayloadAction<string>) => {
            const existingItem = state.items.find(item => item.id === action.payload);
            if (!existingItem) return
            existingItem.amount > 1 ? existingItem.amount -= 1 : state.items = state.items.filter(item => item.id !== action.payload);
        },
        clearCart: (state) => {
            state.items = [];
        },
    }

})

export const { addItem, removeItem, clearCart, decreaseItem } = cartSlice.actions;
export default cartSlice.reducer;