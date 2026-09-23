import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../../shared/api/baseQuery';
import { PRODUCTS_ENDPOINT } from '../../../shared/api/endpoints';

export interface Product {
  id: number;
  name: string;
  category: number;
  description: string;
  price: number;
  quantity: number;
}

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery,
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => ({
        url: PRODUCTS_ENDPOINT,
        method: 'GET'
      })
    })
  })
});

export const { useGetProductsQuery } = productApi;
