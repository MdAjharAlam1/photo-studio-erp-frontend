import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import QRCode from "qrcode";
import { ArrowLeft, Printer, MessageCircle as WhatsappLogo, CheckCircle2, Clock, QrCode, Send } from "lucide-react";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function InvoiceDetail() {
  const { id } = useParams();
  const [inv, setInv] = useState(null);
  const [studio, setStudio] = useState({});
  const [upiQr, setUpiQr] = useState("");
  const [showUpi, setShowUpi] = useState(false);

  useEffect(() => {
    api.get(`/invoices/${id}`).then(({ data }) => setInv(data)).catch(e => toast.error(formatApiError(e)));
    api.get(`/settings/studio`).then(({ data }) => setStudio(data || {})).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!inv || !studio?.upi_id) return;
    const pa = encodeURIComponent(studio.upi_id);
    const pn = encodeURIComponent(studio.upi_name || studio.name || "Studio");
    const am = Number(inv.total || 0).toFixed(2);
    const tn = encodeURIComponent(`Invoice ${inv.invoice_no}`);
    const uri = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
    QRCode.toDataURL(uri, { width: 300, margin: 1 }).then(setUpiQr).catch(() => {});
  }, [inv, studio]);

  if (!inv) return <div className="p-8 text-zinc-500">Loading…</div>;

  const sendWhatsApp = () => {
    const phone = (inv.customer_phone || "").replace(/\D/g, "");
    if (!phone) { toast.error("Customer has no phone"); return; }
    const lines = [
      `Hi ${inv.customer_name},`,
      `${studio.name || "Studio"} invoice ${inv.invoice_no}`,
      `Amount: ₹${inv.total}`,
      inv.status === "pending" && studio.upi_id ? `Pay via UPI: ${studio.upi_id}` : null,
      `Thank you!`,
    ].filter(Boolean);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  const toggleStatus = async () => {
    const next = inv.status === "paid" ? "pending" : "paid";
    try {
      const { data } = await api.patch(`/invoices/${id}`, { status: next });
      setInv(data);
      toast.success(`Marked ${next}`);
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const sendToPrint = async () => {
    try {
      await api.post("/print-jobs", {
        kind: "invoice",
        ref_id: inv.id,
        title: `Invoice ${inv.invoice_no} — ${inv.customer_name}`,
        paper_size: "A4",
        copies: 1,
      });
      toast.success("Sent to print queue");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Invoice"
        title={inv.invoice_no}
        description={`For ${inv.customer_name}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={toggleStatus} data-testid="toggle-status"
              className={`h-10 px-3 border rounded-md flex items-center gap-2 text-sm ${inv.status === "paid" ? "border-zinc-300 hover:bg-zinc-50" : "border-green-300 text-green-700 hover:bg-green-50"}`}>
              {inv.status === "paid" ? <><Clock size={16} /> Mark Pending</> : <><CheckCircle2 size={16} /> Mark Paid</>}
            </button>
            {studio.upi_id && (
              <button onClick={() => setShowUpi(v => !v)} data-testid="upi-qr-btn"
                className="h-10 px-3 border border-zinc-300 rounded-md flex items-center gap-2 text-sm hover:bg-zinc-50">
                <QrCode size={16} /> UPI QR
              </button>
            )}
            <button onClick={sendWhatsApp} data-testid="wa-share"
              className="h-10 px-3 border border-green-300 text-green-700 rounded-md flex items-center gap-2 text-sm hover:bg-green-50">
              <WhatsappLogo size={16} /> WhatsApp
            </button>
            <button onClick={sendToPrint} data-testid="send-to-print"
              className="h-10 px-3 border border-zinc-300 rounded-md flex items-center gap-2 text-sm hover:bg-zinc-50">
              <Send size={16} /> Queue Print
            </button>
            <button onClick={() => window.print()} className="h-10 px-3 border border-zinc-300 rounded-md flex items-center gap-2 text-sm hover:bg-zinc-50">
              <Printer size={16} /> Print
            </button>
          </div>
        }
      />
      <div className="p-8">
        <Link to="/invoices" className="text-sm text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 mb-4"><ArrowLeft size={14} /> Back</Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
          <div className="max-w-3xl bg-white border border-zinc-200 rounded-md p-8 print:border-0 print:shadow-none">
            <div className="flex justify-between items-start pb-6 border-b border-zinc-200 gap-6">
              <div className="flex items-start gap-4">
                {studio.logo && <img src={studio.logo} alt="logo" className="h-14 w-14 object-contain border border-zinc-100 rounded-md p-1" />}
                <div>
                  <div className="label-uppercase">Tax Invoice</div>
                  <h2 className="font-heading text-2xl font-semibold mt-1">{inv.invoice_no}</h2>
                  <div className="text-sm text-zinc-500 mt-1">{new Date(inv.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-heading text-lg font-semibold">{studio.name || "Studio ERP"}</div>
                <div className="text-sm mt-0.5">{studio.tagline || "GST-Ready Photo Studio"}</div>
                {studio.gstin && <div className="text-xs text-zinc-500 font-mono">GSTIN: {studio.gstin}</div>}
                {studio.phone && <div className="text-xs text-zinc-500">{studio.phone}</div>}
                {studio.email && <div className="text-xs text-zinc-500">{studio.email}</div>}
                {studio.address && <div className="text-xs text-zinc-500 max-w-xs whitespace-pre-line">{studio.address}</div>}
                <div className="text-xs text-zinc-500 mt-1">by {inv.created_by}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-b border-zinc-200">
              <div>
                <div className="label-uppercase mb-1">Billed to</div>
                <div className="font-medium">{inv.customer_name}</div>
                <div className="text-sm text-zinc-500">{inv.customer_phone}</div>
              </div>
              <div className="text-right">
                <div className="label-uppercase mb-1">Payment</div>
                <div className="font-medium capitalize">{inv.payment_method}</div>
                <div className={`text-xs uppercase tracking-[0.2em] mt-1 ${inv.status === "paid" ? "text-green-600" : "text-yellow-600"}`}>{inv.status}</div>
              </div>
            </div>

            <table className="w-full text-sm my-6">
              <thead>
                <tr className="text-left border-b border-zinc-200">
                  <th className="py-2 label-uppercase">Description</th>
                  <th className="py-2 label-uppercase text-right">Qty</th>
                  <th className="py-2 label-uppercase text-right">Rate</th>
                  <th className="py-2 label-uppercase text-right">GST</th>
                  <th className="py-2 label-uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((it, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    <td className="py-2">{it.description}</td>
                    <td className="py-2 text-right font-mono">{it.quantity}</td>
                    <td className="py-2 text-right font-mono">{inr(it.rate)}</td>
                    <td className="py-2 text-right font-mono">{it.gst_rate}%</td>
                    <td className="py-2 text-right font-mono">{inr(it.quantity * it.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{inr(inv.subtotal)}</span></div>
                <div className="flex justify-between"><span>GST</span><span className="font-mono">{inr(inv.gst)}</span></div>
                {inv.discount > 0 && <div className="flex justify-between"><span>Discount</span><span className="font-mono">-{inr(inv.discount)}</span></div>}
                <div className="flex justify-between font-heading text-lg font-semibold border-t border-zinc-200 pt-2"><span>Total</span><span>{inr(inv.total)}</span></div>
              </div>
            </div>

            {inv.notes && <div className="mt-6 pt-6 border-t border-zinc-200 text-sm text-zinc-600"><span className="label-uppercase mr-2">Notes</span>{inv.notes}</div>}
          </div>

          {showUpi && upiQr && (
            <div className="bg-white border border-zinc-200 rounded-md p-4 print:hidden">
              <div className="label-uppercase mb-2">UPI Payment</div>
              <img src={upiQr} alt="UPI QR" className="w-full h-auto border border-zinc-100 rounded-md" />
              <div className="text-xs mt-2 font-mono break-all text-zinc-600">{studio.upi_id}</div>
              <div className="text-sm mt-1 font-semibold">{inr(inv.total)}</div>
              <div className="text-[11px] text-zinc-500 mt-2">Scan with any UPI app (GPay / PhonePe / Paytm)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
