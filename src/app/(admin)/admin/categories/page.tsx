"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  Category, // IMPORT THIS
} from "@/lib/redux/features/categories/categoriesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  AlertCircle,
  Eye,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

// REMOVE THIS INTERFACE - it's now imported from categoriesApi
// interface Category {
//   id: number;
//   name: string;
//   ...
// }

interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(),
  );

  const { data, isLoading, error } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  // Build tree structure from flat list
  const buildTree = (categories: Category[]): CategoryTree[] => {
    const categoryMap = new Map<number, CategoryTree>();
    const tree: CategoryTree[] = [];

    // First pass: create map and initialize children arrays
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree structure
    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId === null) {
        tree.push(category);
      } else {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children!.push(category);
        }
      }
    });

    // Sort by displayOrder
    const sortByDisplayOrder = (cats: CategoryTree[]) => {
      cats.sort((a, b) => a.displayOrder - b.displayOrder);
      cats.forEach((cat) => {
        if (cat.children && cat.children.length > 0) {
          sortByDisplayOrder(cat.children);
        }
      });
    };

    sortByDisplayOrder(tree);
    return tree;
  };

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (data?.data) {
      const allIds = new Set(data.data.map((cat) => cat.id));
      setExpandedCategories(allIds);
    }
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This will also delete all subcategories.`,
      )
    ) {
      try {
        await deleteCategory(id).unwrap();
        alert("Category deleted successfully");
      } catch (err: any) {
        alert(err?.data?.message || "Failed to delete category");
      }
    }
  };

  // Filter categories based on search
  const filterCategories = (categories: CategoryTree[]): CategoryTree[] => {
    if (!search) return categories;

    const searchLower = search.toLowerCase();
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchLower) ||
        cat.slug.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower);

      const childrenMatch =
        cat.children && cat.children.length > 0
          ? filterCategories(cat.children).length > 0
          : false;

      return matchesSearch || childrenMatch;
    });
  };

  // Render category row
  const renderCategory = (category: CategoryTree, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const paddingLeft = depth * 40;

    return (
      <div key={category.id}>
        <div
          className={`flex items-center gap-3 py-3 px-4 hover:bg-gray-50 border-b ${
            depth > 0 ? "bg-gray-50/50" : ""
          }`}
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpand(category.id)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded cursor-pointer"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* Icon */}
          <div className="flex-shrink-0">
            {category.level === 1 ? (
              isExpanded && hasChildren ? (
                <FolderOpen className="h-5 w-5 text-blue-600" />
              ) : (
                <Folder className="h-5 w-5 text-blue-600" />
              )
            ) : category.level === 2 ? (
              isExpanded && hasChildren ? (
                <FolderOpen className="h-5 w-5 text-green-600" />
              ) : (
                <Folder className="h-5 w-5 text-green-600" />
              )
            ) : (
              <FileText className="h-5 w-5 text-purple-600" />
            )}
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{category.name}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  category.level === 1
                    ? "bg-blue-100 text-blue-800"
                    : category.level === 2
                      ? "bg-green-100 text-green-800"
                      : "bg-purple-100 text-purple-800"
                }`}
              >
                Level {category.level}
              </span>
            </div>
            {category.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {category.description}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="hidden md:block flex-shrink-0 w-40">
            <p className="text-xs text-muted-foreground font-mono truncate">
              /{category.slug}
            </p>
          </div>

          {/* Status */}
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                category.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Children Count */}
          {hasChildren && (
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {category.children!.length}{" "}
              {category.children!.length === 1 ? "child" : "children"}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link href={`${ROUTES.ADMIN_CATEGORIES}/${category.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`${ROUTES.ADMIN_CATEGORIES}/${category.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category.id, category.name)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-primary" />
            </Button>
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded &&
          hasChildren &&
          category.children!.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Failed to load categories</p>
          <p className="text-sm text-muted-foreground mt-2">
            {(error as any)?.data?.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  const tree = data?.data ? buildTree(data.data) : [];
  const filteredTree = filterCategories(tree);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product categories (3-level hierarchy)
          </p>
        </div>
        <Link href={`${ROUTES.ADMIN_CATEGORIES}/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Search & Actions */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={expandAll}
              >
                Expand All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={collapseAll}
              >
                Collapse All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Categories
            {data && ` (${data.data.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTree.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold">No categories found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {search
                  ? "Try adjusting your search"
                  : "Get started by adding your first category"}
              </p>
              {!search && (
                <Link href={`${ROUTES.ADMIN_CATEGORIES}/create`}>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="border rounded-md">
              {filteredTree.map((category) => renderCategory(category))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Category Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-blue-600" />
              <span>Level 1 - Main Category</span>
            </div>
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-green-600" />
              <span>Level 2 - Sub Category</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <span>Level 3 - Product Group</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
