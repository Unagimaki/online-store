import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../../shared/api/baseQuery';
import { AUTH_ENDPOINT } from '../../../shared/api/endpoints';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: { id: string; email: string };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: `${AUTH_ENDPOINT}/login`,
        method: 'POST',
        body: credentials
      })
    }),
    register: build.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: `${AUTH_ENDPOINT}/register`,
        method: 'POST',
        body: credentials
      })
    })
  })
});

export const { useLoginMutation, useRegisterMutation } = authApi;
