export type UserRole = "customer" | "admin" | "superadmin";

export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  /** Vendor (company) display name. Null for customers. */
  companyName?: string | null;
  /** Vendor logo URL. Null for customers. */
  logoUrl?: string | null;
  /**
   * Moderation flag. NOTE: the backend does NOT return this on login / register /
   * `/auth/me` — it's only present on the superadmin vendor-management endpoints
   * (`/admin/vendors/*`, see `Vendor`). Do not branch on it for the logged-in user;
   * it will be `undefined`. Access revocation is enforced server-side and surfaced
   * via the 403 "deactivated" handler in baseQuery.
   */
  isActive?: boolean;
  /**
   * id of the superadmin who created this vendor (null for self-registered customers).
   * Same caveat as `isActive` — only returned on the vendor-management endpoints.
   */
  createdById?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  };
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface MessageResponse {
  status: string;
  message: string;
}

// Self-service (any authenticated user)
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  // Vendor (company) fields — ignored for customers.
  companyName?: string;
  logoUrl?: string;
}

export interface UpdateProfileResponse {
  status: string;
  message: string;
  data: User;
}
