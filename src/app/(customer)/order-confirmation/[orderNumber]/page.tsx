"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { CONTACT } from "@/config/brand";
import { RootState } from "@/lib/redux/store";
import { useGetOrderByNumberQuery } from "@/lib/redux/features/orders/ordersApi";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order.types";

const PAYMENT_LABELS: Record<Order["paymentMethod"], string> = {
  cod: "Cash on delivery",
  esewa: "eSewa QR",
  khalti: "Khalti",
  bank_transfer: "Bank transfer",
};

const NEXT_STEPS = [
  { title: "Confirmation", body: "A confirmation email with your order details is on its way." },
  { title: "Preparation", body: "We verify your order and pack it for dispatch." },
  { title: "Delivery", body: "Your order arrives within 2–3 business days." },
];

const eyebrowClass =
  "font-inter text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

/*
 * Shown after checkout. Fills the viewport below the navbar: the confirmation
 * and next steps on the left, the order itself on the right. The summary is
 * fetched by order number (guests pass their email, which the server checks);
 * if it can't be loaded the page falls back to the left column alone.
 */
export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const email = useSearchParams().get("email") ?? undefined;
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: order, isLoading } = useGetOrderByNumberQuery({ orderNumber, email });
  const showSummary = isLoading || !!order;

  return (
    <section className="page-wrapper flex min-h-[calc(100dvh-var(--nav-h))] items-center py-8 lg:py-10">
      <div
        className={`mx-auto grid w-full items-start gap-10 lg:gap-16 ${
          showSummary ? "max-w-6xl lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : "max-w-2xl"
        }`}
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4.5 w-4.5" strokeWidth={2.5} />
            </span>
            <p className={eyebrowClass}>Order confirmed</p>
          </div>
          <h1 className="mt-5 font-montserrat text-[30px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#111111] lg:text-[44px]">
            Thank you for your order<span className="text-(--brand-accent)">.</span>
          </h1>
          <p className="mt-4 max-w-md font-inter text-[15px] leading-relaxed text-[#555555]">
            We&apos;ve received your order and it&apos;s now being processed.
            {order && (
              <>
                {" "}A confirmation has been sent to{" "}
                <span className="wrap-anywhere font-medium text-[#111111]">{order.shippingEmail}</span>.
              </>
            )}
          </p>

          <OrderMeta orderNumber={orderNumber} order={order} />

          <div className="mt-8">
            <h2 className={eyebrowClass}>What happens next</h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-6">
              {NEXT_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-3 sm:flex-col sm:gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-(--hairline-strong) font-montserrat text-[12px] font-semibold text-[#111111]">
                    {i + 1}
                  </span>
                  <div className="pt-0.5 sm:pt-0">
                    <p className="font-montserrat text-[14px] font-semibold text-[#111111]">{step.title}</p>
                    <p className="mt-0.5 font-inter text-[13px] leading-relaxed text-[#555555]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.PRODUCTS}
              className="inline-flex items-center justify-center gap-2 rounded-[3px] bg-primary px-6 py-3 font-inter text-sm font-medium text-primary-foreground transition-colors hover:bg-(--primary-hover) active:bg-(--primary-active)"
            >
              Continue shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
            {isAuthenticated && (
              <Link
                href={ROUTES.ORDERS_HISTORY}
                className="inline-flex items-center justify-center rounded-[3px] border border-(--hairline-strong) px-6 py-3 font-inter text-sm font-medium text-[#111111] transition-colors hover:bg-secondary"
              >
                View my orders
              </Link>
            )}
          </div>

          <p className="mt-8 border-t border-border pt-5 font-inter text-[13px] leading-relaxed text-muted-foreground">
            Questions about your order? Email{" "}
            <a href={`mailto:${CONTACT.email}`} className="text-[#111111] underline underline-offset-2 hover:text-(--brand-accent)">
              {CONTACT.email}
            </a>{" "}
            or call{" "}
            <a href={`tel:${CONTACT.phone.tel}`} className="whitespace-nowrap text-[#111111] underline underline-offset-2 hover:text-(--brand-accent)">
              {CONTACT.phone.label}
            </a>
            .
          </p>
        </div>

        {showSummary && (order ? <OrderSummaryCard order={order} /> : <SummarySkeleton />)}
      </div>
    </section>
  );
}

function OrderMeta({ orderNumber, order }: { orderNumber: string; order?: Order }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions); the number is still selectable.
    }
  };

  const placedOn = order
    ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-5 sm:grid-cols-[auto_1fr_1fr]">
      <div className="col-span-2 sm:col-span-1">
        <dt className={eyebrowClass}>Order number</dt>
        <dd className="mt-1.5 flex items-center gap-2">
          <span className="break-all font-montserrat text-[15px] sm:break-normal sm:whitespace-nowrap font-semibold text-[#111111]">{orderNumber}</span>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Order number copied" : "Copy order number"}
            className="shrink-0 rounded-[3px] p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-[#111111]"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </dd>
      </div>
      {order && (
        <>
          <div>
            <dt className={eyebrowClass}>Placed on</dt>
            <dd className="mt-1.5 font-inter text-[15px] text-[#111111]">{placedOn}</dd>
          </div>
          <div>
            <dt className={eyebrowClass}>Payment</dt>
            <dd className="mt-1.5 font-inter text-[15px] text-[#111111]">{PAYMENT_LABELS[order.paymentMethod]}</dd>
          </div>
        </>
      )}
    </dl>
  );
}

