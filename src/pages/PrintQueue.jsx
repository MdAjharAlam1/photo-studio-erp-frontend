import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Printer, Check, X, Trash2, Play, RefreshCw } from "lucide-react";
 import { useCallback } from "react";

const STATUS_COLORS = {
  queued: "text-yellow-800 bg-yellow-50 border-yellow-200",
  printing: "text-blue-800 bg-blue-50 border-blue-200",
  done: "text-green-800 bg-green-50 border-green-200",
  cancelled: "text-zinc-600 bg-zinc-100 border-zinc-200",
};

export default function PrintQueue() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);

 

  const load = useCallback(async () => {
    setBusy(true);

    try {
      const query = filter === "all" ? "" : `?status=${filter}`;
      const { data } = await api.get(`/print-jobs${query}`);
      setJobs(data);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setBusy(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id, status) => {
    try {
      await api.patch(`/print-jobs/${id}`, { status });
      toast.success(`Marked ${status}`);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try { await api.delete(`/print-jobs/${id}`); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  const counts = {
    queued: jobs.filter(j => j.status === "queued").length,
    printing: jobs.filter(j => j.status === "printing").length,
    done: jobs.filter(j => j.status === "done").length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Print Queue"
        description="Track paper prints — passport sheets, invoices and photo jobs."
        actions={
          <button onClick={load} data-testid="pq-refresh" className="h-10 px-4 border border-zinc-300 rounded-md text-sm flex items-center gap-1 hover:bg-zinc-50">
            <RefreshCw size={14} className={busy ? "animate-spin" : ""} /> Refresh
          </button>
        }
      />

      <div className="p-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {["all", "queued", "printing", "done", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)} data-testid={`filter-${s}`}
              className={`h-9 px-3 rounded-md border text-sm capitalize ${filter === s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:bg-zinc-50"}`}>
              {s} {s !== "all" && s in counts ? `(${counts[s]})` : ""}
            </button>
          ))}
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-md p-10 text-center text-zinc-500">
            <Printer size={28} className="mx-auto mb-2 text-zinc-400" />
            No print jobs — send an invoice or passport sheet to the queue.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr className="text-left">
                  <th className="px-4 py-2 label-uppercase">Title</th>
                  <th className="px-4 py-2 label-uppercase">Kind</th>
                  <th className="px-4 py-2 label-uppercase">Paper</th>
                  <th className="px-4 py-2 label-uppercase text-right">Copies</th>
                  <th className="px-4 py-2 label-uppercase">Status</th>
                  <th className="px-4 py-2 label-uppercase">Created</th>
                  <th className="px-4 py-2 label-uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id} className="border-b border-zinc-100" data-testid={`job-${j.id}`}>
                    <td className="px-4 py-2 font-medium">{j.title}</td>
                    <td className="px-4 py-2 capitalize">{j.kind}</td>
                    <td className="px-4 py-2 font-mono text-xs">{j.paper_size}</td>
                    <td className="px-4 py-2 text-right font-mono">{j.copies}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest border ${STATUS_COLORS[j.status] || ""}`}>{j.status}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-zinc-500">{new Date(j.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-1">
                        {j.status === "queued" && (
                          <button onClick={() => patch(j.id, "printing")} title="Start printing"
                            className="h-8 w-8 rounded-md border border-zinc-200 flex items-center justify-center hover:bg-blue-50 text-blue-700">
                            <Play size={14} />
                          </button>
                        )}
                        {(j.status === "queued" || j.status === "printing") && (
                          <>
                            <button onClick={() => patch(j.id, "done")} title="Mark done"
                              className="h-8 w-8 rounded-md border border-zinc-200 flex items-center justify-center hover:bg-green-50 text-green-700" data-testid={`done-${j.id}`}>
                              <Check size={14} />
                            </button>
                            <button onClick={() => patch(j.id, "cancelled")} title="Cancel"
                              className="h-8 w-8 rounded-md border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 text-zinc-700">
                              <X size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => remove(j.id)} title="Delete"
                          className="h-8 w-8 rounded-md border border-zinc-200 flex items-center justify-center hover:bg-red-50 text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
