import type { RootState } from "@/shared/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectCartCount = (state: RootState) => state.cart.items.reduce((sum, item) => sum + (item.amount ?? 1), 0);

export const selectCartItems = (s: RootState) => s.cart.items;
export const selectCartQtyMap = createSelector([selectCartItems], (items) => {
  const map: Record<string, number> = {};
  for (const i of items) map[i.id] = i.amount;
  return map;
});
