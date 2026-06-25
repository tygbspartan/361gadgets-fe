"use client";

import { useState } from "react";
import { useGetDashboardStatsQuery } from "@/lib/redux/features/dashboard/dashboardApi";
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
  Package,
  Tag,
  Briefcase,
  ShoppingCart,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

// Move outside component to avoid re-render issues
const getDefaultDates = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

export default function AdminDashboardPage() {
  const defaults = getDefaultDates();

  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [appliedStartDate, setAppliedStartDate] = useState(defaults.start);
  const [appliedEndDate, setAppliedEndDate] = useState(defaults.end);

  const { data, isLoading, error } = useGetDashboardStatsQuery({
    startDate: appliedStartDate,
    endDate: appliedEndDate,
  });

  const handleApplyFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date must be before end date");
      return;
    }

    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleReset = () => {
    const defaults = getDefaultDates();
    setStartDate(defaults.start);
    setEndDate(defaults.end);
    setAppliedStartDate(defaults.start);
    setAppliedEndDate(defaults.end);
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return `Rs. ${value.toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-primary font-medium">
                Failed to load dashboard
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Please try refreshing the page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusItems = [
    {
      status: "pending",
      label: "Pending",
      count: data.ordersByStatus.pending,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    {
      status: "confirmed",
      label: "Confirmed",
      count: data.ordersByStatus.confirmed,
      color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    {
      status: "processing",
      label: "Processing",
      count: data.ordersByStatus.processing,
      color: "bg-purple-100 text-purple-800 border-purple-300",
    },
    {
      status: "shipped",
      label: "Shipped",
      count: data.ordersByStatus.shipped,
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    },
    {
      status: "delivered",
      label: "Delivered",
      count: data.ordersByStatus.delivered,
      color: "bg-green-100 text-green-800 border-green-300",
    },
    {
      status: "cancelled",
      label: "Cancelled",
      count: data.ordersByStatus.cancelled,
      color: "bg-primary/10 text-primary border-primary/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your store performance</p>
      </div>

      {/* Top Stats - Total Active Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href={ROUTES.ADMIN_PRODUCTS}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Products
              </CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {data.totalProducts.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Total active products
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={ROUTES.ADMIN_DISCOUNTS}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Discounts
              </CardTitle>
              <Tag className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {data.totalDiscounts.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Total active discounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={ROUTES.ADMIN_BRANDS}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Brands
              </CardTitle>
              <Briefcase className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {data.totalBrands.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">Total active brands</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
          <CardDescription>
            Select a date range to view orders and revenue statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilter}>Apply Filter</Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
          {data.dateRange && (
            <p className="text-sm text-gray-500 mt-3">
              Showing data for:{" "}
              <span className="font-medium">
                {formatDateRange(data.dateRange.start, data.dateRange.end)}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Revenue and Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <CardDescription>
                Revenue from selected date range
              </CardDescription>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Excluding cancelled orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Orders
              </CardTitle>
              <CardDescription>Orders from selected date range</CardDescription>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {data.totalOrders.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              All order statuses included
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
          <CardDescription>
            Breakdown of orders in the selected date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statusItems.map((item) => (
              <div
                key={item.status}
                className={`p-4 rounded-lg border-2 ${item.color} text-center`}
              >
                <p className="text-sm font-medium mb-2">{item.label}</p>
                <p className="text-3xl font-bold">{item.count}</p>
                <p className="text-xs mt-1 opacity-75">
                  {data.totalOrders > 0
                    ? `${((item.count / data.totalOrders) * 100).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
