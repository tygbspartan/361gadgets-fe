"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useGetBrandsQuery,
  useDeleteBrandMutation,
} from "@/lib/redux/features/brands/brandsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Building2,
  Star,
} from "lucide-react";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);

  const { data, isLoading, error } = useGetBrandsQuery();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteBrand(id).unwrap();
        alert("Brand deleted successfully");
      } catch (err: any) {
        alert(err?.data?.message || "Failed to delete brand");
      }
    }
  };

  // Filter brands
  const filteredBrands = data?.data
    ? data.data.filter((brand) => {
        const matchesSearch =
          !search ||
          brand.name.toLowerCase().includes(search.toLowerCase());

        const matchesFeatured =
          filterFeatured === null || brand.isFeatured === filterFeatured;

        return matchesSearch && matchesFeatured;
      })
    : [];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Failed to load brands</p>
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
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product brands
          </p>
        </div>
        <Link href={`${ROUTES.ADMIN_BRANDS}/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands by name or country..."
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
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                  }}
                >
                  Clear
                </Button>
              )}
            </form>

            {/* Featured Filter */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={filterFeatured === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFeatured(null)}
              >
                All
              </Button>
              <Button
                type="button"
                variant={filterFeatured === true ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFeatured(true)}
              >
                <Star className="h-4 w-4 mr-1" />
                Featured
              </Button>
              <Button
                type="button"
                variant={filterFeatured === false ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFeatured(false)}
              >
                Regular
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brands Grid */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold">No brands found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {search || filterFeatured !== null
                ? "Try adjusting your filters"
                : "Get started by adding your first brand"}
            </p>
            {!search && filterFeatured === null && (
              <Link href={`${ROUTES.ADMIN_BRANDS}/create`}>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredBrands.length} of {data?.data.length || 0} brands
            </div>

            {/* Brand Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBrands.map((brand) => (
                <Card
                  key={brand.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    {/* Logo */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="w-full h-full object-contain p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Brand Info */}
                    <div className="space-y-3">
                      {/* Name & Badges */}
                      <div>
                        <h3 className="font-semibold text-lg truncate">
                          {brand.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {brand.isFeatured && (
                            <Badge className="bg-amber-500 hover:bg-amber-600 cursor-pointer">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {brand.isActive ? (
                            <Badge className="bg-green-500 hover:bg-green-600 cursor-pointer">
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="cursor-pointer"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {brand.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {brand.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Link
                          href={`${ROUTES.ADMIN_BRANDS}/${brand.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`${ROUTES.ADMIN_BRANDS}/${brand.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(brand.id, brand.name)}
                          disabled={isDeleting}
                          className="border-primary/30 text-primary hover:bg-primary/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
