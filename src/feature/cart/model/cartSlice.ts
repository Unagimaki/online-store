import type { ProductType } from "@/entities/product/type";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartState {
    items: ProductType[],
    length: number
}

const initialState: CartState = {
  items: [],
  length: 0
}

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<any>) => {           
            state.items.push(action.payload)
        },
        removeItem: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload.id);
        },
        clearCart: (state) => {
            state.items = [];
        },
        increase: (state) => {
            state.length += 1
        }
    }

})

export const { addItem, removeItem, clearCart, increase } = cartSlice.actions;
export default cartSlice.reducer;