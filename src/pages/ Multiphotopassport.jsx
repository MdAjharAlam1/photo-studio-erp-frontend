// import { useEffect, useRef, useState, useCallback, useMemo } from "react";
// import { toast } from "sonner";
// import { PASSPORT_SIZES, PAPER_SIZES } from "@/lib/passportSizes";
// import PageHeader from "@/components/PageHeader";
// import {
//   Upload,
//   Trash,
//   DownloadSimple,
//   Printer,
//   Stack,
//   Plus,
//   Minus,
// } from "@phosphor-icons/react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// // mm → px factor for on-screen paper display (same as PassportMaker.jsx)
// const MM_PX = 3.2;

// let uid = 0;
// const nextId = () => `mpp-${Date.now()}-${uid++}`;

// export default function MultiPhotoPassport() {
//   const [size, setSize] = useState(PASSPORT_SIZES[0]);
//   const [paper, setPaper] = useState(PAPER_SIZES[0]);
//   const [items, setItems] = useState([]); // { id, name, src, copies }
//   const [hGap, setHGap] = useState(6);
//   const [vGap, setVGap] = useState(6);
//   const [margin, setMargin] = useState(10);
//   const [autoCenter, setAutoCenter] = useState(true);
//   const [keepTogether, setKeepTogether] = useState(true);
//   const [border, setBorder] = useState({
//     width: 0,
//     color: "#000000",
//     radius: 0,
//   });
//   const fileRef = useRef();
//   const pageRefs = useRef([]);

//   const addPhotos = (fileList) => {
//     const files = Array.from(fileList || []);
//     if (!files.length) return;
//     files.forEach((file) => {
//       const reader = new FileReader();
//       reader.onload = () => {
//         setItems((prev) => [
//           ...prev,
//           {
//             id: nextId(),
//             name: file.name.replace(/\.[^.]+$/, ""),
//             src: reader.result,
//             copies: 5,
//           },
//         ]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const updateItem = (id, patch) =>
//     setItems((prev) =>
//       prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
//     );
//   const removeItem = (id) =>
//     setItems((prev) => prev.filter((it) => it.id !== id));

//   // Grid geometry for the chosen passport size + paper + gaps/margin
//   const grid = useMemo(() => {
//     const pW = paper.w * MM_PX;
//     const pH = paper.h * MM_PX;
//     const w = size.w * MM_PX;
//     const h = size.h * MM_PX;
//     const cols = Math.max(1, Math.floor((pW - 2 * margin + hGap) / (w + hGap)));
//     const rows = Math.max(1, Math.floor((pH - 2 * margin + vGap) / (h + vGap)));
//     return { pW, pH, w, h, cols, rows, capacity: cols * rows };
//   }, [paper, size, hGap, vGap, margin]);

//   // Pack every copy of every uploaded photo onto as few pages as possible,
//   // keeping each photo's copies together on a page when they fit.
//   const pages = useMemo(() => {
//     const { cols, rows, capacity, w, h, pW, pH } = grid;
//     if (capacity <= 0 || items.length === 0) return [];

//     const bucket = [[]];
//     let used = 0;
//     items.forEach((item) => {
//       let remaining = item.copies;
//       if (remaining <= 0) return;
//       while (remaining > 0) {
//         let slotsLeft = capacity - used;
//         if (slotsLeft === 0) {
//           bucket.push([]);
//           used = 0;
//           slotsLeft = capacity;
//         }
//         // Start a fresh page instead of splitting this photo's copies,
//         // as long as the whole batch fits on one empty page.
//         if (keepTogether && used > 0 && remaining <= capacity && remaining > slotsLeft) {
//           bucket.push([]);
//           used = 0;
//           slotsLeft = capacity;
//         }
//         const take = Math.min(remaining, slotsLeft);
//         const current = bucket[bucket.length - 1];
//         for (let i = 0; i < take; i++) {
//           current.push({ src: item.src, itemId: item.id, itemName: item.name });
//         }
//         used += take;
//         remaining -= take;
//       }
//     });

//     const totalW = cols * w + (cols - 1) * hGap;
//     const totalH = rows * h + (rows - 1) * vGap;
//     const offX = autoCenter ? (pW - totalW) / 2 : margin;
//     const offY = autoCenter ? (pH - totalH) / 2 : margin;

//     return bucket
//       .filter((p) => p.length > 0)
//       .map((tiles) =>
//         tiles.map((t, idx) => {
//           const row = Math.floor(idx / cols);
//           const col = idx % cols;
//           return {
//             id: nextId(),
//             src: t.src,
//             itemId: t.itemId,
//             itemName: t.itemName,
//             x: offX + col * (w + hGap),
//             y: offY + row * (h + vGap),
//             w,
//             h,
//           };
//         }),
//       );
//   }, [grid, items, hGap, vGap, margin, autoCenter, keepTogether]);

//   const totalCopies = items.reduce((s, i) => s + (i.copies || 0), 0);

//   const exportPdf = async () => {
//     if (!pages.length) {
//       toast.error("Add at least one photo first");
//       return;
//     }
//     const isLandscape = paper.w > paper.h;
//     const pdf = new jsPDF({
//       orientation: isLandscape ? "l" : "p",
//       unit: "mm",
//       format: paper.id === "a4" ? "a4" : [paper.w, paper.h],
//     });
//     for (let i = 0; i < pageRefs.current.length; i++) {
//       const node = pageRefs.current[i];
//       if (!node) continue;
//       const canvas = await html2canvas(node, { scale: 3, backgroundColor: "#ffffff" });
//       const img = canvas.toDataURL("image/jpeg", 0.95);
//       if (i > 0) pdf.addPage(paper.id === "a4" ? "a4" : [paper.w, paper.h], isLandscape ? "l" : "p");
//       pdf.addImage(img, "JPEG", 0, 0, paper.w, paper.h);
//     }
//     pdf.save(`multi-photo-layout-${paper.id}.pdf`);
//     toast.success(`PDF exported (${pages.length} page${pages.length > 1 ? "s" : ""})`);
//   };

//   const exportPng = async (idx) => {
//     const node = pageRefs.current[idx];
//     if (!node) return;
//     const canvas = await html2canvas(node, { scale: 3, backgroundColor: "#ffffff" });
//     const link = document.createElement("a");
//     link.href = canvas.toDataURL("image/png");
//     link.download = `multi-photo-layout-page${idx + 1}.png`;
//     link.click();
//   };

//   return (
//     <div>
//       <PageHeader
//         eyebrow="Passport Photo Maker"
//         title="Multi-Photo Passport"
//         description="Upload photos for several customers and print them all on the same sheet — no page wasted."
//       />

//       <div className="p-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
//         {/* Left: controls */}
//         <aside className="space-y-5">
//           <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-4">
//             <div>
//               <div className="label-uppercase mb-2">Passport Size</div>
//               <select
//                 value={size.id}
//                 onChange={(e) =>
//                   setSize(PASSPORT_SIZES.find((s) => s.id === e.target.value))
//                 }
//                 className="w-full h-10 border border-zinc-300 rounded-md px-2 text-sm bg-white"
//                 data-testid="mpp-size"
//               >
//                 {PASSPORT_SIZES.map((s) => (
//                   <option key={s.id} value={s.id}>
//                     {s.label}
//                   </option>
//                 ))}
//               </select>
//               <div className="text-[10px] font-mono text-zinc-500 mt-1">
//                 {size.w} × {size.h} mm — applies to every photo
//               </div>
//             </div>

//             <div>
//               <div className="label-uppercase mb-2">Paper Size</div>
//               <select
//                 value={paper.id}
//                 onChange={(e) =>
//                   setPaper(PAPER_SIZES.find((p) => p.id === e.target.value))
//                 }
//                 className="w-full h-10 border border-zinc-300 rounded-md px-2 text-sm bg-white"
//                 data-testid="mpp-paper"
//               >
//                 {PAPER_SIZES.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.label}
//                   </option>
//                 ))}
//               </select>
//               <div className="text-[10px] font-mono text-zinc-500 mt-1">
//                 Fits {grid.cols} × {grid.rows} = {grid.capacity} photos / page
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <div className="label-uppercase mb-2">H. Gap</div>
//                 <input
//                   type="number"
//                   min={0}
//                   max={40}
//                   value={hGap}
//                   onChange={(e) => setHGap(Number(e.target.value) || 0)}
//                   className="w-full h-9 border border-zinc-300 rounded-md px-2 text-sm"
//                 />
//               </div>
//               <div>
//                 <div className="label-uppercase mb-2">V. Gap</div>
//                 <input
//                   type="number"
//                   min={0}
//                   max={40}
//                   value={vGap}
//                   onChange={(e) => setVGap(Number(e.target.value) || 0)}
//                   className="w-full h-9 border border-zinc-300 rounded-md px-2 text-sm"
//                 />
//               </div>
//             </div>

//             <div>
//               <div className="label-uppercase mb-2">Page Margin (px)</div>
//               <input
//                 type="number"
//                 min={0}
//                 max={60}
//                 value={margin}
//                 onChange={(e) => setMargin(Number(e.target.value) || 0)}
//                 className="w-full h-9 border border-zinc-300 rounded-md px-2 text-sm"
//               />
//             </div>

//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 checked={autoCenter}
//                 onChange={(e) => setAutoCenter(e.target.checked)}
//               />
//               Center grid on page
//             </label>
//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 checked={keepTogether}
//                 onChange={(e) => setKeepTogether(e.target.checked)}
//               />
//               Keep each photo's copies together
//             </label>
//           </div>

