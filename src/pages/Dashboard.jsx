import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import {
  CurrencyInr, UsersThree, ShoppingBag, IdentificationCard, Warning, ArrowUpRight,
} from "@phosphor-icons/react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import PageHeader from "@/components/PageHeader";

const KpiCard = ({ label, value, icon: Icon, accent = "#0052FF", testid }) => (
  <div className="bg-white border border-zinc-200 rounded-md p-5 flex flex-col gap-4 min-h-[130px]" data-testid={testid}>
    <div className="flex items-start justify-between">
      <div className="label-uppercase">{label}</div>
      <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: accent + "15", color: accent }}>
        <Icon size={20} weight="regular" />
      </div>
    </div>
    <div className="font-heading text-3xl font-semibold tracking-tight">{value}</div>
  </div>
);

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then(({ data }) => setStats(data)).catch((e) => toast.error(formatApiError(e)));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Today's activity across your studio."
        actions={
          <Link to="/passport" className="h-10 px-4 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium flex items-center gap-2" data-testid="dashboard-new-passport-btn">
            New Passport Job <ArrowUpRight size={16} />
          </Link>
        }
      />

      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Revenue Today" value={inr(stats?.revenue_today)} icon={CurrencyInr} accent="#16A34A" testid="kpi-revenue" />
          <KpiCard label="Customers Today" value={stats?.customers_today ?? "—"} icon={UsersThree} testid="kpi-customers" />
          <KpiCard label="Orders Today" value={stats?.orders_today ?? "—"} icon={ShoppingBag} accent="#EAB308" testid="kpi-orders" />
          <KpiCard label="Passport Photos" value={stats?.passport_photos_today ?? "—"} icon={IdentificationCard} accent="#7C3AED" testid="kpi-passports" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-md p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="label-uppercase">Last 7 days</div>
                <h3 className="font-heading text-xl font-medium mt-1">Revenue trend</h3>
              </div>
            </div>
            <div className="h-64" data-testid="revenue-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chart_7d || []}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0052FF" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0052FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                  <XAxis dataKey="date" stroke="#71717A" fontSize={11} />
                  <YAxis stroke="#71717A" fontSize={11} />
                  <Tooltip formatter={(v) => inr(v)} contentStyle={{ borderRadius: 6, border: "1px solid #E4E4E7" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#0052FF" fill="url(#rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-md p-5">
            <div className="label-uppercase mb-1">Alerts</div>
            <h3 className="font-heading text-xl font-medium">Pending Payments</h3>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-yellow-100 text-yellow-700 flex items-center justify-center"><Warning size={22} /></div>
              <div className="font-heading text-3xl font-semibold" data-testid="pending-amount">{inr(stats?.pending_payments)}</div>
            </div>
            <div className="mt-6 pt-6 border-t border-zinc-200 grid grid-cols-2 gap-4">
              <div>
                <div className="label-uppercase">Total Customers</div>
                <div className="font-heading text-2xl mt-1" data-testid="total-customers">{stats?.total_customers ?? "—"}</div>
              </div>
              <div>
                <div className="label-uppercase">Total Invoices</div>
                <div className="font-heading text-2xl mt-1">{stats?.total_invoices ?? "—"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="bg-white border border-zinc-200 rounded-md">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-heading text-lg font-medium">Recent invoices</h3>
              <Link to="/invoices" className="text-xs text-[#0052FF] uppercase tracking-[0.2em]">View all</Link>
            </div>
            <div>
              {(stats?.recent_invoices || []).length === 0 && <div className="p-5 text-sm text-zinc-500">No invoices yet.</div>}
              {(stats?.recent_invoices || []).map((inv) => (
                <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <div>
                    <div className="font-mono text-xs text-zinc-500">{inv.invoice_no}</div>
                    <div className="text-sm font-medium">{inv.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-semibold">{inr(inv.total)}</div>
                    <div className={`text-[10px] uppercase tracking-[0.2em] ${inv.status === "paid" ? "text-green-600" : "text-yellow-600"}`}>{inv.status}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-md">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-heading text-lg font-medium">Recent customers</h3>
              <Link to="/customers" className="text-xs text-[#0052FF] uppercase tracking-[0.2em]">View all</Link>
            </div>
            <div>
              {(stats?.recent_customers || []).length === 0 && <div className="p-5 text-sm text-zinc-500">No customers yet.</div>}
              {(stats?.recent_customers || []).map((c) => (
                <Link key={c.id} to={`/customers/${c.id}`} className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">{c.phone || "—"}</div>
                  </div>
                  <ArrowUpRight size={16} className="text-zinc-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
