import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user?: { id: string; email: string };
  token?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: undefined,
  token: undefined
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: { id: string; email: string }; token: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = undefined;
      state.token = undefined;
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
