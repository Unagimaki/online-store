import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '@/features/cart/model/cartSlice'
import { orderApi } from '@/features/order/api/orderApi' 

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [orderApi.reducerPath]: orderApi.reducer, 
  },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(orderApi.middleware), 
  })

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch