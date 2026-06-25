"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} from "@/lib/redux/features/orders/ordersApi";
import { Order } from "@/types/order.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);

  const { data: order, isLoading, error } = useGetOrderQuery(orderId);
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();
  const [updatePaymentStatus, { isLoading: isUpdatingPayment }] =
    useUpdatePaymentStatusMutation();

  const [selectedStatus, setSelectedStatus] =
    useState<Order["status"]>("pending");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<Order["paymentStatus"]>("pending");
  const [adminNote, setAdminNote] = useState("");

  // Update local state when order loads
  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setSelectedPaymentStatus(order.paymentStatus);
      setAdminNote(order.adminNote || "");
    }
  }, [order]); // Run when order data loads

  const handleSaveAdminNote = async () => {
    if (!order) return;
    try {
      await updateOrderStatus({
        id: orderId,
        data: {
          status: order.status, // Keep current status
          adminNote: adminNote || undefined,
        },
      }).unwrap();
      alert("Admin note saved successfully!");
    } catch (err) {
      console.error("Failed to save admin note:", err);
      alert("Failed to save admin note");
    }
  };

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
      month: "long",
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

  const handleUpdateOrderStatus = async () => {
    try {
      await updateOrderStatus({
        id: orderId,
        data: {
          status: selectedStatus,
          adminNote: adminNote || undefined,
        },
      }).unwrap();
      alert("Order status updated successfully!");
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      await updatePaymentStatus({
        id: orderId,
        data: {
          paymentStatus: selectedPaymentStatus,
        },
      }).unwrap();
      alert("Payment status updated successfully!");
    } catch (err) {
      console.error("Failed to update payment status:", err);
      alert("Failed to update payment status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link href={ROUTES.ADMIN_ORDERS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-primary font-medium">Order not found</p>
              <p className="text-gray-500 text-sm mt-2">
                The order you're looking for doesn't exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.ADMIN_ORDERS}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-gray-600 mt-1">{order.orderNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={`${getStatusColor(order.status)} text-sm px-4 py-2`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
              <CardDescription>
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}{" "}
                in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>
                      {item.productSku && (
                        <p className="text-sm text-gray-500">
                          SKU: {item.productSku}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm text-gray-600">×</span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">
                    {formatCurrency(order.shippingCost)}
                  </span>
                </div>
                {parseFloat(order.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">
                      {formatCurrency(order.tax)}
                    </span>
                  </div>
                )}
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600">Name</Label>
                <p className="font-medium">{order.shippingFullName}</p>
              </div>
              <div>
                <Label className="text-gray-600">Email</Label>
                <p className="font-medium">{order.shippingEmail}</p>
              </div>
              <div>
                <Label className="text-gray-600">Phone</Label>
                <p className="font-medium">{order.shippingPhone}</p>
              </div>
              {order.user && (
                <div className="pt-4 border-t">
                  <Label className="text-gray-600">Account</Label>
                  <p className="font-medium">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{order.user.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.shippingFullName}</p>
                <p className="text-gray-600">{order.shippingAddressLine1}</p>
                {order.shippingAddressLine2 && (
                  <p className="text-gray-600">{order.shippingAddressLine2}</p>
                )}
                {order.shippingLandmark && (
                  <p className="text-gray-600">
                    Landmark: {order.shippingLandmark}
                  </p>
                )}
                <p className="text-gray-600">
                  {order.shippingCity}
                  {order.shippingProvince && `, ${order.shippingProvince}`}{" "}
                  {order.shippingPostalCode}
                </p>
                <p className="text-gray-600">{order.shippingCountry}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.customerNote && (
                <div>
                  <Label className="text-gray-600">Customer Note</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                    {order.customerNote}
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="adminNote">Admin Note</Label>
                <Textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add notes for internal reference..."
                  rows={4}
                  className="mt-1"
                />
                <Button
                  onClick={handleSaveAdminNote}
                  disabled={
                    isUpdatingStatus || adminNote === (order.adminNote || "")
                  }
                  className="mt-2"
                  variant="outline"
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Admin Note
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Order Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>
                Update the order fulfillment status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orderStatus">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as Order["status"])
                  }
                >
                  <SelectTrigger id="orderStatus" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleUpdateOrderStatus}
                disabled={isUpdatingStatus || selectedStatus === order.status}
                className="w-full"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Order Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Payment Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600">Payment Method</Label>
                <p className="font-medium mt-1 capitalize">
                  {order.paymentMethod.replace("_", " ")}
                </p>
              </div>
              {order.transactionNumber && (
                <div>
                  <Label className="text-gray-600">Transaction Number</Label>
                  <p className="font-medium mt-1">{order.transactionNumber}</p>
                </div>
              )}
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={selectedPaymentStatus}
                  onValueChange={(value) =>
                    setSelectedPaymentStatus(value as Order["paymentStatus"])
                  }
                >
                  <SelectTrigger id="paymentStatus" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleUpdatePaymentStatus}
                disabled={
                  isUpdatingPayment ||
                  selectedPaymentStatus === order.paymentStatus
                }
                className="w-full"
                variant="outline"
              >
                {isUpdatingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Payment Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-gray-600">Created</Label>
                <p className="text-sm mt-1">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <Label className="text-gray-600">Last Updated</Label>
                <p className="text-sm mt-1">{formatDate(order.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Discount Information */}
          {(order.discountCode || parseFloat(order.discount) > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Discount Applied</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.discountCode && (
                  <div>
                    <Label className="text-gray-600">Code</Label>
                    <p className="font-medium mt-1">{order.discountCode}</p>
                  </div>
                )}
                <div>
                  <Label className="text-gray-600">Amount</Label>
                  <p className="font-medium mt-1 text-green-600">
                    -{formatCurrency(order.discount)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