function OrderSummaryCard({ order }: { order: Order }) {
  const itemCount = order.items.reduce((n, item) => n + item.quantity, 0);
  const discount = Number(order.discount);
  const tax = Number(order.tax);
  const shipping = Number(order.shippingCost);
  const address = [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    order.shippingLandmark,
    order.shippingCity,
    order.shippingProvince,
  ].filter(Boolean);

  return (
    <aside className="rounded-md border border-border bg-[#FAFAFA] p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-montserrat text-[16px] font-semibold text-[#111111]">Order summary</h2>
        <span className="font-inter text-[13px] text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <ul className="mt-5 max-h-72 divide-y divide-border overflow-y-auto pr-1">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[3px] border border-border bg-white">
              {item.productImage && (
                <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-montserrat text-[13px] font-medium leading-snug text-[#111111]">
                {item.productName}
              </p>
              <p className="mt-0.5 font-inter text-[12px] text-muted-foreground">Qty {item.quantity}</p>
            </div>
            <p className="shrink-0 font-inter text-[13px] font-medium text-[#111111]">
              {formatPrice(Number(item.subtotal))}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-border pt-4 font-inter text-[14px]">
        <SummaryRow label="Subtotal" value={formatPrice(Number(order.subtotal))} />
        <SummaryRow label="Shipping" value={shipping > 0 ? formatPrice(shipping) : "Free"} />
        {tax > 0 && <SummaryRow label="Tax" value={formatPrice(tax)} />}
        {discount > 0 && (
          <SummaryRow
            label={order.discountCode ? `Discount (${order.discountCode})` : "Discount"}
            value={`− ${formatPrice(discount)}`}
          />
        )}
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <dt className="font-montserrat font-semibold text-[#111111]">Total</dt>
          <dd className="font-montserrat text-[18px] font-semibold text-[#111111]">{formatPrice(Number(order.total))}</dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className={eyebrowClass}>Delivering to</h3>
        <address className="mt-2 font-inter text-[14px] not-italic leading-relaxed text-[#555555]">
          <span className="font-medium text-[#111111]">{order.shippingFullName}</span>
          <br />
          {address.join(", ")}
          <br />
          {order.shippingPhone}
        </address>
      </div>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#555555]">{label}</dt>
      <dd className="text-[#111111]">{value}</dd>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="animate-pulse rounded-md border border-border bg-[#FAFAFA] p-5 sm:p-6" aria-hidden>
      <div className="h-4 w-32 rounded bg-[#E9E9E9]" />
      {[0, 1].map((i) => (
        <div key={i} className="mt-5 flex items-center gap-3">
          <div className="h-14 w-14 rounded-[3px] bg-[#E9E9E9]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-[#E9E9E9]" />
            <div className="h-3 w-1/4 rounded bg-[#E9E9E9]" />
          </div>
        </div>
      ))}
      <div className="mt-6 space-y-2 border-t border-border pt-4">
        <div className="h-3 w-full rounded bg-[#E9E9E9]" />
        <div className="h-3 w-full rounded bg-[#E9E9E9]" />
        <div className="h-4 w-full rounded bg-[#E9E9E9]" />
      </div>
    </div>
  );
}
