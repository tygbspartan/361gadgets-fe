"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/lib/redux/features/products/productsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Package,
  Star,
  Tag,
  Home,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<"all" | "featured" | "discount" | "homepage">("all");

  const isDiscountFilter = filter === "discount";

  const { data, isLoading, error } = useGetProductsQuery({
    page: isDiscountFilter ? 1 : page,
    limit: isDiscountFilter ? 1000 : 10,
    search: search || undefined,
    isFeatured: filter === "featured" ? true : undefined,
    homepageFeature: filter === "homepage" ? true : undefined,
  });

  const rawProducts = data?.data.data ?? [];
  const displayProducts = isDiscountFilter
    ? rawProducts.filter((p) => p.originalPrice != null && p.originalPrice > p.price)
    : rawProducts;

  const [deleteProduct] = useDeleteProductMutation();
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const setFilterAndReset = (f: typeof filter) => {
    setFilter(f);
    setPage(1);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteProduct(id).unwrap();
    } catch (err: any) {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      alert(err?.data?.message || "Failed to delete product");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Failed to load products</p>
          <p className="text-sm text-muted-foreground mt-2">
            {(error as any)?.data?.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search + Filters */}
      <Card>
        <CardContent className="space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
              >
                Clear
              </Button>
            )}
          </form>

          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterAndReset("all")}
            >
              All
            </Button>
            <Button
              type="button"
              variant={filter === "featured" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterAndReset("featured")}
            >
              <Star className="h-3.5 w-3.5 mr-1.5" />
              Featured
            </Button>
            <Button
              type="button"
              variant={filter === "discount" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterAndReset("discount")}
            >
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              On Sale
            </Button>
            <Button
              type="button"
              variant={filter === "homepage" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterAndReset("homepage")}
            >
              <Home className="h-3.5 w-3.5 mr-1.5" />
              Homepage Featured
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Products
            {data && ` (${isDiscountFilter ? displayProducts.length : data.data.pagination.total})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {search
                  ? "Try adjusting your search"
                  : "Get started by adding your first product"}
              </p>
              {!search && (
                <Link href="/admin/products/create">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">
                        SKU
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">
                        Price
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">
                        Stock
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProducts.filter((p) => !deletingIds.has(p.id)).map((product) => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {/* Product Image */}
                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0].imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            {/* Product Name */}
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {product.name}
                              </p>
                              {product.brand && (
                                <p className="text-xs text-muted-foreground">
                                  {product.brand.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">
                            {product.sku || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium">
                              {formatPrice(product.price)}
                            </p>
                            {product.originalPrice &&
                              product.originalPrice > product.price && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatPrice(product.originalPrice)}
                                </p>
                              )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-sm font-medium ${
                              product.stockQuantity === 0
                                ? "text-primary"
                                : product.stockQuantity <=
                                  product.lowStockThreshold
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/products/${product.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                              disabled={deletingIds.has(product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-primary" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination — hidden for discount filter (client-side filtered) */}
              {data && data.data.pagination.totalPages > 1 && !isDiscountFilter && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 10 + 1} to{" "}
                    {Math.min(page * 10, data.data.pagination.total)} of{" "}
                    {data.data.pagination.total} products
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.data.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
