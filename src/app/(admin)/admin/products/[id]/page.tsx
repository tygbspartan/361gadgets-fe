"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useGetProductByIdQuery,
  useDeleteProductMutation,
} from "@/lib/redux/features/products/productsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Package,
  CheckCircle,
  XCircle,
  Edit, // ADD THIS
  Trash2, // ADD THIS
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error } = useGetProductByIdQuery(parseInt(id));
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Set initial image when data loads
  const product = data?.data;
  const primaryImage =
    product?.images?.find((img) => img.isPrimary)?.imageUrl ||
    product?.images?.[0]?.imageUrl ||
    "";

  const displayImage = selectedImage || primaryImage;

  // Helper function to safely get array from product field
  const getArrayField = (field: any): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProduct(product.id).unwrap();
      router.push(ROUTES.ADMIN_PRODUCTS);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete product");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Product not found</p>
          <p className="text-sm text-muted-foreground mt-2">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/admin/products">
            <Button className="mt-4">Back to Products</Button>
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
          <Link href={ROUTES.ADMIN_PRODUCTS}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground mt-1">Product Details</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`${ROUTES.ADMIN_PRODUCTS}/${product.id}/edit`}>
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
                  Are you sure you want to delete this product?
                </p>
                <p className="text-sm text-primary mt-1">
                  This action cannot be undone. The product will be permanently
                  removed from your catalog.
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
        {/* Left Column - Images */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-6">
              {/* Main Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.imageUrl)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                        (selectedImage || primaryImage) === img.imageUrl
                          ? "border-primary"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={img.imageUrl}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                {product.isActive ? (
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
                {product.isFeatured ? (
                  <Badge className="bg-green-500 hover:bg-green-600 cursor-pointer">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="cursor-pointer">
                    No
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Stock Status
                </span>
                {product.stockQuantity === 0 ? (
                  <Badge variant="destructive" className="cursor-pointer">
                    Out of Stock
                  </Badge>
                ) : product.stockQuantity <= product.lowStockThreshold ? (
                  <Badge className="bg-amber-500 hover:bg-amber-600 cursor-pointer">
                    Low Stock
                  </Badge>
                ) : (
                  <Badge className="bg-green-500 hover:bg-green-600 cursor-pointer">
                    In Stock
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Product Name
                    </label>
                    <p className="text-base mt-1">{product.name}</p>
                  </div>

                  {product.shortDescription && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Short Description
                      </label>
                      <p className="text-base mt-1">
                        {product.shortDescription}
                      </p>
                    </div>
                  )}

                  {product.longDescription && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Long Description
                      </label>
                      <p className="text-base mt-1 whitespace-pre-line">
                        {product.longDescription}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Brand
                      </label>
                      <p className="text-base mt-1">
                        {product.brand?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Category
                      </label>
                      <p className="text-base mt-1">
                        {product.category?.name || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        SKU
                      </label>
                      <p className="text-base mt-1">{product.sku || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Slug
                      </label>
                      <p className="text-base mt-1 font-mono text-sm">
                        {product.slug}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Selling Price
                      </label>
                      <p className="text-2xl font-bold mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    {product.originalPrice && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Original Price
                        </label>
                        <p className="text-xl font-semibold mt-1 line-through text-muted-foreground">
                          {formatPrice(product.originalPrice)}
                        </p>
                      </div>
                    )}
                    {product.costPrice && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Cost Price
                        </label>
                        <p className="text-xl font-semibold mt-1">
                          {formatPrice(product.costPrice)}
                        </p>
                      </div>
                    )}
                  </div>

                  {product.discountPercentage &&
                    product.discountPercentage > 0 && (
                      <div>
                        <Badge
                          variant="destructive"
                          className="text-lg px-3 py-1 cursor-pointer"
                        >
                          {product.discountPercentage}% OFF
                        </Badge>
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              {getArrayField(product.effectiveFor).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Effective For</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getArrayField(product.effectiveFor).map(
                        (item, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                          >
                            {item}
                          </Badge>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {getArrayField(product.features).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {getArrayField(product.features).map((feature, index) => (
                        <li key={index} className="text-sm">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {getArrayField(product.ingredients).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {getArrayField(product.ingredients).join(", ")}
                    </p>
                  </CardContent>
                </Card>
              )}

              {getArrayField(product.howToUse).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>How To Use</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2">
                      {getArrayField(product.howToUse).map((step, index) => (
                        <li key={index} className="text-sm">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {getArrayField(product.cautions).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cautions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {getArrayField(product.cautions).map((caution, index) => (
                        <li key={index} className="text-sm text-primary">
                          {caution}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {getArrayField(product.certifications).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getArrayField(product.certifications).map(
                        (cert, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer"
                          >
                            {cert}
                          </Badge>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specs">
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.specifications &&
                  product.specifications.length > 0 ? (
                    <div className="divide-y">
                      {product.specifications.map((spec) => (
                        <div
                          key={spec.id}
                          className="flex justify-between py-3 first:pt-0 last:pb-0"
                        >
                          <span className="text-sm font-medium text-muted-foreground">
                            {spec.key}
                          </span>
                          <span className="text-sm font-semibold">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No specifications added
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            {(product.metaTitle || product.metaDescription) && (
              <TabsContent value="seo">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {product.metaTitle && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Meta Title
                        </label>
                        <p className="text-base mt-1">{product.metaTitle}</p>
                      </div>
                    )}

                    {product.metaDescription && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Meta Description
                        </label>
                        <p className="text-base mt-1">
                          {product.metaDescription}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Current Stock
                      </label>
                      <p className="text-3xl font-bold mt-1">
                        {product.stockQuantity}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Low Stock Threshold
                      </label>
                      <p className="text-3xl font-bold mt-1">
                        {product.lowStockThreshold}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium">Stock Status</p>
                    <div className="mt-2 flex items-center gap-2">
                      {product.stockQuantity === 0 ? (
                        <>
                          <div className="h-3 w-3 rounded-full bg-primary"></div>
                          <span className="text-sm font-semibold text-primary">
                            Out of Stock
                          </span>
                        </>
                      ) : product.stockQuantity <= product.lowStockThreshold ? (
                        <>
                          <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                          <span className="text-sm font-semibold text-amber-600">
                            Low Stock - Reorder Soon
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span className="text-sm font-semibold text-green-600">
                            In Stock
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Product ID
                    </label>
                    <p className="text-sm mt-1 font-mono">{product.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created At
                    </label>
                    <p className="text-sm mt-1">
                      {new Date(product.createdAt).toLocaleDateString("en-US", {
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
                      {new Date(product.updatedAt).toLocaleDateString("en-US", {
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
