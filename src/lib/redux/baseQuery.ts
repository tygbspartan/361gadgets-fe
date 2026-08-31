import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { API_BASE_URL } from "@/constants/api";
import { logout } from "./features/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/** Pulls the API's `message` string out of an error payload, if present. */
function errorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const msg = (data as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return "";
}

export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const { status, data } = result.error;

    // 401 → token missing/expired: drop the session.
    if (status === 401) {
      api.dispatch(logout());
    }

    // 403 → could be "wrong role" (leave session intact) OR a deactivated
    // account (instant access revocation — drop the session). The backend
    // sends "Your account has been deactivated." for the latter.
    if (status === 403 && /deactivat/i.test(errorMessage(data))) {
      api.dispatch(logout());
    }
  }

  return result;
};
