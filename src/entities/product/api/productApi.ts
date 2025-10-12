import { BASE_URL } from "@/shared/api/config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ProductType } from "../type";

interface GetProductsParams {
    page: number;
    limit: number;
}

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL
    }),
    tagTypes: ['Products'],
    endpoints: (builder) => ({
        getProducts: builder.query<ProductType[], GetProductsParams>({
            query: (args) => {
                const params: Record<string, number> = {}
                
                if (args?.page !== null) params.page = args.page
                if (args?.limit !== null) params.limit = args.limit
                
                return {
                    url: '/products',
                    params,
                }
            }
        }),

        getProductById: builder.query<ProductType, string>({
            query: (id) => `/products/${id}`,
            providesTags: (result, error, id) => [{ type: 'Products', id }]
        })
    })
})

export const { useGetProductsQuery, useGetProductByIdQuery } = productApi