import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";
import PageHeader from "@/components/PageHeader";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

  import { useCallback } from "react";

const initialForm = { name: "", phone: "", email: "", address: "", gstin: "", notes: "" };

export default function Customers() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);


const load = useCallback(async () => {
  try {
    const { data } = await api.get("/customers", {
      params: { q },
    });
    setItems(data);
  } catch (e) {
    toast.error(formatApiError(e));
  }
}, [q]);

useEffect(() => {
  load();
}, [load]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/customers", form);
      toast.success("Customer added");
      setOpen(false); setForm(initialForm); load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        description="Every walk-in and appointment in one place."
        actions={
          <button onClick={() => setOpen(true)} data-testid="new-customer-btn" className="h-10 px-4 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium flex items-center gap-2">
            <Plus size={16} weight="bold" /> New Customer
          </button>
        }
      />
      <div className="p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              data-testid="customer-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or phone…"
              className="w-full h-10 pl-9 pr-3 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>
          <div className="text-xs font-mono text-zinc-500">{items.length} records</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr className="text-left">
                <th className="px-4 py-2.5 label-uppercase">Name</th>
                <th className="px-4 py-2.5 label-uppercase">Phone</th>
                <th className="px-4 py-2.5 label-uppercase">Email</th>
                <th className="px-4 py-2.5 label-uppercase">GSTIN</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-zinc-500">No customers yet. Add your first walk-in.</td></tr>
              )}
              {items.map(c => (
                <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50" data-testid={`customer-row-${c.id}`}>
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5 font-mono">{c.phone || "—"}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{c.email || "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{c.gstin || "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link to={`/customers/${c.id}`} className="text-[#0052FF] text-xs uppercase tracking-[0.2em] inline-flex items-center gap-1">
                      Open <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">New Customer</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3" data-testid="customer-form">
            {[
              ["name", "Full name", true, 2],
              ["phone", "Phone", false, 1],
              ["email", "Email", false, 1],
              ["gstin", "GSTIN", false, 1],
              ["address", "Address", false, 2],
              ["notes", "Notes", false, 2],
            ].map(([key, label, req, span]) => (
              <div key={key} className={span === 2 ? "col-span-2" : ""}>
                <label className="label-uppercase block mb-1">{label}{req && " *"}</label>
                <input
                  data-testid={`input-${key}`}
                  required={req}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full h-10 px-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
            ))}
            <DialogFooter className="col-span-2 mt-2">
              <button type="button" onClick={() => setOpen(false)} className="h-10 px-4 border border-zinc-300 rounded-md">Cancel</button>
              <button type="submit" data-testid="submit-customer" className="h-10 px-4 bg-[#0052FF] text-white rounded-md">Save</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
