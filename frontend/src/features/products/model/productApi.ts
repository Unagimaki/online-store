import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../../shared/api/baseQuery';
import { PRODUCTS_ENDPOINT } from '../../../shared/api/endpoints';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
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
