// src/shared/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '@/features/cart/model/cartSlice'
import { orderApi } from '@/features/order/api/orderApi' // ← Импортируй API

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [orderApi.reducerPath]: orderApi.reducer, // ← Добавь редюсер
  },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(orderApi.middleware), // ← Добавь middleware
  })

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch