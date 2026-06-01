"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

/**
 * Clears the cart once, on mount — rendered on the success page after a
 * confirmed payment so the purchased course doesn't linger in the cart.
 */
export function ClearCart(): null {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
