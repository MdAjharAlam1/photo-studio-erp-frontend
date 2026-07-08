// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { api, formatApiError } from "@/lib/api";
// import { toast } from "sonner";
// import PageHeader from "@/components/PageHeader";
// import { Trash, Plus, ArrowLeft } from "@phosphor-icons/react";

// const emptyItem = () => ({ description: "", quantity: 1, rate: 0, gst_rate: 18 });
// const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// export default function InvoiceNew() {
//   const nav = useNavigate();
//   const [customers, setCustomers] = useState([]);
//   const [customerId, setCustomerId] = useState("");
//   const [items, setItems] = useState([{ ...emptyItem(), description: "Passport Photo — 8 copies", rate: 150 }]);
//   const [discount, setDiscount] = useState(0);
//   const [paymentMethod, setPaymentMethod] = useState("cash");
//   const [status, setStatus] = useState("paid");
//   const [notes, setNotes] = useState("");

//   useEffect(() => {
//     api.get("/customers").then(({ data }) => {
//       setCustomers(data);
//       if (data.length && !customerId) setCustomerId(data[0].id);
//     });
//     // eslint-disable-next-line
//   }, []);

//   const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
//   const gst = items.reduce((s, i) => s + i.quantity * i.rate * (i.gst_rate / 100), 0);
//   const total = Math.max(subtotal + gst - Number(discount || 0), 0);

//   const update = (idx, patch) => setItems(items.map((it, i) => i === idx ? { ...it, ...patch } : it));

//   const submit = async (e) => {
//     e.preventDefault();
//     if (!customerId) return toast.error("Select a customer");
//     try {
//       const { data } = await api.post("/invoices", {
//         customer_id: customerId, items, discount: Number(discount || 0),
//         payment_method: paymentMethod, notes, status,
//       });
//       toast.success("Invoice created");
//       nav(`/invoices/${data.id}`);
//     } catch (e) { toast.error(formatApiError(e)); }
//   };

//   return (
//     <div>
//       <PageHeader eyebrow="Billing" title="New Invoice" description="Add line items, apply GST and share with customer." />
//       <form onSubmit={submit} className="p-8 space-y-4" data-testid="invoice-form">
//         <Link to="/invoices" className="text-sm text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"><ArrowLeft size={14} /> Back</Link>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="md:col-span-2 bg-white border border-zinc-200 rounded-md p-5 space-y-4">
//             <div>
//               <label className="label-uppercase block mb-1">Customer</label>
//               <select
//                 data-testid="select-customer"
//                 required
//                 value={customerId}
//                 onChange={(e) => setCustomerId(e.target.value)}
//                 className="w-full h-10 px-3 border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
//               >
//                 <option value="">— Select customer —</option>
//                 {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone && `(${c.phone})`}</option>)}
//               </select>
//             </div>

//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <div className="label-uppercase">Line items</div>
//                 <button type="button" onClick={() => setItems([...items, emptyItem()])} data-testid="add-item-btn" className="text-[#0052FF] text-xs uppercase tracking-[0.2em] inline-flex items-center gap-1"><Plus size={12} /> Add</button>
//               </div>
//               <div className="space-y-2">
//                 {items.map((it, idx) => (
//                   <div key={idx} className="grid grid-cols-12 gap-2 items-center">
//                     <input placeholder="Description" required value={it.description} onChange={(e) => update(idx, { description: e.target.value })}
//                       className="col-span-5 h-10 px-3 border border-zinc-300 rounded-md text-sm" data-testid={`item-desc-${idx}`} />
//                     <input type="number" min="1" value={it.quantity} onChange={(e) => update(idx, { quantity: Number(e.target.value) })}
//                       className="col-span-1 h-10 px-2 border border-zinc-300 rounded-md text-sm" />
//                     <input type="number" min="0" step="0.01" value={it.rate} onChange={(e) => update(idx, { rate: Number(e.target.value) })}
//                       className="col-span-2 h-10 px-2 border border-zinc-300 rounded-md text-sm" data-testid={`item-rate-${idx}`} />
//                     <select value={it.gst_rate} onChange={(e) => update(idx, { gst_rate: Number(e.target.value) })} className="col-span-2 h-10 px-2 border border-zinc-300 rounded-md text-sm bg-white">
//                       {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>GST {g}%</option>)}
//                     </select>
//                     <div className="col-span-1 text-right font-mono text-xs">{inr(it.quantity * it.rate)}</div>
//                     <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="col-span-1 text-zinc-400 hover:text-red-500">
//                       <Trash size={16} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="label-uppercase block mb-1">Notes</label>
//               <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
//                 className="w-full min-h-[70px] p-3 border border-zinc-300 rounded-md text-sm" />
//             </div>
//           </div>

