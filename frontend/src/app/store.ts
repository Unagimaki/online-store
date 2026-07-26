import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth/model/authSlice';
import { authApi } from '../features/auth/model/authApi';
import { productApi } from '../features/products/model/productApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productApi.reducerPath]: productApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, productApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
