// Vendor = a User with role "admin" managed by a superadmin.
// Password hashes / tokens are never returned (backend ADMIN_SELECT whitelist).

export interface Vendor {
  id: number;
  email: string;
  companyName: string | null;
  logoUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: "admin" | "superadmin";
  isActive: boolean;
  isEmailVerified: boolean;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Vendor detail includes counts of resources they own. */
export interface VendorDetail extends Vendor {
  _count?: {
    ownedProducts: number;
    ownedDiscounts: number;
  };
  // Some backends flatten the counts; support both shapes.
  ownedProductsCount?: number;
  ownedDiscountsCount?: number;
}

export interface CreateVendorDto {
  email: string;
  password: string;
  companyName?: string;
  logoUrl?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateVendorDto {
  companyName?: string;
  logoUrl?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface VendorFilters {
  isActive?: boolean;
  search?: string;
}

// API response wrappers — all follow { status, message, data }.
export interface VendorsApiResponse {
  status: string;
  message: string;
  // List endpoint returns a plain array (no pagination in the spec).
  data: Vendor[];
}

export interface SingleVendorApiResponse {
  status: string;
  message: string;
  data: VendorDetail;
}
