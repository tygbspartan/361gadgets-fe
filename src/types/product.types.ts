import { Category } from "@/lib/redux/features/categories/categoriesApi";

export interface Product {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  price: number;
  originalPrice: number | null;
  costPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string | null;
  brandId: number | null;
  categoryId: number | null;
  isActive: boolean;
  isFeatured: boolean;
  homepageFeature: boolean;
  sizes: string[] | null;
  skinType: string[] | null;
  skinConcern: string[] | null;
  countryOfOrigin: string | null;
  effectiveFor: string[] | null;
  features: string[] | null;
  certifications: string[] | null;
  howToUse: string[] | null;
  ingredients: string[] | null;
  cautions: string[] | null;
  metaTitle: string | null; // ADD THIS
  metaDescription: string | null; // ADD THIS
  createdAt: string;
  updatedAt: string;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  discountPercentage?: number;
}

export interface CreateProductRequest {
  name: string;
  shortDescription?: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  sku?: string;
  brandId?: number;
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  homepageFeature?: boolean;
  sizes?: string[];
  skinType?: string[];
  skinConcern?: string[];
  countryOfOrigin?: string;
  effectiveFor?: string[];
  features?: string[];
  certifications?: string[];
  howToUse?: string[];
  ingredients?: string[];
  cautions?: string[];
  metaTitle?: string; // ADD THIS
  metaDescription?: string; // ADD THIS
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
