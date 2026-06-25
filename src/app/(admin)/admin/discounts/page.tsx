"use client";

import { useState } from "react";
import {
  useGetDiscountsQuery,
  useDeleteDiscountMutation,
  useUpdateDiscountMutation,
} from "@/lib/redux/features/discounts/discountsApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function DiscountsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const { data, isLoading, error } = useGetDiscountsQuery({
    page,
    limit: 10,
    search: searchQuery || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const [deleteDiscount] = useDeleteDiscountMutation();
  const [toggleStatus] = useUpdateDiscountMutation();

  const handleSearch = () => {
    setSearchQuery(searchInput); // Set the actual query when button clicked
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("all");
    setPage(1);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete discount "${name}"?`)) {
      try {
        await deleteDiscount(id).unwrap();
        alert("Discount deleted successfully!");
      } catch (err) {
        console.error("Failed to delete discount:", err);
        alert("Failed to delete discount");
      }
    }
  };

  const handleToggleStatus = async (
    id: number,
    status: boolean,
    name: string,
  ) => {
    if (
      window.confirm(
        `Are you sure you want to ${status ? "activate" : "de-activate"} discount "${name}"?`,
      )
    ) {
      try {
        await toggleStatus({ id, data: { isActive: !status } }).unwrap();
      } catch (err) {
        console.error("Failed to toggle discount status:", err);
        alert("Failed to update discount status");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDiscount = (type: string, value: string) => {
    if (type === "percentage") {
      return `${parseFloat(value)}%`;
    }
    return `Rs. ${parseFloat(value).toLocaleString("en-NP")}`;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Discounts Management</h1>
          <p className="text-gray-600 mt-1">Create and manage discounts</p>
        </div>
        <Link href={`${ROUTES.ADMIN_DISCOUNTS}/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Discount
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-9"
              />
            </div>

            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as "all" | "active" | "inactive");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="w-full sm:w-auto"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discounts</CardTitle>
          <CardDescription>
            {data?.pagination?.total || 0} total discounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading discounts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-primary">Failed to load discounts</p>
            </div>
          ) : !data?.data?.length ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No discounts found</p>
              <Link href={`${ROUTES.ADMIN_DISCOUNTS}/create`}>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Discount
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((discount) => {
                    const expired = isExpired(discount.endDate);

                    return (
                      <TableRow key={discount.id}>
                        <TableCell>
                          <p className="font-medium">{discount.name}</p>
                        </TableCell>
                        <TableCell>
                          {discount.code ? (
                            <Badge variant="outline" className="font-mono">
                              {discount.code}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No code
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {discount.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatDiscount(discount.type, discount.value)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">
                              {discount.usedCount}
                            </span>
                            {discount.usageLimit && (
                              <span className="text-gray-500">
                                {" "}
                                / {discount.usageLimit}
                              </span>
                            )}
                            {!discount.usageLimit && (
                              <span className="text-gray-500"> / ∞</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(discount.startDate)}</p>
                            <p
                              className={
                                expired ? "text-primary" : "text-gray-500"
                              }
                            >
                              to {formatDate(discount.endDate)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              className={
                                discount.isActive
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-gray-100 text-gray-800 border-gray-300"
                              }
                            >
                              {discount.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {expired && (
                              <Badge className="bg-primary/10 text-primary border-primary/30">
                                Expired
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleStatus(
                                  discount.id,
                                  discount.isActive,
                                  discount.name,
                                )
                              }
                              title={
                                discount.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              {discount.isActive ? (
                                <XCircle className="h-4 w-4 text-primary" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Link
                              href={`${ROUTES.ADMIN_DISCOUNTS}/${discount.id}/edit`}
                            >
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(discount.id, discount.name)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-primary" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination?.total && data.pagination.total > 10 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination?.totalPages || 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (data.pagination?.totalPages || 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
