import type { CartItemType } from "@/entities/cart-item/type";
import type { OrderType } from "@/entities/order/type";
import { BASE_URL } from "@/shared/api/config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CreateOrderRequest {
  order: OrderType
}

export interface CreateOrderResponse {
  id: string
  createdAt: string
  status: string
  totalPrice: number,
  items: CartItemType[]
}

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL
    }),
    tagTypes: ['Order'],
    endpoints: (builder) => ({
        createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
            queryFn: async (orderData, _api, _extraOptions, _baseQuery) => {
                try {
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const mockOrder: CreateOrderResponse = {
                        id: Math.random().toString(36).substr(2, 9),
                        createdAt: new Date().toISOString(),
                        totalPrice: orderData.order.items.reduce((acc, item) => acc + item.amount * item.price, 0),
                        items: orderData.order.items,
                        status: 'pending'
                    };

                    console.log('Заказ создан:', mockOrder);

                    return { data: mockOrder };
                    
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Неизвестная ошибка'
                        }
                    };
                }
            }
        })
    })
})

export const { useCreateOrderMutation } = orderApi;