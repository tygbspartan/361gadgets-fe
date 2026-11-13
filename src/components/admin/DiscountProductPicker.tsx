"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetAdminProductsQuery } from "@/lib/redux/features/products/productsApi";

export interface PickedProduct {
  id: number;
  name: string;
}

interface Props {
  value: PickedProduct[];
  onChange: (products: PickedProduct[]) => void;
  // Superadmin codes cover the whole cart by default; a vendor's cover only
  // their own products. Used for the "nothing selected" hint.
  isPlatform: boolean;
}

/*
 * Optional product restriction for a discount. Searches the admin product
 * list, which the server already limits to the vendor's own products, so a
 * vendor can't pick anyone else's.
 */
export default function DiscountProductPicker({ value, onChange, isPlatform }: Props) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce typing so each keystroke isn't a request.
  useEffect(() => {
    const t = window.setTimeout(() => setSearch(input.trim()), 300);
    return () => window.clearTimeout(t);
  }, [input]);

  const { data, isFetching } = useGetAdminProductsQuery({
    page: 1,
    limit: 8,
    search: search || undefined,
  });
  const results = data?.data.data ?? [];
  const selectedIds = new Set(value.map((p) => p.id));

  const toggle = (product: PickedProduct) =>
    onChange(
      selectedIds.has(product.id)
        ? value.filter((p) => p.id !== product.id)
        : [...value, { id: product.id, name: product.name }],
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {value.length === 0
          ? isPlatform
            ? "No products selected: the code applies to the whole cart."
            : "No products selected: the code applies to all of your products in the cart."
          : `The code only applies to ${value.length} selected product${value.length === 1 ? "" : "s"}.`}
      </p>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((p) => (
            <span
              key={p.id}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-gray-50 py-1 pl-3 pr-1.5 text-sm"
            >
              <span className="truncate">{p.name}</span>
              <button
                type="button"
                onClick={() => toggle(p)}
                aria-label={`Remove ${p.name}`}
                className="rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-sm text-gray-500 underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search products by name or SKU"
          className="pl-9"
          aria-label="Search products to restrict this discount to"
        />
      </div>

      <ul className="max-h-64 divide-y overflow-y-auto rounded-md border" aria-busy={isFetching}>
        {results.length === 0 ? (
          <li className="px-3 py-4 text-center text-sm text-gray-500">
            {isFetching ? "Searching…" : "No products found"}
          </li>
        ) : (
          results.map((product) => (
            <li key={product.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedIds.has(product.id)}
                  onChange={() => toggle(product)}
                  className="h-4 w-4 shrink-0 accent-black"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{product.name}</span>
                  {product.sku && (
                    <span className="block text-xs text-gray-500">SKU {product.sku}</span>
                  )}
                </span>
                <span className="shrink-0 text-sm text-gray-600">
                  Rs {Number(product.price).toLocaleString("en-IN")}
                </span>
              </label>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
