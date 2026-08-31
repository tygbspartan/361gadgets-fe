"use client";

import { use } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, CheckCircle, XCircle } from "lucide-react";
import { useGetDiscountQuery } from "@/lib/redux/features/discounts/discountsApi";
import { useAppSelector } from "@/lib/redux/hooks";
import { isSuper } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

export default function DiscountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const discountId = Number(id);

  const role = useAppSelector((state) => state.auth.user?.role);
  const showOwner = isSuper(role);

  const { data: discount, isLoading, error } = useGetDiscountQuery(discountId);

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !discount) {
    return (
      <div className="space-y-4">
        <Link href={ROUTES.ADMIN_DISCOUNTS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to discounts
          </Button>
        </Link>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Discount not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const valueLabel =
    discount.type === "percentage"
      ? `${discount.value}%`
      : `Rs ${discount.value}`;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Code", value: <span className="font-mono">{discount.code}</span> },
    { label: "Type", value: discount.type },
    { label: "Value", value: valueLabel },
    {
      label: "Min. purchase",
      value: discount.minPurchaseAmount
        ? `Rs ${discount.minPurchaseAmount}`
        : "—",
    },
    {
      label: "Max. discount",
      value: discount.maxDiscountAmount
        ? `Rs ${discount.maxDiscountAmount}`
        : "—",
    },
    {
      label: "Usage",
      value: `${discount.usedCount}${
        discount.usageLimit ? ` / ${discount.usageLimit}` : " (unlimited)"
      }`,
    },
    { label: "Starts", value: formatDate(discount.startDate) },
    { label: "Ends", value: formatDate(discount.endDate) },
  ];

  if (showOwner) {
    rows.push({
      label: "Owner",
      value: discount.ownerId ? `Vendor #${discount.ownerId}` : "Platform",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={ROUTES.ADMIN_DISCOUNTS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to discounts
          </Button>
        </Link>
        <Link href={`${ROUTES.ADMIN_DISCOUNTS}/${discount.id}/edit`}>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>{discount.name}</CardTitle>
              <CardDescription>Discount details</CardDescription>
            </div>
            {discount.isActive ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" /> Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" /> Inactive
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b pb-2"
              >
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="text-sm font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
