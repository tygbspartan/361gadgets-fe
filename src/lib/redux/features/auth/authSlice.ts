"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState } from "@/types/auth.types";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const isExpired = payload.exp && payload.exp * 1000 < Date.now();
            if (isExpired) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
            } else {
              state.token = token;
              state.user = JSON.parse(userStr);
              state.isAuthenticated = true;
            }
          } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
        state.isLoading = false;
      }
    },
  },
});

export const { setCredentials, logout, setLoading, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;
