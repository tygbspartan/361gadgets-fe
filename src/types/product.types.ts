import { Category } from "@/lib/redux/features/categories/categoriesApi";

// Mirrors the backend Product model (prisma/schema.prisma).
export interface Product {
  id: number;
  name: string;
  slug: string;
  longDescription: string | null;
  price: number;
  originalPrice: number | null;
  costPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string | null;
  brandId: number | null;
  categoryId: number | null;
  /** Owning vendor's user id. null = legacy/platform-owned (managed by superadmin). */
  ownerId: number | null;
  isActive: boolean;
  isFeatured: boolean;
  homepageFeature: boolean;
  countryOfOrigin: string | null;
  badges: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  /** Optional color variants, each with its own stock. Empty = simple product. */
  colors?: ProductColor[];
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  discountPercentage?: number;
}

// A saved color variant (returned by the API).
export interface ProductColor {
  id: number;
  name: string;
  hexCode: string | null;
  sku: string | null;
  imageUrl: string | null;
  stockQuantity: number;
  displayOrder: number;
}

// A color variant as sent to the create/update API (no id).
export interface ProductColorInput {
  name: string;
  hexCode?: string;
  sku?: string;
  imageUrl?: string;
  stockQuantity: number;
  displayOrder?: number;
}

// Matches the backend CreateProductRequest / UpdateProductRequest contract.
export interface CreateProductRequest {
  name: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  sku?: string;
  brandId?: number;
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  homepageFeature?: boolean;
  colors?: ProductColorInput[];
  countryOfOrigin?: string;
  metaTitle?: string;
  metaDescription?: string;
  images?: {
    imageUrl: string;
    altText?: string;
    isPrimary: boolean;
    displayOrder: number;
  }[];
  specifications?: {
    key: string;
    value: string;
  }[];
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface ProductSpecification {
  id: number;
  productId: number;
  key: string;
  value: string;
  createdAt: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  isFeatured: boolean;
  /** Vendor this brand is reserved for. null = unclaimed. */
  ownerId?: number | null;
  createdAt: string;
  updatedAt: string;
}

// Remove this - it's now imported from categoriesApi
// export interface Category {
//   id: number;
//   name: string;
//   slug: string;
//   description: string | null;
//   imageUrl: string | null;
//   parentId: number | null;
//   level: number;
//   displayOrder: number;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }
