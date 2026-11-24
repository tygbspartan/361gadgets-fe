"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import type { Product } from "@/types/product.types";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToastHelpers } from "@/components/ui/ToastStack";
import {
  COMPARE_MAX,
  addCompare,
  clearCompare,
  removeCompare,
  replaceCompare,
  toCompareItem,
} from "./compareSlice";

/*
 * Compare list rules, shared by the card toggle and the product page button:
 *   - up to 3 products;
 *   - all from the same product group (e.g. Wireless Earbuds), so their specs
 *     line up. Adding one from another group offers to start a new list.
 */
export function useCompare() {
  const dispatch = useDispatch();
  const items = useSelector((s: RootState) => s.compare.items);
  const confirm = useConfirm();
  const { toastError } = useToastHelpers();

  const isCompared = (id: number) => items.some((i) => i.id === id);

  const toggle = async (product: Product) => {
    if (isCompared(product.id)) {
      dispatch(removeCompare(product.id));
      return;
    }
    const item = toCompareItem(product);
    const group = items[0];
    if (group && group.categoryId !== item.categoryId) {
      const ok = await confirm({
        title: "Start a new comparison?",
        message: `Products can only be compared with others of the same type. Your list has ${
          group.categoryName ?? "other products"
        }. Start a new comparison with ${product.name}?`,
        confirmText: "Start new",
        cancelText: "Keep current",
      });
      if (ok) dispatch(replaceCompare(item));
      return;
    }
    if (items.length >= COMPARE_MAX) {
      toastError(`You can compare up to ${COMPARE_MAX} products`, "Remove one from the compare bar first.");
      return;
    }
    dispatch(addCompare(item));
  };

  return {
    items,
    isCompared,
    toggle,
    remove: (id: number) => dispatch(removeCompare(id)),
    clear: () => dispatch(clearCompare()),
  };
}
