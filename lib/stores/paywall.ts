"use client";

import { create } from "zustand";

interface PaywallStore {
  open: boolean;
  reason: string | null;
  /** Mirrors showPaywall(reason:) in the mobile app. */
  showPaywall: (reason?: string) => void;
  close: () => void;
}

export const usePaywall = create<PaywallStore>((set) => ({
  open: false,
  reason: null,
  showPaywall: (reason) => set({ open: true, reason: reason ?? null }),
  close: () => set({ open: false }),
}));
