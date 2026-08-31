"use client";

import { useGetAdminBrandsQuery } from "@/lib/redux/features/brands/brandsApi";

interface Props {
  /** Currently selected brand ids. */
  value: number[];
  onChange: (ids: number[]) => void;
  /** The vendor being edited (so their own brands read as "assigned", not "taken"). */
  currentVendorId?: number;
  /**
   * Create-vendor mode: show ONLY currently-unassigned brands (a brand-new
   * vendor can only be given brands nobody owns yet).
   */
  onlyUnassigned?: boolean;
}

/**
 * Superadmin-only checkbox grid for assigning brands to a vendor.
 *
 * - Detail mode: shows ALL brands, each labeled "unassigned" / "already
 *   assigned" (never the other vendor's name). Checking (re)assigns to this
 *   vendor; unchecking releases it.
 * - onlyUnassigned mode (create vendor): shows only brands nobody owns yet.
 */
export default function BrandAssignment({
  value,
  onChange,
  currentVendorId,
  onlyUnassigned,
}: Props) {
  const { data: brandsData, isLoading } = useGetAdminBrandsQuery();

  const all = brandsData?.data ?? [];
  const brands = onlyUnassigned ? all.filter((b) => b.ownerId == null) : all;

  const toggle = (id: number) =>
    onChange(
      value.includes(id) ? value.filter((x) => x !== id) : [...value, id]
    );

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading brands…</p>;
  }
  if (brands.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {onlyUnassigned
          ? "No unassigned brands available."
          : "No brands available yet."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {brands.map((b) => {
        const checked = value.includes(b.id);
        const assignedElsewhere =
          b.ownerId != null && b.ownerId !== currentVendorId;
        return (
          <label
            key={b.id}
            className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer transition-colors ${
              checked
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(b.id)}
              className="w-4 h-4 accent-primary shrink-0"
            />
            <span className="text-sm truncate">{b.name}</span>
            {!onlyUnassigned && (
              <span
                className={`ml-auto text-[11px] shrink-0 ${
                  assignedElsewhere ? "text-amber-600" : "text-gray-400"
                }`}
              >
                {b.ownerId == null ? "unassigned" : "already assigned"}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
