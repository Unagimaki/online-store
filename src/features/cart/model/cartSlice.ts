import type { CartItemType } from "@/entities/cart-item/type";
import type { ProductType } from "@/entities/product/type";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartState {
    items: CartItemType[],
}

const initialState: CartState = {
  items: [],
}

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<ProductType>) => {
            const item = state.items.find(i => i.id === action.payload.id);
            if (item) {
                item.amount += 1;
            } else {
                state.items.push({...action.payload, amount: 1});
            }
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