//           {/* Border controls */}
//           <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-3">
//             <div className="label-uppercase">Photo Border</div>
//             <div>
//               <div className="flex justify-between text-xs mb-1">
//                 <span className="label-uppercase">Width</span>
//                 <span className="font-mono">{border.width}px</span>
//               </div>
//               <input
//                 type="range"
//                 min="0"
//                 max="20"
//                 value={border.width}
//                 onChange={(e) =>
//                   setBorder((b) => ({ ...b, width: Number(e.target.value) }))
//                 }
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <div className="flex justify-between text-xs mb-1">
//                 <span className="label-uppercase">Radius</span>
//                 <span className="font-mono">{border.radius}px</span>
//               </div>
//               <input
//                 type="range"
//                 min="0"
//                 max="60"
//                 value={border.radius}
//                 onChange={(e) =>
//                   setBorder((b) => ({ ...b, radius: Number(e.target.value) }))
//                 }
//                 className="w-full"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="label-uppercase flex-1">Color</div>
//               <input
//                 type="color"
//                 value={border.color}
//                 onChange={(e) =>
//                   setBorder((b) => ({ ...b, color: e.target.value }))
//                 }
//                 className="w-10 h-9 rounded border border-zinc-300 bg-white cursor-pointer p-0.5"
//               />
//             </div>
//           </div>

//           {/* Summary */}
//           <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-2">
//             <div className="label-uppercase">Summary</div>
//             <div className="text-sm flex justify-between">
//               <span className="text-zinc-500">Photos added</span>
//               <span className="font-mono">{items.length}</span>
//             </div>
//             <div className="text-sm flex justify-between">
//               <span className="text-zinc-500">Total prints</span>
//               <span className="font-mono">{totalCopies}</span>
//             </div>
//             <div className="text-sm flex justify-between">
//               <span className="text-zinc-500">Pages needed</span>
//               <span className="font-mono" data-testid="mpp-page-count">
//                 {pages.length}
//               </span>
//             </div>
//             <button
//               onClick={exportPdf}
//               data-testid="mpp-export-pdf"
//               className="w-full h-10 mt-2 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm flex items-center justify-center gap-2"
//             >
//               <DownloadSimple size={16} /> Export All Pages (PDF)
//             </button>
//             <button
//               onClick={() => window.print()}
//               className="w-full h-10 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"
//             >
//               <Printer size={16} /> Print
//             </button>
//           </div>
//         </aside>

//         {/* Right: photo list + page previews */}
//         <div className="space-y-6">
//           {/* Upload + list */}
//           <div className="bg-white border border-zinc-200 rounded-md p-4">
//             <div className="flex items-center justify-between mb-3">
//               <div className="label-uppercase">Photos to combine</div>
//               <button
//                 onClick={() => fileRef.current?.click()}
//                 data-testid="mpp-add-photo"
//                 className="h-9 px-3 border border-zinc-300 rounded-md text-xs flex items-center gap-2 hover:border-zinc-400"
//               >
//                 <Upload size={14} /> Add photo(s)
//               </button>
//               <input
//                 ref={fileRef}
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 className="hidden"
//                 onChange={(e) => {
//                   addPhotos(e.target.files);
//                   e.target.value = "";
//                 }}
//               />
//             </div>

