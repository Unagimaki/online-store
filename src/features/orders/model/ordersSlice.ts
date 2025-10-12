import type { OrderType } from "@/entities/order/type"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface OrdersState {
    orders: OrderType[]
}

const initialState: OrdersState = {
    orders: []
}
export const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        addOrder: (state, action: PayloadAction<OrderType>) => {
            state.orders.push(action.payload)
        },
        removeOrder: (state, action: PayloadAction<string>) => {
            state.orders = state.orders.filter(order => order.id !== action.payload)
        }
    }
})

export const { addOrder, removeOrder } = ordersSlice.actions
export default ordersSlice.reducer