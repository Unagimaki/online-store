import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '@/features/cart/model/cartSlice'
import { orderApi } from '@/entities/order/api/orderApi'
import { productApi } from '@/entities/product/api/productApi'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [orderApi.reducerPath]: orderApi.reducer, 
    [productApi.reducerPath]: productApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      orderApi.middleware,
      productApi.middleware
    ), 
  })

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch