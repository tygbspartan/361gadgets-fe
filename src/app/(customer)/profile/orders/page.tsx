"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import EmptyState from "@/components/ui/EmptyState";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { RootState } from "@/lib/redux/store";
import { useGetUserOrdersQuery } from "@/lib/redux/features/orders/ordersApi";
import { useGetMyReviewsQuery } from "@/lib/redux/features/reviews/reviewsApi";
import { useAddToCartMutation } from "@/lib/redux/features/cart/cartApi";
import { Order } from "@/types/order.types";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/components/ui/ToastStack";
import ProfileNavMobile from "@/components/profile/ProfileNavMobile";

export default function ProfileOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [page, setPage] = useState(1);
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  const { data, isLoading } = useGetUserOrdersQuery(
    { page, limit: 10 },
    { skip: !isAuthenticated }
  );

  const { data: myReviews } = useGetMyReviewsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const reviewedProductIds = new Set(myReviews?.map((r) => r.productId) ?? []);

  const [addToCart] = useAddToCartMutation();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) router.push(ROUTES.LOGIN);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    try {
      for (const item of order.items) {
        await addToCart({ productId: item.productId, quantity: item.quantity }).unwrap();
      }
      showToast({ icon: "hugeicons:shopping-cart-check-in-02", title: "Added to Cart!", variant: "positive" });
    } catch {
      // silent — cart errors don't block the user
    } finally {
      setReorderingId(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const STATUS_STYLES: Record<string, { cls: string; label: string }> = {
    pending:    { cls: "bg-[#FFFBEB] border-[#FBBF24] text-[#FBBF24]",   label: "Pending" },
    confirmed:  { cls: "bg-[#ECFDF5] border-[#34D399] text-[#34D399]",   label: "Confirmed" },
    processing: { cls: "bg-[#EEF2FF] border-[#818CF8] text-[#818CF8]",   label: "Processing" },
    shipped:    { cls: "bg-[#E27A301A] border-[#E27A30] text-[#E27A30]", label: "Shipped" },
    delivered:  { cls: "bg-[#ECFDF5] border-[#0B6343] text-[#0B6343]",   label: "Delivered" },
    cancelled:  { cls: "bg-[#FEF2F2] border-[#F87171] text-[#F87171]",   label: "Cancelled" },
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Title — centered on mobile */}
      <div className="w-fit mx-auto lg:mx-0 text-center">
        <h1 className="font-montserrat font-medium text-[18px] lg:text-[24px] leading-none text-black">
          My Orders
        </h1>
        <div className="h-0.5 bg-primary mt-1.5" />
      </div>

      {/* Mobile: User Settings dropdown */}
      <ProfileNavMobile />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="lets-icons:order-light"
          title="No orders yet."
          description="You haven't placed any orders yet."
          buttonText="Start shopping"
          className="py-16"
        />
      ) : (
        <>
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const total = parseFloat(order.total);
              const isReordering = reorderingId === order.id;
              const s = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
              const statusBadge = (
                <span className={`rounded-full border py-0.5 px-2.5 font-inter font-medium text-[14px] leading-5.5 ${s.cls}`}>
                  {s.label}
                </span>
              );

              return (
                <div
                  key={order.id}
                  className="border border-[#E2E4E5] rounded-lg px-5 lg:px-8 py-5 flex flex-col gap-3.75"
                >
                  {/* Card Header — order number (+ status on desktop) + date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-montserrat font-semibold text-[18px] lg:text-[20px] leading-7 text-black">
                        {order.orderNumber}
                      </span>
                      {/* Status — right of order number on desktop */}
                      <span className="hidden lg:inline-flex">{statusBadge}</span>
                    </div>
                    <span className="font-montserrat font-normal text-[12px] lg:text-[16px] leading-4 lg:leading-none text-[#454545]">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Status — below on mobile only */}
                  <div className="lg:hidden flex justify-start">{statusBadge}</div>

                  {/* Items */}
                  <div className="flex flex-col">
                    {order.items.map((item) => {
                      const price = parseFloat(item.price);
                      const itemTotal = parseFloat(item.subtotal);

                      return (
                        <div key={item.id}>
                          <div className="flex items-start gap-5 py-2.5 lg:py-4">
                            {/* Image + bubble */}
                            <div className="relative shrink-0 w-17.5 h-17.5 lg:w-18.75 lg:h-18.75">
                              <Link href={item.product?.slug ? `${ROUTES.PRODUCT}/${item.product.slug}` : "#"} className="block w-full h-full overflow-hidden bg-[#F8F8F8] border border-[#C9C9C9]">
                                {item.productImage ? (
                                  <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100" />
                                )}
                              </Link>
                              <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
                                <span className="font-inter font-normal text-[12.5px] leading-none text-white">
                                  {item.quantity}
                                </span>
                              </div>
                            </div>

                            {/* Name / brand / price × qty */}
                            <div className="flex-1 min-w-0 flex flex-col gap-1.75 pt-1">
                              <Link href={item.product?.slug ? `${ROUTES.PRODUCT}/${item.product.slug}` : "#"}>
                                <p className="font-montserrat font-medium text-[14px] lg:text-[16px] leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors">
                                  {item.productName}
                                </p>
                              </Link>
                              {item.product?.brand && (
                                <p className="font-montserrat font-medium text-[12px] lg:text-[16px] leading-none text-[#4B4B4B]">
                                  {item.product.brand.name}
                                </p>
                              )}
                              <p className="font-montserrat font-medium text-[12px] lg:text-[16px] leading-none text-[#4B4B4B]">
                                Rs. {price.toLocaleString("en-NP")} × {item.quantity}
                              </p>
                            </div>

                            {/* Review link (top) + item total (bottom) */}
                            <div className="shrink-0 self-stretch flex flex-col justify-between items-end pt-1">
                              {reviewedProductIds.has(item.productId) ? (
                                <Link
                                  href={item.product?.slug ? `${ROUTES.PRODUCT}/${item.product.slug}` : "#"}
                                  className="font-montserrat font-medium text-[12px] lg:text-[16px] leading-none underline text-[#4B4B4B] hover:text-primary transition-colors"
                                >
                                  View review
                                </Link>
                              ) : (
                                <Link
                                  href={item.product?.slug ? `${ROUTES.PRODUCT}/${item.product.slug}#write-review` : "#"}
                                  className="font-montserrat font-medium text-[12px] lg:text-[16px] leading-none underline text-[#4B4B4B] hover:text-primary transition-colors"
                                >
                                  Leave a review
                                </Link>
                              )}
                              <span className="font-montserrat font-semibold text-[12px] lg:text-[16px] leading-none text-black">
                                Rs. {itemTotal.toLocaleString("en-NP")}
                              </span>
                            </div>
                          </div>

                          {/* Divider after every item */}
                          <div className="border-t border-[#B9B7B7]" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Footer — reorder (left) + total (right) */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleReorder(order)}
                      disabled={isReordering}
                      className="flex items-center justify-center border border-black bg-white text-black font-inter font-medium text-[10px] lg:text-base leading-none lg:leading-6 uppercase rounded-[3px] h-6 lg:h-auto px-3.25 lg:px-3.75 py-0 lg:py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isReordering ? "Adding…" : "Reorder"}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="font-inter font-normal text-[14px] lg:text-[16px] leading-none text-[#4B4B4B]">
                        Total:
                      </span>
                      <span className="font-inter font-semibold text-[16px] lg:text-[20px] leading-none text-black">
                        Rs. {total.toLocaleString("en-NP")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed font-inter text-sm"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                if (p === 1 || p === pagination.totalPages || (p >= page - 1 && p <= page + 1)) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 border rounded-lg font-inter text-sm ${
                        p === page
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return <span key={p} className="px-2 self-center">…</span>;
                }
                return null;
              })}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed font-inter text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
