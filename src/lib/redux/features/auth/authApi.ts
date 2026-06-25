"use client"

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/api";
import {
  LoginRequest,
  LoginResponse,
  User,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
} from "@/types/auth.types";
import { baseQueryWithAuth } from "../../baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Existing endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.LOGIN,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query<{ status: string; data: User }, void>({
      query: () => API_ENDPOINTS.ME,
      providesTags: ['User'],
    }),

    // ← ADD NEW ENDPOINTS BELOW

    // Register
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.REGISTER,
        method: "POST",
        body: credentials,
      }),
    }),

    // Verify Email
    verifyEmail: builder.mutation<LoginResponse, VerifyEmailRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.VERIFY_EMAIL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Resend Verification
    resendVerification: builder.mutation<MessageResponse, ResendVerificationRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.RESEND_VERIFICATION,
        method: "POST",
        body: data,
      }),
    }),

    // Forgot Password
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.FORGOT_PASSWORD,
        method: "POST",
        body: data,
      }),
    }),

    // Reset Password
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.RESET_PASSWORD,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useGetMeQuery,
  useLazyGetMeQuery,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;