//           <div className="bg-white border border-zinc-200 rounded-md p-5 h-fit space-y-4">
//             <div className="label-uppercase">Summary</div>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{inr(subtotal)}</span></div>
//               <div className="flex justify-between"><span>GST</span><span className="font-mono">{inr(gst)}</span></div>
//               <div className="flex justify-between items-center">
//                 <span>Discount</span>
//                 <input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)}
//                   className="w-24 h-8 px-2 border border-zinc-300 rounded-md text-right text-sm" />
//               </div>
//               <div className="flex justify-between text-lg font-heading font-semibold border-t border-zinc-200 pt-2"><span>Total</span><span data-testid="invoice-total">{inr(total)}</span></div>
//             </div>

//             <div>
//               <label className="label-uppercase block mb-1">Payment Method</label>
//               <div className="grid grid-cols-4 gap-1">
//                 {["cash", "upi", "card", "qr"].map(m => (
//                   <button type="button" key={m} onClick={() => setPaymentMethod(m)}
//                     className={`h-9 text-xs uppercase tracking-[0.1em] rounded-md border ${paymentMethod === m ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-300"}`}>
//                     {m}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <label className="label-uppercase block mb-1">Status</label>
//               <div className="grid grid-cols-2 gap-1">
//                 {["paid", "pending"].map(s => (
//                   <button type="button" key={s} onClick={() => setStatus(s)}
//                     className={`h-9 text-xs uppercase tracking-[0.1em] rounded-md border ${status === s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-300"}`}>
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <button type="submit" data-testid="submit-invoice" className="w-full h-11 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium">Create Invoice</button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }





import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Trash, Plus, ArrowLeft } from "@phosphor-icons/react";

const GST_RATES = [0, 5, 12, 18, 28];
const PAYMENT_METHODS = ["cash", "upi", "card", "qr"];
const STATUSES = ["paid", "pending"];

// Stable id generator so React keys survive add/remove without remounting
// unrelated rows (fixes input focus/value bugs when a middle row is deleted).
let idSeq = 0;
const nextId = () => `item-${Date.now()}-${idSeq++}`;

