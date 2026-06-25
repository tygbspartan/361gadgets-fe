"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
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
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

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

  // Filter parent categories based on selected level
  const getAvailableParents = () => {
    if (!categoriesData?.data) return [];

    const level = parseInt(formData.level);

    if (level === 1) {
      return []; // Level 1 has no parent
    } else if (level === 2) {
      // Level 2 can only have Level 1 parents
      return categoriesData.data.filter((cat) => cat.level === 1);
    } else if (level === 3) {
      // Level 3 can only have Level 2 parents
      return categoriesData.data.filter((cat) => cat.level === 2);
    }

    return [];
  };

  // Reset parentId when level changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, parentId: "" }));
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

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        level: level,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
        displayOrder: parseInt(formData.displayOrder),
        isActive: formData.isActive,
      };

      await createCategory(categoryData).unwrap();
      setSuccess("Category created successfully! Redirecting...");

      setTimeout(() => {
        router.push(ROUTES.ADMIN_CATEGORIES);
      }, 1500);
    } catch (err: any) {
      console.error("Create category error:", err);
      setError(err?.data?.message || "Failed to create category");
    }
  };

  const availableParents = getAvailableParents();
  const showParentField = parseInt(formData.level) > 1;

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
          <h1 className="text-3xl font-bold">Add New Category</h1>
          <p className="text-muted-foreground mt-1">
            Create a new category in your hierarchy
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
            {/* Level Selection */}
            <div className="space-y-2">
              <Label htmlFor="level">
                Category Level <span className="text-primary">*</span>
              </Label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                required
              >
                <option value="1">Level 1 - Main Category</option>
                <option value="2">Level 2 - Sub Category</option>
                <option value="3">Level 3 - Product Group</option>
              </select>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium">
                    {formData.level === "1" &&
                      "Main Category - Top level in hierarchy (e.g., Personal Care, Health & Wellness)"}
                    {formData.level === "2" &&
                      "Sub Category - Must have a Level 1 parent (e.g., Skin Care under Personal Care)"}
                    {formData.level === "3" &&
                      "Product Group - Must have a Level 2 parent (e.g., Face Masks under Skin Care)"}
                  </p>
                </div>
              </div>
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
                    Select {formData.level === "2" ? "Main" : "Sub"} Category
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
                    Level {parseInt(formData.level) - 1} category first.
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
          <Button type="submit" disabled={isLoading} className="">
            {isLoading ? "Creating Category..." : "Create Category"}
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