//             {items.length === 0 ? (
//               <div
//                 onDragOver={(e) => e.preventDefault()}
//                 onDrop={(e) => {
//                   e.preventDefault();
//                   addPhotos(e.dataTransfer.files);
//                 }}
//                 className="border-2 border-dashed border-zinc-300 rounded-md p-10 text-center text-sm text-zinc-500"
//               >
//                 Drop customer photos here, or click "Add photo(s)". Add one
//                 photo per customer — you'll set how many copies each needs.
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {items.map((it) => (
//                   <div
//                     key={it.id}
//                     className="flex items-center gap-3 border border-zinc-200 rounded-md p-2"
//                     data-testid={`mpp-item-${it.id}`}
//                   >
//                     <img
//                       src={it.src}
//                       alt={it.name}
//                       className="w-10 h-12 object-cover rounded"
//                     />
//                     <input
//                       value={it.name}
//                       onChange={(e) => updateItem(it.id, { name: e.target.value })}
//                       className="flex-1 h-9 px-2 border border-zinc-200 rounded-md text-sm"
//                       placeholder="Customer / label"
//                     />
//                     <div className="flex items-center gap-1">
//                       <button
//                         onClick={() =>
//                           updateItem(it.id, { copies: Math.max(1, it.copies - 1) })
//                         }
//                         className="w-8 h-8 border border-zinc-300 rounded-md flex items-center justify-center"
//                       >
//                         <Minus size={12} />
//                       </button>
//                       <input
//                         type="number"
//                         min={1}
//                         value={it.copies}
//                         onChange={(e) =>
//                           updateItem(it.id, {
//                             copies: Math.max(1, Number(e.target.value) || 1),
//                           })
//                         }
//                         className="w-14 h-8 text-center border border-zinc-300 rounded-md text-sm"
//                         data-testid={`mpp-copies-${it.id}`}
//                       />
//                       <button
//                         onClick={() => updateItem(it.id, { copies: it.copies + 1 })}
//                         className="w-8 h-8 border border-zinc-300 rounded-md flex items-center justify-center"
//                       >
//                         <Plus size={12} />
//                       </button>
//                     </div>
//                     <button
//                       onClick={() => removeItem(it.id)}
//                       className="w-8 h-8 rounded-md flex items-center justify-center text-red-600 hover:bg-red-50"
//                     >
//                       <Trash size={14} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Page previews */}
//           {pages.length === 0 ? (
//             <div className="canvas-bg rounded-md p-10 flex flex-col items-center justify-center text-zinc-400 gap-2">
//               <Stack size={32} />
//               <div className="text-sm">
//                 Combined layout will appear here once you add photos.
//               </div>
//             </div>
//           ) : (
//             pages.map((tiles, idx) => (
//               <div key={idx} className="canvas-bg rounded-md p-6">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="label-uppercase">
//                     Page {idx + 1} of {pages.length}
//                   </div>
//                   <button
//                     onClick={() => exportPng(idx)}
//                     className="h-8 px-3 border border-zinc-300 rounded-md text-xs flex items-center gap-1 bg-white"
//                   >
//                     <DownloadSimple size={12} /> PNG
//                   </button>
//                 </div>
//                 <div className="flex justify-center">
//                   <div
//                     ref={(el) => (pageRefs.current[idx] = el)}
//                     className="paper-sheet relative"
//                     style={{ width: grid.pW, height: grid.pH }}
//                     data-testid={`mpp-page-${idx}`}
//                   >
//                     {tiles.map((t) => (
//                       <div
//                         key={t.id}
//                         title={t.itemName}
//                         style={{
//                           position: "absolute",
//                           left: t.x,
//                           top: t.y,
//                           width: t.w,
//                           height: t.h,
//                           overflow: "hidden",
//                           border:
//                             border.width > 0
//                               ? `${border.width}px solid ${border.color}`
//                               : undefined,
//                           borderRadius: border.radius,
//                           boxSizing: "border-box",
//                         }}
//                       >
//                         <img
//                           src={t.src}
//                           alt={t.itemName}
//                           style={{
//                             width: "100%",
//                             height: "100%",
//                             objectFit: "cover",
//                             borderRadius: Math.max(0, border.radius - border.width),
//                           }}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 {/* Legend: which customer contributed how many prints on this page (screen only) */}
//                 <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500">
//                   {Object.entries(
//                     tiles.reduce((acc, t) => {
//                       acc[t.itemName] = (acc[t.itemName] || 0) + 1;
//                       return acc;
//                     }, {}),
//                   ).map(([name, count]) => (
//                     <span
//                       key={name}
//                       className="px-2 py-1 bg-white border border-zinc-200 rounded-full"
//                     >
//                       {name}: {count}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




// 



// import { useEffect, useRef, useState, useCallback, useMemo } from "react";
// import { toast } from "sonner";
// import { api, formatApiError } from "@/lib/api";
// import { PASSPORT_SIZES, PAPER_SIZES } from "@/lib/passportSizes";
// import PageHeader from "@/components/PageHeader";
// import {
//   Upload,
//   Trash,
//   DownloadSimple,
//   Printer,
//   Stack,
//   Plus,
//   Minus,
//   PencilSimple,
//   Crop as CropIcon,
//   ImageSquare,
//   SlidersHorizontal,
//   X,
// } from "@phosphor-icons/react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import Cropper from "react-easy-crop";

// // mm → px factor for on-screen paper display (same as PassportMaker.jsx)
// const MM_PX = 3.2;

// let uid = 0;
// const nextId = () => `mpp-${Date.now()}-${uid++}`;

// export default function MultiPhotoPassport() {
//   const [size, setSize] = useState(PASSPORT_SIZES[0]);
//   const [paper, setPaper] = useState(PAPER_SIZES[0]);
//   const [items, setItems] = useState([]); // { id, name, src, copies }
//   const [hGap, setHGap] = useState(6);
//   const [vGap, setVGap] = useState(6);
//   const [margin, setMargin] = useState(10);
//   const [autoCenter, setAutoCenter] = useState(true);
//   const [keepTogether, setKeepTogether] = useState(true);
//   const [border, setBorder] = useState({
//     width: 0,
//     color: "#000000",
//     radius: 0,
//   });
//   const fileRef = useRef();
//   const pageRefs = useRef([]);
//   const [editingId, setEditingId] = useState(null);
//   const editingItem = items.find((i) => i.id === editingId) || null;

//   // Billing
//   const [customers, setCustomers] = useState([]);
//   const [showNewCustomer, setShowNewCustomer] = useState(false);
//   const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
//   const [billingBusy, setBillingBusy] = useState(false);
//   const [invoices, setInvoices] = useState(null); // [{item, invoice}]

//   const loadCustomers = () => api.get("/customers").then(({ data }) => setCustomers(data));
//   useEffect(() => {
//     loadCustomers();
//   }, []);

//   const createCustomer = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await api.post("/customers", { ...newCustomer });
//       await loadCustomers();
//       setNewCustomer({ name: "", phone: "" });
//       setShowNewCustomer(false);
//       toast.success("Customer created — assign it below");
//     } catch (err) {
//       toast.error(formatApiError(err));
//     }
//   };

//   const addPhotos = (fileList) => {
//     const files = Array.from(fileList || []);
//     if (!files.length) return;
//     files.forEach((file) => {
//       const reader = new FileReader();
//       reader.onload = () => {
//         setItems((prev) => [
//           ...prev,
//           {
//             id: nextId(),
//             name: file.name.replace(/\.[^.]+$/, ""),
//             src: reader.result,
//             copies: 5,
//             customerId: "",
//             rate: 150,
//           },
//         ]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const updateItem = (id, patch) =>
//     setItems((prev) =>
//       prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
//     );
//   const removeItem = (id) =>
//     setItems((prev) => prev.filter((it) => it.id !== id));

//   // Grid geometry for the chosen passport size + paper + gaps/margin
//   const grid = useMemo(() => {
//     const pW = paper.w * MM_PX;
//     const pH = paper.h * MM_PX;
//     const w = size.w * MM_PX;
//     const h = size.h * MM_PX;
//     const cols = Math.max(1, Math.floor((pW - 2 * margin + hGap) / (w + hGap)));
//     const rows = Math.max(1, Math.floor((pH - 2 * margin + vGap) / (h + vGap)));
//     return { pW, pH, w, h, cols, rows, capacity: cols * rows };
//   }, [paper, size, hGap, vGap, margin]);

//   // Pack every copy of every uploaded photo onto as few pages as possible,
//   // keeping each photo's copies together on a page when they fit.
//   const pages = useMemo(() => {
//     const { cols, rows, capacity, w, h, pW, pH } = grid;
//     if (capacity <= 0 || items.length === 0) return [];

//     const bucket = [[]];
//     let used = 0;
//     items.forEach((item) => {
//       let remaining = item.copies;
//       if (remaining <= 0) return;
//       while (remaining > 0) {
//         let slotsLeft = capacity - used;
//         if (slotsLeft === 0) {
//           bucket.push([]);
//           used = 0;
//           slotsLeft = capacity;
//         }
//         // Start a fresh page instead of splitting this photo's copies,
//         // as long as the whole batch fits on one empty page.
//         if (keepTogether && used > 0 && remaining <= capacity && remaining > slotsLeft) {
//           bucket.push([]);
//           used = 0;
//           slotsLeft = capacity;
//         }
//         const take = Math.min(remaining, slotsLeft);
//         const current = bucket[bucket.length - 1];
//         for (let i = 0; i < take; i++) {
//           current.push({ src: item.src, itemId: item.id, itemName: item.name });
//         }
//         used += take;
//         remaining -= take;
//       }
//     });

//     const totalW = cols * w + (cols - 1) * hGap;
//     const totalH = rows * h + (rows - 1) * vGap;
//     const offX = autoCenter ? (pW - totalW) / 2 : margin;
//     const offY = autoCenter ? (pH - totalH) / 2 : margin;

//     return bucket
//       .filter((p) => p.length > 0)
//       .map((tiles) =>
//         tiles.map((t, idx) => {
//           const row = Math.floor(idx / cols);
//           const col = idx % cols;
//           return {
//             id: nextId(),
//             src: t.src,
//             itemId: t.itemId,
//             itemName: t.itemName,
//             x: offX + col * (w + hGap),
//             y: offY + row * (h + vGap),
//             w,
//             h,
//           };
//         }),
//       );
//   }, [grid, items, hGap, vGap, margin, autoCenter, keepTogether]);

//   const totalCopies = items.reduce((s, i) => s + (i.copies || 0), 0);
//   const gstRate = 18;
//   const billingSubtotal = items.reduce((s, i) => s + (i.copies || 0) * (i.rate || 0), 0);
//   const billingGst = billingSubtotal * (gstRate / 100);
//   const billingTotal = billingSubtotal + billingGst;
//   const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

//   const finalizeBilling = async () => {
//     if (items.length === 0) {
//       toast.error("Add at least one photo first");
//       return;
//     }
//     const unassigned = items.filter((it) => !it.customerId);
//     if (unassigned.length) {
//       toast.error("Assign a customer to every photo before finalizing");
//       return;
//     }
//     setBillingBusy(true);
//     try {
//       const results = [];
//       for (const it of items) {
//         await api.post("/orders", {
//           customer_id: it.customerId,
//           passport_size: size.label,
//           copies: it.copies,
//           paper_size: paper.label,
//         });
//         const { data: inv } = await api.post("/invoices", {
//           customer_id: it.customerId,
//           items: [
//             {
//               description: `${it.copies} × ${size.label} — combined sheet (${it.name})`,
//               quantity: 1,
//               rate: it.rate,
//               gst_rate: gstRate,
//             },
//           ],
//           payment_method: "cash",
//           status: "paid",
//           notes: `Multi-photo passport job — printed together with ${items.length - 1} other photo(s) to save paper`,
//         });
//         results.push({ item: it, invoice: inv });
//       }
//       setInvoices(results);
//       toast.success(`${results.length} invoice(s) generated`);
//     } catch (err) {
//       toast.error(formatApiError(err));
//     }
//     setBillingBusy(false);
//   };

//   const exportPdf = async () => {
//     if (!pages.length) {
//       toast.error("Add at least one photo first");
//       return;
//     }
//     const isLandscape = paper.w > paper.h;
//     const pdf = new jsPDF({
//       orientation: isLandscape ? "l" : "p",
//       unit: "mm",
//       format: paper.id === "a4" ? "a4" : [paper.w, paper.h],
//     });
//     for (let i = 0; i < pageRefs.current.length; i++) {
//       const node = pageRefs.current[i];
//       if (!node) continue;
//       const canvas = await html2canvas(node, { scale: 3, backgroundColor: "#ffffff" });
//       const img = canvas.toDataURL("image/jpeg", 0.95);
//       if (i > 0) pdf.addPage(paper.id === "a4" ? "a4" : [paper.w, paper.h], isLandscape ? "l" : "p");
//       pdf.addImage(img, "JPEG", 0, 0, paper.w, paper.h);
//     }
//     pdf.save(`multi-photo-layout-${paper.id}.pdf`);
//     toast.success(`PDF exported (${pages.length} page${pages.length > 1 ? "s" : ""})`);
//   };

//   const exportPng = async (idx) => {
//     const node = pageRefs.current[idx];
//     if (!node) return;
//     const canvas = await html2canvas(node, { scale: 3, backgroundColor: "#ffffff" });
//     const link = document.createElement("a");
//     link.href = canvas.toDataURL("image/png");
//     link.download = `multi-photo-layout-page${idx + 1}.png`;
//     link.click();
//   };

//   return (
//     <div>
//       <PageHeader
//         eyebrow="Passport Photo Maker"
//         title="Multi-Photo Passport"
//         description="Upload photos for several customers and print them all on the same sheet — no page wasted."
//       />

//       <div className="p-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
//         {/* Left: controls */}
//         <aside className="space-y-5">
//           <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-4">
//             <div>
//               <div className="label-uppercase mb-2">Passport Size</div>
//               <select
//                 value={size.id}
//                 onChange={(e) =>
//                   setSize(PASSPORT_SIZES.find((s) => s.id === e.target.value))
//                 }
//                 className="w-full h-10 border border-zinc-300 rounded-md px-2 text-sm bg-white"
//                 data-testid="mpp-size"
//               >
//                 {PASSPORT_SIZES.map((s) => (
//                   <option key={s.id} value={s.id}>
//                     {s.label}
//                   </option>
//                 ))}
//               </select>
//               <div className="text-[10px] font-mono text-zinc-500 mt-1">
//                 {size.w} × {size.h} mm — applies to every photo
//               </div>
//             </div>

//             <div>
//               <div className="label-uppercase mb-2">Paper Size</div>
//               <select
//                 value={paper.id}
//                 onChange={(e) =>
//                   setPaper(PAPER_SIZES.find((p) => p.id === e.target.value))
//                 }
//                 className="w-full h-10 border border-zinc-300 rounded-md px-2 text-sm bg-white"
//                 data-testid="mpp-paper"
//               >
//                 {PAPER_SIZES.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.label}
//                   </option>
//                 ))}
//               </select>
//               <div className="text-[10px] font-mono text-zinc-500 mt-1">
//                 Fits {grid.cols} × {grid.rows} = {grid.capacity} photos / page
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <div className="label-uppercase mb-2">H. Gap</div>
//                 <input
//                   type="number"
//                   min={0}
//                   max={40}
//                   value={hGap}
//                   onChange={(e) => setHGap(Number(e.target.value) || 0)}
//                   className="w-full h-9 border border-zinc-300 rounded-md px-2 text-sm"
//                 />
//               </div>
//               <div>
//                 <div className="label-uppercase mb-2">V. Gap</div>
//                 <input
//                   type="number"
//                   min={0}
//                   max={40}
//                   value={vGap}
//                   onChange={(e) => setVGap(Number(e.target.value) || 0)}
//                   className="w-full h-9 border border-zinc-300 rounded-md px-2 text-sm"
//                 />
//               </div>
//             </div>

//             <div>
//               <div className="label-uppercase mb-2">Page Margin (px)</div>
//               <input
//                 type="number"
//                 min={0}
//                 max={60}
//                 value={margin}
//                 onChange={(e) => setMargin(Number(e.target.value) || 0)}
//                 className="w-full h-9 border border-zinc-300 rounded-md px-2 text-sm"
//               />
//             </div>

//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 checked={autoCenter}
//                 onChange={(e) => setAutoCenter(e.target.checked)}
//               />
//               Center grid on page
//             </label>
//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 checked={keepTogether}
//                 onChange={(e) => setKeepTogether(e.target.checked)}
//               />
//               Keep each photo's copies together
//             </label>
//           </div>

//           {/* Border controls */}
//           <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-3">
//             <div className="label-uppercase">Photo Border</div>
//             <div>
//               <div className="flex justify-between text-xs mb-1">
//                 <span className="label-uppercase">Width</span>
//                 <span className="font-mono">{border.width}px</span>
//               </div>
//               <input
//                 type="range"
//                 min="0"
//                 max="20"
//                 value={border.width}
//                 onChange={(e) =>
//                   setBorder((b) => ({ ...b, width: Number(e.target.value) }))
//                 }
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <div className="flex justify-between text-xs mb-1">
//                 <span className="label-uppercase">Radius</span>
//                 <span className="font-mono">{border.radius}px</span>
//               </div>
//               <input
//                 type="range"
//                 min="0"
//                 max="60"
//                 value={border.radius}
//                 onChange={(e) =>
//                   setBorder((b) => ({ ...b, radius: Number(e.target.value) }))
//                 }
//                 className="w-full"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="label-uppercase flex-1">Color</div>
//               <input
//                 type="color"
//                 value={border.color}
//                 onChange={(e) =>
//                   setBorder((b) => ({ ...b, color: e.target.value }))
//                 }
//                 className="w-10 h-9 rounded border border-zinc-300 bg-white cursor-pointer p-0.5"
//               />
//             </div>
//           </div>

//           {/* Summary */}
//           <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-2">
//             <div className="label-uppercase">Summary</div>
//             <div className="text-sm flex justify-between">
//               <span className="text-zinc-500">Photos added</span>
//               <span className="font-mono">{items.length}</span>
//             </div>
//             <div className="text-sm flex justify-between">
//               <span className="text-zinc-500">Total prints</span>
//               <span className="font-mono">{totalCopies}</span>
//             </div>
//             <div className="text-sm flex justify-between">
//               <span className="text-zinc-500">Pages needed</span>
//               <span className="font-mono" data-testid="mpp-page-count">
//                 {pages.length}
//               </span>
//             </div>
//             <button
//               onClick={exportPdf}
//               data-testid="mpp-export-pdf"
//               className="w-full h-10 mt-2 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm flex items-center justify-center gap-2"
//             >
//               <DownloadSimple size={16} /> Export All Pages (PDF)
//             </button>
//             <button
//               onClick={() => window.print()}
//               className="w-full h-10 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"
//             >
//               <Printer size={16} /> Print
//             </button>
//           </div>
//         </aside>

//         {/* Right: photo list + page previews */}
//         <div className="space-y-6">
//           {/* Upload + list */}
//           <div className="bg-white border border-zinc-200 rounded-md p-4">
//             <div className="flex items-center justify-between mb-3">
//               <div className="label-uppercase">Photos to combine</div>
//               <button
//                 onClick={() => fileRef.current?.click()}
//                 data-testid="mpp-add-photo"
//                 className="h-9 px-3 border border-zinc-300 rounded-md text-xs flex items-center gap-2 hover:border-zinc-400"
//               >
//                 <Upload size={14} /> Add photo(s)
//               </button>
//               <input
//                 ref={fileRef}
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 className="hidden"
//                 onChange={(e) => {
//                   addPhotos(e.target.files);
//                   e.target.value = "";
//                 }}
//               />
//             </div>

//             {items.length === 0 ? (
//               <div
//                 onDragOver={(e) => e.preventDefault()}
//                 onDrop={(e) => {
//                   e.preventDefault();
//                   addPhotos(e.dataTransfer.files);
//                 }}
//                 className="border-2 border-dashed border-zinc-300 rounded-md p-10 text-center text-sm text-zinc-500"
//               >
//                 Drop customer photos here, or click "Add photo(s)". Add one
//                 photo per customer — you'll set how many copies each needs.
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {items.map((it) => (
//                   <div
//                     key={it.id}
//                     className="flex items-center gap-3 border border-zinc-200 rounded-md p-2"
//                     data-testid={`mpp-item-${it.id}`}
//                   >
//                     <img
//                       src={it.src}
//                       alt={it.name}
//                       className="w-10 h-12 object-cover rounded"
//                     />
//                     <input
//                       value={it.name}
//                       onChange={(e) => updateItem(it.id, { name: e.target.value })}
//                       className="flex-1 h-9 px-2 border border-zinc-200 rounded-md text-sm"
//                       placeholder="Customer / label"
//                     />
//                     <button
//                       onClick={() => setEditingId(it.id)}
//                       data-testid={`mpp-edit-${it.id}`}
//                       className="h-8 px-2 border border-zinc-300 rounded-md text-xs flex items-center gap-1 hover:border-zinc-400"
//                       title="Crop, remove background, adjust"
//                     >
//                       <PencilSimple size={12} /> Edit
//                     </button>
//                     <div className="flex items-center gap-1">
//                       <button
//                         onClick={() =>
//                           updateItem(it.id, { copies: Math.max(1, it.copies - 1) })
//                         }
//                         className="w-8 h-8 border border-zinc-300 rounded-md flex items-center justify-center"
//                       >
//                         <Minus size={12} />
//                       </button>
//                       <input
//                         type="number"
//                         min={1}
//                         value={it.copies}
//                         onChange={(e) =>
//                           updateItem(it.id, {
//                             copies: Math.max(1, Number(e.target.value) || 1),
//                           })
//                         }
//                         className="w-14 h-8 text-center border border-zinc-300 rounded-md text-sm"
//                         data-testid={`mpp-copies-${it.id}`}
//                       />
//                       <button
//                         onClick={() => updateItem(it.id, { copies: it.copies + 1 })}
//                         className="w-8 h-8 border border-zinc-300 rounded-md flex items-center justify-center"
//                       >
//                         <Plus size={12} />
//                       </button>
//                     </div>
//                     <button
//                       onClick={() => removeItem(it.id)}
//                       className="w-8 h-8 rounded-md flex items-center justify-center text-red-600 hover:bg-red-50"
//                     >
//                       <Trash size={14} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Billing */}
//           {items.length > 0 && (
//             <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="label-uppercase">Billing — assign a customer to each photo</div>
//                 <button
//                   onClick={() => setShowNewCustomer(!showNewCustomer)}
//                   className="text-[#0052FF] text-xs uppercase tracking-[0.2em]"
//                   data-testid="mpp-new-customer-toggle"
//                 >
//                   {showNewCustomer ? "Close" : "+ New customer"}
//                 </button>
//               </div>

//               {showNewCustomer && (
//                 <form
//                   onSubmit={createCustomer}
//                   className="flex flex-wrap items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-md p-3"
//                 >
//                   <input
//                     required
//                     placeholder="Full name"
//                     value={newCustomer.name}
//                     onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
//                     className="h-9 px-3 border border-zinc-300 rounded-md text-sm flex-1 min-w-[160px]"
//                     data-testid="mpp-new-cust-name"
//                   />
//                   <input
//                     placeholder="Phone"
//                     value={newCustomer.phone}
//                     onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
//                     className="h-9 px-3 border border-zinc-300 rounded-md text-sm flex-1 min-w-[140px]"
//                   />
//                   <button type="submit" className="h-9 px-4 bg-[#0052FF] text-white rounded-md text-sm">
//                     Save
//                   </button>
//                 </form>
//               )}

//               <div className="space-y-2">
//                 {items.map((it) => (
//                   <div
//                     key={it.id}
//                     className="flex flex-wrap items-center gap-2 border border-zinc-200 rounded-md p-2"
//                   >
//                     <img src={it.src} alt={it.name} className="w-8 h-10 object-cover rounded" />
//                     <div className="text-sm w-28 truncate">{it.name}</div>
//                     <select
//                       value={it.customerId}
//                       onChange={(e) => updateItem(it.id, { customerId: e.target.value })}
//                       className="h-9 px-2 border border-zinc-300 rounded-md text-sm bg-white flex-1 min-w-[160px]"
//                       data-testid={`mpp-customer-${it.id}`}
//                     >
//                       <option value="">— Select customer —</option>
//                       {customers.map((c) => (
//                         <option key={c.id} value={c.id}>
//                           {c.name} {c.phone && `(${c.phone})`}
//                         </option>
//                       ))}
//                     </select>
//                     <div className="flex items-center gap-1 text-sm text-zinc-500">
//                       <span className="text-xs">₹/copy</span>
//                       <input
//                         type="number"
//                         min={0}
//                         value={it.rate}
//                         onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) || 0 })}
//                         className="w-20 h-9 px-2 border border-zinc-300 rounded-md text-sm text-right"
//                         data-testid={`mpp-rate-${it.id}`}
//                       />
//                     </div>
//                     <div className="text-sm font-mono w-24 text-right">
//                       {inr(it.copies * it.rate)}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="border-t border-zinc-200 pt-3 space-y-1 text-sm max-w-xs ml-auto">
//                 <div className="flex justify-between">
//                   <span>Subtotal</span>
//                   <span className="font-mono">{inr(billingSubtotal)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>GST {gstRate}%</span>
//                   <span className="font-mono">{inr(billingGst)}</span>
//                 </div>
//                 <div className="flex justify-between font-heading text-lg font-semibold border-t border-zinc-200 pt-2">
//                   <span>Total</span>
//                   <span data-testid="mpp-billing-total">{inr(billingTotal)}</span>
//                 </div>
//               </div>

//               {!invoices ? (
//                 <button
//                   onClick={finalizeBilling}
//                   disabled={billingBusy}
//                   data-testid="mpp-finalize-btn"
//                   className="w-full h-12 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium disabled:opacity-60"
//                 >
//                   {billingBusy ? "Generating…" : "Finalize & Generate Invoices"}
//                 </button>
//               ) : (
//                 <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm space-y-1">
//                   <div className="font-medium text-green-800">✓ Invoices created</div>
//                   {invoices.map(({ item, invoice }) => (
//                     <div key={item.id} className="font-mono text-xs text-green-700">
//                       {item.name}: {invoice.invoice_no}
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <div className="text-[11px] text-zinc-500 leading-relaxed">
//                 One invoice is generated per photo/customer, even though all
//                 copies print together on the same sheet(s) above.
//               </div>
//             </div>
//           )}

//           {/* Page previews */}
//           {pages.length === 0 ? (
//             <div className="canvas-bg rounded-md p-10 flex flex-col items-center justify-center text-zinc-400 gap-2">
//               <Stack size={32} />
//               <div className="text-sm">
//                 Combined layout will appear here once you add photos.
//               </div>
//             </div>
//           ) : (
//             pages.map((tiles, idx) => (
//               <div key={idx} className="canvas-bg rounded-md p-6">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="label-uppercase">
//                     Page {idx + 1} of {pages.length}
//                   </div>
//                   <button
//                     onClick={() => exportPng(idx)}
//                     className="h-8 px-3 border border-zinc-300 rounded-md text-xs flex items-center gap-1 bg-white"
//                   >
//                     <DownloadSimple size={12} /> PNG
//                   </button>
//                 </div>
//                 <div className="flex justify-center">
//                   <div
//                     ref={(el) => (pageRefs.current[idx] = el)}
//                     className="paper-sheet relative"
//                     style={{ width: grid.pW, height: grid.pH }}
//                     data-testid={`mpp-page-${idx}`}
//                   >
//                     {tiles.map((t) => (
//                       <div
//                         key={t.id}
//                         title={t.itemName}
//                         style={{
//                           position: "absolute",
//                           left: t.x,
//                           top: t.y,
//                           width: t.w,
//                           height: t.h,
//                           overflow: "hidden",
//                           border:
//                             border.width > 0
//                               ? `${border.width}px solid ${border.color}`
//                               : undefined,
//                           borderRadius: border.radius,
//                           boxSizing: "border-box",
//                         }}
//                       >
//                         <img
//                           src={t.src}
//                           alt={t.itemName}
//                           style={{
//                             width: "100%",
//                             height: "100%",
//                             objectFit: "cover",
//                             borderRadius: Math.max(0, border.radius - border.width),
//                           }}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 {/* Legend: which customer contributed how many prints on this page (screen only) */}
//                 <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500">
//                   {Object.entries(
//                     tiles.reduce((acc, t) => {
//                       acc[t.itemName] = (acc[t.itemName] || 0) + 1;
//                       return acc;
//                     }, {}),
//                   ).map(([name, count]) => (
//                     <span
//                       key={name}
//                       className="px-2 py-1 bg-white border border-zinc-200 rounded-full"
//                     >
//                       {name}: {count}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {editingItem && (
//         <PhotoEditModal
//           item={editingItem}
//           size={size}
//           onClose={() => setEditingId(null)}
//           onSave={(newSrc) => {
//             updateItem(editingItem.id, { src: newSrc });
//             setEditingId(null);
//             toast.success("Photo updated");
//           }}
//         />
//       )}
//     </div>
//   );
// }

// /* ---------------- Per-photo edit modal: crop, remove background, adjust ---------------- */
// function loadImgEl(src) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.onload = () => resolve(img);
//     img.onerror = reject;
//     img.src = src;
//   });
// }

// async function cropImage(imageSrc, pixelCrop, rotation, targetAspect) {
//   const image = await loadImgEl(imageSrc);
//   const rotRad = (rotation * Math.PI) / 180;
//   const absCos = Math.abs(Math.cos(rotRad));
//   const absSin = Math.abs(Math.sin(rotRad));
//   const bboxW = image.width * absCos + image.height * absSin;
//   const bboxH = image.width * absSin + image.height * absCos;

//   const rotCanvas = document.createElement("canvas");
//   rotCanvas.width = bboxW;
//   rotCanvas.height = bboxH;
//   const rctx = rotCanvas.getContext("2d");
//   rctx.translate(bboxW / 2, bboxH / 2);
//   rctx.rotate(rotRad);
//   rctx.drawImage(image, -image.width / 2, -image.height / 2);

//   const outW = 600;
//   const outH = Math.round(outW / (targetAspect || pixelCrop.width / pixelCrop.height));
//   const cropCanvas = document.createElement("canvas");
//   cropCanvas.width = outW;
//   cropCanvas.height = outH;
//   const ctx = cropCanvas.getContext("2d");
//   ctx.fillStyle = "#ffffff";
//   ctx.fillRect(0, 0, outW, outH);
//   ctx.drawImage(
//     rotCanvas,
//     pixelCrop.x,
//     pixelCrop.y,
//     pixelCrop.width,
//     pixelCrop.height,
//     0,
//     0,
//     outW,
//     outH,
//   );
//   return cropCanvas.toDataURL("image/jpeg", 0.95);
// }

// function PhotoEditModal({ item, size, onClose, onSave }) {
//   const [tab, setTab] = useState("crop"); // crop | bg | adjust
//   const [draft, setDraft] = useState(item.src); // current working image
//   const [busy, setBusy] = useState(false);

//   // Crop state
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [pixels, setPixels] = useState(null);
//   const onCropComplete = useCallback((_, area) => setPixels(area), []);

//   // Background removal state
//   const [bgColor, setBgColor] = useState("#ffffff");

//   // Adjust state
//   const [adj, setAdj] = useState({
//     brightness: 100,
//     contrast: 100,
//     saturate: 100,
//     grayscale: 0,
//     sepia: 0,
//     hue: 0,
//   });
//   const adjCanvasRef = useRef(null);

//   useEffect(() => {
//     if (tab !== "adjust") return;
//     loadImgEl(draft).then((img) => {
//       const canvas = adjCanvasRef.current;
//       if (!canvas) return;
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d");
//       ctx.filter = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturate}%) grayscale(${adj.grayscale}%) sepia(${adj.sepia}%) hue-rotate(${adj.hue}deg)`;
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0);
//     });
//   }, [tab, draft, adj]);

//   const applyCrop = async () => {
//     if (!pixels) {
//       toast.error("Drag the crop box first");
//       return;
//     }
//     setBusy(true);
//     try {
//       const out = await cropImage(draft, pixels, rotation, size.w / size.h);
//       setDraft(out);
//       toast.success("Crop applied");
//     } catch (e) {
//       toast.error("Crop failed");
//     }
//     setBusy(false);
//   };

//   const removeBackground = async () => {
//     setBusy(true);
//     try {
//       const { data } = await api.post("/ai/bg-remove", { image: draft });
//       const cut = await loadImgEl(data.image);
//       const canvas = document.createElement("canvas");
//       canvas.width = cut.width;
//       canvas.height = cut.height;
//       const ctx = canvas.getContext("2d");
//       ctx.fillStyle = bgColor;
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(cut, 0, 0);
//       setDraft(canvas.toDataURL("image/png"));
//       toast.success("Background removed");
//     } catch (e) {
//       toast.error(formatApiError(e));
//     }
//     setBusy(false);
//   };

//   const applyAdjust = () => {
//     setDraft(adjCanvasRef.current.toDataURL("image/png"));
//     toast.success("Adjustment applied");
//   };

//   const TABS = [
//     { id: "crop", label: "Crop", icon: CropIcon },
//     { id: "bg", label: "Background", icon: ImageSquare },
//     { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
//   ];

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
//       <div className="bg-white rounded-md w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
//           <div className="font-heading text-lg">Edit photo — {item.name}</div>
//           <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-100">
//             <X size={16} />
//           </button>
//         </div>

//         <div className="px-5 pt-4 flex items-center gap-2">
//           {TABS.map((t) => {
//             const Icon = t.icon;
//             return (
//               <button
//                 key={t.id}
//                 onClick={() => setTab(t.id)}
//                 className={`h-9 px-3 rounded-full text-xs uppercase tracking-[0.15em] border flex items-center gap-2 ${
//                   tab === t.id
//                     ? "bg-zinc-900 text-white border-zinc-900"
//                     : "bg-white text-zinc-500 border-zinc-200"
//                 }`}
//               >
//                 <Icon size={13} /> {t.label}
//               </button>
//             );
//           })}
//         </div>

//         <div className="p-5">
//           {tab === "crop" && (
//             <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
//               <div className="relative bg-zinc-900 rounded-md" style={{ height: 420 }}>
//                 <Cropper
//                   image={draft}
//                   crop={crop}
//                   zoom={zoom}
//                   rotation={rotation}
//                   aspect={size.w / size.h}
//                   cropShape="rect"
//                   showGrid
//                   objectFit="contain"
//                   onCropChange={setCrop}
//                   onZoomChange={setZoom}
//                   onRotationChange={setRotation}
//                   onCropComplete={onCropComplete}
//                 />
//               </div>
//               <div className="space-y-4">
//                 <RangeMini label="Zoom" value={zoom} min={1} max={4} step={0.01} onChange={setZoom} />
//                 <RangeMini label="Rotate" value={rotation} min={-180} max={180} step={1} onChange={setRotation} />
//                 <button
//                   onClick={applyCrop}
//                   disabled={busy}
//                   className="w-full h-10 bg-[#0052FF] text-white rounded-md text-sm disabled:opacity-60"
//                 >
//                   {busy ? "Applying…" : "Apply crop"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {tab === "bg" && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="border border-zinc-200 rounded-md p-4 flex items-center justify-center">
//                 <img src={draft} alt="preview" className="max-h-[360px] object-contain" />
//               </div>
//               <div className="space-y-4">
//                 <button
//                   onClick={removeBackground}
//                   disabled={busy}
//                   className="w-full h-11 bg-[#0052FF] text-white rounded-md text-sm disabled:opacity-60"
//                 >
//                   {busy ? "Processing…" : "Remove Background"}
//                 </button>
//                 <div className="flex items-center gap-2 text-sm">
//                   <span className="label-uppercase">BG color</span>
//                   <input
//                     type="color"
//                     value={bgColor}
//                     onChange={(e) => setBgColor(e.target.value)}
//                     className="w-9 h-9 rounded border border-zinc-300 cursor-pointer"
//                   />
//                   <div className="flex gap-1 ml-auto">
//                     {["#ffffff", "#f5f5f5", "#e0eaff", "#7dbfff"].map((c) => (
//                       <button
//                         key={c}
//                         onClick={() => setBgColor(c)}
//                         className="h-6 w-6 rounded border border-zinc-300"
//                         style={{ background: c }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <p className="text-xs text-zinc-500">
//                   Removes the existing background and fills it with the color
//                   above — same passport-safe cutout used in the single-photo
//                   wizard's Background step.
//                 </p>
//               </div>
//             </div>
//           )}

//           {tab === "adjust" && (
//             <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
//               <div className="flex justify-center bg-zinc-50 border border-zinc-200 rounded-md p-4">
//                 <canvas ref={adjCanvasRef} className="max-h-[360px] max-w-full" />
//               </div>
//               <div className="space-y-3">
//                 <RangeMini label="Brightness" value={adj.brightness} min={0} max={200} onChange={(v) => setAdj((a) => ({ ...a, brightness: v }))} />
//                 <RangeMini label="Contrast" value={adj.contrast} min={0} max={200} onChange={(v) => setAdj((a) => ({ ...a, contrast: v }))} />
//                 <RangeMini label="Saturation" value={adj.saturate} min={0} max={200} onChange={(v) => setAdj((a) => ({ ...a, saturate: v }))} />
//                 <RangeMini label="Hue" value={adj.hue} min={0} max={360} onChange={(v) => setAdj((a) => ({ ...a, hue: v }))} />
//                 <RangeMini label="Grayscale" value={adj.grayscale} min={0} max={100} onChange={(v) => setAdj((a) => ({ ...a, grayscale: v }))} />
//                 <button onClick={applyAdjust} className="w-full h-10 bg-[#0052FF] text-white rounded-md text-sm">
//                   Apply adjustment
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="px-5 py-4 border-t border-zinc-200 flex items-center justify-between gap-3">
//           <div className="text-xs text-zinc-500">
//             Changes on each tab stack on top of each other — crop, then remove
//             background, then adjust, in any order.
//           </div>
//           <div className="flex gap-2 shrink-0">
//             <button onClick={onClose} className="h-10 px-4 border border-zinc-300 rounded-md text-sm">
//               Cancel
//             </button>
//             <button
//               onClick={() => onSave(draft)}
//               className="h-10 px-4 bg-zinc-900 text-white rounded-md text-sm"
//             >
//               Save photo
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function RangeMini({ label, value, min, max, step = 1, onChange }) {
//   return (
//     <div>
//       <div className="flex justify-between text-xs mb-1">
//         <span className="label-uppercase">{label}</span>
//         <span className="font-mono">{Number(value).toFixed(step < 1 ? 2 : 0)}</span>
//       </div>
//       <input
//         type="range"
//         min={min}
//         max={max}
//         step={step}
//         value={value}
//         onChange={(e) => onChange(Number(e.target.value))}
//         className="w-full"
//       />
//     </div>
//   );
// }




import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { PASSPORT_SIZES, PAPER_SIZES } from "@/lib/passportSizes";
import PageHeader from "@/components/PageHeader";
import {
  Upload,
  Trash,
  DownloadSimple,
  Printer,
  Stack,
  Plus,
  Minus,
  PencilSimple,
  Crop as CropIcon,
  ImageSquare,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Cropper from "react-easy-crop";

// mm → px factor for on-screen paper display (same as PassportMaker.jsx)
const MM_PX = 3.2;

let uid = 0;
const nextId = () => `mpp-${Date.now()}-${uid++}`;

export default function MultiPhotoPassport() {
  const [size, setSize] = useState(PASSPORT_SIZES[0]);
  const [paper, setPaper] = useState(PAPER_SIZES[0]);
  const [items, setItems] = useState([]); // { id, name, src, copies }
  const [hGap, setHGap] = useState(6);
  const [vGap, setVGap] = useState(6);
  const [margin, setMargin] = useState(10);
  const [autoCenter, setAutoCenter] = useState(true);
  const [keepTogether, setKeepTogether] = useState(true);
  const [border, setBorder] = useState({
    width: 0,
    color: "#000000",
    radius: 0,
  });
  const fileRef = useRef();
  const pageRefs = useRef([]);
  const [editingId, setEditingId] = useState(null);
  const editingItem = items.find((i) => i.id === editingId) || null;

  // Billing
  const [customers, setCustomers] = useState([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [billingBusy, setBillingBusy] = useState(false);
  const [invoices, setInvoices] = useState(null); // [{item, invoice}]
  const [showBillingModal, setShowBillingModal] = useState(false);

  const loadCustomers = () => api.get("/customers").then(({ data }) => setCustomers(data));
  useEffect(() => {
    loadCustomers();
  }, []);

  const createCustomer = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/customers", { ...newCustomer });
      await loadCustomers();
      setNewCustomer({ name: "", phone: "" });
      setShowNewCustomer(false);
      toast.success("Customer created — assign it below");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const addPhotos = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setItems((prev) => [
          ...prev,
          {
            id: nextId(),
            name: file.name.replace(/\.[^.]+$/, ""),
            src: reader.result,
            copies: 5,
            customerId: "",
            rate: 150,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateItem = (id, patch) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  // Grid geometry for the chosen passport size + paper + gaps/margin
  const grid = useMemo(() => {
    const pW = paper.w * MM_PX;
    const pH = paper.h * MM_PX;
    const w = size.w * MM_PX;
    const h = size.h * MM_PX;
    const cols = Math.max(1, Math.floor((pW - 2 * margin + hGap) / (w + hGap)));
    const rows = Math.max(1, Math.floor((pH - 2 * margin + vGap) / (h + vGap)));
    return { pW, pH, w, h, cols, rows, capacity: cols * rows };
  }, [paper, size, hGap, vGap, margin]);

  // Pack every copy of every uploaded photo onto as few pages as possible,
  // keeping each photo's copies together on a page when they fit.
  const pages = useMemo(() => {
    const { cols, rows, capacity, w, h, pW, pH } = grid;
    if (capacity <= 0 || items.length === 0) return [];

    const bucket = [[]];
    let used = 0;
    items.forEach((item) => {
      let remaining = item.copies;
      if (remaining <= 0) return;
      while (remaining > 0) {
        let slotsLeft = capacity - used;
        if (slotsLeft === 0) {
          bucket.push([]);
          used = 0;
          slotsLeft = capacity;
        }
        // Start a fresh page instead of splitting this photo's copies,
        // as long as the whole batch fits on one empty page.
        if (keepTogether && used > 0 && remaining <= capacity && remaining > slotsLeft) {
          bucket.push([]);
          used = 0;
          slotsLeft = capacity;
        }
        const take = Math.min(remaining, slotsLeft);
        const current = bucket[bucket.length - 1];
        for (let i = 0; i < take; i++) {
          current.push({ src: item.src, itemId: item.id, itemName: item.name });
        }
        used += take;
        remaining -= take;
      }
    });

    const totalW = cols * w + (cols - 1) * hGap;
    const totalH = rows * h + (rows - 1) * vGap;
    const offX = autoCenter ? (pW - totalW) / 2 : margin;
    const offY = autoCenter ? (pH - totalH) / 2 : margin;

    return bucket
      .filter((p) => p.length > 0)
      .map((tiles) =>
        tiles.map((t, idx) => {
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          return {
            id: nextId(),
            src: t.src,
            itemId: t.itemId,
            itemName: t.itemName,
            x: offX + col * (w + hGap),
            y: offY + row * (h + vGap),
            w,
            h,
          };
        }),
      );
  }, [grid, items, hGap, vGap, margin, autoCenter, keepTogether]);

  const totalCopies = items.reduce((s, i) => s + (i.copies || 0), 0);
  const gstRate = 18;
  const billingSubtotal = items.reduce((s, i) => s + (i.copies || 0) * (i.rate || 0), 0);
  const billingGst = billingSubtotal * (gstRate / 100);
  const billingTotal = billingSubtotal + billingGst;
  const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

  const finalizeBilling = async () => {
    if (items.length === 0) {
      toast.error("Add at least one photo first");
      return;
    }
    const unassigned = items.filter((it) => !it.customerId);
    if (unassigned.length) {
      toast.error("Assign a customer to every photo before finalizing");
      return;
    }
    setBillingBusy(true);
    try {
      const results = [];
      for (const it of items) {
        await api.post("/orders", {
          customer_id: it.customerId,
          passport_size: size.label,
          copies: it.copies,
          paper_size: paper.label,
        });
        const { data: inv } = await api.post("/invoices", {
          customer_id: it.customerId,
          items: [
            {
              description: `${it.copies} × ${size.label} — combined sheet (${it.name})`,
              quantity: it.copies,
              rate: it.rate,
              gst_rate: gstRate,
            },
          ],
          payment_method: "cash",
          status: "paid",
          notes:
            items.length > 1
              ? `Multi-photo passport job — printed together with ${items.length - 1} other photo(s) to save paper`
              : `Passport photo job (${it.copies} copies)`,
        });
        results.push({ item: it, invoice: inv });
      }
      setInvoices(results);
      toast.success(`${results.length} invoice(s) generated`);
    } catch (err) {
      toast.error(formatApiError(err));
    }
    setBillingBusy(false);
  };

  const exportPdf = async () => {
    if (!pages.length) {
      toast.error("Add at least one photo first");
      return;
    }
    const isLandscape = paper.w > paper.h;
    const pdf = new jsPDF({
      orientation: isLandscape ? "l" : "p",
      unit: "mm",
      format: paper.id === "a4" ? "a4" : [paper.w, paper.h],
    });
    for (let i = 0; i < pageRefs.current.length; i++) {
      const node = pageRefs.current[i];
      if (!node) continue;
      const canvas = await html2canvas(node, { scale: 3, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/jpeg", 0.95);
      if (i > 0) pdf.addPage(paper.id === "a4" ? "a4" : [paper.w, paper.h], isLandscape ? "l" : "p");
      pdf.addImage(img, "JPEG", 0, 0, paper.w, paper.h);
    }
    pdf.save(`multi-photo-layout-${paper.id}.pdf`);
    toast.success(`PDF exported (${pages.length} page${pages.length > 1 ? "s" : ""})`);
  };

  const exportPng = async (idx) => {
    const node = pageRefs.current[idx];
    if (!node) return;
    const canvas = await html2canvas(node, { scale: 3, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `multi-photo-layout-page${idx + 1}.png`;
    link.click();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Passport Photo Maker"
        title="Multi-Photo Passport"
        description="Upload photos for several customers and print them all on the same sheet — no page wasted."
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left: controls */}
        <aside className="space-y-5">
          <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-4">
            <div>
              <div className="label-uppercase mb-2">Passport Size</div>
              <select
                value={size.id}
                onChange={(e) =>
                  setSize(PASSPORT_SIZES.find((s) => s.id === e.target.value))
                }
                className="w-full h-10 border border-zinc-300 rounded-md px-2 text-sm bg-white"
                data-testid="mpp-size"
              >
                {PASSPORT_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div className="text-[10px] font-mono text-zinc-500 mt-1">
                {size.w} × {size.h} mm — applies to every photo
              </div>
            </div>

            <div>
              <div className="label-uppercase mb-2">Paper Size</div>
              <select
                value={paper.id}
                onChange={(e) =>
                  setPaper(PAPER_SIZES.find((p) => p.id === e.target.value))
                }
                className="w-full h-10 border border-zinc-300 rounded-md px-2 text-sm bg-white"
                data-testid="mpp-paper"
              >
                {PAPER_SIZES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="text-[10px] font-mono text-zinc-500 mt-1">
                Fits {grid.cols} × {grid.rows} = {grid.capacity} photos / page
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="label-uppercase mb-2">H. Gap</div>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={hGap}
                  onChange={(e) => setHGap(Number(e.target.value) || 0)}
                  className="w-full h-9 border border-zinc-300 rounded-md px-2 text-sm"
                />
              </div>
              <div>
                <div className="label-uppercase mb-2">V. Gap</div>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={vGap}
                  onChange={(e) => setVGap(Number(e.target.value) || 0)}
                  className="w-full h-9 border border-zinc-300 rounded-md px-2 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="label-uppercase mb-2">Page Margin (px)</div>
              <input
                type="number"
                min={0}
                max={60}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value) || 0)}
                className="w-full h-9 border border-zinc-300 rounded-md px-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoCenter}
                onChange={(e) => setAutoCenter(e.target.checked)}
              />
              Center grid on page
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={keepTogether}
                onChange={(e) => setKeepTogether(e.target.checked)}
              />
              Keep each photo's copies together
            </label>
          </div>

          {/* Border controls */}
          <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-3">
            <div className="label-uppercase">Photo Border</div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="label-uppercase">Width</span>
                <span className="font-mono">{border.width}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={border.width}
                onChange={(e) =>
                  setBorder((b) => ({ ...b, width: Number(e.target.value) }))
                }
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="label-uppercase">Radius</span>
                <span className="font-mono">{border.radius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={border.radius}
                onChange={(e) =>
                  setBorder((b) => ({ ...b, radius: Number(e.target.value) }))
                }
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="label-uppercase flex-1">Color</div>
              <input
                type="color"
                value={border.color}
                onChange={(e) =>
                  setBorder((b) => ({ ...b, color: e.target.value }))
                }
                className="w-10 h-9 rounded border border-zinc-300 bg-white cursor-pointer p-0.5"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-2">
            <div className="label-uppercase">Summary</div>
            <div className="text-sm flex justify-between">
              <span className="text-zinc-500">Photos added</span>
              <span className="font-mono">{items.length}</span>
            </div>
            <div className="text-sm flex justify-between">
              <span className="text-zinc-500">Total prints</span>
              <span className="font-mono">{totalCopies}</span>
            </div>
            <div className="text-sm flex justify-between">
              <span className="text-zinc-500">Pages needed</span>
              <span className="font-mono" data-testid="mpp-page-count">
                {pages.length}
              </span>
            </div>
            <button
              onClick={exportPdf}
              data-testid="mpp-export-pdf"
              className="w-full h-10 mt-2 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm flex items-center justify-center gap-2"
            >
              <DownloadSimple size={16} /> Export All Pages (PDF)
            </button>
            <button
              onClick={() => window.print()}
              className="w-full h-10 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </aside>

        {/* Right: photo list + page previews */}
        <div className="space-y-6">
          {/* Upload + list */}
          <div className="bg-white border border-zinc-200 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="label-uppercase">Photos to combine</div>
              <button
                onClick={() => fileRef.current?.click()}
                data-testid="mpp-add-photo"
                className="h-9 px-3 border border-zinc-300 rounded-md text-xs flex items-center gap-2 hover:border-zinc-400"
              >
                <Upload size={14} /> Add photo(s)
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {items.length === 0 ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addPhotos(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-zinc-300 rounded-md p-10 text-center text-sm text-zinc-500"
              >
                Drop customer photos here, or click "Add photo(s)". Add one
                photo per customer — you'll set how many copies each needs.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-3 border border-zinc-200 rounded-md p-2"
                    data-testid={`mpp-item-${it.id}`}
                  >
                    <img
                      src={it.src}
                      alt={it.name}
                      className="w-10 h-12 object-cover rounded"
                    />
                    <input
                      value={it.name}
                      onChange={(e) => updateItem(it.id, { name: e.target.value })}
                      className="flex-1 h-9 px-2 border border-zinc-200 rounded-md text-sm"
                      placeholder="Customer / label"
                    />
                    <button
                      onClick={() => setEditingId(it.id)}
                      data-testid={`mpp-edit-${it.id}`}
                      className="h-8 px-2 border border-zinc-300 rounded-md text-xs flex items-center gap-1 hover:border-zinc-400"
                      title="Crop, remove background, adjust"
                    >
                      <PencilSimple size={12} /> Edit
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateItem(it.id, { copies: Math.max(1, it.copies - 1) })
                        }
                        className="w-8 h-8 border border-zinc-300 rounded-md flex items-center justify-center"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={it.copies}
                        onChange={(e) =>
                          updateItem(it.id, {
                            copies: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-14 h-8 text-center border border-zinc-300 rounded-md text-sm"
                        data-testid={`mpp-copies-${it.id}`}
                      />
                      <button
                        onClick={() => updateItem(it.id, { copies: it.copies + 1 })}
                        className="w-8 h-8 border border-zinc-300 rounded-md flex items-center justify-center"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-red-600 hover:bg-red-50"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Billing (compact trigger — full form lives in a popup) */}
          {items.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-md p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="label-uppercase">Billing</div>
                <div className="text-sm text-zinc-500 mt-1">
                  {invoices ? (
                    <span className="text-green-700">
                      ✓ {invoices.length} invoice(s) generated — {inr(billingTotal)} total
                    </span>
                  ) : (
                    <>
                      {items.filter((i) => i.customerId).length}/{items.length} photos
                      assigned a customer · Est. total {inr(billingTotal)}
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowBillingModal(true)}
                data-testid="mpp-open-billing"
                className="h-10 px-4 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm"
              >
                {invoices ? "View invoices" : "Open Billing"}
              </button>
            </div>
          )}

          {/* Page previews */}
          {pages.length === 0 ? (
            <div className="canvas-bg rounded-md p-10 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <Stack size={32} />
              <div className="text-sm">
                Combined layout will appear here once you add photos.
              </div>
            </div>
          ) : (
            pages.map((tiles, idx) => (
              <div key={idx} className="canvas-bg rounded-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="label-uppercase">
                    Page {idx + 1} of {pages.length}
                  </div>
                  <button
                    onClick={() => exportPng(idx)}
                    className="h-8 px-3 border border-zinc-300 rounded-md text-xs flex items-center gap-1 bg-white"
                  >
                    <DownloadSimple size={12} /> PNG
                  </button>
                </div>
                <div className="flex justify-center">
                  <div
                    ref={(el) => (pageRefs.current[idx] = el)}
                    className="paper-sheet relative"
                    style={{ width: grid.pW, height: grid.pH }}
                    data-testid={`mpp-page-${idx}`}
                  >
                    {tiles.map((t) => (
                      <div
                        key={t.id}
                        title={t.itemName}
                        style={{
                          position: "absolute",
                          left: t.x,
                          top: t.y,
                          width: t.w,
                          height: t.h,
                          overflow: "hidden",
                          border:
                            border.width > 0
                              ? `${border.width}px solid ${border.color}`
                              : undefined,
                          borderRadius: border.radius,
                          boxSizing: "border-box",
                        }}
                      >
                        <img
                          src={t.src}
                          alt={t.itemName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: Math.max(0, border.radius - border.width),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Legend: which customer contributed how many prints on this page (screen only) */}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                  {Object.entries(
                    tiles.reduce((acc, t) => {
                      acc[t.itemName] = (acc[t.itemName] || 0) + 1;
                      return acc;
                    }, {}),
                  ).map(([name, count]) => (
                    <span
                      key={name}
                      className="px-2 py-1 bg-white border border-zinc-200 rounded-full"
                    >
                      {name}: {count}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingItem && (
        <PhotoEditModal
          item={editingItem}
          size={size}
          onClose={() => setEditingId(null)}
          onSave={(newSrc) => {
            updateItem(editingItem.id, { src: newSrc });
            setEditingId(null);
            toast.success("Photo updated");
          }}
        />
      )}

      {showBillingModal && (
        <BillingModal
          items={items}
          customers={customers}
          updateItem={updateItem}
          showNewCustomer={showNewCustomer}
          setShowNewCustomer={setShowNewCustomer}
          newCustomer={newCustomer}
          setNewCustomer={setNewCustomer}
          createCustomer={createCustomer}
          gstRate={gstRate}
          billingSubtotal={billingSubtotal}
          billingGst={billingGst}
          billingTotal={billingTotal}
          inr={inr}
          invoices={invoices}
          billingBusy={billingBusy}
          finalizeBilling={finalizeBilling}
          onClose={() => setShowBillingModal(false)}
        />
      )}
    </div>
  );
}

/* ---------------- Billing popup: assign customers, rates, finalize invoices ---------------- */
function BillingModal({
  items,
  customers,
  updateItem,
  showNewCustomer,
  setShowNewCustomer,
  newCustomer,
  setNewCustomer,
  createCustomer,
  gstRate,
  billingSubtotal,
  billingGst,
  billingTotal,
  inr,
  invoices,
  billingBusy,
  finalizeBilling,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-md w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 sticky top-0 bg-white">
          <div className="font-heading text-lg">Billing — assign a customer to each photo</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewCustomer(!showNewCustomer)}
              className="text-[#0052FF] text-xs uppercase tracking-[0.2em]"
              data-testid="mpp-new-customer-toggle"
            >
              {showNewCustomer ? "Close" : "+ New customer"}
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-100">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {showNewCustomer && (
            <form
              onSubmit={createCustomer}
              className="flex flex-wrap items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-md p-3"
            >
              <input
                required
                placeholder="Full name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="h-9 px-3 border border-zinc-300 rounded-md text-sm flex-1 min-w-[160px]"
                data-testid="mpp-new-cust-name"
              />
              <input
                placeholder="Phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="h-9 px-3 border border-zinc-300 rounded-md text-sm flex-1 min-w-[140px]"
              />
              <button type="submit" className="h-9 px-4 bg-[#0052FF] text-white rounded-md text-sm">
                Save
              </button>
            </form>
          )}

          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex flex-wrap items-center gap-2 border border-zinc-200 rounded-md p-2"
              >
                <img src={it.src} alt={it.name} className="w-8 h-10 object-cover rounded" />
                <div className="text-sm w-28 truncate">{it.name}</div>
                <select
                  value={it.customerId}
                  onChange={(e) => updateItem(it.id, { customerId: e.target.value })}
                  className="h-9 px-2 border border-zinc-300 rounded-md text-sm bg-white flex-1 min-w-[160px]"
                  data-testid={`mpp-customer-${it.id}`}
                >
                  <option value="">— Select customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone && `(${c.phone})`}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1 text-sm text-zinc-500">
                  <span className="text-xs">₹/copy</span>
                  <input
                    type="number"
                    min={0}
                    value={it.rate}
                    onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) || 0 })}
                    className="w-20 h-9 px-2 border border-zinc-300 rounded-md text-sm text-right"
                    data-testid={`mpp-rate-${it.id}`}
                  />
                </div>
                <div className="text-sm font-mono w-24 text-right">
                  {inr(it.copies * it.rate)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-200 pt-3 space-y-1 text-sm max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">{inr(billingSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST {gstRate}%</span>
              <span className="font-mono">{inr(billingGst)}</span>
            </div>
            <div className="flex justify-between font-heading text-lg font-semibold border-t border-zinc-200 pt-2">
              <span>Total</span>
              <span data-testid="mpp-billing-total">{inr(billingTotal)}</span>
            </div>
          </div>

          {!invoices ? (
            <button
              onClick={finalizeBilling}
              disabled={billingBusy}
              data-testid="mpp-finalize-btn"
              className="w-full h-12 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium disabled:opacity-60"
            >
              {billingBusy ? "Generating…" : "Finalize & Generate Invoices"}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm space-y-1">
              <div className="font-medium text-green-800">✓ Invoices created</div>
              {invoices.map(({ item, invoice }) => (
                <div key={item.id} className="font-mono text-xs text-green-700">
                  {item.name}: {invoice.invoice_no}
                </div>
              ))}
            </div>
          )}
          <div className="text-[11px] text-zinc-500 leading-relaxed">
            One invoice is generated per photo/customer, even though all
            copies print together on the same sheet(s).
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Per-photo edit modal: crop, remove background, adjust ---------------- */
function loadImgEl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function cropImage(imageSrc, pixelCrop, rotation, targetAspect) {
  const image = await loadImgEl(imageSrc);
  const rotRad = (rotation * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(rotRad));
  const absSin = Math.abs(Math.sin(rotRad));
  const bboxW = image.width * absCos + image.height * absSin;
  const bboxH = image.width * absSin + image.height * absCos;

  const rotCanvas = document.createElement("canvas");
  rotCanvas.width = bboxW;
  rotCanvas.height = bboxH;
  const rctx = rotCanvas.getContext("2d");
  rctx.translate(bboxW / 2, bboxH / 2);
  rctx.rotate(rotRad);
  rctx.drawImage(image, -image.width / 2, -image.height / 2);

  const outW = 600;
  const outH = Math.round(outW / (targetAspect || pixelCrop.width / pixelCrop.height));
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = outW;
  cropCanvas.height = outH;
  const ctx = cropCanvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(
    rotCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH,
  );
  return cropCanvas.toDataURL("image/jpeg", 0.95);
}

function PhotoEditModal({ item, size, onClose, onSave }) {
  const [tab, setTab] = useState("crop"); // crop | bg | adjust
  const [draft, setDraft] = useState(item.src); // current working image
  const [busy, setBusy] = useState(false);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pixels, setPixels] = useState(null);
  const onCropComplete = useCallback((_, area) => setPixels(area), []);

  // Background removal state
  const [bgColor, setBgColor] = useState("#ffffff");

  // Adjust state
  const [adj, setAdj] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    hue: 0,
  });
  const adjCanvasRef = useRef(null);

  useEffect(() => {
    if (tab !== "adjust") return;
    loadImgEl(draft).then((img) => {
      const canvas = adjCanvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.filter = `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturate}%) grayscale(${adj.grayscale}%) sepia(${adj.sepia}%) hue-rotate(${adj.hue}deg)`;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    });
  }, [tab, draft, adj]);

  const applyCrop = async () => {
    if (!pixels) {
      toast.error("Drag the crop box first");
      return;
    }
    setBusy(true);
    try {
      const out = await cropImage(draft, pixels, rotation, size.w / size.h);
      setDraft(out);
      toast.success("Crop applied");
    } catch (e) {
      toast.error("Crop failed");
    }
    setBusy(false);
  };

  const removeBackground = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/ai/bg-remove", { image: draft });
      const cut = await loadImgEl(data.image);
      const canvas = document.createElement("canvas");
      canvas.width = cut.width;
      canvas.height = cut.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cut, 0, 0);
      setDraft(canvas.toDataURL("image/png"));
      toast.success("Background removed");
    } catch (e) {
      toast.error(formatApiError(e));
    }
    setBusy(false);
  };

  const applyAdjust = () => {
    setDraft(adjCanvasRef.current.toDataURL("image/png"));
    toast.success("Adjustment applied");
  };

  const TABS = [
    { id: "crop", label: "Crop", icon: CropIcon },
    { id: "bg", label: "Background", icon: ImageSquare },
    { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-md w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="font-heading text-lg">Edit photo — {item.name}</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-100">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-4 flex items-center gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`h-9 px-3 rounded-full text-xs uppercase tracking-[0.15em] border flex items-center gap-2 ${
                  tab === t.id
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-500 border-zinc-200"
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {tab === "crop" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
              <div className="relative bg-zinc-900 rounded-md" style={{ height: 420 }}>
                <Cropper
                  image={draft}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={size.w / size.h}
                  cropShape="rect"
                  showGrid
                  objectFit="contain"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="space-y-4">
                <RangeMini label="Zoom" value={zoom} min={1} max={4} step={0.01} onChange={setZoom} />
                <RangeMini label="Rotate" value={rotation} min={-180} max={180} step={1} onChange={setRotation} />
                <button
                  onClick={applyCrop}
                  disabled={busy}
                  className="w-full h-10 bg-[#0052FF] text-white rounded-md text-sm disabled:opacity-60"
                >
                  {busy ? "Applying…" : "Apply crop"}
                </button>
              </div>
            </div>
          )}

          {tab === "bg" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-zinc-200 rounded-md p-4 flex items-center justify-center">
                <img src={draft} alt="preview" className="max-h-[360px] object-contain" />
              </div>
              <div className="space-y-4">
                <button
                  onClick={removeBackground}
                  disabled={busy}
                  className="w-full h-11 bg-[#0052FF] text-white rounded-md text-sm disabled:opacity-60"
                >
                  {busy ? "Processing…" : "Remove Background"}
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <span className="label-uppercase">BG color</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded border border-zinc-300 cursor-pointer"
                  />
                  <div className="flex gap-1 ml-auto">
                    {["#ffffff", "#f5f5f5", "#e0eaff", "#7dbfff"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setBgColor(c)}
                        className="h-6 w-6 rounded border border-zinc-300"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  Removes the existing background and fills it with the color
                  above — same passport-safe cutout used in the single-photo
                  wizard's Background step.
                </p>
              </div>
            </div>
          )}

          {tab === "adjust" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
              <div className="flex justify-center bg-zinc-50 border border-zinc-200 rounded-md p-4">
                <canvas ref={adjCanvasRef} className="max-h-[360px] max-w-full" />
              </div>
              <div className="space-y-3">
                <RangeMini label="Brightness" value={adj.brightness} min={0} max={200} onChange={(v) => setAdj((a) => ({ ...a, brightness: v }))} />
                <RangeMini label="Contrast" value={adj.contrast} min={0} max={200} onChange={(v) => setAdj((a) => ({ ...a, contrast: v }))} />
                <RangeMini label="Saturation" value={adj.saturate} min={0} max={200} onChange={(v) => setAdj((a) => ({ ...a, saturate: v }))} />
                <RangeMini label="Hue" value={adj.hue} min={0} max={360} onChange={(v) => setAdj((a) => ({ ...a, hue: v }))} />
                <RangeMini label="Grayscale" value={adj.grayscale} min={0} max={100} onChange={(v) => setAdj((a) => ({ ...a, grayscale: v }))} />
                <button onClick={applyAdjust} className="w-full h-10 bg-[#0052FF] text-white rounded-md text-sm">
                  Apply adjustment
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-zinc-200 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-500">
            Changes on each tab stack on top of each other — crop, then remove
            background, then adjust, in any order.
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onClose} className="h-10 px-4 border border-zinc-300 rounded-md text-sm">
              Cancel
            </button>
            <button
              onClick={() => onSave(draft)}
              className="h-10 px-4 bg-zinc-900 text-white rounded-md text-sm"
            >
              Save photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RangeMini({ label, value, min, max, step = 1, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="label-uppercase">{label}</span>
        <span className="font-mono">{Number(value).toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}