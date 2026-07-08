import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

// Common GST slabs — used wherever a person picks a rate manually.
export const GST_RATES = [0, 5, 12, 18, 28];
export const DEFAULT_GST_RATE = 18;

export const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// Coerce a raw input value to a non-negative number, falling back instead of NaN.
export const toNonNegNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

/**
 * Compute subtotal / GST / total for a list of line items.
 * Each item needs { quantity, rate } and EITHER:
 *  - its own `gst_rate` (per-item manual GST — used by InvoiceNew, MultiPhotoPassport), or
 *  - a single `overrideGstRate` applied to every item (used by PassportMaker's one-line invoice).
 *
 * Discount is clamped so it can never exceed subtotal+gst or go negative —
 * that clamping used to only happen in the UI, not before the value was sent to the server.
 */
export function computeInvoiceTotals(items, { discount = 0, overrideGstRate } = {}) {
  const subtotal = items.reduce((s, i) => s + (i.quantity || 0) * (i.rate || 0), 0);
  const gst = items.reduce((s, i) => {
    const rate = overrideGstRate ?? i.gst_rate ?? 0;
    return s + (i.quantity || 0) * (i.rate || 0) * (rate / 100);
  }, 0);
  const discountValue = Math.min(toNonNegNumber(discount), subtotal + gst);
  const total = Math.max(subtotal + gst - discountValue, 0);
  return { subtotal, gst, discountValue, total };
}

/**
 * POST /invoices with consistent error handling. Returns the created invoice,
 * or null if the request failed (a toast has already been shown).
 */
export async function createInvoice(payload) {
  try {
    const { data } = await api.post("/invoices", payload);
    return data;
  } catch (err) {
    toast.error(formatApiError(err));
    return null;
  }
}

/** POST /orders with the same error-handling contract as createInvoice. */
export async function createOrder(payload) {
  try {
    const { data } = await api.post("/orders", payload);
    return data;
  } catch (err) {
    toast.error(formatApiError(err));
    return null;
  }
}