const emptyItem = () => ({
  id: nextId(),
  description: "",
  quantity: 1,
  rate: 0,
  gst_rate: 18,
});

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// Coerce a raw input string to a non-negative number, defaulting to 0
// instead of producing NaN when the field is cleared or mid-edit (e.g. "-").
const toNonNegNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export default function InvoiceNew() {
  const nav = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState(() => [
    { ...emptyItem(), description: "Passport Photo — 8 copies", rate: 150 },
  ]);
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [status, setStatus] = useState("paid");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCustomersLoading(true);
    api
      .get("/customers")
      .then(({ data }) => {
        if (cancelled) return;
        setCustomers(data);
        if (data.length) setCustomerId((prev) => prev || data[0].id);
      })
      .catch((e) => {
        if (!cancelled) toast.error(formatApiError(e));
      })
      .finally(() => {
        if (!cancelled) setCustomersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.quantity * i.rate, 0),
    [items]
  );
  const gst = useMemo(
    () => items.reduce((s, i) => s + i.quantity * i.rate * (i.gst_rate / 100), 0),
    [items]
  );
  // Clamp discount so it can never push the total negative or exceed
  // subtotal+gst (previously an oversized discount was sent to the server as-is).
  const discountValue = Math.min(toNonNegNumber(discount), subtotal + gst);
  const total = Math.max(subtotal + gst - discountValue, 0);

  const update = useCallback((id, patch) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, emptyItem()]);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!customerId) return toast.error("Select a customer");
    if (items.length === 0) return toast.error("Add at least one line item");

    const invalidItem = items.find(
      (it) => !it.description.trim() || it.quantity <= 0 || it.rate < 0
    );
    if (invalidItem) {
      return toast.error("Each item needs a description, quantity ≥ 1, and a non-negative rate");
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/invoices", {
        customer_id: customerId,
        items: items.map(({ id, ...rest }) => rest), // strip client-only id before sending
        discount: discountValue,
        payment_method: paymentMethod,
        notes,
        status,
      });
      toast.success("Invoice created");
      nav(`/invoices/${data.id}`);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Billing"
        title="New Invoice"
        description="Add line items, apply GST and share with customer."
      />
      <form onSubmit={submit} className="p-8 space-y-4" data-testid="invoice-form">
        <Link
          to="/invoices"
          className="text-sm text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white border border-zinc-200 rounded-md p-5 space-y-4">
            <div>
              <label htmlFor="customer-select" className="label-uppercase block mb-1">
                Customer
              </label>
              <select
                id="customer-select"
                data-testid="select-customer"
                required
                disabled={customersLoading}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-10 px-3 border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF] disabled:opacity-50"
              >
                <option value="">
                  {customersLoading ? "Loading customers…" : "— Select customer —"}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone && `(${c.phone})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="label-uppercase">Line items</div>
                <button
                  type="button"
                  onClick={addItem}
                  data-testid="add-item-btn"
                  className="text-[#0052FF] text-xs uppercase tracking-[0.2em] inline-flex items-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      placeholder="Description"
                      required
                      value={it.description}
                      onChange={(e) => update(it.id, { description: e.target.value })}
                      className="col-span-5 h-10 px-3 border border-zinc-300 rounded-md text-sm"
                      data-testid={`item-desc-${idx}`}
                    />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={it.quantity}
                      onChange={(e) =>
                        update(it.id, { quantity: Math.max(1, toNonNegNumber(e.target.value, 1)) })
                      }
                      className="col-span-1 h-10 px-2 border border-zinc-300 rounded-md text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={it.rate}
                      onChange={(e) => update(it.id, { rate: toNonNegNumber(e.target.value) })}
                      className="col-span-2 h-10 px-2 border border-zinc-300 rounded-md text-sm"
                      data-testid={`item-rate-${idx}`}
                    />
                    <select
                      value={it.gst_rate}
                      onChange={(e) => update(it.id, { gst_rate: Number(e.target.value) })}
                      className="col-span-2 h-10 px-2 border border-zinc-300 rounded-md text-sm bg-white"
                    >
                      {GST_RATES.map((g) => (
                        <option key={g} value={g}>
                          GST {g}%
                        </option>
                      ))}
                    </select>
                    <div className="col-span-1 text-right font-mono text-xs">
                      {inr(it.quantity * it.rate)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      disabled={items.length === 1}
                      title={items.length === 1 ? "At least one item is required" : "Remove item"}
                      className="col-span-1 text-zinc-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-zinc-400"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="label-uppercase block mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[70px] p-3 border border-zinc-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-md p-5 h-fit space-y-4">
            <div className="label-uppercase">Summary</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST</span>
                <span className="font-mono">{inr(gst)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discount</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={subtotal + gst}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-24 h-8 px-2 border border-zinc-300 rounded-md text-right text-sm"
                />
              </div>
              <div className="flex justify-between text-lg font-heading font-semibold border-t border-zinc-200 pt-2">
                <span>Total</span>
                <span data-testid="invoice-total">{inr(total)}</span>
              </div>
            </div>

            <div>
              <div className="label-uppercase block mb-1">Payment Method</div>
              <div className="grid grid-cols-4 gap-1" role="group" aria-label="Payment method">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    aria-pressed={paymentMethod === m}
                    onClick={() => setPaymentMethod(m)}
                    className={`h-9 text-xs uppercase tracking-[0.1em] rounded-md border ${
                      paymentMethod === m
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-600 border-zinc-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="label-uppercase block mb-1">Status</div>
              <div className="grid grid-cols-2 gap-1" role="group" aria-label="Invoice status">
                {STATUSES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    aria-pressed={status === s}
                    onClick={() => setStatus(s)}
                    className={`h-9 text-xs uppercase tracking-[0.1em] rounded-md border ${
                      status === s
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-600 border-zinc-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              data-testid="submit-invoice"
              disabled={submitting}
              className="w-full h-11 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : "Create Invoice"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
