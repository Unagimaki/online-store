import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CartItem = { id: string; name: string; quantity: number } // пример

interface CartState {
    items: CartItem[]
}

const initialState: CartState = {
  items: [],
}


export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<CartItem>) => {
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