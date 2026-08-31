"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "@/lib/redux/features/products/productsApi";
import { useGetCategoriesQuery } from "@/lib/redux/features/categories/categoriesApi";
import { useGetAdminBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
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
  Upload,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useAppSelector } from "@/lib/redux/hooks";
import { isSuper } from "@/constants/roles";

type StagedFile = { file: File; isPrimary: boolean };

// A color variant row in the form (stock is a string for controlled inputs).
type ColorRow = {
  name: string;
  hexCode: string;
  sku: string;
  stockQuantity: string;
};

const emptyColor = (): ColorRow => ({
  name: "",
  hexCode: "",
  sku: "",
  stockQuantity: "",
});

export default function CreateProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [uploadProductImage, { isLoading: isUploadingImages }] =
    useUploadProductImageMutation();

  const isLoading = isCreating || isUploadingImages;

  const { data: categoriesData } = useGetCategoriesQuery();
  // Scoped list: a vendor gets only their assigned brands; superadmin gets all.
  const { data: brandsData } = useGetAdminBrandsQuery();

  // Only the superadmin can feature products on the store-front.
  const role = useAppSelector((state) => state.auth.user?.role);
  const canFeature = isSuper(role);

  const usableBrands = brandsData?.data ?? [];
  const hasNoBrands = usableBrands.length === 0;

  const [formData, setFormData] = useState({
    name: "",
    longDescription: "",
    price: "",
    originalPrice: "",
    costPrice: "",
    stockQuantity: "",
    lowStockThreshold: "10",
    sku: "",
    brandId: "",
    categoryId: "",
    countryOfOrigin: "",
    isActive: true,
    isFeatured: false,
    homepageFeature: false,
    metaTitle: "",
    metaDescription: "",
  });

  // Optional color variants. When present, each carries its own stock and the
  // product-level stock is the sum (computed on the server).
  const [colors, setColors] = useState<ColorRow[]>([]);
  const hasColors = colors.length > 0;
  const colorsStockTotal = colors.reduce(
    (sum, c) => sum + (parseInt(c.stockQuantity) || 0),
    0,
  );

  const [imageFiles, setImageFiles] = useState<StagedFile[]>([]);

  const [specifications, setSpecifications] = useState<
    { key: string; value: string }[]
  >([]);
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (incoming.length === 0) return;
    setImageFiles((prev) => {
      const newEntries: StagedFile[] = incoming.map((file, i) => ({
        file,
        isPrimary: prev.length === 0 && i === 0,
      }));
      return [...prev, ...newEntries];
    });
    e.target.value = "";
  };

  const setPrimaryImage = (index: number) => {
    setImageFiles((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index })),
    );
  };

  const removeFile = (index: number) => {
    setImageFiles((prev) => {
      const wasPrimary = prev[index].isPrimary;
      const next = prev.filter((_, i) => i !== index);
      if (wasPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

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

  const addColor = () => setColors((prev) => [...prev, emptyColor()]);
  const updateColor = (index: number, field: keyof ColorRow, value: string) =>
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  const removeColor = (index: number) =>
    setColors((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.price ||
      !formData.costPrice ||
      (!formData.stockQuantity && !hasColors) ||
      !formData.longDescription ||
      !formData.sku
    ) {
      setError(
        "Please fill in all required fields (Name, Price, Cost Price, Stock Quantity or Colors, Long Description, SKU)",
      );
      return;
    }
    if (!formData.brandId || !formData.categoryId) {
      setError("Please select a Brand and Category");
      return;
    }
    if (hasColors) {
      const invalid = colors.some(
        (c) =>
          !c.name.trim() ||
          c.stockQuantity === "" ||
          parseInt(c.stockQuantity) < 0,
      );
      if (invalid) {
        setError("Each color needs a name and a valid stock quantity");
        return;
      }
    }
    if (imageFiles.length === 0) {
      setError("Please add at least one product image");
      return;
    }

    try {
      // Step 1: Create the product
      const created = await createProduct({
        name: formData.name,
        longDescription: formData.longDescription,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        costPrice: parseFloat(formData.costPrice),
        // With colors the server derives stock from the sum; send 0 as a base.
        stockQuantity: hasColors
          ? colorsStockTotal
          : parseInt(formData.stockQuantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        sku: formData.sku,
        brandId: parseInt(formData.brandId),
        categoryId: parseInt(formData.categoryId),
        countryOfOrigin: formData.countryOfOrigin || undefined,
        isActive: formData.isActive,
        // Feature flags are superadmin-only; vendors never send them.
        ...(canFeature
          ? {
              isFeatured: formData.isFeatured,
              homepageFeature: formData.homepageFeature,
            }
          : {}),
        colors: hasColors
          ? colors.map((c, i) => ({
              name: c.name.trim(),
              hexCode: c.hexCode.trim() || undefined,
              sku: c.sku.trim() || undefined,
              stockQuantity: parseInt(c.stockQuantity) || 0,
              displayOrder: i,
            }))
          : undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        specifications: specifications.length > 0 ? specifications : undefined,
      }).unwrap();

      const productId = created.data.id;

      // Step 2: Upload primary image first (backend makes first upload primary),
      // then the rest
      const sorted = [...imageFiles].sort(
        (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
      );
      for (const staged of sorted) {
        const fd = new FormData();
        fd.append("image", staged.file);
        await uploadProductImage({ id: productId, body: fd }).unwrap();
      }

      setSuccess("Product created successfully! Redirecting...");
      setTimeout(() => router.push(ROUTES.ADMIN_PRODUCTS), 1500);
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        err?.message ||
        "Failed to create product";
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN_PRODUCTS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground mt-1">
            Create a new product in your catalog
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
              <Label htmlFor="longDescription">
                Long Description <span className="text-primary">*</span>
              </Label>
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
                <Label htmlFor="sku">
                  SKU <span className="text-primary">*</span>
                </Label>
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
                <Label htmlFor="brandId">
                  Brand <span className="text-primary">*</span>
                </Label>
                <select
                  id="brandId"
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleInputChange}
                  disabled={hasNoBrands}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Brand</option>
                  {usableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {hasNoBrands && !canFeature && (
                  <p className="text-xs text-amber-600">
                    You have no brands assigned yet. Ask the platform admin to
                    assign a brand before adding products.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">
                  Category <span className="text-primary">*</span>
                </Label>
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
                  Only product-level categories are shown
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
                <p className="text-xs text-muted-foreground">
                  Set higher than price to show a crossed-out price
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">
                  Cost Price (Rs) <span className="text-primary">*</span>
                </Label>
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

        {/* Color Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Color Variants</CardTitle>
            <CardDescription>
              Optional. Add colors if this product ships in multiple colors —
              each color tracks its own stock. Leave empty for a single-stock
              product (uses the Inventory stock above).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {colors.length > 0 && (
              <div className="space-y-3">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border rounded-md p-3"
                  >
                    <div className="md:col-span-4 space-y-1">
                      <Label className="text-xs">
                        Color name <span className="text-primary">*</span>
                      </Label>
                      <Input
                        value={color.name}
                        onChange={(e) =>
                          updateColor(index, "name", e.target.value)
                        }
                        placeholder="e.g., Space Black"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs">Swatch</Label>
                      <input
                        type="color"
                        value={color.hexCode || "#000000"}
                        onChange={(e) =>
                          updateColor(index, "hexCode", e.target.value)
                        }
                        className="w-full h-9 rounded border cursor-pointer"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <Label className="text-xs">SKU</Label>
                      <Input
                        value={color.sku}
                        onChange={(e) =>
                          updateColor(index, "sku", e.target.value)
                        }
                        placeholder="Optional"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs">
                        Stock <span className="text-primary">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={color.stockQuantity}
                        onChange={(e) =>
                          updateColor(index, "stockQuantity", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeColor(index)}
                      >
                        <X className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  Total stock across colors:{" "}
                  <span className="font-medium">{colorsStockTotal}</span> (this
                  becomes the product stock)
                </p>
              </div>
            )}
            <Button type="button" variant="outline" onClick={addColor}>
              <Plus className="h-4 w-4 mr-2" />
              Add Color
            </Button>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>
              Product Images <span className="text-primary">*</span>
            </CardTitle>
            <CardDescription>
              Select image files to upload. The first image is primary by
              default.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone — input overlays the entire area so the user clicks it directly */}
            <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors overflow-hidden">
              <div className="pointer-events-none flex flex-col items-center justify-center h-full gap-1">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to choose files
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP, GIF — max 2 MB each
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

            {/* Staged file list */}
            {imageFiles.length > 0 && (
              <div className="space-y-2">
                {imageFiles.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 border rounded-md bg-gray-50"
                  >
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt={item.file.name}
                      className="w-12 h-12 object-cover rounded shrink-0"
                    />
                    <p className="text-sm truncate flex-1">{item.file.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.isPrimary ? (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Primary
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryImage(index)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
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
            <CardTitle>Additional Specifications</CardTitle>
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

        {/* SEO */}
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
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </div>
            {/* Featured flags are curated by the platform — superadmin only. */}
            {canFeature && (
              <>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <Label
                      htmlFor="isFeatured"
                      className="text-base font-medium"
                    >
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
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <Label
                      htmlFor="homepageFeature"
                      className="text-base font-medium"
                    >
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
                    checked={formData.homepageFeature}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isCreating ? "Creating Product..." : "Uploading Images..."}
              </>
            ) : (
              "Create Product"
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
