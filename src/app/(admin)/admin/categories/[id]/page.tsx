"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useGetCategoryByIdQuery,
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/lib/redux/features/categories/categoriesApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertCircle,
  Edit,
  Trash2,
  Folder,
  FolderOpen,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const { data, isLoading, error } = useGetCategoryByIdQuery(id);
  const { data: allCategoriesData } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const category = data?.data;

  // Get parent category
  const parentCategory = category?.parentId
    ? allCategoriesData?.data.find((cat) => cat.id === category.parentId)
    : null;

  // Get children categories
  const childrenCategories = category
    ? allCategoriesData?.data.filter((cat) => cat.parentId === category.id) ||
      []
    : [];

  const handleDelete = async () => {
    if (!category) return;

    try {
      await deleteCategory(category.id).unwrap();
      router.push(ROUTES.ADMIN_CATEGORIES);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete category");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Category not found</p>
          <p className="text-sm text-muted-foreground mt-2">
            The category you're looking for doesn't exist or has been removed.
          </p>
          <Link href={ROUTES.ADMIN_CATEGORIES}>
            <Button className="mt-4">Back to Categories</Button>
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
          <Link href={ROUTES.ADMIN_CATEGORIES}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground mt-1">Category Details</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`${ROUTES.ADMIN_CATEGORIES}/${category.id}/edit`}>
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
                  Are you sure you want to delete this category?
                </p>
                <p className="text-sm text-primary mt-1">
                  This action cannot be undone. All subcategories will also be
                  deleted.
                  {childrenCategories.length > 0 && (
                    <span className="font-semibold">
                      {" "}
                      ({childrenCategories.length}{" "}
                      {childrenCategories.length === 1
                        ? "subcategory"
                        : "subcategories"}{" "}
                      will be deleted)
                    </span>
                  )}
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
        {/* Left Column - Image & Quick Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Category Icon */}
          <Card>
            <CardContent className="p-6">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <div className="w-full h-full flex items-center justify-center">
                  {category.level === 1 ? (
                    <Folder className="h-16 w-16 text-blue-400" />
                  ) : category.level === 2 ? (
                    <FolderOpen className="h-16 w-16 text-green-400" />
                  ) : (
                    <FileText className="h-16 w-16 text-purple-400" />
                  )}
                </div>
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
                {category.isActive ? (
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
                <span className="text-sm text-muted-foreground">Level</span>
                <Badge
                  className={`cursor-pointer ${
                    category.level === 1
                      ? "bg-blue-500 hover:bg-blue-600"
                      : category.level === 2
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  Level {category.level}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Display Order
                </span>
                <span className="text-sm font-semibold">
                  {category.displayOrder}
                </span>
              </div>
              {childrenCategories.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Subcategories
                  </span>
                  <Badge variant="secondary" className="cursor-pointer">
                    {childrenCategories.length}
                  </Badge>
                </div>
              )}
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
                  Category Name
                </label>
                <p className="text-base mt-1">{category.name}</p>
              </div>

              {category.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-base mt-1">{category.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Slug
                </label>
                <p className="text-base mt-1 font-mono text-sm">
                  {category.slug}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Category Type
                </label>
                <p className="text-base mt-1">
                  {category.level === 1
                    ? "Main Category"
                    : category.level === 2
                    ? "Sub Category"
                    : "Product Group"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hierarchy */}
          <Card>
            <CardHeader>
              <CardTitle>Category Hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parent */}
              {parentCategory && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Parent Category
                  </label>
                  <Link
                    href={`${ROUTES.ADMIN_CATEGORIES}/${parentCategory.id}`}
                  >
                    <div className="mt-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        {parentCategory.level === 1 ? (
                          <Folder className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FolderOpen className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-medium">
                          {parentCategory.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs cursor-pointer"
                        >
                          Level {parentCategory.level}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Children */}
              {childrenCategories.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Subcategories ({childrenCategories.length})
                  </label>
                  <div className="mt-2 space-y-2">
                    {childrenCategories.map((child) => (
                      <Link
                        key={child.id}
                        href={`${ROUTES.ADMIN_CATEGORIES}/${child.id}`}
                      >
                        <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex items-center gap-2">
                            {child.level === 2 ? (
                              <FolderOpen className="h-4 w-4 text-green-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-purple-600" />
                            )}
                            <span className="font-medium">{child.name}</span>
                            <Badge
                              variant="secondary"
                              className="text-xs cursor-pointer"
                            >
                              Level {child.level}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!parentCategory && childrenCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  This category has no parent or subcategories.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Category ID
                </label>
                <p className="text-sm mt-1 font-mono">{category.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <p className="text-sm mt-1">
                  {new Date(category.createdAt).toLocaleDateString("en-US", {
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
                  {new Date(category.updatedAt).toLocaleDateString("en-US", {
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
