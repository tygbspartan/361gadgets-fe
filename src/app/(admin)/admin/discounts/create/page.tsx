"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateDiscountMutation } from "@/lib/redux/features/discounts/discountsApi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function CreateDiscountPage() {
  const router = useRouter();
  const [createDiscount, { isLoading }] = useCreateDiscountMutation();

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Discount name is required";
    }

    if (!code.trim()) {
      newErrors.name = "Discount code is required";
    }

    if (code && !/^[A-Z0-9_-]+$/i.test(code)) {
      newErrors.code =
        "Code can only contain letters, numbers, hyphens, and underscores";
    }

    if (!value || parseFloat(value) <= 0) {
      newErrors.value = "Discount value must be greater than 0";
    }

    if (type === "percentage" && parseFloat(value) > 100) {
      newErrors.value = "Percentage cannot exceed 100%";
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (minPurchaseAmount && parseFloat(minPurchaseAmount) < 0) {
      newErrors.minPurchaseAmount =
        "Minimum purchase amount cannot be negative";
    }

    if (maxDiscountAmount && parseFloat(maxDiscountAmount) <= 0) {
      newErrors.maxDiscountAmount =
        "Maximum discount amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createDiscount({
        name: name.trim(),
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minPurchaseAmount: minPurchaseAmount
          ? parseFloat(minPurchaseAmount)
          : undefined,
        maxDiscountAmount: maxDiscountAmount
          ? parseFloat(maxDiscountAmount)
          : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        startDate,
        endDate,
        isActive,
      }).unwrap();

      alert("Discount created successfully!");
      router.push(ROUTES.ADMIN_DISCOUNTS);
    } catch (err: any) {
      console.error("Failed to create discount:", err);
      alert(err?.data?.message || "Failed to create discount");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN_DISCOUNTS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Discount</h1>
          <p className="text-gray-600 mt-1">Add a new discount</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Discount name and optional promo code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">
                Discount Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Sale 2026"
                className="mt-2"
              />
              {errors.name && (
                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="code">
                Promo Code <span className="text-primary">*</span>
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., SUMMER2026 (optional)"
                className="mt-2"
              />
              {errors.code && (
                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.code}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Optional code customers can use at checkout
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Discount Value */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Value</CardTitle>
            <CardDescription>
              Set the discount amount and conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">
                  Discount Type <span className="text-primary">*</span>
                </Label>
                <Select
                  value={type}
                  onValueChange={(value) =>
                    setType(value as "percentage" | "fixed")
                  }
                >
                  <SelectTrigger id="type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">
                  Value <span className="text-primary">*</span>
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === "percentage" ? "10" : "500"}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {type === "percentage" ? "%" : "Rs."}
                  </span>
                </div>
                {errors.value && (
                  <p className="text-sm text-primary mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.value}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPurchaseAmount">
                  Minimum Purchase Amount (Rs.)
                </Label>
                <Input
                  id="minPurchaseAmount"
                  type="number"
                  step="0.01"
                  value={minPurchaseAmount}
                  onChange={(e) => setMinPurchaseAmount(e.target.value)}
                  placeholder="Optional"
                  className="mt-2"
                />
                {errors.minPurchaseAmount && (
                  <p className="text-sm text-primary mt-1">
                    {errors.minPurchaseAmount}
                  </p>
                )}
              </div>

              {type === "percentage" && (
                <div>
                  <Label htmlFor="maxDiscountAmount">
                    Maximum Discount Cap (Rs.)
                  </Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    step="0.01"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="Optional"
                    className="mt-2"
                  />
                  {errors.maxDiscountAmount && (
                    <p className="text-sm text-primary mt-1">
                      {errors.maxDiscountAmount}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validity Period */}
        <Card>
          <CardHeader>
            <CardTitle>Validity Period</CardTitle>
            <CardDescription>Set when this discount is active</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">
                  Start Date <span className="text-primary">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2"
                />
                {errors.startDate && (
                  <p className="text-sm text-primary mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate">
                  End Date <span className="text-primary">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2"
                />
                {errors.endDate && (
                  <p className="text-sm text-primary mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Limits</CardTitle>
            <CardDescription>
              Control how many times this discount can be used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="usageLimit">Total Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min="0"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty for unlimited uses
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Control the availability of this discount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive" className="text-base font-medium">
                  Active
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  {isActive
                    ? "Discount is active and can be used by customers"
                    : "Discount is inactive and cannot be used"}
                </p>
              </div>
              <button
                type="button"
                id="isActive"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Link href={ROUTES.ADMIN_DISCOUNTS}>
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
                Create Discount
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
