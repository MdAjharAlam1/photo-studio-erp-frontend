import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Plus } from "@phosphor-icons/react";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function Invoices() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/invoices").then(({ data }) => setItems(data)).catch(e => toast.error(formatApiError(e)));
  }, []);
  return (
    <div>
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="GST-ready thermal & A4 invoices."
        actions={
          <Link to="/invoices/new" data-testid="new-invoice-btn" className="h-10 px-4 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium flex items-center gap-2">
            <Plus size={16} weight="bold" /> New Invoice
          </Link>
        }
      />
      <div className="p-8">
        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-left">
              <tr>
                <th className="px-4 py-2.5 label-uppercase">Invoice</th>
                <th className="px-4 py-2.5 label-uppercase">Customer</th>
                <th className="px-4 py-2.5 label-uppercase">Date</th>
                <th className="px-4 py-2.5 label-uppercase">Status</th>
                <th className="px-4 py-2.5 label-uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-zinc-500">No invoices yet.</td></tr>}
              {items.map(inv => (
                <tr key={inv.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-mono text-xs">
                    <Link to={`/invoices/${inv.id}`} className="text-[#0052FF]">{inv.invoice_no}</Link>
                  </td>
                  <td className="px-4 py-2.5">{inv.customer_name}</td>
                  <td className="px-4 py-2.5 text-zinc-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${inv.status === "paid" ? "text-green-600" : "text-yellow-600"}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-heading font-semibold">{inr(inv.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
