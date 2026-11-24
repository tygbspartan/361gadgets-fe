"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import type { Product } from "@/types/product.types";
import { useCompareProductsQuery } from "@/lib/redux/features/products/productsApi";
import { useCompare } from "@/lib/redux/features/compare/useCompare";
import { COMPARE_MAX } from "@/lib/redux/features/compare/compareSlice";
import { useCart } from "@/lib/redux/features/cart/useCart";
import { useToast } from "@/components/ui/ToastStack";
import { StarDisplay } from "@/components/productDetailPage/shared";
import CompareSkeleton from "./CompareSkeleton";
import { ROUTES } from "@/constants/routes";

type CompareProduct = Product & { averageRating?: number; reviewCount?: number };

/** A table row: a label and one cell per product. `compareKey` is the text
 *  used to decide whether the products differ (for "show only differences"). */
interface Row {
  label: string;
  cells: React.ReactNode[];
  compareKey?: string[];
}

const rs = (n: number) => `Rs. ${n.toLocaleString()}`;
const dash = <span className="text-[#AAAAAA]">—</span>;

/** Ids from ?ids=1,2,3 (a shared link), else the ones picked on this device. */
function useCompareIds(): number[] {
  const params = useSearchParams();
  const { items } = useCompare();
  const fromUrl = (params.get("ids") ?? "")
    .split(",")
    .map((v) => parseInt(v, 10))
    .filter((n) => Number.isInteger(n) && n > 0);
  const ids = fromUrl.length ? fromUrl : items.map((i) => i.id);
  return [...new Set(ids)].slice(0, COMPARE_MAX);
}

