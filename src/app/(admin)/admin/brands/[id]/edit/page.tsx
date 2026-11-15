"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetBrandByIdQuery,
  useUpdateBrandMutation,
  useUploadBrandLogoMutation,
  useDeleteBrandLogoMutation,
} from "@/lib/redux/features/brands/brandsApi";
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
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
  X,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import FaqEditor, { cleanFaqs } from "@/components/admin/FaqEditor";
import type { Faq } from "@/types/product.types";

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = parseInt(params.id as string);
  const confirm = useConfirm();

  const { data: brandData, isLoading: isLoadingBrand } =
    useGetBrandByIdQuery(brandId);
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [uploadBrandLogo, { isLoading: isUploadingLogo }] =
    useUploadBrandLogoMutation();
  const [deleteBrandLogo, { isLoading: isDeletingLogo }] =
    useDeleteBrandLogoMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    seoDescription: "",
    seoContent: "",
    isFeatured: false,
    isActive: true,
  });
  const [faqs, setFaqs] = useState<Faq[]>([]);

  // Logo file state (new file to upload)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLoading = isUpdating || isUploadingLogo || isDeletingLogo;

  // Load brand data into form
  useEffect(() => {
    if (brandData?.data) {
      const brand = brandData.data;
      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        description: brand.description || "",
        metaTitle: brand.metaTitle || "",
        metaDescription: brand.metaDescription || "",
        seoDescription: brand.seoDescription || "",
        seoContent: brand.seoContent || "",
        isFeatured: brand.isFeatured ?? false,
        isActive: brand.isActive ?? true,
      });
      setFaqs(Array.isArray(brand.faqs) ? brand.faqs : []);
    }
  }, [brandData]);

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

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const clearLogoFile = () => {
    setLogoFile(null);
    setLogoPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteLogo = async () => {
    if (!(await confirm({ message: "Remove the current logo?", confirmText: "Remove", destructive: true }))) return;
    try {
      await deleteBrandLogo(brandId).unwrap();
    } catch (err: any) {
      setError(err?.data?.message || "Failed to delete logo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name) {
      setError("Brand name is required");
      return;
    }

    try {
      await updateBrand({
        id: brandId,
        brand: {
          name: formData.name,
          // The URL slug: only sent when changed (the server tidies it, e.g. "Samsung" -> "samsung").
          slug:
            formData.slug.trim() && formData.slug.trim() !== brandData?.data?.slug
              ? formData.slug.trim()
              : undefined,
          description: formData.description || undefined,
          metaTitle: formData.metaTitle || undefined,
          metaDescription: formData.metaDescription || undefined,
          seoDescription: formData.seoDescription || undefined,
          // null clears the guide; [] clears the FAQ.
          seoContent: formData.seoContent.trim() || null,
          faqs: cleanFaqs(faqs),
          isFeatured: formData.isFeatured,
          isActive: formData.isActive,
        },
      }).unwrap();

      // Upload new logo if a file was selected
      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        await uploadBrandLogo({ id: brandId, body: fd }).unwrap();
        clearLogoFile();
      }

      setSuccess("Brand updated successfully! Redirecting...");
      setTimeout(() => {
        router.push(ROUTES.ADMIN_BRANDS);
      }, 1500);
    } catch (err: any) {
      console.error("Update brand error:", err);
      setError(err?.data?.message || "Failed to update brand");
    }
  };

  if (isLoadingBrand) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (!brandData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Brand not found</p>
          <Link href={ROUTES.ADMIN_BRANDS}>
            <Button className="mt-4">Back to Brands</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentLogoUrl = brandData.data.logoUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN_BRANDS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Brand</h1>
          <p className="text-muted-foreground mt-1">Update brand information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-md bg-primary/5 border border-primary/20">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-primary">{error}</p>
          </div>
        )}

        {/* Success Message */}
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
            <CardDescription>Core brand details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Brand Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., COSRX, The Ordinary, CeraVe"
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be visible to customers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="e.g. samsung"
              />
              <p className="text-xs text-muted-foreground">
                The brand page address: 361gadgets.com/brand/<strong>{formData.slug || "…"}</strong>. Lowercase
                words joined by hyphens. Changing it changes the page URL.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description about the brand..."
                className="w-full min-h-25 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Shown under the brand name on the brand page. One or two sentences.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Brand Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Logo</CardTitle>
            <CardDescription>
              Upload a logo image (JPEG, PNG, WebP, GIF — max 5 MB).
              Uploading a new file replaces the current logo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current logo */}
            {currentLogoUrl && !logoPreviewUrl && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Current Logo
                </Label>
                <div className="flex items-start gap-3">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border shrink-0">
                    <img
                      src={currentLogoUrl}
                      alt="Current logo"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteLogo}
                    disabled={isDeletingLogo}
                    className="border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <X className="h-4 w-4 mr-1" />
                    {isDeletingLogo ? "Removing..." : "Remove Logo"}
                  </Button>
                </div>
              </div>
            )}

            {/* No logo placeholder */}
            {!currentLogoUrl && !logoPreviewUrl && (
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border flex items-center justify-center">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {/* New file preview */}
            {logoPreviewUrl && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  New Logo Preview
                </Label>
                <div className="flex items-start gap-3">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border shrink-0">
                    <img
                      src={logoPreviewUrl}
                      alt="New logo preview"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                      {logoFile?.name}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearLogoFile}
                      className="text-primary hover:text-primary hover:bg-primary/5"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload button */}
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {currentLogoUrl ? "Replace Logo" : "Upload Logo"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleLogoFileChange}
              />
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
                placeholder="SEO title for this brand"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 50-60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="SEO description for this brand..."
                maxLength={160}
                className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 150-160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">Brand page copy (SEO)</Label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleInputChange}
                placeholder="Long-form intro shown above the product grid on the brand page…"
                className="w-full min-h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                150–250 words recommended. Shown to shoppers and search engines; left blank shows nothing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Buying guide + FAQ, shown under the product grid */}
        <Card>
          <CardHeader>
            <CardTitle>Buying guide & FAQ (optional)</CardTitle>
            <CardDescription>
              Shown under the products on the brand page (first page only). Helps shoppers and search engines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="seoContent">Buying guide</Label>
              <textarea
                id="seoContent"
                name="seoContent"
                value={formData.seoContent}
                onChange={handleInputChange}
                placeholder={"## Buy JBL in Nepal\n\nA paragraph about the brand…\n\n## How to choose\n- Portable or party speaker\n- Battery life"}
                className="w-full min-h-56 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Leave a blank line between paragraphs. Start a line with <code>## </code> for a heading
                and <code>- </code> for a bullet point. 300–600 words works well.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Frequently asked questions</Label>
              <FaqEditor value={faqs} onChange={setFaqs} idPrefix="brand-faq" />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Visibility</CardTitle>
            <CardDescription>
              Set brand visibility and featured status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <Label
                  htmlFor="isActive"
                  className="text-base font-medium cursor-pointer"
                >
                  Active
                </Label>
                <p className="text-sm text-muted-foreground">
                  Make this brand visible in the store
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

            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <Label
                  htmlFor="isFeatured"
                  className="text-base font-medium cursor-pointer"
                >
                  Featured
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show this brand in “Shop by Brand” on the homepage
                </p>
              </div>
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="submit" disabled={isLoading}>
            {isUpdating
              ? "Updating Brand..."
              : isUploadingLogo
              ? "Uploading Logo..."
              : "Update Brand"}
          </Button>
          <Link href={ROUTES.ADMIN_BRANDS}>
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
