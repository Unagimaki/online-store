import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from './endpoints';

export const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseUrl,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  }
});
