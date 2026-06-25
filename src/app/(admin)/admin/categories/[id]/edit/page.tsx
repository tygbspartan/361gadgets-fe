"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
} from "@/lib/redux/features/categories/categoriesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: categoryData, isLoading: isLoadingCategory } =
    useGetCategoryByIdQuery(categoryId);
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "1",
    parentId: "",
    displayOrder: "0",
    isActive: true,
  });

  // Error & Success states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load category data into form
  useEffect(() => {
    if (categoryData?.data) {
      const category = categoryData.data;
      setFormData({
        name: category.name || "",
        description: category.description || "",
        level: category.level.toString(),
        parentId: category.parentId?.toString() || "",
        displayOrder: category.displayOrder?.toString() || "0",
        isActive: category.isActive ?? true,
      });
    }
  }, [categoryData]);

  // Filter parent categories based on selected level
  const getAvailableParents = () => {
    if (!categoriesData?.data) return [];

    const level = parseInt(formData.level);

    // Exclude the current category and its descendants
    const excludeIds = new Set<number>([categoryId]);

    // Find all descendants recursively
    const findDescendants = (parentId: number) => {
      categoriesData.data
        .filter((cat) => cat.parentId === parentId)
        .forEach((cat) => {
          excludeIds.add(cat.id);
          findDescendants(cat.id);
        });
    };
    findDescendants(categoryId);

    if (level === 1) {
      return []; // Level 1 has no parent
    } else if (level === 2) {
      // Level 2 can only have Level 1 parents
      return categoriesData.data.filter(
        (cat) => cat.level === 1 && !excludeIds.has(cat.id)
      );
    } else if (level === 3) {
      // Level 3 can only have Level 2 parents
      return categoriesData.data.filter(
        (cat) => cat.level === 2 && !excludeIds.has(cat.id)
      );
    }

    return [];
  };

  // Reset parentId when level changes (but not on initial load)
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  useEffect(() => {
    if (initialLoadDone && categoryData?.data) {
      setFormData((prev) => ({ ...prev, parentId: "" }));
    }
    setInitialLoadDone(true);
  }, [formData.level]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name) {
      setError("Category name is required");
      return;
    }

    const level = parseInt(formData.level);

    // Validate parent for level 2 and 3
    if ((level === 2 || level === 3) && !formData.parentId) {
      setError(`Please select a parent category for Level ${level}`);
      return;
    }

    // Prevent circular reference
    if (formData.parentId && parseInt(formData.parentId) === categoryId) {
      setError("A category cannot be its own parent");
      return;
    }

    try {
      const categoryUpdateData = {
        name: formData.name,
        description: formData.description || undefined,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
        displayOrder: parseInt(formData.displayOrder),
        isActive: formData.isActive,
      };

      await updateCategory({
        id: categoryId,
        category: categoryUpdateData,
      }).unwrap();
      setSuccess("Category updated successfully! Redirecting...");

      setTimeout(() => {
        router.push(ROUTES.ADMIN_CATEGORIES);
      }, 1500);
    } catch (err: any) {
      console.error("Update category error:", err);
      setError(err?.data?.message || "Failed to update category");
    }
  };

  // Show loading state while fetching category
  if (isLoadingCategory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!categoryData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Category not found</p>
          <Link href={ROUTES.ADMIN_CATEGORIES}>
            <Button className="mt-4">Back to Categories</Button>
          </Link>
        </div>
      </div>
    );
  }

  const availableParents = getAvailableParents();
  const showParentField = parseInt(formData.level) > 1;
  const currentLevel = parseInt(formData.level);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN_CATEGORIES}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Category</h1>
          <p className="text-muted-foreground mt-1">
            Update category information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-md bg-primary/5 border border-primary/20">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-primary">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-2 p-4 rounded-md bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core category details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Category Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Skin Care, Face Masks"
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be visible to customers
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of this category..."
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Optional category description
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Category Level & Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle>Category Level & Hierarchy</CardTitle>
            <CardDescription>
              Define the category level and parent relationship
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Level Display (Read-only) */}
            <div className="space-y-2">
              <Label>Category Level</Label>
              <div className="p-3 bg-gray-50 border border-gray-300 rounded-md">
                <p className="text-sm font-medium">
                  Level {currentLevel} -{" "}
                  {currentLevel === 1
                    ? "Main Category"
                    : currentLevel === 2
                    ? "Sub Category"
                    : "Product Group"}
                </p>
              </div>
              <p className="text-xs text-amber-600">
                ⚠️ Category level cannot be changed after creation to maintain
                hierarchy integrity
              </p>
            </div>

            {/* Parent Selection */}
            {showParentField && (
              <div className="space-y-2">
                <Label htmlFor="parentId">
                  Parent Category <span className="text-primary">*</span>
                </Label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  required
                >
                  <option value="">
                    Select {currentLevel === 2 ? "Main" : "Sub"} Category
                  </option>
                  {availableParents.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {availableParents.length === 0 && (
                  <p className="text-xs text-amber-600">
                    ⚠️ No available parent categories found. Please create a
                    Level {currentLevel - 1} category first.
                  </p>
                )}
              </div>
            )}

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={handleInputChange}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the list
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Set category visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <Label
                  htmlFor="isActive"
                  className="text-base font-medium cursor-pointer"
                >
                  Active
                </Label>
                <p className="text-sm text-muted-foreground">
                  Make this category visible in the store
                </p>
              </div>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="submit" disabled={isUpdating} className="">
            {isUpdating ? "Updating Category..." : "Update Category"}
          </Button>
          <Link href={ROUTES.ADMIN_CATEGORIES} className="">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
