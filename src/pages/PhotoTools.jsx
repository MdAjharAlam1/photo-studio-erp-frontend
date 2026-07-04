import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { ImageIcon, ArrowDownToLine as DownloadSimple, Upload, Repeat as ArrowsClockwise, Minimize2 as ArrowsIn, Maximize2 as ArrowsOut, Droplet as Drop } from "lucide-react";
const ImgIcon = ImageIcon;

const TOOLS = [
  { id: "compress", name: "Compress", icon: ArrowsIn, desc: "Reduce JPG/PNG file size" },
  { id: "resize", name: "Resize by KB", icon: ArrowsOut, desc: "Target file size (PI7 style)" },
  { id: "watermark", name: "Watermark", icon: Drop, desc: "Add text watermark" },
  { id: "convert", name: "Convert", icon: ArrowsClockwise, desc: "JPG ↔ PNG ↔ WebP" },
];

const download = (dataUrl, filename) => {
  const a = document.createElement("a"); a.href = dataUrl; a.download = filename; a.click();
};

async function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

function drawToCanvas(img, w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return c;
}

export default function PhotoTools() {
  const [tab, setTab] = useState("compress");
  const [file, setFile] = useState(null); // {src, name, size}
  const [quality, setQuality] = useState(0.75);
  const [targetKb, setTargetKb] = useState(50);
  const [wm, setWm] = useState("© Studio");
  const [fmt, setFmt] = useState("jpeg");
  const [outSize, setOutSize] = useState(null);

  const onPick = (f) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setFile({ src: r.result, name: f.name, size: f.size });
    r.readAsDataURL(f);
    setOutSize(null);
  };

  const run = async () => {
    if (!file) return toast.error("Upload an image first");
    const img = await loadImg(file.src);

    if (tab === "compress") {
      const c = drawToCanvas(img, img.width, img.height);
      const out = c.toDataURL("image/jpeg", quality);
      const kb = Math.round((out.length * 0.75) / 1024);
      download(out, file.name.replace(/\.\w+$/, "") + `-compressed.jpg`);
      setOutSize(kb);
      toast.success(`Downloaded ${kb} KB`);
    } else if (tab === "resize") {
      // Binary search quality to target size
      let lo = 0.05, hi = 0.95, best = null, bestKb = Infinity;
      for (let i = 0; i < 8; i++) {
        const q = (lo + hi) / 2;
        const c = drawToCanvas(img, img.width, img.height);
        const url = c.toDataURL("image/jpeg", q);
        const kb = (url.length * 0.75) / 1024;
        if (kb > targetKb) hi = q; else { lo = q; best = url; bestKb = kb; }
      }
      if (!best) { const c = drawToCanvas(img, img.width, img.height); best = c.toDataURL("image/jpeg", 0.05); }
      download(best, file.name.replace(/\.\w+$/, "") + `-${targetKb}kb.jpg`);
      setOutSize(Math.round(bestKb));
      toast.success(`Downloaded ~${Math.round(bestKb)} KB`);
    } else if (tab === "watermark") {
      const c = drawToCanvas(img, img.width, img.height);
      const ctx = c.getContext("2d");
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = "#ffffff";
      const fs = Math.max(24, Math.round(img.width / 22));
      ctx.font = `bold ${fs}px 'IBM Plex Sans', sans-serif`;
      ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 6;
      ctx.fillText(wm, img.width - 20, img.height - 20);
      download(c.toDataURL("image/jpeg", 0.92), file.name.replace(/\.\w+$/, "") + "-wm.jpg");
      toast.success("Watermark added");
    } else if (tab === "convert") {
      const c = drawToCanvas(img, img.width, img.height);
      const mime = fmt === "png" ? "image/png" : fmt === "webp" ? "image/webp" : "image/jpeg";
      const url = c.toDataURL(mime, 0.92);
      download(url, file.name.replace(/\.\w+$/, "") + "." + fmt);
      toast.success(`Converted to ${fmt.toUpperCase()}`);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Utilities" title="Photo Tools" description="Compress, resize, watermark and convert — 100% offline in your browser." />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="space-y-1">
          {TOOLS.map(t => {
            const I = t.icon;
            return (
              <button key={t.id} data-testid={`tool-${t.id}`} onClick={() => setTab(t.id)}
                className={`w-full text-left px-4 py-3 rounded-md border flex items-center gap-3 ${tab === t.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
                <I size={18} />
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className={`text-[11px] ${tab === t.id ? "text-zinc-300" : "text-zinc-500"}`}>{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-zinc-200 rounded-md p-6 space-y-5">
          <label className="block border-2 border-dashed border-zinc-300 rounded-md p-6 text-center cursor-pointer hover:border-[#0052FF]"
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files?.[0]); }}>
            <Upload size={28} className="mx-auto text-zinc-400" />
            <div className="mt-2 text-sm">{file ? file.name : "Drop image or click to upload"}</div>
            {file && <div className="text-xs text-zinc-500 mt-1 font-mono">{Math.round(file.size / 1024)} KB</div>}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} data-testid="tool-upload" />
          </label>

          {tab === "compress" && (
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="label-uppercase">Quality</span><span className="font-mono">{Math.round(quality * 100)}%</span></div>
              <input type="range" min="0.1" max="0.95" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
            </div>
          )}
          {tab === "resize" && (
            <div>
              <div className="label-uppercase mb-1">Target size (KB)</div>
              <input type="number" min="5" max="2000" value={targetKb} onChange={(e) => setTargetKb(Number(e.target.value))} className="w-full h-10 px-3 border border-zinc-300 rounded-md" data-testid="target-kb" />
            </div>
          )}
          {tab === "watermark" && (
            <div>
              <div className="label-uppercase mb-1">Watermark text</div>
              <input value={wm} onChange={(e) => setWm(e.target.value)} className="w-full h-10 px-3 border border-zinc-300 rounded-md" />
            </div>
          )}
          {tab === "convert" && (
            <div>
              <div className="label-uppercase mb-1">Output format</div>
              <div className="flex gap-2">
                {["jpeg", "png", "webp"].map(f => (
                  <button key={f} onClick={() => setFmt(f)} className={`h-10 flex-1 rounded-md border text-sm uppercase ${fmt === f ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-300"}`}>{f}</button>
                ))}
              </div>
            </div>
          )}

          <button onClick={run} data-testid="run-tool" className="w-full h-11 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium flex items-center justify-center gap-2">
            <DownloadSimple size={16} /> Process & Download
          </button>

          {outSize !== null && <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md p-2">Output ≈ {outSize} KB</div>}
        </div>
      </div>
    </div>
  );
}
