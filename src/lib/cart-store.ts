"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/events-data";
import { isPurchasable, type PayMode } from "@/lib/checkout";

/**
 * Cart state. Holds only a course id and the chosen payment mode — never any
 * registrant PII or payment data — so persisting it to localStorage is safe.
 * A single-item cart matches the product: one course purchase at a time.
 */
type CartState = {
  courseId: string | null;
  payMode: PayMode;
  /** Registrant-chosen amount in cents, for pay-what-you-want courses. */
  amountCents: number | null;
  setItem: (courseId: string, payMode?: PayMode) => void;
  setPayMode: (payMode: PayMode) => void;
  setAmount: (amountCents: number | null) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      courseId: null,
      payMode: "full",
      amountCents: null,
      // A new item clears any previous custom amount.
      setItem: (courseId, payMode = "full") =>
        set({ courseId, payMode, amountCents: null }),
      setPayMode: (payMode) => set({ payMode }),
      setAmount: (amountCents) => set({ amountCents }),
      clear: () => set({ courseId: null, payMode: "full", amountCents: null }),
    }),
    {
      name: "cdm-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
      partialize: (s) => ({
        courseId: s.courseId,
        payMode: s.payMode,
        amountCents: s.amountCents,
      }),
    },
  ),
);

/**
 * True once the persisted cart has rehydrated from localStorage. Components
 * gate on this to avoid rendering an "empty cart" flash on first paint.
 */
export function useCartHydrated(): boolean {
  // The initializer captures synchronous (localStorage) hydration; the
  // subscription covers any async storage case. Both avoid an "empty cart"
  // flash on first paint.
  const [hydrated, setHydrated] = useState<boolean>(() =>
    useCartStore.persist.hasHydrated(),
  );
  useEffect(() => {
    return useCartStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}

/**
 * Convenience action used by every "Enroll" CTA: drop the course in the cart
 * and route to the cart page. No-op for courses that aren't purchasable.
 */
export function useEnroll(): (course: Course, payMode?: PayMode) => void {
  const router = useRouter();
  const setItem = useCartStore((s) => s.setItem);
  return (course, payMode = "full") => {
    if (!isPurchasable(course)) return;
    setItem(course.id, payMode);
    router.push("/cart");
  };
}
