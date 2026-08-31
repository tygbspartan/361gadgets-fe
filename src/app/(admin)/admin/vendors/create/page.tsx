"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateVendorMutation,
  useUploadVendorLogoMutation,
} from "@/lib/redux/features/vendors/vendorsApi";
import { useAssignBrandsToVendorMutation } from "@/lib/redux/features/brands/brandsApi";
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
import { ArrowLeft, Save, Loader2, AlertCircle, Upload, X } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import BrandAssignment from "@/components/admin/BrandAssignment";
import { useToastHelpers } from "@/components/ui/ToastStack";

export default function CreateVendorPage() {
  const router = useRouter();
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const { toastSuccess, toastError } = useToastHelpers();
  const [uploadVendorLogo, { isLoading: isUploadingLogo }] =
    useUploadVendorLogoMutation();
  const [assignBrands, { isLoading: isAssigning }] =
    useAssignBrandsToVendorMutation();
  const isLoading = isCreating || isUploadingLogo || isAssigning;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [assignedBrandIds, setAssignedBrandIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const vendor = await createVendor({
        email: email.trim(),
        password,
        companyName: companyName.trim() || undefined,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
      }).unwrap();

      // Upload the logo (if chosen) to the freshly-created vendor.
      if (logoFile && vendor.id) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        await uploadVendorLogo({ id: vendor.id, body: fd }).unwrap();
      }

      // Assign the selected brands to the new vendor.
      if (assignedBrandIds.length > 0 && vendor.id) {
        await assignBrands({
          vendorId: vendor.id,
          brandIds: assignedBrandIds,
        }).unwrap();
      }

      toastSuccess("Vendor created successfully!");
      router.push(`${ROUTES.ADMIN_VENDORS}/${vendor.id}`);
    } catch (err: any) {
      console.error("Failed to create vendor:", err);
      toastError(err?.data?.message || "Failed to create vendor");
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold">Add Vendor</h1>
          <p className="text-gray-600 mt-1">
            Create a new vendor (seller) account
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>Account Credentials</CardTitle>
            <CardDescription>
              The vendor is created active and email-verified. Share these
              credentials with them securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">
                Email <span className="text-primary">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@example.com"
                className="mt-2"
              />
              {errors.email && (
                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">
                Password <span className="text-primary">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-2"
              />
              {errors.password && (
                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Optional contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">
                Company Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Gadgets Pvt. Ltd."
                className="mt-2"
              />
              {errors.companyName && (
                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.companyName}
                </p>
              )}
            </div>
            <div>
              <Label>Company Logo</Label>
              <p className="text-xs text-gray-500 mb-2 mt-1">
                Optional. JPEG, PNG, WebP, GIF — max 5 MB.
              </p>
              {logoPreviewUrl ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreviewUrl}
                    alt="Logo preview"
                    className="w-24 h-24 rounded-lg object-contain p-1 border bg-gray-50"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground truncate max-w-[220px]">
                      {logoFile?.name}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearLogoFile}
                      className="text-primary hover:text-primary hover:bg-primary/5 w-fit"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-7 w-7 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload logo
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleLogoFileChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Contact First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Optional"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Contact Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Optional"
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
                placeholder="Optional"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assigned Brands */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Brands</CardTitle>
            <CardDescription>
              Pick the brands this vendor is allowed to sell. Only these brands
              will appear in their product form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrandAssignment
              value={assignedBrandIds}
              onChange={setAssignedBrandIds}
              onlyUnassigned
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <Link href={ROUTES.ADMIN_VENDORS}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Vendor
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
