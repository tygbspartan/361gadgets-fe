"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useGetVendorQuery,
  useUpdateVendorMutation,
  useSetVendorStatusMutation,
  useUploadVendorLogoMutation,
  useDeleteVendorLogoMutation,
} from "@/lib/redux/features/vendors/vendorsApi";
import {
  useGetAdminBrandsQuery,
  useAssignBrandsToVendorMutation,
} from "@/lib/redux/features/brands/brandsApi";
import BrandAssignment from "@/components/admin/BrandAssignment";
import { useToastHelpers } from "@/components/ui/ToastStack";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Package,
  Tag,
  Power,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { VendorDetail } from "@/types/vendor.types";

function ownedCounts(v?: VendorDetail) {
  return {
    products: v?._count?.ownedProducts ?? v?.ownedProductsCount ?? 0,
    discounts: v?._count?.ownedDiscounts ?? v?.ownedDiscountsCount ?? 0,
  };
}

export default function VendorDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { toastSuccess, toastError } = useToastHelpers();
  const confirm = useConfirm();

  const { data: vendor, isLoading, error } = useGetVendorQuery(id, {
    skip: !id || Number.isNaN(id),
  });

  const [updateVendor, { isLoading: isSaving }] = useUpdateVendorMutation();
  const [setStatus, { isLoading: isToggling }] = useSetVendorStatusMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] =
    useUploadVendorLogoMutation();
  const [deleteLogo, { isLoading: isDeletingLogo }] =
    useDeleteVendorLogoMutation();
  const [assignBrands, { isLoading: isAssigningBrands }] =
    useAssignBrandsToVendorMutation();

  // Brands currently owned by this vendor (to seed the assignment selector).
  const { data: brandsData } = useGetAdminBrandsQuery({ ownerId: id });
  const [assignedBrandIds, setAssignedBrandIds] = useState<number[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Logo: a newly picked file (uploaded on Save) + its preview.
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  // Seed form once vendor loads
  useEffect(() => {
    if (vendor) {
      setCompanyName(vendor.companyName ?? "");
      setFirstName(vendor.firstName ?? "");
      setLastName(vendor.lastName ?? "");
      setPhone(vendor.phone ?? "");
    }
  }, [vendor]);

  // Seed the assigned brands from the brands this vendor currently owns.
  useEffect(() => {
    if (brandsData?.data) {
      setAssignedBrandIds(
        brandsData.data.filter((b) => b.ownerId === id).map((b) => b.id)
      );
    }
  }, [brandsData, id]);

  const handleSaveBrands = async () => {
    try {
      await assignBrands({ vendorId: id, brandIds: assignedBrandIds }).unwrap();
      toastSuccess("Assigned brands updated.");
    } catch (err: any) {
      toastError(err?.data?.message || "Failed to update brands");
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
    if (
      !(await confirm({
        message: "Remove the current logo?",
        confirmText: "Remove",
        destructive: true,
      }))
    )
      return;
    try {
      await deleteLogo(id).unwrap();
    } catch (err: any) {
      toastError(err?.data?.message || "Failed to remove logo");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateVendor({
        id,
        data: {
          companyName: companyName.trim() || undefined,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
        },
      }).unwrap();

      // Upload the newly picked logo (if any) after saving the profile.
      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        await uploadLogo({ id, body: fd }).unwrap();
        clearLogoFile();
      }

      toastSuccess("Profile updated successfully!");
    } catch (err: any) {
      toastError(err?.data?.message || "Failed to update profile");
    }
  };

  const handleToggleStatus = async () => {
    if (!vendor) return;
    const next = !vendor.isActive;
    const verb = next ? "activate" : "deactivate";
    if (
      !(await confirm({
        title: next ? "Activate vendor" : "Deactivate vendor",
        message: next
          ? `Activate ${vendor.email}? They will regain access immediately.`
          : `Deactivate ${vendor.email}? They will lose access immediately and all their products will be set to inactive.`,
        confirmText: next ? "Activate" : "Deactivate",
        destructive: !next,
      }))
    )
      return;
    try {
      await setStatus({ id, isActive: next }).unwrap();
      if (!next) {
        toastSuccess("Vendor deactivated. All of their products were set to inactive.");
      }
    } catch (err: any) {
      toastError(err?.data?.message || `Failed to ${verb} vendor`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-primary mb-4" />
        <p className="text-lg font-semibold">Vendor not found</p>
        <Link href={ROUTES.ADMIN_VENDORS} className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
        </Link>
      </div>
    );
  }

  const counts = ownedCounts(vendor);
  const contactName =
    [vendor.firstName, vendor.lastName].filter(Boolean).join(" ");
  const displayName = vendor.companyName || contactName || "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN_VENDORS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        {vendor.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.logoUrl}
            alt={displayName}
            className="h-12 w-12 rounded-md object-cover border"
          />
        ) : null}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <Badge
              className={
                vendor.isActive
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }
            >
              {vendor.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">
            {vendor.email}
            {vendor.companyName && contactName ? ` · ${contactName}` : ""}
          </p>
        </div>
        <Button
          variant={vendor.isActive ? "outline" : "default"}
          onClick={handleToggleStatus}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : vendor.isActive ? (
            <Power className="h-4 w-4 mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          {vendor.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>

      {/* Owned resource counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-md bg-primary/10 p-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.products}</p>
              <p className="text-sm text-gray-500">Owned products</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-md bg-primary/10 p-3">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.discounts}</p>
              <p className="text-sm text-gray-500">Owned discounts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Profile edit */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update company details, contact name and phone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Company Logo</Label>
                <p className="text-xs text-gray-500 mb-2 mt-1">
                  JPEG, PNG, WebP, GIF — max 5 MB. Picking a new file replaces
                  the current logo when you save.
                </p>
                <div className="flex items-center gap-4">
                  {/* Preview: newly picked file, else the current saved logo */}
                  {logoPreviewUrl || vendor.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreviewUrl || (vendor.logoUrl as string)}
                      alt="Vendor logo"
                      className="w-24 h-24 rounded-lg object-contain p-1 border bg-gray-50 shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg border bg-gray-50 flex items-center justify-center shrink-0">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {vendor.logoUrl || logoPreviewUrl ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {logoPreviewUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearLogoFile}
                        className="w-fit text-gray-600"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel new logo
                      </Button>
                    ) : vendor.logoUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteLogo}
                        disabled={isDeletingLogo}
                        className="w-fit text-primary hover:text-primary hover:bg-primary/5"
                      >
                        <X className="h-4 w-4 mr-1" />
                        {isDeletingLogo ? "Removing..." : "Remove Logo"}
                      </Button>
                    ) : null}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Contact First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={vendor.email} disabled className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed.
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || isUploadingLogo}>
                  {isSaving || isUploadingLogo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Assigned Brands */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Brands</CardTitle>
            <CardDescription>
              The brands this vendor is allowed to sell. Only these appear in
              their product form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BrandAssignment
              value={assignedBrandIds}
              onChange={setAssignedBrandIds}
              currentVendorId={id}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSaveBrands}
                disabled={isAssigningBrands}
              >
                {isAssigningBrands ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Brands
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
