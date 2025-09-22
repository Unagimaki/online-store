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
        getAllProducts: builder.query<ProductType[], void>({
            query: () => ({
                url: '/products'
            }),
            providesTags: ['Products']
        }),
        getProducts: builder.query<ProductType[], GetProductsParams>({
            query: (params) => ({
                url: '/products',
                params: {
                    page: params.page,
                    limit: params.limit
                }
            }),
            providesTags: ['Products']
        }),
        getProductById: builder.query<ProductType, string>({
            query: (id) => `/products/${id}`,
            providesTags: (result, error, id) => [{ type: 'Products', id }]
        })
    })
})

export const { useGetProductsQuery, useGetAllProductsQuery, useGetProductByIdQuery } = productApi