import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "@phosphor-icons/react";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get(`/customers/${id}`).then(({ data }) => setData(data)).catch(e => toast.error(formatApiError(e)));
  }, [id]);

  if (!data) return <div className="p-8 text-zinc-500">Loading…</div>;
  const { customer, invoices, orders } = data;

  return (
    <div>
      <PageHeader eyebrow="Customer" title={customer.name} description={customer.phone} />
      <div className="p-8 space-y-6">
        <Link to="/customers" className="text-sm text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"><ArrowLeft size={14} /> Back</Link>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ["Email", customer.email || "—"],
            ["Address", customer.address || "—"],
            ["GSTIN", customer.gstin || "—"],
            ["Notes", customer.notes || "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-white border border-zinc-200 rounded-md p-4">
              <div className="label-uppercase mb-1">{k}</div>
              <div className="text-sm">{v}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-200 rounded-md">
            <div className="px-5 py-3 border-b border-zinc-200 font-heading font-medium">Invoices ({invoices.length})</div>
            {invoices.length === 0 ? <div className="p-5 text-sm text-zinc-500">No invoices.</div> : invoices.map(inv => (
              <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 hover:bg-zinc-50">
                <div className="font-mono text-xs">{inv.invoice_no}</div>
                <div className="font-heading font-medium">{inr(inv.total)}</div>
              </Link>
            ))}
          </div>
          <div className="bg-white border border-zinc-200 rounded-md">
            <div className="px-5 py-3 border-b border-zinc-200 font-heading font-medium">Passport Orders ({orders.length})</div>
            {orders.length === 0 ? <div className="p-5 text-sm text-zinc-500">No orders.</div> : orders.map(o => (
              <div key={o.id} className="px-5 py-3 border-b border-zinc-100 flex justify-between">
                <div>
                  <div className="text-sm">{o.passport_size}</div>
                  <div className="text-xs text-zinc-500">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="font-mono text-xs">{o.copies} copies · {o.paper_size}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