export default function CompareView() {
  const router = useRouter();
  const ids = useCompareIds();
  const { remove } = useCompare();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [onlyDiff, setOnlyDiff] = useState(false);

  const { data, isFetching, isError } = useCompareProductsQuery(ids, { skip: ids.length < 2 });
  const products = useMemo(() => (data?.products ?? []) as CompareProduct[], [data]);
  const specKeys = useMemo(() => data?.specKeys ?? [], [data]);

  const removeProduct = (id: number) => {
    remove(id);
    const next = ids.filter((x) => x !== id);
    router.replace(next.length ? `${ROUTES.COMPARE}?ids=${next.join(",")}` : ROUTES.COMPARE);
  };

  const addToCart = async (p: CompareProduct) => {
    try {
      await addItem(p, 1);
      showToast({ icon: "hugeicons:shopping-cart-check-in-02", title: "Added to Cart!", variant: "positive" });
    } catch {
      showToast({ icon: "mdi:alert-circle", title: "Couldn't add to cart", variant: "negative" });
    }
  };

  const rows: Row[] = useMemo(() => {
    const specValue = (p: CompareProduct, key: string) =>
      p.specifications?.find((s) => s.key === key)?.value?.trim() ?? "";
    const stock = (p: CompareProduct) =>
      p.stockQuantity <= 0 ? "Out of stock" : p.stockStatus === "low_stock" ? "Only a few left" : "In stock";
    const colours = (p: CompareProduct) => (p.colors ?? []).map((c) => c.name).join(", ");

    return [
      {
        label: "Rating",
        compareKey: products.map((p) => `${p.averageRating ?? 0}/${p.reviewCount ?? 0}`),
        cells: products.map((p) =>
          p.reviewCount ? (
            <div key={p.id} className="flex flex-wrap items-center gap-1.5">
              <StarDisplay rating={p.averageRating ?? 0} size={14} />
              <span className="text-[#555555]">
                {p.averageRating?.toFixed(1)} ({p.reviewCount})
              </span>
            </div>
          ) : (
            <span key={p.id} className="text-[#888888]">No reviews yet</span>
          )
        ),
      },
      {
        label: "Availability",
        compareKey: products.map(stock),
        cells: products.map((p) => (
          <span key={p.id} className={p.stockQuantity <= 0 ? "text-(--brand-accent)" : "text-[#1B7A3D]"}>
            {stock(p)}
          </span>
        )),
      },
      {
        label: "Brand",
        compareKey: products.map((p) => p.brand?.name ?? ""),
        cells: products.map((p) =>
          p.brand ? (
            <Link key={p.id} href={`${ROUTES.BRAND}/${p.brand.slug}`} className="underline-offset-4 hover:underline">
              {p.brand.name}
            </Link>
          ) : (
            <span key={p.id}>{dash}</span>
          )
        ),
      },
      {
        label: "Colours",
        compareKey: products.map(colours),
        cells: products.map((p) => <span key={p.id}>{colours(p) || dash}</span>),
      },
      ...specKeys.map((key) => ({
        label: key,
        compareKey: products.map((p) => specValue(p, key).toLowerCase()),
        cells: products.map((p) => <span key={p.id}>{specValue(p, key) || dash}</span>),
      })),
    ];
  }, [products, specKeys]);

  // Not enough picked yet
  if (ids.length < 2) {
    return (
      <div className="page-wrapper py-10 text-center">
        <Icon icon="mdi:compare-horizontal" className="mx-auto h-12 w-12 text-[#BBBBBB]" />
        <h1 className="mt-4 font-montserrat text-[22px] font-semibold text-black lg:text-[26px]">Compare products</h1>
        <p className="mx-auto mt-3 max-w-md font-inter text-[14px] leading-6 text-[#555555]">
          Pick 2 or 3 products of the same type with the <strong>Compare</strong> button on any product,
          then come back here to see them side by side.
        </p>
        <Link
          href={ROUTES.PRODUCTS}
          className="btn-accent mt-6 inline-flex rounded-[8px] px-6 py-3 font-inter text-[13px] font-semibold uppercase tracking-wide"
        >
          Browse products
        </Link>
      </div>
    );
  }

  if (isFetching && !data) return <CompareSkeleton />;

  if (isError || products.length < 2) {
    return (
      <div className="page-wrapper py-10 text-center">
        <h1 className="font-montserrat text-[22px] font-semibold text-black">Compare products</h1>
        <p className="mt-3 font-inter text-[14px] text-[#555555]">
          {isError
            ? "We couldn't load these products. Please try again."
            : "Some of these products are no longer available. Pick another one to compare."}
        </p>
        <Link href={ROUTES.PRODUCTS} className="mt-4 inline-block font-inter text-[14px] font-medium underline underline-offset-4">
          Browse products
        </Link>
      </div>
    );
  }

  const differs = (r: Row) => !r.compareKey || new Set(r.compareKey).size > 1;
  const visibleRows = onlyDiff ? rows.filter(differs) : rows;
  const cols = products.length;
  // Sticky label column + one column per product. On phones the product
  // columns have a fixed width (long values wrap) and the table scrolls sideways.
  const grid =
    cols === 3
      ? "grid-cols-[7.5rem_repeat(3,11rem)] lg:grid-cols-[12rem_repeat(3,minmax(0,1fr))]"
      : "grid-cols-[7.5rem_repeat(2,11rem)] lg:grid-cols-[12rem_repeat(2,minmax(0,1fr))]";
  const labelCell =
    "sticky left-0 z-10 bg-[#F6F6F6] px-3 py-3 font-inter text-[12px] font-medium text-[#111111] lg:px-4 lg:text-[14px]";
  const valueCell = "px-3 py-3 font-inter text-[13px] leading-5 text-[#333333] break-words lg:px-4 lg:text-[14px]";

  return (
    <div className="page-wrapper">
      <div className="flex justify-center">
        <div className="w-fit">
          <h1 className="text-center font-montserrat text-[22px] font-semibold leading-tight text-black lg:text-[28px]">
            Compare Products
          </h1>
          <div className="heading-rule -mx-5 mt-2" />
        </div>
      </div>
      {products[0]?.category?.name && (
        <p className="mt-3 text-center font-inter text-[14px] text-[#555555]">{products[0].category.name}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 font-inter text-[13px] font-medium text-[#111111] lg:text-sm">
          <input
            type="checkbox"
            checked={onlyDiff}
            onChange={(e) => setOnlyDiff(e.target.checked)}
            className="h-4 w-4 accent-[#111111]"
          />
          Show only differences
        </label>
        {cols < COMPARE_MAX && products[0]?.category?.slug && (
          <Link
            href={`${ROUTES.CATEGORY}/${products[0].category.slug}`}
            className="font-inter text-[13px] font-medium text-[#111111] underline underline-offset-4 lg:text-sm"
          >
            + Add another {products[0].category.name ?? "product"}
          </Link>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E5E5]">
        <div className={`grid min-w-max lg:min-w-0 ${grid}`}>
          {/* Product header: image, name, price, add to cart, remove */}
          <div className={`${labelCell} border-b border-[#EBEBEB]`} />
          {products.map((p) => {
            const img = p.images?.find((i) => i.isPrimary)?.imageUrl ?? p.images?.[0]?.imageUrl;
            const original = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : null;
            const oos = p.stockQuantity <= 0;
            return (
              <div key={p.id} className="relative flex flex-col gap-2 border-b border-[#EBEBEB] p-3 lg:p-4">
                <button
                  type="button"
                  onClick={() => removeProduct(p.id)}
                  aria-label={`Remove ${p.name} from comparison`}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-[#555555] shadow-(--elev-1) hover:text-[#111111]"
                >
                  <Icon icon="mdi:close" width={14} height={14} />
                </button>
                <Link href={`${ROUTES.PRODUCT}/${p.slug}`} className="relative mx-auto block aspect-square w-full max-w-36 overflow-hidden rounded-xl bg-gray-50 lg:max-w-48">
                  {img ? (
                    <Image src={img} alt={p.name} fill sizes="(min-width: 1024px) 192px, 144px" className="object-cover" />
                  ) : null}
                </Link>
                <Link
                  href={`${ROUTES.PRODUCT}/${p.slug}`}
                  className="font-montserrat text-[13px] font-medium leading-snug text-[#111111] line-clamp-2 hover:underline lg:text-[15px]"
                >
                  {p.name}
                </Link>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-inter text-[15px] font-bold text-[#111111] lg:text-[17px]">{rs(p.price)}</span>
                  {original && (
                    <span className="font-inter text-[12px] text-[#888888] line-through">{rs(original)}</span>
                  )}
                </div>
                {original && (
                  <span className="w-fit rounded bg-[#E7F6EC] px-1.5 py-0.5 font-inter text-[11px] font-semibold text-[#1B7A3D]">
                    Save {rs(original - p.price)}
                    {p.discountPercentage ? ` (${p.discountPercentage}%)` : ""}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => addToCart(p)}
                  disabled={oos}
                  className="btn-accent mt-auto h-9 rounded-[8px] font-inter text-[12px] font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-40 lg:h-10 lg:text-[13px]"
                >
                  {oos ? "Out of stock" : "Add to cart"}
                </button>
              </div>
            );
          })}

          {/* Detail rows */}
          {visibleRows.map((row) => (
            <div key={row.label} className="contents">
              <div className={`${labelCell} border-b border-[#EBEBEB]`}>{row.label}</div>
              {row.cells.map((cell, i) => (
                <div key={i} className={`${valueCell} border-b border-[#EBEBEB]`}>
                  {cell}
                </div>
              ))}
            </div>
          ))}
          {onlyDiff && visibleRows.length === 0 && (
            <div className="col-span-full px-4 py-6 text-center font-inter text-[14px] text-[#555555]">
              These products don&apos;t differ in any listed detail other than price.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
