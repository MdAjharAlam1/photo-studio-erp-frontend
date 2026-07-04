import { useRef, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { PDFDocument, degrees } from "pdf-lib";
import {
  FilePlus as FileArrowUp, Repeat as ArrowsClockwise, Scissors, Upload,
  ArrowDownToLine as DownloadSimple, Layers as Stack, X, ChevronUp, ChevronDown, Plus,
} from "lucide-react";

const TOOLS = [
  { id: "jpg2pdf", name: "JPG → PDF", icon: FileArrowUp, desc: "Convert images to one PDF" },
  { id: "merge", name: "Merge PDFs", icon: Stack, desc: "Combine multiple PDFs" },
  { id: "split", name: "Split PDF", icon: Scissors, desc: "Extract page range" },
  { id: "rotate", name: "Rotate PDF", icon: ArrowsClockwise, desc: "Rotate all pages" },
];

async function readAsBytes(file) {
  return new Uint8Array(await file.arrayBuffer());
}

function downloadBytes(bytes, name) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function PdfTools() {
  const [tab, setTab] = useState("jpg2pdf");
  const [files, setFiles] = useState([]);
  const [range, setRange] = useState("1-1");
  const [rotation, setRotation] = useState(90);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const multi = tab === "merge" || tab === "jpg2pdf";
  const accept = tab === "jpg2pdf" ? "image/*" : "application/pdf";

  const switchTab = (id) => {
    setTab(id);
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onPick = (fs) => {
    const arr = Array.from(fs || []);
    if (!arr.length) return;
    if (multi) {
      // Append (dedup by name+size+lastModified) so users can click "Add" many times.
      setFiles((prev) => {
        const key = (f) => `${f.name}|${f.size}|${f.lastModified}`;
        const existing = new Set(prev.map(key));
        const additions = arr.filter((f) => !existing.has(key(f)));
        return [...prev, ...additions];
      });
    } else {
      setFiles([arr[0]]);
    }
    // Reset native input so selecting the same file again fires change.
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i, dir) => setFiles((prev) => {
    const j = i + dir;
    if (j < 0 || j >= prev.length) return prev;
    const next = prev.slice();
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const clearAll = () => setFiles([]);

  const run = async () => {
    if (!files.length) return toast.error("Upload file(s) first");
    if (tab === "merge" && files.length < 2) return toast.error("Add at least 2 PDFs to merge");
    setBusy(true);
    try {
      if (tab === "jpg2pdf") {
        const doc = await PDFDocument.create();
        for (const f of files) {
          const bytes = await readAsBytes(f);
          const img = /png$/i.test(f.name) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
          const page = doc.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
        downloadBytes(await doc.save(), "images.pdf");
      } else if (tab === "merge") {
        const merged = await PDFDocument.create();
        for (const f of files) {
          const src = await PDFDocument.load(await readAsBytes(f));
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        }
        downloadBytes(await merged.save(), "merged.pdf");
      } else if (tab === "split") {
        const src = await PDFDocument.load(await readAsBytes(files[0]));
        const total = src.getPageCount();
        const [a, b] = range.split("-").map(Number);
        const from = Math.max(1, a || 1) - 1;
        const to = Math.min(total, b || a || 1);
        if (from >= to) throw new Error("Invalid page range");
        const out = await PDFDocument.create();
        const pages = await out.copyPages(src, Array.from({ length: to - from }, (_, i) => from + i));
        pages.forEach((p) => out.addPage(p));
        downloadBytes(await out.save(), `split-${from + 1}-${to}.pdf`);
      } else if (tab === "rotate") {
        const src = await PDFDocument.load(await readAsBytes(files[0]));
        src.getPages().forEach((p) => p.setRotation(degrees(rotation)));
        downloadBytes(await src.save(), "rotated.pdf");
      }
      toast.success("Done — check downloads");
    } catch (e) {
      toast.error("Failed: " + (e.message || String(e)));
    }
    setBusy(false);
  };

  return (
    <div>
      <PageHeader eyebrow="Utilities" title="PDF Tools" description="Merge, split, rotate & convert PDFs — private, in-browser processing." />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="space-y-1">
          {TOOLS.map((t) => {
            const I = t.icon;
            return (
              <button
                key={t.id}
                data-testid={`pdftool-${t.id}`}
                onClick={() => switchTab(t.id)}
                className={`w-full text-left px-4 py-3 rounded-md border flex items-center gap-3 ${tab === t.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:border-zinc-300"}`}
              >
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
          <label
            className="block border-2 border-dashed border-zinc-300 rounded-md p-6 text-center cursor-pointer hover:border-[#0052FF]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files); }}
          >
            <Upload size={28} className="mx-auto text-zinc-400" />
            <div className="mt-2 text-sm">
              {files.length
                ? (multi ? `Add more or drop files here` : "Replace file")
                : (multi ? "Drop files or click to upload" : "Drop file or click to upload")}
            </div>
            {multi && (
              <div className="text-[11px] text-zinc-500 mt-1">
                Tip: hold <span className="font-mono">Ctrl</span> / <span className="font-mono">⌘</span> to pick multiple files at once
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={multi}
              className="hidden"
              onChange={(e) => onPick(e.target.files)}
              data-testid="pdf-upload"
            />
          </label>

          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="label-uppercase">Files ({files.length})</div>
                <div className="flex gap-2">
                  {multi && (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      data-testid="pdf-add-more"
                      className="h-8 px-2 border border-zinc-300 rounded-md text-xs flex items-center gap-1 hover:bg-zinc-50"
                    >
                      <Plus size={12} /> Add more
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearAll}
                    className="h-8 px-2 border border-red-200 text-red-700 rounded-md text-xs hover:bg-red-50"
                  >
                    Clear all
                  </button>
                </div>
              </div>
              <ul className="text-sm font-mono text-zinc-700 divide-y divide-zinc-100 border border-zinc-200 rounded-md max-h-56 overflow-auto" data-testid="pdf-file-list">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50" data-testid={`pdf-file-${i}`}>
                    <span className="text-[10px] text-zinc-400 w-5">{i + 1}.</span>
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-[10px] text-zinc-500">{Math.round(f.size / 1024)} KB</span>
                    {multi && (
                      <>
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                          className="h-6 w-6 rounded-md hover:bg-zinc-100 text-zinc-500 disabled:opacity-30" title="Move up">
                          <ChevronUp size={14} />
                        </button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === files.length - 1}
                          className="h-6 w-6 rounded-md hover:bg-zinc-100 text-zinc-500 disabled:opacity-30" title="Move down">
                          <ChevronDown size={14} />
                        </button>
                      </>
                    )}
                    <button type="button" onClick={() => remove(i)}
                      className="h-6 w-6 rounded-md hover:bg-red-50 text-red-600" title="Remove" data-testid={`pdf-remove-${i}`}>
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              {tab === "merge" && files.length < 2 && (
                <div className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
                  Add at least one more PDF to merge.
                </div>
              )}
            </div>
          )}

          {tab === "split" && (
            <div>
              <div className="label-uppercase mb-1">Page range (e.g. 1-3)</div>
              <input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full h-10 px-3 border border-zinc-300 rounded-md"
                data-testid="page-range"
              />
            </div>
          )}
          {tab === "rotate" && (
            <div>
              <div className="label-uppercase mb-1">Rotation</div>
              <div className="flex gap-2">
                {[90, 180, 270].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRotation(r)}
                    className={`h-10 flex-1 rounded-md border text-sm ${rotation === r ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-300"}`}
                  >
                    {r}°
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={run}
            disabled={busy}
            data-testid="run-pdftool"
            className="w-full h-11 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <DownloadSimple size={16} /> {busy ? "Processing…" : "Process & Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
