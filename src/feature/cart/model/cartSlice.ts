import type { ProductType } from "@/entities/product/type";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartState {
    items: ProductType[]
}

const initialState: CartState = {
  items: [],
}

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<ProductType>) => {
            state.items.push(action.payload);
        },
        removeItem: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload.id);
        },
        clearCart: (state) => {
            state.items = [];
        }
    }

})

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;