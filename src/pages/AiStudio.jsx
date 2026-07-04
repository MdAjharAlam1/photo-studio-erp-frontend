import { useState, useRef } from "react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Sparkles, Scissors, User, Maximize2, Wand2, Upload, ArrowDownToLine as DownloadSimple, ImageIcon } from "lucide-react";

const TOOLS = [
  { id: "bg-remove", name: "Remove Background", icon: Scissors, desc: "AI cutout (birefnet)", endpoint: "/ai/bg-remove", accent: "text-purple-700 bg-purple-50 border-purple-200" },
  { id: "face-enhance", name: "Face Enhance", icon: User, desc: "CodeFormer restore + subtle upscale", endpoint: "/ai/face-enhance", accent: "text-blue-700 bg-blue-50 border-blue-200" },
  { id: "upscale", name: "Upscale 2×/4×", icon: Maximize2, desc: "ESRGAN super-resolution", endpoint: "/ai/upscale", accent: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "restore", name: "Restore Old Photo", icon: Wand2, desc: "Fix scratches / low quality", endpoint: "/ai/restore", accent: "text-amber-700 bg-amber-50 border-amber-200" },
];

async function fileToDataUrl(file, maxSide = 1400) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = reject; img.src = r.result;
    };
    r.onerror = reject; r.readAsDataURL(file);
  });
}

export default function AiStudio() {
  const [tool, setTool] = useState(TOOLS[0]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [scale, setScale] = useState(2);
  const [fidelity, setFidelity] = useState(0.7);
  const fileRef = useRef();

  const onPick = async (f) => {
    if (!f) return;
    try {
      const url = await fileToDataUrl(f);
      setInput(url); setOutput("");
      toast.success("Image loaded");
    } catch { toast.error("Could not read image"); }
  };

  const run = async () => {
    if (!input) return toast.error("Upload an image first");
    setBusy(true); setOutput("");
    try {
      const payload = { image: input };
      if (tool.id === "upscale") payload.scale = Number(scale);
      if (tool.id === "face-enhance" || tool.id === "restore") payload.fidelity = Number(fidelity);
      const { data } = await api.post(tool.endpoint, payload);
      setOutput(data.image_url);
      toast.success("Done");
    } catch (e) { toast.error(formatApiError(e)); }
    setBusy(false);
  };

  const download = () => {
    if (!output) return;
    const a = document.createElement("a"); a.href = output; a.download = `${tool.id}.png`; a.target = "_blank"; a.click();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Utilities"
        title="AI Studio"
        description="Background cutout, face enhancement, upscaling & old-photo restoration — powered by fal.ai."
      />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <div className="space-y-1">
          {TOOLS.map((t) => {
            const I = t.icon;
            const active = tool.id === t.id;
            return (
              <button key={t.id} onClick={() => { setTool(t); setOutput(""); }} data-testid={`ai-tool-${t.id}`}
                className={`w-full text-left px-4 py-3 rounded-md border flex items-center gap-3 ${active ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
                <I size={18} />
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className={`text-[11px] ${active ? "text-zinc-300" : "text-zinc-500"}`}>{t.desc}</div>
                </div>
              </button>
            );
          })}
          <div className="mt-4 text-[11px] text-zinc-500 border border-zinc-200 rounded-md p-3 bg-zinc-50">
            <Sparkles size={12} className="inline mr-1" /> Requires an active fal.ai balance.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-200 rounded-md p-5">
            <div className="label-uppercase mb-2">Input</div>
            <label className="block border-2 border-dashed border-zinc-300 rounded-md p-6 text-center cursor-pointer hover:border-[#0052FF] mb-3"
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files?.[0]); }}>
              <Upload size={24} className="mx-auto text-zinc-400" />
              <div className="mt-1 text-xs text-zinc-500">Drop image or click to upload</div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} data-testid="ai-upload" />
            </label>
            {input ? (
              <img src={input} alt="input" className="w-full max-h-[380px] object-contain bg-zinc-50 rounded" />
            ) : (
              <div className="h-40 flex items-center justify-center text-zinc-400"><ImageIcon size={22} /></div>
            )}

            {tool.id === "upscale" && (
              <div className="mt-3">
                <div className="label-uppercase mb-1">Scale</div>
                <div className="flex gap-2">
                  {[2, 4].map((s) => (
                    <button key={s} onClick={() => setScale(s)}
                      className={`h-9 px-3 rounded-md border text-sm ${scale === s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-300"}`}>
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(tool.id === "face-enhance" || tool.id === "restore") && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1"><span className="label-uppercase">Fidelity</span><span className="font-mono">{fidelity.toFixed(2)}</span></div>
                <input type="range" min="0" max="1" step="0.05" value={fidelity} onChange={(e) => setFidelity(Number(e.target.value))} className="w-full" />
                <div className="text-[10px] text-zinc-500 mt-1">Lower = more restoration, higher = closer to original.</div>
              </div>
            )}

            <button onClick={run} disabled={busy || !input} data-testid="ai-run"
              className="mt-4 w-full h-11 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-60">
              <Sparkles size={16} /> {busy ? "Processing…" : `Run ${tool.name}`}
            </button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="label-uppercase">Result</div>
              {output && (
                <button onClick={download} data-testid="ai-download"
                  className="h-8 px-3 border border-zinc-300 rounded-md text-xs flex items-center gap-1 hover:bg-zinc-50">
                  <DownloadSimple size={12} /> Download
                </button>
              )}
            </div>
            {output ? (
              <a href={output} target="_blank" rel="noreferrer">
                <img src={output} alt="output" className="w-full max-h-[520px] object-contain bg-[repeating-conic-gradient(#e4e4e7_0deg_90deg,transparent_90deg_180deg)] bg-[length:16px_16px] rounded" data-testid="ai-result" />
              </a>
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-400 text-sm">Output appears here</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
