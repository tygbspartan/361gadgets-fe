"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useGetBrandByIdQuery,
  useDeleteBrandMutation,
} from "@/lib/redux/features/brands/brandsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertCircle,
  Edit,
  Trash2,
  Building2,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const { data, isLoading, error } = useGetBrandByIdQuery(id);
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const brand = data?.data;

  const handleDelete = async () => {
    if (!brand) return;

    try {
      await deleteBrand(brand.id).unwrap();
      router.push(ROUTES.ADMIN_BRANDS);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete brand");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Brand not found</p>
          <p className="text-sm text-muted-foreground mt-2">
            The brand you're looking for doesn't exist or has been removed.
          </p>
          <Link href={ROUTES.ADMIN_BRANDS}>
            <Button className="mt-4">Back to Brands</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.ADMIN_BRANDS}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{brand.name}</h1>
            <p className="text-muted-foreground mt-1">Brand Details</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`${ROUTES.ADMIN_BRANDS}/${brand.id}/edit`}>
            <Button
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-primary">
                  Are you sure you want to delete this brand?
                </p>
                <p className="text-sm text-primary mt-1">
                  This action cannot be undone. All products associated with
                  this brand will lose their brand association.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Logo & Quick Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Brand Logo */}
          <Card>
            <CardContent className="p-6">
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
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                {brand.isActive ? (
                  <Badge className="bg-green-500 hover:bg-green-600 cursor-pointer">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="cursor-pointer">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Featured</span>
                {brand.isFeatured ? (
                  <Badge className="bg-amber-500 hover:bg-amber-600 cursor-pointer">
                    <Star className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="cursor-pointer">
                    No
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Brand Name
                </label>
                <p className="text-base mt-1">{brand.name}</p>
              </div>

              {brand.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-base mt-1">{brand.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Slug
                </label>
                <p className="text-base mt-1 font-mono text-sm">{brand.slug}</p>
              </div>

            </CardContent>
          </Card>

          {/* SEO Information */}
          {(brand.metaTitle || brand.metaDescription) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brand.metaTitle && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Meta Title
                    </label>
                    <p className="text-base mt-1">{brand.metaTitle}</p>
                  </div>
                )}
                {brand.metaDescription && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Meta Description
                    </label>
                    <p className="text-base mt-1">{brand.metaDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Brand ID
                </label>
                <p className="text-sm mt-1 font-mono">{brand.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <p className="text-sm mt-1">
                  {new Date(brand.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-sm mt-1">
                  {new Date(brand.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
