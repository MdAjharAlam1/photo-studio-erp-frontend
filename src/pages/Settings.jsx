import { useEffect, useRef, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Upload, Trash2, ImageIcon } from "lucide-react";

const empty = {
  name: "", tagline: "", gstin: "", phone: "", email: "", address: "",
  upi_id: "", upi_name: "", logo: "",
};

async function fileToDataUrl(file, maxSide = 512) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = r.result;
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();
  const canEdit = ["owner", "manager"].includes(user?.role);

  useEffect(() => {
    api.get("/settings/studio").then(({ data }) => setForm({ ...empty, ...(data || {}) })).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.put("/settings/studio", form); toast.success("Studio profile saved"); }
    catch (e) { toast.error(formatApiError(e)); }
    setBusy(false);
  };

  const onLogo = async (f) => {
    if (!f) return;
    try {
      const dataUrl = await fileToDataUrl(f);
      setForm(x => ({ ...x, logo: dataUrl }));
      toast.success("Logo loaded — click Save to keep it");
    } catch { toast.error("Could not read image"); }
  };

  return (
    <div>
      <PageHeader eyebrow="System" title="Settings" description="Your studio profile appears on every invoice and shared receipt." />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-md p-5">
          <div className="label-uppercase">Signed in as</div>
          <div className="mt-2 font-heading text-xl">{user?.name}</div>
          <div className="text-sm text-zinc-500">{user?.email}</div>
          <div className="mt-4 inline-flex items-center gap-2 px-2 py-1 bg-zinc-100 rounded-md text-xs uppercase tracking-[0.2em]">{user?.role}</div>
          <div className="mt-6 border-t border-zinc-100 pt-4">
            <div className="label-uppercase mb-2">Logo</div>
            {form.logo ? (
              <div className="border border-zinc-200 rounded-md p-3 bg-zinc-50 flex items-center justify-center h-32">
                <img src={form.logo} alt="Studio logo" className="max-h-24 object-contain" />
              </div>
            ) : (
              <div className="border border-dashed border-zinc-300 rounded-md p-3 flex flex-col items-center justify-center h-32 text-zinc-400">
                <ImageIcon size={22} />
                <div className="text-xs mt-1">No logo</div>
              </div>
            )}
            {canEdit && (
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => fileRef.current?.click()} data-testid="upload-logo"
                  className="h-9 px-3 border border-zinc-300 rounded-md text-sm flex items-center gap-1 hover:bg-zinc-50">
                  <Upload size={14} /> Upload
                </button>
                {form.logo && (
                  <button type="button" onClick={() => setForm(x => ({ ...x, logo: "" }))}
                    className="h-9 px-3 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-1 hover:bg-red-50">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={save} className="lg:col-span-2 bg-white border border-zinc-200 rounded-md p-5" data-testid="studio-form">
          <div className="label-uppercase">Studio profile</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {[
              ["name", "Studio name"],
              ["tagline", "Tagline"],
              ["gstin", "GSTIN"],
              ["phone", "Phone"],
              ["email", "Email"],
              ["upi_id", "UPI ID (for QR)"],
              ["upi_name", "UPI Name (for QR)"],
            ].map(([k, l]) => (
              <div key={k}>
                <label className="label-uppercase block mb-1">{l}</label>
                <input value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  disabled={!canEdit} data-testid={`studio-${k}`}
                  className="w-full h-10 px-3 border border-zinc-300 rounded-md disabled:bg-zinc-50" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="label-uppercase block mb-1">Address</label>
              <textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })}
                disabled={!canEdit} rows={2} data-testid="studio-address"
                className="w-full px-3 py-2 border border-zinc-300 rounded-md disabled:bg-zinc-50" />
            </div>
          </div>
          {canEdit ? (
            <button type="submit" disabled={busy} data-testid="save-studio"
              className="mt-4 h-10 px-5 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium">
              {busy ? "Saving…" : "Save profile"}
            </button>
          ) : (
            <div className="mt-4 text-xs text-zinc-500">Only owner/manager can edit.</div>
          )}
        </form>
      </div>
    </div>
  );
}
