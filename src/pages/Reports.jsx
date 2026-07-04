import { useEffect, useMemo, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { BarChart3, Download, FileSpreadsheet, RefreshCw, TrendingUp, Users, Package, Receipt } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

function toCsv(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
}

function downloadFile(content, filename, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(today());
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const df = new Date(from + "T00:00:00Z").toISOString();
      const dt = new Date(to + "T23:59:59Z").toISOString();
      const { data } = await api.get(`/reports/summary?date_from=${encodeURIComponent(df)}&date_to=${encodeURIComponent(dt)}`);
      setData(data);
    } catch (e) { toast.error(formatApiError(e)); }
    setBusy(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const kpis = useMemo(() => data ? ([
    { label: "Revenue", value: inr(data.revenue), icon: TrendingUp, color: "text-green-700 bg-green-50 border-green-200" },
    { label: "GST Collected", value: inr(data.gst_total), icon: Receipt, color: "text-blue-700 bg-blue-50 border-blue-200" },
    { label: "Paid Invoices", value: data.paid_count, icon: FileSpreadsheet, color: "text-zinc-800 bg-zinc-50 border-zinc-200" },
    { label: "Pending Amount", value: inr(data.pending_amount), icon: BarChart3, color: "text-yellow-800 bg-yellow-50 border-yellow-200" },
  ]) : [], [data]);

  const exportGstCsv = () => {
    if (!data) return;
    const rows = data.daily.map(d => ({ date: d.date, invoices: d.invoices, revenue: d.revenue, gst: d.gst }));
    rows.push({ date: "TOTAL", invoices: data.paid_count, revenue: data.revenue, gst: data.gst_total });
    downloadFile(toCsv(rows), `gst-report-${from}-to-${to}.csv`);
  };

  const exportCustomersCsv = () => {
    if (!data) return;
    downloadFile(toCsv(data.top_customers.length ? data.top_customers : [{ customer_id: "", customer_name: "No data", orders: 0, total: 0 }]),
      `top-customers-${from}-to-${to}.csv`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="GST summary, revenue, top customers & products."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-zinc-500">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} data-testid="date-from"
              className="h-10 px-3 border border-zinc-300 rounded-md text-sm" />
            <label className="text-xs text-zinc-500">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} data-testid="date-to"
              className="h-10 px-3 border border-zinc-300 rounded-md text-sm" />
            <button onClick={load} disabled={busy} data-testid="load-report"
              className="h-10 px-3 bg-zinc-900 text-white rounded-md text-sm flex items-center gap-1 disabled:opacity-60">
              <RefreshCw size={14} className={busy ? "animate-spin" : ""} /> Update
            </button>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {!data ? (
          <div className="text-zinc-500">Loading…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpis.map((k) => {
                const I = k.icon;
                return (
                  <div key={k.label} className={`border rounded-md p-4 ${k.color}`}>
                    <div className="flex justify-between items-start">
                      <div className="label-uppercase">{k.label}</div>
                      <I size={16} />
                    </div>
                    <div className="font-heading text-2xl font-semibold mt-2">{k.value}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-md p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="label-uppercase">Revenue trend</div>
                    <div className="font-heading text-lg font-medium">Daily paid revenue</div>
                  </div>
                  <button onClick={exportGstCsv} data-testid="export-gst"
                    className="h-9 px-3 border border-zinc-300 rounded-md text-sm flex items-center gap-1 hover:bg-zinc-50">
                    <Download size={14} /> GST CSV
                  </button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.daily}>
                      <CartesianGrid stroke="#e4e4e7" strokeDasharray="2 4" />
                      <XAxis dataKey="date" fontSize={11} stroke="#71717a" />
                      <YAxis fontSize={11} stroke="#71717a" />
                      <Tooltip formatter={(v) => inr(v)} />
                      <Line type="monotone" dataKey="revenue" stroke="#0052FF" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-md p-5">
                <div className="label-uppercase">GST breakdown</div>
                <div className="font-heading text-lg font-medium mb-3">Tax collected</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>CGST</span><span className="font-mono">{inr(data.cgst)}</span></div>
                  <div className="flex justify-between"><span>SGST</span><span className="font-mono">{inr(data.sgst)}</span></div>
                  <div className="flex justify-between font-semibold border-t border-zinc-200 pt-2"><span>Total GST</span><span className="font-mono">{inr(data.gst_total)}</span></div>
                  <div className="flex justify-between text-zinc-500"><span>Net revenue</span><span className="font-mono">{inr(data.net_revenue)}</span></div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="label-uppercase mb-2">Payments</div>
                  <div className="space-y-1 text-sm">
                    {Object.entries(data.payment_break).length === 0 ? <div className="text-zinc-500 text-xs">No paid invoices</div> :
                      Object.entries(data.payment_break).map(([k, v]) => (
                        <div key={k} className="flex justify-between"><span className="capitalize">{k}</span><span className="font-mono">{inr(v)}</span></div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-zinc-200 rounded-md p-5">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="label-uppercase flex items-center gap-1"><Users size={12} /> Top customers</div>
                    <div className="font-heading text-lg font-medium">By revenue</div>
                  </div>
                  <button onClick={exportCustomersCsv} data-testid="export-customers"
                    className="h-9 px-3 border border-zinc-300 rounded-md text-sm flex items-center gap-1 hover:bg-zinc-50">
                    <Download size={14} /> CSV
                  </button>
                </div>
                {data.top_customers.length === 0 ? <div className="text-zinc-500 text-sm">No paid invoices in range.</div> : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-zinc-200 text-left">
                      <th className="py-2 label-uppercase">Customer</th>
                      <th className="py-2 label-uppercase text-right">Orders</th>
                      <th className="py-2 label-uppercase text-right">Total</th>
                    </tr></thead>
                    <tbody>{data.top_customers.map(r => (
                      <tr key={r.customer_id} className="border-b border-zinc-100">
                        <td className="py-2">{r.customer_name}</td>
                        <td className="py-2 text-right font-mono">{r.orders}</td>
                        <td className="py-2 text-right font-mono">{inr(r.total)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>

              <div className="bg-white border border-zinc-200 rounded-md p-5">
                <div className="label-uppercase flex items-center gap-1"><Package size={12} /> Top products / services</div>
                <div className="font-heading text-lg font-medium mb-3">By revenue</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.top_products}>
                      <CartesianGrid stroke="#e4e4e7" strokeDasharray="2 4" />
                      <XAxis dataKey="description" fontSize={10} stroke="#71717a" interval={0} angle={-15} textAnchor="end" height={50} />
                      <YAxis fontSize={11} stroke="#71717a" />
                      <Tooltip formatter={(v) => inr(v)} />
                      <Bar dataKey="total" fill="#0052FF" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
