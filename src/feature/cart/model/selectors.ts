import type { RootState } from "@/shared/store";

export const selectCartCount = (state: RootState) => state.cart.items.reduce((sum, item) => sum + (item.amount ?? 1), 0);
