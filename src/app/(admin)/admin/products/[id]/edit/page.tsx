"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "@/lib/redux/features/products/productsApi";
import { useGetCategoriesQuery } from "@/lib/redux/features/categories/categoriesApi";
import { useGetBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
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
import {
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const SKIN_TYPES = ["Normal", "Dry", "Oily", "Combination", "Sensitive"];

const SKIN_CONCERNS = [
  "Acne & Breakouts", "Oil Control", "Large Pores", "Dryness",
  "Dehydration", "Sensitivity & Redness", "Dark Spots & Hyperpigmentation",
  "Uneven Skin Tone", "Dullness & Brightening", "Uneven Texture",
  "Fine Lines & Wrinkles", "Firmness & Elasticity", "Dark Circles",
  "Puffiness", "Sun Protection",
];

type LocalImage = {
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
};

type StagedFile = { file: File; isPrimary: boolean };

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.id as string);

  const { data: productData, isLoading: isLoadingProduct } =
    useGetProductByIdQuery(productId);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadProductImage, { isLoading: isUploadingImage }] =
    useUploadProductImageMutation();

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

  const [formData, setFormData] = useState({
    name: "",
    longDescription: "",
    price: "",
    originalPrice: "",
    costPrice: "",
    stockQuantity: "",
    lowStockThreshold: "",
    sku: "",
    brandId: "",
    categoryId: "",
    countryOfOrigin: "",
    isActive: true,
    isFeatured: false,
    homepageFeature: false,
    skinType: [] as string[],
    skinConcern: [] as string[],
    metaTitle: "",
    metaDescription: "",
  });

  // Existing images loaded from the server
  const [images, setImages] = useState<LocalImage[]>([]);
  // New files staged locally — uploaded on submit
  const [imageFiles, setImageFiles] = useState<StagedFile[]>([]);

  const [specifications, setSpecifications] = useState<
    { key: string; value: string }[]
  >([]);
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!productData?.data) return;
    const p = productData.data;

    setFormData({
      name: p.name || "",
      longDescription: p.longDescription || "",
      price: p.price?.toString() || "",
      originalPrice: p.originalPrice?.toString() || "",
      costPrice: p.costPrice?.toString() || "",
      stockQuantity: p.stockQuantity?.toString() || "",
      lowStockThreshold: p.lowStockThreshold?.toString() || "",
      sku: p.sku || "",
      brandId: p.brandId?.toString() || "",
      categoryId: p.categoryId?.toString() || "",
      countryOfOrigin: p.countryOfOrigin || "",
      isActive: p.isActive ?? true,
      isFeatured: p.isFeatured ?? false,
      homepageFeature: p.homepageFeature ?? false,
      skinType: p.skinType ?? [],
      skinConcern: p.skinConcern ?? [],
      metaTitle: p.metaTitle || "",
      metaDescription: p.metaDescription || "",
    });

    if (p.images && p.images.length > 0) {
      setImages(
        [...(p.images ?? [])]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((img) => ({
            imageUrl: img.imageUrl,
            altText: img.altText || "",
            isPrimary: img.isPrimary,
            displayOrder: img.displayOrder,
          }))
      );
    }

    if (p.specifications && p.specifications.length > 0) {
      setSpecifications(
        p.specifications.map((s) => ({ key: s.key, value: s.value }))
      );
    }
  }, [productData]);

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

  const toggleArrayItem = (field: "skinType" | "skinConcern", value: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  // ── Image handlers ────────────────────────────────────────────────────────

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (incoming.length === 0) return;
    setImageFiles((prev) => {
      // A new staged file is primary only if there are no existing images and
      // no staged files yet, and this is the first file in the selection.
      const noPrimaryYet =
        !images.some((img) => img.isPrimary) &&
        !prev.some((f) => f.isPrimary);
      return [
        ...prev,
        ...incoming.map((file, i) => ({
          file,
          isPrimary: noPrimaryYet && i === 0,
        })),
      ];
    });
    e.target.value = "";
  };

  // Set an existing server image as primary; clear primary on all staged files
  const setPrimaryExisting = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
    setImageFiles((prev) => prev.map((f) => ({ ...f, isPrimary: false })));
  };

  // Set a staged file as primary; clear primary on all existing images
  const setPrimaryStaged = (index: number) => {
    setImageFiles((prev) =>
      prev.map((f, i) => ({ ...f, isPrimary: i === index }))
    );
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: false })));
  };

  const removeExistingImage = (index: number) => {
    setImages((prev) => {
      const wasPrimary = prev[index].isPrimary;
      const next = prev
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, displayOrder: i }));
      // Re-assign primary: prefer first remaining existing image,
      // otherwise first staged file
      if (wasPrimary) {
        if (next.length > 0) {
          next[0] = { ...next[0], isPrimary: true };
        } else {
          setImageFiles((staged) =>
            staged.map((f, i) => ({ ...f, isPrimary: i === 0 }))
          );
        }
      }
      return next;
    });
  };

  const removeStagedFile = (index: number) => {
    setImageFiles((prev) => {
      const wasPrimary = prev[index].isPrimary;
      const next = prev.filter((_, i) => i !== index);
      if (wasPrimary) {
        // Re-assign primary: prefer first remaining staged file,
        // otherwise first existing image
        if (next.length > 0) {
          next[0] = { ...next[0], isPrimary: true };
        } else {
          setImages((imgs) =>
            imgs.map((img, i) => ({ ...img, isPrimary: i === 0 }))
          );
        }
      }
      return next;
    });
  };

  // ── Specification handlers ────────────────────────────────────────────────

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setSpecifications((prev) => [
        ...prev,
        { key: specKey.trim(), value: specValue.trim() },
      ]);
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.price || !formData.stockQuantity) {
      setError(
        "Please fill in all required fields (Name, Price, Stock Quantity)"
      );
      return;
    }
    if (images.length === 0 && imageFiles.length === 0) {
      setError("Please add at least one product image");
      return;
    }

    try {
      // Step 1: Upload staged files and collect their resulting LocalImages
      const uploadedImages: LocalImage[] = [];
      for (const staged of imageFiles) {
        const fd = new FormData();
        fd.append("image", staged.file);
        const result = await uploadProductImage({
          id: productId,
          body: fd,
        }).unwrap();
        uploadedImages.push({
          imageUrl: result.data.imageUrl,
          altText: "",
          isPrimary: staged.isPrimary,
          displayOrder: 0,
        });
      }

      // Step 2: Combine existing + newly uploaded, re-index displayOrder
      const allImages = [...images, ...uploadedImages].map((img, i) => ({
        ...img,
        displayOrder: i,
      }));

      // Guarantee exactly one primary
      const hasPrimary = allImages.some((img) => img.isPrimary);
      if (!hasPrimary && allImages.length > 0) {
        allImages[0] = { ...allImages[0], isPrimary: true };
      }

      const payload = {
        name: formData.name,
        longDescription: formData.longDescription || undefined,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        costPrice: formData.costPrice
          ? parseFloat(formData.costPrice)
          : undefined,
        stockQuantity: parseInt(formData.stockQuantity),
        lowStockThreshold: formData.lowStockThreshold
          ? parseInt(formData.lowStockThreshold)
          : undefined,
        sku: formData.sku || undefined,
        brandId: formData.brandId ? parseInt(formData.brandId) : undefined,
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId)
          : undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        homepageFeature: formData.homepageFeature,
        skinType: formData.skinType,
        skinConcern: formData.skinConcern,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        countryOfOrigin: formData.countryOfOrigin || undefined,
        images: allImages.map((img) => ({
          imageUrl: img.imageUrl,
          altText: img.altText || undefined,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
        })),
        specifications: specifications.length > 0 ? specifications : [],
      };

      const result = await updateProduct({
        id: productId,
        product: payload,
      }).unwrap();

      // Sync state with what the server saved
      setImageFiles([]);
      const updated = result.data;
      if (updated) {
        setImages(
          [...(updated.images ?? [])]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((img) => ({
              imageUrl: img.imageUrl,
              altText: img.altText || "",
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder,
            }))
        );
        setSpecifications(
          (updated.specifications ?? []).map((s) => ({
            key: s.key,
            value: s.value,
          }))
        );
      }

      setSuccess("Product updated successfully! Redirecting...");
      setTimeout(() => router.push(ROUTES.ADMIN_PRODUCTS), 1500);
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        err?.message ||
        "Failed to update product";
      setError(message);
    }
  };

  // ── Loading / not-found states ────────────────────────────────────────────

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!productData?.data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Product not found</p>
          <Link href={ROUTES.ADMIN_PRODUCTS}>
            <Button className="mt-4">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalImages = images.length + imageFiles.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN_PRODUCTS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground mt-1">
            Update product information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-md bg-primary/5 border border-primary/20">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-primary">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 p-4 rounded-md bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., COSRX Advanced Snail 96 Mucin Power Essence"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                placeholder="Detailed product description..."
                className="w-full min-h-30 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g., COSRX-SNL-96"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                <Input
                  id="countryOfOrigin"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleInputChange}
                  placeholder="e.g., South Korea"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandId">Brand</Label>
                <select
                  id="brandId"
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Brand</option>
                  {brandsData?.data.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  {categoriesData?.data
                    .filter((c) => c.level === 3)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Only product-level categories (level 3) are shown
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set product pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Selling Price (Rs) <span className="text-primary">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="1500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (Rs)</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="2000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price (Rs)</Label>
                <Input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  placeholder="1000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Manage stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">
                  Stock Quantity <span className="text-primary">*</span>
                </Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  placeholder="100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  placeholder="10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>
              Product Images{" "}
              {totalImages > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({totalImages})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              New files are uploaded when you save. Click an image to set it as
              primary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone — transparent input overlays the area */}
            <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors overflow-hidden">
              <div className="pointer-events-none flex flex-col items-center justify-center h-full gap-1">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to add images
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP, GIF — max 5 MB each. Uploaded on save.
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            </div>

            {/* Existing server images */}
            {images.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Saved images
                </p>
                {images.map((img, index) => (
                  <div
                    key={`${img.imageUrl}-${index}`}
                    className="flex items-center gap-3 p-2 border rounded-md bg-gray-50"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || `Image ${index + 1}`}
                      className="w-12 h-12 object-cover rounded shrink-0"
                    />
                    <p className="text-sm truncate flex-1">{img.imageUrl}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {img.isPrimary ? (
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                          Primary
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryExisting(index)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Staged (new) files */}
            {imageFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  New files (not yet saved)
                </p>
                {imageFiles.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 border rounded-md bg-blue-50"
                  >
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt={item.file.name}
                      className="w-12 h-12 object-cover rounded shrink-0"
                    />
                    <p className="text-sm truncate flex-1">{item.file.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.isPrimary ? (
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                          Primary
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryStaged(index)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStagedFile(index)}
                      >
                        <X className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Add product specifications (e.g., Weight: 100ml)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Add Specification</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Key (e.g., Weight)"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                />
                <Input
                  placeholder="Value (e.g., 100ml)"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                />
                <Button type="button" onClick={addSpecification}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {specifications.length > 0 && (
              <div className="space-y-2">
                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <span className="text-sm font-medium">{spec.key}:</span>
                    <span className="text-sm flex-1">{spec.value}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skin Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Skin Profile</CardTitle>
            <CardDescription>Target skin types and concerns for this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Skin Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SKIN_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.skinType.includes(type)}
                      onChange={() => toggleArrayItem("skinType", type)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-base font-medium">Skin Concern</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SKIN_CONCERNS.map((concern) => (
                  <label key={concern} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.skinConcern.includes(concern)}
                      onChange={() => toggleArrayItem("skinConcern", concern)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-sm">{concern}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>
              Optional meta information for search engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                placeholder="SEO title for this product"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 50-60 characters. Leave blank to use product name.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="SEO description for this product..."
                maxLength={160}
                className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 150-160 characters.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Set product visibility and featured status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <Label htmlFor="isActive" className="text-base font-medium">
                  Active
                </Label>
                <p className="text-sm text-muted-foreground">
                  Make this product visible in the store
                </p>
              </div>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={!!formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <Label htmlFor="isFeatured" className="text-base font-medium">
                  Featured
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show this product in featured section
                </p>
              </div>
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={!!formData.isFeatured}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <Label htmlFor="homepageFeature" className="text-base font-medium">
                  Homepage Featured
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show this product in the homepage featured section
                </p>
              </div>
              <input
                type="checkbox"
                id="homepageFeature"
                name="homepageFeature"
                checked={!!formData.homepageFeature}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <Button type="submit" disabled={isUpdating || isUploadingImage}>
            {isUpdating || isUploadingImage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploadingImage ? "Uploading Images..." : "Updating Product..."}
              </>
            ) : (
              "Update Product"
            )}
          </Button>
          <Link href={ROUTES.ADMIN_PRODUCTS}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
