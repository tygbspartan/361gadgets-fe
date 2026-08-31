"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetVendorsQuery } from "@/lib/redux/features/vendors/vendorsApi";
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
import { Plus, Search, Eye, Store } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function VendorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const { data: vendors, isLoading, error } = useGetVendorsQuery({
    search: searchQuery || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const handleSearch = () => setSearchQuery(searchInput);
  const handleClear = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("all");
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const vendorName = (v: {
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
  }) =>
    v.companyName ||
    [v.firstName, v.lastName].filter(Boolean).join(" ") ||
    "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-gray-600 mt-1">
            Create and manage vendor (seller) accounts
          </p>
        </div>
        <Link href={`${ROUTES.ADMIN_VENDORS}/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
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
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "active" | "inactive")
              }
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

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>{vendors?.length || 0} total vendors</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading vendors...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-primary">Failed to load vendors</p>
            </div>
          ) : !vendors?.length ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No vendors found</p>
              <Link href={`${ROUTES.ADMIN_VENDORS}/create`}>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vendor
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {vendor.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={vendor.logoUrl}
                              alt={vendorName(vendor)}
                              className="h-8 w-8 rounded object-cover border"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                              <Store className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{vendorName(vendor)}</p>
                            {(vendor.firstName || vendor.lastName) &&
                              vendor.companyName && (
                                <p className="text-xs text-gray-500">
                                  {[vendor.firstName, vendor.lastName]
                                    .filter(Boolean)
                                    .join(" ")}
                                </p>
                              )}
                            {vendor.role === "superadmin" && (
                              <Badge variant="outline" className="mt-1">
                                superadmin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{vendor.email}</TableCell>
                      <TableCell className="text-sm">
                        {vendor.phone || (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            vendor.isActive
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                          }
                        >
                          {vendor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(vendor.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`${ROUTES.ADMIN_VENDORS}/${vendor.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
