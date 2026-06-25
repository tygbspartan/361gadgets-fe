"use client";

import { useState } from "react";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} from "@/lib/redux/features/orders/ordersApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Order } from "@/types/order.types";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "">("");
  const [paymentFilter, setPaymentFilter] = useState<
    Order["paymentStatus"] | ""
  >("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Track which order is being updated
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [updatingField, setUpdatingField] = useState<
    "status" | "payment" | null
  >(null);

  const { data, isLoading, error } = useGetOrdersQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
    paymentStatus: paymentFilter || undefined,
    search: searchQuery || undefined,
  });

  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      processing: "bg-purple-100 text-purple-800 border-purple-300",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
      delivered: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-primary/10 text-primary border-primary/30",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      paid: "bg-green-100 text-green-800 border-green-300",
      failed: "bg-primary/10 text-primary border-primary/30",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string) => {
    return `Rs. ${parseFloat(amount).toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchQuery("");
    setPaymentFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const handleStatusChange = async (
    orderId: number,
    currentStatus: Order["status"],
    newStatus: string,
  ) => {
    if (newStatus === currentStatus) return;

    setUpdatingOrderId(orderId);
    setUpdatingField("status");

    try {
      await updateOrderStatus({
        id: orderId,
        data: {
          status: newStatus as Order["status"],
        },
      }).unwrap();

      // Show success message
      alert(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      alert(error?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
      setUpdatingField(null);
    }
  };

  const handlePaymentStatusChange = async (
    orderId: number,
    currentPaymentStatus: Order["paymentStatus"],
    newPaymentStatus: string,
  ) => {
    if (newPaymentStatus === currentPaymentStatus) return;

    setUpdatingOrderId(orderId);
    setUpdatingField("payment");

    try {
      await updatePaymentStatus({
        id: orderId,
        data: {
          paymentStatus: newPaymentStatus as Order["paymentStatus"],
        },
      }).unwrap();

      // Show success message
      alert(`Payment status updated to ${newPaymentStatus}`);
    } catch (error: any) {
      console.error("Failed to update payment status:", error);
      alert(error?.data?.message || "Failed to update payment status");
    } finally {
      setUpdatingOrderId(null);
      setUpdatingField(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-gray-600 mt-1">View and manage customer orders</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number, customer name, or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>

            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            {/* Status Filter */}
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) =>
                setStatusFilter(
                  value === "all" ? "" : (value as Order["status"]),
                )
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select
              value={paymentFilter || "all"}
              onValueChange={(value) =>
                setPaymentFilter(
                  value === "all" ? "" : (value as Order["paymentStatus"]),
                )
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(statusFilter || paymentFilter || searchQuery) && (
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

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Orders List</CardTitle>
              <CardDescription>
                {data?.pagination.total || 0} total orders
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
              <p className="text-gray-500 mt-2">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-primary">Failed to load orders</p>
            </div>
          ) : !data?.data?.length ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((order) => {
                    const isUpdatingStatus =
                      updatingOrderId === order.id &&
                      updatingField === "status";
                    const isUpdatingPayment =
                      updatingOrderId === order.id &&
                      updatingField === "payment";

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.shippingFullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.shippingPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(order.total)}
                        </TableCell>

                        {/* Order Status Dropdown */}
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleStatusChange(order.id, order.status, value)
                            }
                            disabled={isUpdatingStatus}
                          >
                            <SelectTrigger
                              className={`w-[140px] ${getStatusColor(order.status)}`}
                            >
                              <SelectValue>
                                {isUpdatingStatus ? (
                                  <span className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Updating...
                                  </span>
                                ) : (
                                  <span className="capitalize">
                                    {order.status}
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">
                                Confirmed
                              </SelectItem>
                              <SelectItem value="processing">
                                Processing
                              </SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">
                                Delivered
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Payment Status Dropdown */}
                        <TableCell>
                          <Select
                            value={order.paymentStatus}
                            onValueChange={(value) =>
                              handlePaymentStatusChange(
                                order.id,
                                order.paymentStatus,
                                value,
                              )
                            }
                            disabled={isUpdatingPayment}
                          >
                            <SelectTrigger
                              className={`w-[120px] ${getPaymentStatusColor(order.paymentStatus)}`}
                            >
                              <SelectValue>
                                {isUpdatingPayment ? (
                                  <span className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Updating...
                                  </span>
                                ) : (
                                  <span className="capitalize">
                                    {order.paymentStatus}
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell className="text-sm">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`${ROUTES.ADMIN_ORDERS}/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.total > 10 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
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
