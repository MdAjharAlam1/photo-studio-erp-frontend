// import { useEffect, useRef, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { api, formatApiError } from "@/lib/api";
// import { toast } from "sonner";
// import { PASSPORT_SIZES, PAPER_SIZES } from "@/lib/passportSizes";
// import PageHeader from "@/components/PageHeader";
// import {
//   Upload,
//   Crop,
//   ImageSquare,
//   TShirt,
//   GridFour,
//   Receipt,
//   Printer,
//   ArrowLeft,
//   ArrowRight,
//   Plus,
//   Minus,
//   Trash,
//   Copy,
//   Check,
//   DownloadSimple,
//   IdentificationCard,
//   SlidersHorizontal,
//   TextT,
// } from "@phosphor-icons/react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import Cropper from "react-easy-crop";

// const STEPS = [
//   { id: 1, name: "Upload", icon: Upload },
//   { id: 2, name: "Size", icon: IdentificationCard },
//   { id: 3, name: "Crop", icon: Crop },
//   { id: 4, name: "Background", icon: ImageSquare },
//   { id: 5, name: "Adjust", icon: SlidersHorizontal },
//   { id: 6, name: "Text Format", icon: TextT },
//   { id: 7, name: "Layout", icon: GridFour },
//   { id: 8, name: "Billing", icon: Receipt },
//   { id: 9, name: "Print", icon: Printer },
// ];

// // mm → px factor for on-screen paper display
// const MM_PX = 3.2;

// export default function PassportMaker() {
//   const [step, setStep] = useState(1);
//   const [photo, setPhoto] = useState(null); // { src, name }
//   const [croppedSrc, setCroppedSrc] = useState(null);
//   const [size, setSize] = useState(PASSPORT_SIZES[0]);
//   const [bgWhite, setBgWhite] = useState(false);
//   const [copies, setCopies] = useState(8);
//   const [paper, setPaper] = useState(PAPER_SIZES[0]);
//   const [tiles, setTiles] = useState([]); // {id, x, y, w, h, rotation, src}
//   const [customerId, setCustomerId] = useState("");
//   const [customers, setCustomers] = useState([]);
//   const [rate, setRate] = useState(150);
//   const nav = useNavigate();

//   useEffect(() => {
//     api.get("/customers").then(({ data }) => setCustomers(data));
//   }, []);

//   const finalPhotoSrc = croppedSrc || photo?.src;

//   // Auto-layout: fill paper with `copies` of finalPhotoSrc
//   const autoFill = useCallback(() => {
//     if (!finalPhotoSrc) return;
//     const pW = paper.w * MM_PX; // paper display px
//     const pH = paper.h * MM_PX;
//     const w = size.w * MM_PX;
//     const h = size.h * MM_PX;
//     const gap = 6;
//     const cols = Math.max(1, Math.floor((pW + gap) / (w + gap)));
//     const rows = Math.max(1, Math.floor((pH + gap) / (h + gap)));
//     const max = cols * rows;
//     const n = Math.min(copies, max);
//     const totalW = cols * w + (cols - 1) * gap;
//     const totalH = Math.ceil(n / cols) * h + (Math.ceil(n / cols) - 1) * gap;
//     const offX = (pW - totalW) / 2;
//     const offY = (pH - totalH) / 2;
//     const newTiles = [];
//     for (let i = 0; i < n; i++) {
//       const r = Math.floor(i / cols);
//       const c = i % cols;
//       newTiles.push({
//         id: crypto.randomUUID(),
//         x: offX + c * (w + gap),
//         y: offY + r * (h + gap),
//         w,
//         h,
//         rotation: 0,
//         src: finalPhotoSrc,
//         borderWidth: 0,
//         borderColor: "#000000",
//         borderRadius: 0,
//       });
//     }
//     setTiles(newTiles);
//   }, [finalPhotoSrc, paper, size, copies]);

//   useEffect(() => {
//     if (step === 6 && tiles.length === 0 && finalPhotoSrc) autoFill();
//     // eslint-disable-next-line
//   }, [step]);

//   const canNext = () => {
//     if (step === 1) return !!photo;
//     if (step === 2) return !!size;
//     return true;
//   };

//   const goto = (s) => {
//     if (s > step && !canNext()) {
//       toast.error("Complete current step first");
//       return;
//     }
//     setStep(Math.max(1, Math.min(STEPS.length, s)));
//   };

//   return (
//     <div>
//       <PageHeader
//         eyebrow="Passport Photo Maker"
//         title={`Step ${step} — ${STEPS[step - 1].name}`}
//         description="Professional passport & ID photos, layout-built on a real paper canvas."
//       />
//       {/* Stepper */}
//       <div className="px-8 py-4 border-b border-zinc-200 bg-white sticky top-[92px] z-10">
//         <ol className="flex items-center gap-2 flex-wrap">
//           {STEPS.map((s) => {
//             const Icon = s.icon;
//             const active = step === s.id;
//             const done = step > s.id;
//             return (
//               <li key={s.id}>
//                 <button
//                   onClick={() => goto(s.id)}
//                   data-testid={`step-${s.id}`}
//                   className={`h-9 pl-2 pr-3 rounded-full flex items-center gap-2 text-xs uppercase tracking-[0.15em] border transition
//                     ${
//                       active
//                         ? "bg-zinc-900 text-white border-zinc-900"
//                         : done
//                           ? "bg-[#0052FF]/10 text-[#0052FF] border-[#0052FF]/30"
//                           : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
//                     }`}
//                 >
//                   <span
//                     className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? "bg-white text-zinc-900" : done ? "bg-[#0052FF] text-white" : "bg-zinc-100 text-zinc-500"}`}
//                   >
//                     {done ? (
//                       <Check size={12} weight="bold" />
//                     ) : (
//                       <Icon size={12} />
//                     )}
//                   </span>
//                   <span>
//                     {s.id}. {s.name}
//                   </span>
//                 </button>
//               </li>
//             );
//           })}
//         </ol>
//       </div>

//       <div className="p-8 min-h-[500px]">
//         {step === 1 && (
//           <StepUpload
//             photo={photo}
//             setPhoto={setPhoto}
//             onNext={() => goto(2)}
//           />
//         )}
//         {step === 2 && <StepSize size={size} setSize={setSize} />}
//         {step === 3 && (
//           <StepCrop
//             src={photo?.src}
//             size={size}
//             croppedSrc={croppedSrc}
//             setCroppedSrc={setCroppedSrc}
//           />
//         )}
//         {step === 4 && (
//           <StepBackground
//             src={finalPhotoSrc}
//             bgWhite={bgWhite}
//             setBgWhite={setBgWhite}
//             setCroppedSrc={setCroppedSrc}
//             croppedSrc={croppedSrc}
//           />
//         )}
//         {step === 5 && (
//           <StepAdjust src={finalPhotoSrc} setCroppedSrc={setCroppedSrc} />
//         )}
//         {step === 6 && (
//           <TextPanel src={finalPhotoSrc} setCroppedSrc={setCroppedSrc} />
//         )}
//         {step === 7 && (
//           <StepLayout
//             paper={paper}
//             setPaper={setPaper}
//             size={size}
//             tiles={tiles}
//             setTiles={setTiles}
//             finalPhotoSrc={finalPhotoSrc}
//           />
//           // <StepLayout
//           //   paper={paper} setPaper={setPaper}
//           //   size={size}
//           //   copies={copies} setCopies={setCopies}
//           //   tiles={tiles} setTiles={setTiles}
//           //   autoFill={autoFill}
//           //   finalPhotoSrc={finalPhotoSrc}
//           // />
//         )}
//         {step === 8 && (
//           <StepBilling
//             customers={customers}
//             customerId={customerId}
//             setCustomerId={setCustomerId}
//             copies={tiles.length}
//             rate={rate}
//             setRate={setRate}
//             size={size}
//             paper={paper}
//             refreshCustomers={() =>
//               api.get("/customers").then(({ data }) => setCustomers(data))
//             }
//           />
//         )}
//         {step === 9 && (
//           <StepPrint
//             tiles={tiles}
//             paper={paper}
//             size={size}
//             copies={tiles.length}
//             customerId={customerId}
//             customers={customers}
//             afterFinalize={() => nav("/dashboard")}
//           />
//         )}
//       </div>

//       {/* Footer nav */}
//       <div className="border-t border-zinc-200 bg-white px-8 py-4 flex items-center justify-between sticky bottom-0">
//         <button
//           onClick={() => goto(step - 1)}
//           disabled={step === 1}
//           data-testid="wizard-back"
//           className="h-10 px-4 border border-zinc-300 rounded-md text-sm flex items-center gap-2 disabled:opacity-40"
//         >
//           <ArrowLeft size={14} /> Back
//         </button>
//         <div className="text-xs font-mono text-zinc-500">Step {step} of {STEPS.length}</div>
//         {step < 10 ? (
//           <button
//             onClick={() => goto(step + 1)}
//             data-testid="wizard-next"
//             className="h-10 px-4 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm flex items-center gap-2"
//           >
//             Continue <ArrowRight size={14} />
//           </button>
//         ) : (
//           <div style={{ width: 90 }} />
//         )}
//       </div>
//     </div>
//   );
// }

// /* ---------------- Step 1: Upload ---------------- */
// function StepUpload({ photo, setPhoto, onNext }) {
//   const fileRef = useRef();
//   const onPick = (file) => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => setPhoto({ src: reader.result, name: file.name });
//     reader.readAsDataURL(file);
//   };
//   return (
//     <div className="max-w-3xl mx-auto">
//       <label
//         onDragOver={(e) => e.preventDefault()}
//         onDrop={(e) => {
//           e.preventDefault();
//           onPick(e.dataTransfer.files?.[0]);
//         }}
//         className="block border-2 border-dashed border-zinc-300 rounded-md p-12 text-center bg-white hover:border-[#0052FF] cursor-pointer"
//       >
//         <Upload size={40} className="mx-auto text-zinc-400" />
//         <div className="mt-3 font-heading text-lg">
//           Drop a photo here or click to upload
//         </div>
//         <div className="text-sm text-zinc-500 mt-1">
//           JPG / PNG · Recommended front-facing portrait
//         </div>
//         <input
//           ref={fileRef}
//           type="file"
//           accept="image/*"
//           className="hidden"
//           onChange={(e) => onPick(e.target.files?.[0])}
//           data-testid="upload-input"
//         />
//       </label>
//       {photo && (
//         <div
//           className="mt-6 flex items-center gap-4 bg-white border border-zinc-200 rounded-md p-4"
//           data-testid="upload-preview"
//         >
//           <img
//             src={photo.src}
//             alt="preview"
//             className="w-24 h-32 object-cover rounded"
//           />
//           <div className="flex-1">
//             <div className="font-medium">{photo.name}</div>
//             <div className="text-xs text-zinc-500 mt-1">
//               Ready to proceed. You can crop & align in step 3.
//             </div>
//           </div>
//           <button
//             onClick={onNext}
//             className="h-10 px-4 bg-[#0052FF] text-white rounded-md text-sm"
//           >
//             Continue
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------------- Step 2: Size ---------------- */
// function StepSize({ size, setSize }) {
//   return (
//     <div className="space-y-4 max-w-5xl">
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//         {PASSPORT_SIZES.map((s) => {
//           const active = size.id === s.id;
//           return (
//             <button
//               key={s.id}
//               onClick={() => setSize({ ...s })}
//               data-testid={`size-${s.id}`}
//               className={`p-5 rounded-md border text-left ${active ? "border-[#0052FF] bg-[#0052FF]/5" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
//             >
//               <div className="label-uppercase">
//                 {active ? "Selected" : s.custom ? "Custom" : "Passport"}
//               </div>
//               <div className="mt-2 font-heading font-medium">{s.label}</div>
//               <div className="mt-3 flex items-end gap-2">
//                 <div
//                   className={`border rounded-sm ${active ? "border-[#0052FF]" : "border-zinc-300"}`}
//                   style={{
//                     width: Math.min(s.w, 60) * 1.4,
//                     height: Math.min(s.h, 80) * 1.4,
//                   }}
//                 />
//                 <div className="text-[10px] font-mono text-zinc-500 pb-1">
//                   {s.w}×{s.h} mm
//                 </div>
//               </div>
//             </button>
//           );
//         })}
//       </div>

//       {/* Custom size editor */}
//       {size.custom && (
//         <div
//           className="bg-white border border-[#0052FF]/40 rounded-md p-5"
//           data-testid="custom-size-panel"
//         >
//           <div className="flex items-center justify-between mb-3">
//             <div>
//               <div className="label-uppercase">Custom size</div>
//               <div className="font-heading text-lg mt-1">
//                 Enter your exact dimensions
//               </div>
//               <div className="text-xs text-zinc-500 mt-0.5">
//                 Free-form crop with all edge & corner handles will be enabled in
//                 Step 3.
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <div>
//                 <div className="label-uppercase mb-1">Width (mm)</div>
//                 <input
//                   data-testid="custom-width"
//                   type="number"
//                   min="10"
//                   max="300"
//                   step="1"
//                   value={size.w}
//                   onChange={(e) =>
//                     setSize({
//                       ...size,
//                       w: Math.max(
//                         10,
//                         Math.min(300, Number(e.target.value) || 10),
//                       ),
//                     })
//                   }
//                   className="w-24 h-10 px-3 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
//                 />
//               </div>
//               <div className="text-2xl text-zinc-300 pt-5">×</div>
//               <div>
//                 <div className="label-uppercase mb-1">Height (mm)</div>
//                 <input
//                   data-testid="custom-height"
//                   type="number"
//                   min="10"
//                   max="300"
//                   step="1"
//                   value={size.h}
//                   onChange={(e) =>
//                     setSize({
//                       ...size,
//                       h: Math.max(
//                         10,
//                         Math.min(300, Number(e.target.value) || 10),
//                       ),
//                     })
//                   }
//                   className="w-24 h-10 px-3 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
//                 />
//               </div>
//             </div>
//           </div>
//           {/* Quick presets */}
//           <div className="flex items-center gap-2 pt-3 border-t border-zinc-200">
//             <span className="label-uppercase mr-2">Quick set</span>
//             {[
//               [30, 40],
//               [40, 50],
//               [45, 60],
//               [50, 70],
//               [60, 90],
//             ].map(([w, h]) => (
//               <button
//                 key={`${w}x${h}`}
//                 onClick={() => setSize({ ...size, w, h })}
//                 className="h-8 px-3 border border-zinc-300 rounded-md text-xs font-mono hover:border-[#0052FF]"
//                 data-testid={`quick-${w}x${h}`}
//               >
//                 {w}×{h}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------------- Step 3: Photoshop-style Crop ---------------- */
// async function getCroppedImg(imageSrc, pixelCrop, rotation, size) {
//   // Renders the cropped + rotated area of imageSrc onto a canvas at print-quality resolution.
//   const image = await new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.onload = () => resolve(img);
//     img.onerror = reject;
//     img.src = imageSrc;
//   });
//   const outW = Math.max(600, Math.round((size.w / 25.4) * 600));
//   const outH = Math.max(600, Math.round((size.h / 25.4) * 600));

//   // 1) Bake rotation onto a full-size canvas
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

//   // 2) Crop from rotated canvas
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
//   return cropCanvas.toDataURL("image/jpeg", 0.94);
// }

// function StepCrop({ src, size, croppedSrc, setCroppedSrc }) {
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [pixels, setPixels] = useState(null);
//   const [busy, setBusy] = useState(false);
//   const [freeAspect, setFreeAspect] = useState(!!size.custom);
//   const [outW, setOutW] = useState(size.w);
//   const [outH, setOutH] = useState(size.h);
//   const aspect = freeAspect ? undefined : size.w / size.h;

//   // Keep output size synced when size prop changes
//   useEffect(() => {
//     setOutW(size.w);
//     setOutH(size.h);
//   }, [size.id, size.w, size.h]);

//   const onCropComplete = useCallback((_, area) => setPixels(area), []);

//   const doApply = async () => {
//     if (!pixels) return;
//     setBusy(true);
//     try {
//       const outSize = freeAspect ? { w: outW, h: outH } : size;
//       const out = await getCroppedImg(src, pixels, rotation, outSize);
//       setCroppedSrc(out);
//       toast.success("Crop applied");
//     } catch (e) {
//       toast.error("Crop failed");
//     } finally {
//       setBusy(false);
//     }
//   };

//   const reset = () => {
//     setCrop({ x: 0, y: 0 });
//     setZoom(1);
//     setRotation(0);
//   };

//   if (!src)
//     return <div className="text-zinc-500">Upload a photo in Step 1 first.</div>;

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 max-w-6xl">
//       {/* Photoshop-style crop workspace */}
//       <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
//         <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200">
//           <div className="label-uppercase">Crop workspace</div>
//           <div className="flex items-center gap-3">
//             <label
//               className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer"
//               data-testid="free-aspect-toggle"
//             >
//               <input
//                 type="checkbox"
//                 checked={freeAspect}
//                 onChange={(e) => setFreeAspect(e.target.checked)}
//                 className="accent-[#0052FF]"
//               />
//               <span className="uppercase tracking-[0.15em]">
//                 Free aspect (drag any edge)
//               </span>
//             </label>
//             <div className="text-xs font-mono text-zinc-500">
//               {freeAspect ? "Free" : `${size.w}:${size.h} · locked`}
//             </div>
//           </div>
//         </div>
//         <div
//           className="relative bg-zinc-900 crop-photoshop"
//           style={{ height: 480 }}
//           data-testid="crop-workspace"
//         >
//           <Cropper
//             image={src}
//             crop={crop}
//             zoom={zoom}
//             rotation={rotation}
//             aspect={aspect}
//             cropShape="rect"
//             showGrid={true}
//             restrictPosition={false}
//             objectFit="contain"
//             onCropChange={setCrop}
//             onZoomChange={setZoom}
//             onRotationChange={setRotation}
//             onCropComplete={onCropComplete}
//             style={{
//               containerStyle: { background: "#18181B" },
//               cropAreaStyle: {
//                 border: "2px solid #0052FF",
//                 color: "rgba(0,0,0,0.55)",
//               },
//             }}
//           />
//           {!freeAspect && (
//             <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
//               <div
//                 className="w-24 h-32 rounded-full border border-white/30"
//                 style={{ marginTop: -20 }}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Right sidebar */}
//       <aside className="bg-white border border-zinc-200 rounded-md p-5 h-fit space-y-4">
//         {freeAspect && (
//           <div>
//             <div className="label-uppercase mb-2">Output size (mm)</div>
//             <div className="flex items-center gap-2">
//               <input
//                 type="number"
//                 min="10"
//                 max="300"
//                 value={outW}
//                 onChange={(e) =>
//                   setOutW(Math.max(10, Number(e.target.value) || 10))
//                 }
//                 className="w-full h-9 px-2 border border-zinc-300 rounded-md text-sm"
//                 data-testid="crop-out-w"
//               />
//               <span className="text-zinc-400">×</span>
//               <input
//                 type="number"
//                 min="10"
//                 max="300"
//                 value={outH}
//                 onChange={(e) =>
//                   setOutH(Math.max(10, Number(e.target.value) || 10))
//                 }
//                 className="w-full h-9 px-2 border border-zinc-300 rounded-md text-sm"
//                 data-testid="crop-out-h"
//               />
//             </div>
//             <div className="text-[10px] text-zinc-500 mt-1">
//               Free-form mode. Output will be scaled to these mm dimensions.
//             </div>
//           </div>
//         )}

//         <div>
//           <div className="label-uppercase mb-2">
//             Preview {freeAspect ? `${outW}×${outH}mm` : `${size.w}×${size.h}mm`}
//           </div>
//           <div className="flex items-center justify-center">
//             <div
//               style={{
//                 width: (freeAspect ? outW : size.w) * 3,
//                 height: (freeAspect ? outH : size.h) * 3,
//               }}
//               className="border border-zinc-300 bg-zinc-50 overflow-hidden"
//             >
//               {croppedSrc ? (
//                 <img
//                   src={croppedSrc}
//                   alt="cropped"
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-zinc-400 text-center px-2">
//                   Apply crop to see preview
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={doApply}
//           disabled={busy || !pixels}
//           data-testid="crop-apply"
//           className="w-full h-11 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm disabled:opacity-50"
//         >
//           {busy ? "Applying…" : croppedSrc ? "Re-apply crop" : "Apply crop"}
//         </button>

//         <div className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-200 pt-3">
//           {freeAspect
//             ? "Drag any corner or edge handle to reshape the crop box freely · scroll to zoom · drag inside to pan."
//             : "Aspect is locked to selected size. Toggle Free aspect to drag any edge/corner independently."}
//         </div>
//         <div className="p-4 border-t border-zinc-200 grid grid-cols-1 md:grid-cols-1 gap-4">
//           <RangeRow
//             label="Zoom"
//             value={zoom}
//             min="1"
//             max="4"
//             step="0.01"
//             onChange={setZoom}
//             testid="crop-zoom"
//           />
//           <RangeRow
//             label="Rotate"
//             value={rotation}
//             min="-180"
//             max="180"
//             step="1"
//             onChange={setRotation}
//             testid="crop-rotate"
//           />
//           <div className="flex items-end gap-2">
//             <button
//               onClick={reset}
//               className="h-9 px-3 border border-zinc-300 rounded-md text-xs uppercase tracking-[0.15em] flex-1"
//             >
//               Reset
//             </button>
//             <button
//               onClick={() => setRotation((r) => r - 90)}
//               className="h-9 px-3 border border-zinc-300 rounded-md text-xs uppercase tracking-[0.15em]"
//             >
//               -90°
//             </button>
//             <button
//               onClick={() => setRotation((r) => r + 90)}
//               className="h-9 px-3 border border-zinc-300 rounded-md text-xs uppercase tracking-[0.15em]"
//             >
//               +90°
//             </button>
//           </div>
//         </div>
//       </aside>
//     </div>
//   );
// }

// function RangeRow({ label, value, min, max, step, onChange, testid }) {
//   return (
//     <div>
//       <div className="flex justify-between text-xs mb-1">
//         <span className="label-uppercase">{label}</span>
//         <span className="font-mono">{Number(value).toFixed(2)}</span>
//       </div>
//       <input
//         data-testid={testid}
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

// /* ---------------- Step 4: Background ---------------- */
// function StepBackground({
//   src,
//   bgWhite,
//   setBgWhite,
//   setCroppedSrc,
//   croppedSrc,
// }) {
//   const [busy, setBusy] = useState("");
//   const [bgColor, setBgColor] = useState("#ffffff");

//   if (!src)
//     return <div className="text-zinc-500">Complete previous steps first.</div>;

//   const overlayWhite = () => {
//     const canvas = document.createElement("canvas");
//     const img = new Image();
//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d");
//       ctx.fillStyle = "#ffffff";
//       ctx.fillRect(0, 0, img.width, img.height);
//       ctx.globalCompositeOperation = "source-over";
//       ctx.drawImage(img, 0, 0);
//       ctx.globalCompositeOperation = "screen";
//       ctx.fillStyle = "rgba(255,255,255,0.15)";
//       ctx.fillRect(0, 0, img.width, img.height);
//       setCroppedSrc(canvas.toDataURL("image/jpeg", 0.92));
//       setBgWhite(true);
//       toast.success("Background lightened (offline).");
//     };
//     img.src = src;
//   };

//   // const applyInformation=async()=>{

//   //   const img=await loadImg(croppedSrc || src);

//   //   const lines=[];

//   //   if(info.name)
//   //     lines.push(info.name);

//   //   if(info.template==="namedob"|| info.template==="namedobdop"|| info.template==="custom")
//   //     lines.push("DOB : "+info.dob);

//   //   if(info.template==="namedobdop")
//   //     lines.push("DOP : "+info.dop);

//   //   const padding=10;
//   //   const lineHeight=info.fontSize+6;

//   //   const stripHeight =
//   //     Math.max(
//   //         80,
//   //         padding * 2 + lines.length * lineHeight
//   //     );
//   //   const canvas=document.createElement("canvas");

//   //   canvas.width = img.width;
//   //   canvas.height = img.height + stripHeight;

//   //   ctx.drawImage(img, 0, 0);

//   //   ctx.fillStyle = "#fff";
//   //   ctx.fillRect(
//   //       0,
//   //       img.height,
//   //       img.width,
//   //       stripHeight
//   //   );

//   //   ctx.fillStyle = "#000";
//   //   ctx.font = `${info.fontSize}px Arial`;
//   //   ctx.textAlign = "center";
//   //   ctx.textBaseline = "middle";

//   //   let y = img.height + stripHeight / 2;

//   //   lines.forEach((line, index) => {
//   //     ctx.fillText(
//   //         line,
//   //         img.width / 2,
//   //         y + index * lineHeight
//   //     );
//   //   });

//   //   setCroppedSrc(
//   //     canvas.toDataURL("image/png")
//   //   );
//   //   toast.success("Information added.");
//   // }

//   // const aiCutout = async () => {
//   //   setBusy("cutout");
//   //   try {
//   //     const { data } = await api.post("/ai/bg-remove", { image: src });
//   //     // Composite the cutout onto the selected solid bgColor at same resolution
//   //     const cut = await loadImg(data.image_url);
//   //     const c = document.createElement("canvas"); c.width = cut.width; c.height = cut.height;
//   //     const ctx = c.getContext("2d");
//   //     ctx.fillStyle = bgColor; ctx.fillRect(0, 0, c.width, c.height);
//   //     ctx.drawImage(cut, 0, 0);
//   //     setCroppedSrc(c.toDataURL("image/jpeg", 0.94));
//   //     setBgWhite(true);
//   //     toast.success("AI cutout applied — passport-safe background.");
//   //   } catch (e) { toast.error(formatApiError(e)); }
//   //   setBusy("");
//   // };

//   //   const aiCutout = async () => {
//   //   setBusy("cutout");

//   //   try {
//   //     const { data } = await api.post("/ai/bg-remove", {
//   //       image: src,
//   //     });

//   //     // Load returned Base64 image
//   //     const cut = await loadImg(data.image);

//   //     // Create new canvas
//   //     const canvas = document.createElement("canvas");
//   //     canvas.width = cut.width;
//   //     canvas.height = cut.height;

//   //     const ctx = canvas.getContext("2d");

//   //     // Fill selected background color
//   //     ctx.fillStyle = bgColor;
//   //     ctx.fillRect(0, 0, canvas.width, canvas.height);

//   //     // Draw transparent cutout
//   //     ctx.drawImage(cut, 0, 0);

//   //     // Save result
//   //     setCroppedSrc(canvas.toDataURL("image/jpeg"));

//   //     setBgWhite(true);

//   //     toast.success("Background removed successfully.");
//   //   } catch (e) {
//   //     toast.error(e)
//   //     // toast.error(formatApiError(e));
//   //   } finally {
//   //     setBusy("");
//   //   }
//   // };

//   const aiCutout = async () => {
//     setBusy("cutout");

//     try {
//       const { data } = await api.post("/ai/bg-remove", {
//         image: src,
//       });

//       const cut = await loadImg(data.image);

//       const canvas = document.createElement("canvas");
//       canvas.width = cut.width;
//       canvas.height = cut.height;

//       const ctx = canvas.getContext("2d");

//       // Better rendering quality
//       ctx.imageSmoothingEnabled = true;
//       ctx.imageSmoothingQuality = "high";

//       // Fill passport background
//       ctx.fillStyle = bgColor;
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       // Draw transparent PNG
//       ctx.drawImage(cut, 0, 0);

//       // Keep PNG while editing
//       setCroppedSrc(canvas.toDataURL("image/png"));

//       setBgWhite(true);

//       toast.success("Background removed successfully.");
//     } catch (e) {
//       console.error(e);
//       toast.error(formatApiError(e));
//     } finally {
//       setBusy("");
//     }
//   };

//   const aiFaceEnhance = async () => {
//     setBusy("face");
//     try {
//       const { data } = await api.post("/ai/face-enhance", {
//         image: src,
//         fidelity: 0.7,
//       });
//       const enh = await loadImg(data.image_url);
//       const c = document.createElement("canvas");
//       c.width = enh.width;
//       c.height = enh.height;
//       c.getContext("2d").drawImage(enh, 0, 0);
//       setCroppedSrc(c.toDataURL("image/jpeg", 0.94));
//       toast.success("Face enhanced.");
//     } catch (e) {
//       toast.error(formatApiError(e));
//     }
//     setBusy("");
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
//       <div className="bg-white border border-zinc-200 rounded-md p-5">
//         <img
//           src={croppedSrc || src}
//           alt="preview"
//           className="w-full max-h-[420px] object-contain bg-zinc-50 rounded"
//         />
//       </div>
//       <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-4">
//         <div className="label-uppercase">Enhancement</div>

//         <div className="space-y-2">
//           <div className="border border-zinc-200 rounded-md p-3 space-y-2">
//             <button
//               onClick={aiCutout}
//               disabled={!!busy}
//               data-testid="ai-cutout-btn"
//               className="w-full h-10 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm flex items-center justify-between px-4 disabled:opacity-60"
//             >
//               <span>AI Cutout & Remove BG</span>
//               {busy === "cutout" ? (
//                 <span className="text-[10px]">Processing…</span>
//               ) : (
//                 <span className="text-[10px] uppercase tracking-[0.2em]">
//                   fal.ai
//                 </span>
//               )}
//             </button>
//             <div className="flex items-center gap-2 text-xs">
//               <span className="label-uppercase">BG color</span>
//               <input
//                 type="color"
//                 value={bgColor}
//                 onChange={(e) => setBgColor(e.target.value)}
//                 data-testid="bg-color"
//                 className="w-8 h-8 rounded border border-zinc-300 cursor-pointer"
//               />
//               <span className="font-mono text-zinc-500">{bgColor}</span>
//               <div className="ml-auto flex gap-1">
//                 {["#ffffff", "#f5f5f5", "#e0eaff", "#7dbfff"].map((c) => (
//                   <button
//                     key={c}
//                     type="button"
//                     onClick={() => setBgColor(c)}
//                     className="h-5 w-5 rounded border border-zinc-300"
//                     style={{ background: c }}
//                     title={c}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={aiFaceEnhance}
//             disabled={true}
//             data-testid="ai-face-btn"
//             className="w-full h-11 border border-zinc-300 rounded-md text-sm text-left px-4 flex items-center justify-between disabled:opacity-60"
//           >
//             <span>Face Enhance / Upscale</span>
//             <span className="text-[10px] tracking-[0.2em] font-bold text-red-900">
//               coming soon
//             </span>
//           </button>
//         </div>

//         {bgWhite && (
//           <div className="text-xs text-green-600 uppercase tracking-[0.2em]">
//             ✓ Background enhanced
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function loadImg(src) {
//   return new Promise((res, rej) => {
//     const i = new Image();
//     i.crossOrigin = "anonymous";
//     i.onload = () => res(i);
//     i.onerror = rej;
//     i.src = src;
//   });
// }

// /* ---------------- Step 5: Ajust brigthness ---------------- */
// // function StepDress() {
// //   return (
// //     <div className="max-w-2xl">
// //       <div className="bg-white border border-zinc-200 rounded-md p-8 text-center">
// //         <TShirt size={40} className="mx-auto text-zinc-400" />
// //         <div className="mt-3 font-heading text-xl">Dress & Accessories</div>
// //         <p className="text-sm text-zinc-500 mt-2">Attire overlays, tie/coat presets and gender-based swaps ship in Phase 2.</p>
// //         <div className="mt-4 inline-block text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-zinc-100 rounded-full">Skip for now</div>
// //       </div>
// //     </div>
// //   );
// // }
// function StepAdjust({ src, setCroppedSrc }) {
//   const canvasRef = useRef(null);

//   const [settings, setSettings] = useState({
//     brightness: 100,
//     contrast: 100,
//     saturate: 100,
//     blur: 0,
//     grayscale: 0,
//     sepia: 0,
//     hue: 0,
//   });

//   useEffect(() => {
//     if (!src) return;

//     const img = new Image();
//     img.onload = () => {
//       const canvas = canvasRef.current;

//       canvas.width = img.width;
//       canvas.height = img.height;

//       const ctx = canvas.getContext("2d");

//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       ctx.filter = `
//         brightness(${settings.brightness}%)
//         contrast(${settings.contrast}%)
//         saturate(${settings.saturate}%)
//         blur(${settings.blur}px)
//         grayscale(${settings.grayscale}%)
//         sepia(${settings.sepia}%)
//         hue-rotate(${settings.hue}deg)
//       `;

//       ctx.drawImage(img, 0, 0);
//     };

//     img.src = src;
//   }, [src, settings]);

//   const apply = () => {
//     setCroppedSrc(canvasRef.current.toDataURL("image/png"));
//   };

//   const reset = () => {
//     setSettings({
//       brightness: 100,
//       contrast: 100,
//       saturate: 100,
//       blur: 0,
//       grayscale: 0,
//       sepia: 0,
//       hue: 0,
//     });
//   };

//   const Slider = ({ label, keyName, min, max, step = 1 }) => (
//     <div className="space-y-1">
//       <div className="flex justify-between text-xs">
//         <span>{label}</span>
//         <span>{settings[keyName]}</span>
//       </div>

//       <input
//         type="range"
//         min={min}
//         max={max}
//         step={step}
//         value={settings[keyName]}
//         onChange={(e) =>
//           setSettings((s) => ({
//             ...s,
//             [keyName]: Number(e.target.value),
//           }))
//         }
//         className="w-full"
//       />
//     </div>
//   );

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
//       <div className="bg-white rounded-lg border p-6">
//         <div className="flex justify-center">
//           <canvas
//             ref={canvasRef}
//             className="max-h-[600px] max-w-full border rounded shadow"
//           />
//         </div>
//       </div>

//       <div className="bg-white rounded-lg border p-5 space-y-5">
//         <h2 className="font-semibold text-lg">Image Adjustment</h2>

//         <Slider label="Brightness" keyName="brightness" min={0} max={200} />

//         <Slider label="Contrast" keyName="contrast" min={0} max={200} />

//         <Slider label="Saturation" keyName="saturate" min={0} max={200} />

//         <Slider label="Blur" keyName="blur" min={0} max={10} />

//         <Slider label="Hue" keyName="hue" min={0} max={360} />

//         <Slider label="Grayscale" keyName="grayscale" min={0} max={100} />

//         <Slider label="Sepia" keyName="sepia" min={0} max={100} />

//         <div className="flex gap-3 pt-4">
//           <button onClick={reset} className="flex-1 h-11 border rounded-md">
//             Reset
//           </button>

//           <button
//             onClick={apply}
//             className="flex-1 h-11 bg-[#0052FF] text-white rounded-md"
//           >
//             Apply
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------------- Step 6: Text Format ---------------- */
// function TextPanel({ src, setCroppedSrc }) {
//   const [info, setInfo] = useState({
//     enabled: true,
//     showName: true,
//     showDob: true,
//     showDop: false,
//     name: "",
//     dob: "",
//     dop: "",
//     fontSize: 22,
//     stripHeight: 90,
//     bg: "#ffffff",
//     color: "#000000",
//     font: "Arial",
//   });
//   const canvasRef = useRef();

//   const apply = () => {
//     setCroppedSrc(canvasRef.current.toDataURL("image/png"));
//     toast.success("Photo text applied");
//   };

//   const drawCanvas = useCallback(async()=>{
//     if (!src || !canvasRef.current) return;

//     const img = await loadImg(src);

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     // Build text lines
//     const lines = [];

//     if (info.enabled && info.name.trim()) lines.push(info.name);

//     if (info.enabled && info.showDob && info.dob)
//       lines.push(`DOB : ${info.dob}`);

//     if (info.enabled && info.showDop && info.dop)
//       lines.push(`DOP : ${info.dop}`);

//     // Calculate strip height automatically
//     const lineHeight = info.fontSize + 8;
//     const padding = 18;

//     const autoStripHeight =
//       lines.length > 0
//         ? Math.max(info.stripHeight, lines.length * lineHeight + padding * 2)
//         : info.stripHeight;

//     canvas.width = img.width;
//     canvas.height = img.height + (info.enabled ? autoStripHeight : 0);

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     ctx.imageSmoothingEnabled = true;
//     ctx.imageSmoothingQuality = "high";

//     // Draw image
//     ctx.drawImage(img, 0, 0);

//     if (!info.enabled) return;

//     // Draw white strip
//     ctx.fillStyle = info.bg;
//     ctx.fillRect(0, img.height, canvas.width, autoStripHeight);

//     // Draw text
//     ctx.fillStyle = info.color;
//     ctx.font = `bold ${info.fontSize}px ${info.font}`;
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";

//     let y =
//       img.height + autoStripHeight / 2 - ((lines.length - 1) * lineHeight) / 2;

//     lines.forEach((line) => {
//       ctx.fillText(line, canvas.width / 2, y);
//       y += lineHeight;
//     });
//   },[src, info])

//   useEffect(() => {
//     drawCanvas();
//   }, [drawCanvas]);

//   return (
//     <div className="grid grid-cols-[1fr_330px] gap-6">
//       <div className="bg-white rounded-lg border p-6">
//         <div className="flex justify-center">
//           <canvas
//             ref={canvasRef}
//             className="max-h-[600px] max-w-full border rounded shadow"
//           />
//         </div>
//       </div>

//       <div className="space-y-4">
//         <label>
//           <input
//             type="checkbox"
//             checked={info.enabled}
//             onChange={(e) =>
//               setInfo((p) => ({
//                 ...p,
//                 enabled: e.target.checked,
//               }))
//             }
//           />
//           Enable
//         </label>
//         <div>
//           <label className="text-xs font-medium text-zinc-500">Full Name</label>

//           <input
//             value={info.name}
//             onChange={(e) =>
//               setInfo((p) => ({
//                 ...p,
//                 name: e.target.value,
//               }))
//             }
//             placeholder="Full Name"
//             className="mt-1 w-full h-10 border rounded-md px-3"
//           />
//         </div>

//         <div>
//           <label className="text-xs font-medium text-zinc-500">
//             Date Of Birth
//           </label>
//           <input
//             type="date"
//             value={info.dob}
//             onChange={(e) =>
//               setInfo((p) => ({
//                 ...p,
//                 dob: e.target.value,
//               }))
//             }
//             className="mt-1 w-full h-10 border rounded-md px-3"
//           />
//         </div>
//         <div>
//           <label className="text-xs font-medium text-zinc-500">
//             Date Of Photo
//           </label>

//           <input
//             type="date"
//             value={info.dop}
//             onChange={(e) =>
//               setInfo((p) => ({
//                 ...p,
//                 dop: e.target.value,
//               }))
//             }
//             className="mt-1 w-full h-10 border rounded-md px-3"
//           />
//         </div>
//         <div>
//           <label className="text-xs font-medium text-zinc-500">
//             Font Size ({info.fontSize}px)
//           </label>

//           <input
//             type="range"
//             min={12}
//             max={40}
//             value={info.fontSize}
//             onChange={(e) =>
//               setInfo((p) => ({
//                 ...p,
//                 fontSize: Number(e.target.value),
//               }))
//             }
//             className="w-full"
//           />
//         </div>
//         <div>
//           <label className="text-xs font-medium text-zinc-500">
//             Strip Height ({info.stripHeight}px)
//           </label>

//           <input
//             type="range"
//             min={60}
//             max={200}
//             value={info.stripHeight}
//             onChange={(e) =>
//               setInfo((p) => ({
//                 ...p,
//                 stripHeight: Number(e.target.value),
//               }))
//             }
//             className="w-full"
//           />
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <div className="flex items-center">
//             <label className="text-sm font-medium text-zinc-500">
//               Text Color :-
//             </label>

//             <input
//               type="color"
//               value={info.color}
//               onChange={(e) =>
//                 setInfo((p) => ({
//                   ...p,
//                   color: e.target.value,
//                 }))
//               }
//             />
//           </div>

//           <div className="flex items-center">
//             <label className="text-sm  font-medium text-zinc-500">
//               Strip Background :-
//             </label>

//             <input
//               type="color"
//               value={info.bg}
//               onChange={(e) =>
//                 setInfo((p) => ({
//                   ...p,
//                   bg: e.target.value,
//                 }))
//               }
//             />
//           </div>
//         </div>

//         <button>Apply</button>
//         <button
//           onClick={apply}
//           className="w-full h-11 bg-[#0052FF] text-white rounded-md"
//         >
//           Apply Photo Text
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ---------------- Step 7: Layout Builder ---------------- */
// function StepLayout({
//   paper,
//   setPaper,
//   size,
//   copies,
//   setCopies,
//   tiles,
//   setTiles,
//   autoFill,
//   finalPhotoSrc,
// }) {
//   const [selected, setSelected] = useState(null);
//   const [photosPerRow, setPhotosPerRow] = useState(4);
//   const [totalPhotos, setTotalPhotos] = useState(8);

//   const [hGap, setHGap] = useState(8);
//   const [vGap, setVGap] = useState(8);

//   const [topMargin, setTopMargin] = useState(10);
//   const [leftMargin, setLeftMargin] = useState(10);

//   const [autoCenter, setAutoCenter] = useState(true);
//   const [autoRotate, setAutoRotate] = useState(false);
//   const canvasRef = useRef();
//   const pW = paper.w * MM_PX;
//   const pH = paper.h * MM_PX;
  

//   // const addTile = () => {
//   //   if (!finalPhotoSrc) return;
//   //   setTiles([...tiles, {
//   //     id: crypto.randomUUID(), x: 20, y: 20,
//   //     w: size.w * MM_PX, h: size.h * MM_PX,
//   //     rotation: 0, src: finalPhotoSrc,
//   //     borderWidth: 0, borderColor: "#000000", borderRadius: 0,
//   //   }]);
//   // };

//   const generateLayout = useCallback(()=> {
//     if (!finalPhotoSrc) return;

//     // const photoW = size.w * MM_PX;
//     // const photoH = size.h * MM_PX;

//     const pW = paper.w * MM_PX;
//     const pH = paper.h * MM_PX;

//     const aspect = size.h / size.w;

//     const usableWidth = pW - 20 - (photosPerRow - 1) * hGap;

//     const photoW = usableWidth / photosPerRow;

//     const photoH = photoW * aspect;

//     const rows = Math.ceil(totalPhotos / photosPerRow);

//     const layoutWidth = photosPerRow * photoW + (photosPerRow - 1) * hGap;

//     const layoutHeight = rows * photoH + (rows - 1) * vGap;

//     const startX = autoCenter ? (pW - layoutWidth) / 2 : 10;

//     const startY = autoCenter ? (pH - layoutHeight) / 2 : 10;

//     const items = [];

//     for (let i = 0; i < totalPhotos; i++) {
//       const row = Math.floor(i / photosPerRow);

//       const col = i % photosPerRow;

//       items.push({
//         id: crypto.randomUUID(),

//         src: finalPhotoSrc,

//         x: startX + col * (photoW + hGap),

//         y: startY + row * (photoH + vGap),

//         w: photoW,

//         h: photoH,

//         rotation: 0,

//         borderWidth: 0,

//         borderRadius: 0,

//         borderColor: "#000",
//       });
//     }

//     setTiles(items);
//   },[paper,
//     size,
//     photosPerRow,
//     totalPhotos,
//     hGap,
//     vGap,
//     autoCenter,
//     finalPhotoSrc, setTiles]);

//   const removeTile = (id) => setTiles(tiles.filter((t) => t.id !== id));
//   const duplicateTile = (t) =>
//     setTiles([
//       ...tiles,
//       { ...t, id: crypto.randomUUID(), x: t.x + 10, y: t.y + 10 },
//     ]);

//   const updateTile = (id, patch) =>
//     setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
//   const applyBorderToAll = (patch) =>
//     setTiles((prev) => prev.map((t) => ({ ...t, ...patch })));

//   const selectedTile = tiles.find((t) => t.id === selected) || null;

//   const onMouseDown = (e, t) => {
//     e.stopPropagation();
//     setSelected(t.id);
//     const startX = e.clientX,
//       startY = e.clientY;
//     const orig = { ...t };
//     const move = (ev) => {
//       const dx = ev.clientX - startX,
//         dy = ev.clientY - startY;
//       setTiles((prev) =>
//         prev.map((p) =>
//           p.id === t.id
//             ? {
//                 ...p,
//                 x: Math.max(0, Math.min(pW - p.w, orig.x + dx)),
//                 y: Math.max(0, Math.min(pH - p.h, orig.y + dy)),
//               }
//             : p,
//         ),
//       );
//     };
//     const up = () => {
//       window.removeEventListener("mousemove", move);
//       window.removeEventListener("mouseup", up);
//     };
//     window.addEventListener("mousemove", move);
//     window.addEventListener("mouseup", up);
//   };

//   const onResize = (e, t) => {
//     e.stopPropagation();
//     const startX = e.clientX,
//       startY = e.clientY;
//     const orig = { ...t };
//     const ratio = t.w / t.h;
//     const move = (ev) => {
//       const dx = ev.clientX - startX;
//       const newW = Math.max(30, orig.w + dx);
//       const newH = newW / ratio;
//       setTiles((prev) =>
//         prev.map((p) => (p.id === t.id ? { ...p, w: newW, h: newH } : p)),
//       );
//     };
//     const up = () => {
//       window.removeEventListener("mousemove", move);
//       window.removeEventListener("mouseup", up);
//     };
//     window.addEventListener("mousemove", move);
//     window.addEventListener("mouseup", up);
//   };

//   useEffect(() => {
//     generateLayout();
//   }, [
//     generateLayout
//   ]);

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-4">
//       {/* Left panel */}
//       {/* <aside className="bg-white border border-zinc-200 rounded-md p-4 space-y-4 h-fit">
//         <div>
//           <div className="label-uppercase mb-2">Paper</div>
//           <select value={paper.id} onChange={(e) => setPaper(PAPER_SIZES.find(p => p.id === e.target.value))} className="w-full h-9 px-2 border border-zinc-300 rounded-md text-sm bg-white">
//             {PAPER_SIZES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
//           </select>
//           <div className="text-[10px] font-mono text-zinc-500 mt-1">{paper.w} × {paper.h} mm</div>
//         </div>
//         <div>
//           <div className="label-uppercase mb-2">Copies</div>
//           <div className="flex items-center gap-2">
//             <button onClick={() => setCopies(Math.max(1, copies - 1))} className="w-9 h-9 border border-zinc-300 rounded-md flex items-center justify-center"><Minus size={14} /></button>
//             <input value={copies} onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))} className="flex-1 h-9 text-center border border-zinc-300 rounded-md text-sm" data-testid="copies-input" />
//             <button onClick={() => setCopies(copies + 1)} className="w-9 h-9 border border-zinc-300 rounded-md flex items-center justify-center"><Plus size={14} /></button>
//           </div>
//         </div>
//         <button onClick={autoFill} data-testid="auto-fill-btn" className="w-full h-10 bg-[#0052FF] text-white rounded-md text-sm">Smart Auto Fill</button>
//         <button onClick={addTile} className="w-full h-10 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"><Plus size={14} /> Add photo</button>
//         <button onClick={() => setTiles([])} className="w-full h-10 border border-red-200 text-red-600 rounded-md text-sm flex items-center justify-center gap-2"><Trash size={14} /> Clear canvas</button>
//       </aside> */}
//       <aside className="bg-white border border-zinc-200 rounded-md p-4 space-y-5">
//         {/* Paper */}
//         <div>
//           <div className="label-uppercase mb-2">Paper Size</div>

//           <select
//             value={paper.id}
//             onChange={(e) =>
//               setPaper(PAPER_SIZES.find((p) => p.id === e.target.value))
//             }
//             className="w-full h-10 border rounded-md px-2"
//           >
//             {PAPER_SIZES.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Row */}

//         <div>
//           <div className="label-uppercase mb-2">Photos Per Row</div>

//           <input
//             type="number"
//             min={1}
//             max={10}
//             value={photosPerRow}
//             onChange={(e) => setPhotosPerRow(Number(e.target.value))}
//             className="w-full h-10 border rounded-md text-center"
//           />
//         </div>

//         {/* Total */}

//         <div>
//           <div className="label-uppercase mb-2">Total Photos</div>

//           <input
//             type="number"
//             min={1}
//             max={50}
//             value={totalPhotos}
//             onChange={(e) => setTotalPhotos(Number(e.target.value))}
//             className="w-full h-10 border rounded-md text-center"
//           />
//         </div>

//         {/* Horizontal */}

//         <div>
//           <div className="flex justify-between">
//             <span className="label-uppercase">Horizontal Gap</span>

//             <span>{hGap}px</span>
//           </div>

//           <input
//             type="range"
//             min={0}
//             max={30}
//             value={hGap}
//             onChange={(e) => setHGap(Number(e.target.value))}
//             className="w-full"
//           />
//         </div>

//         {/* Vertical */}

//         <div>
//           <div className="flex justify-between">
//             <span className="label-uppercase">Vertical Gap</span>

//             <span>{vGap}px</span>
//           </div>

//           <input
//             type="range"
//             min={0}
//             max={30}
//             value={vGap}
//             onChange={(e) => setVGap(Number(e.target.value))}
//             className="w-full"
//           />
//         </div>

//         <label className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             checked={autoCenter}
//             onChange={(e) => setAutoCenter(e.target.checked)}
//           />
//           Auto Center
//         </label>
//       </aside>

//       {/* Center canvas */}
//       <div className="canvas-bg rounded-md p-6 min-h-[540px] flex items-center justify-center">
//         <div
//           ref={canvasRef}
//           onClick={() => setSelected(null)}
//           className="paper-sheet relative"
//           style={{ width: pW, height: pH }}
//           data-testid="layout-canvas"
//         >
//           {tiles.map((t) => (
//             <div
//               key={t.id}
//               onMouseDown={(e) => onMouseDown(e, t)}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelected(t.id);
//               }}
//               className={`photo-tile ${selected === t.id ? "selected" : ""}`}
//               style={{
//                 left: t.x,
//                 top: t.y,
//                 width: t.w,
//                 height: t.h,
//                 transform: `rotate(${t.rotation}deg)`,
//                 border:
//                   (t.borderWidth || 0) > 0
//                     ? `${t.borderWidth}px solid ${t.borderColor || "#000"}`
//                     : undefined,
//                 borderRadius: t.borderRadius || 0,
//               }}
//             >
//               <img
//                 src={t.src}
//                 alt=""
//                 draggable={false}
//                 style={{
//                   borderRadius: Math.max(
//                     0,
//                     (t.borderRadius || 0) - (t.borderWidth || 0),
//                   ),
//                 }}
//               />
//               {selected === t.id && (
//                 <>
//                   <div
//                     className="resize-handle"
//                     onMouseDown={(e) => onResize(e, t)}
//                   />
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       duplicateTile(t);
//                     }}
//                     className="absolute top-1 right-8 w-6 h-6 bg-white/95 rounded shadow flex items-center justify-center text-zinc-700"
//                   >
//                     <Copy size={12} />
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       removeTile(t.id);
//                     }}
//                     className="absolute top-1 right-1 w-6 h-6 bg-white/95 rounded shadow flex items-center justify-center text-red-600"
//                   >
//                     <Trash size={12} />
//                   </button>
//                 </>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Right panel */}
//       <aside className="bg-white border border-zinc-200 rounded-md p-4 space-y-4 h-fit">
//         <div>
//           <div className="label-uppercase">Layout stats</div>
//           <div className="mt-2 space-y-2">
//             {/* <StatRow label="Tiles on paper" value={tiles.length} />
//             <StatRow label="Passport size" value={`${size.w}×${size.h}mm`} />
//             <StatRow label="Paper" value={paper.label} />
//             <StatRow label="Total Photos" value={tiles.length} /> */}
//             <StatRow label="Photos Per Row" value={photosPerRow} />

//             <StatRow label="Total Photos" value={tiles.length} />

//             <StatRow label="Horizontal Gap" value={`${hGap}px`} />

//             <StatRow label="Vertical Gap" value={`${vGap}px`} />
//           </div>
//         </div>

//         {/* Border controls */}
//         <div className="pt-4 border-t border-zinc-200">
//           <div className="flex items-center justify-between">
//             <div className="label-uppercase">Photo border</div>
//             <span className="text-[10px] font-mono text-zinc-500">
//               {selectedTile ? "Selected tile" : "Applies to all"}
//             </span>
//           </div>

//           {(() => {
//             const bw = selectedTile
//               ? selectedTile.borderWidth || 0
//               : tiles[0]?.borderWidth || 0;
//             const bc = selectedTile
//               ? selectedTile.borderColor || "#000000"
//               : tiles[0]?.borderColor || "#000000";
//             const br = selectedTile
//               ? selectedTile.borderRadius || 0
//               : tiles[0]?.borderRadius || 0;
//             const setW = (v) =>
//               selectedTile
//                 ? updateTile(selectedTile.id, { borderWidth: v })
//                 : applyBorderToAll({ borderWidth: v });
//             const setC = (v) =>
//               selectedTile
//                 ? updateTile(selectedTile.id, { borderColor: v })
//                 : applyBorderToAll({ borderColor: v });
//             const setR = (v) =>
//               selectedTile
//                 ? updateTile(selectedTile.id, { borderRadius: v })
//                 : applyBorderToAll({ borderRadius: v });

//             return (
//               <div className="mt-3 space-y-3">
//                 <div>
//                   <div className="flex justify-between text-xs mb-1">
//                     <span className="label-uppercase">Width</span>
//                     <span className="font-mono">{bw}px</span>
//                   </div>
//                   <input
//                     data-testid="border-width"
//                     type="range"
//                     min="0"
//                     max="20"
//                     step="1"
//                     value={bw}
//                     onChange={(e) => setW(Number(e.target.value))}
//                     className="w-full"
//                   />
//                 </div>
//                 <div>
//                   <div className="flex justify-between text-xs mb-1">
//                     <span className="label-uppercase">Radius</span>
//                     <span className="font-mono">{br}px</span>
//                   </div>
//                   <input
//                     data-testid="border-radius"
//                     type="range"
//                     min="0"
//                     max="60"
//                     step="1"
//                     value={br}
//                     onChange={(e) => setR(Number(e.target.value))}
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="label-uppercase flex-1">Color</div>
//                   <input
//                     data-testid="border-color"
//                     type="color"
//                     value={bc}
//                     onChange={(e) => setC(e.target.value)}
//                     className="w-10 h-9 rounded border border-zinc-300 bg-white cursor-pointer p-0.5"
//                   />
//                   <div className="font-mono text-[11px] text-zinc-500">
//                     {bc}
//                   </div>
//                 </div>

//                 {/* Presets */}
//                 <div>
//                   <div className="label-uppercase mb-2">Presets</div>
//                   <div className="grid grid-cols-4 gap-1.5">
//                     {[
//                       { label: "None", w: 0, c: "#000", r: 0 },
//                       { label: "Thin", w: 2, c: "#000", r: 0 },
//                       { label: "Bold", w: 6, c: "#000", r: 0 },
//                       { label: "Round", w: 3, c: "#000", r: 24 },
//                       { label: "White", w: 6, c: "#FFF", r: 0 },
//                       { label: "Blue", w: 4, c: "#0052FF", r: 0 },
//                       { label: "Red", w: 4, c: "#DC2626", r: 0 },
//                       { label: "Pill", w: 4, c: "#000", r: 60 },
//                     ].map((p) => (
//                       <button
//                         key={p.label}
//                         onClick={() => {
//                           const patch = {
//                             borderWidth: p.w,
//                             borderColor: p.c,
//                             borderRadius: p.r,
//                           };
//                           selectedTile
//                             ? updateTile(selectedTile.id, patch)
//                             : applyBorderToAll(patch);
//                         }}
//                         className="h-8 border border-zinc-200 rounded text-[10px] uppercase tracking-[0.1em] bg-white hover:border-zinc-400"
//                         data-testid={`border-preset-${p.label.toLowerCase()}`}
//                       >
//                         {p.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {!selectedTile && (
//                   <div className="text-[10px] text-zinc-500 leading-relaxed">
//                     Tip: click a photo on the canvas to edit just that
//                     photo&apos;s border.
//                   </div>
//                 )}
//               </div>
//             );
//           })()}
//         </div>

//         <div className="pt-3 border-t border-zinc-200 text-xs text-zinc-500 leading-relaxed">
//           Drag tiles to reposition · corner handle to resize · click a tile to
//           duplicate / delete.
//         </div>
//       </aside>
//     </div>
//   );
// }

// function StatRow({ label, value }) {
//   return (
//     <div className="flex items-center justify-between text-sm">
//       <span className="text-zinc-500">{label}</span>
//       <span className="font-mono">{value}</span>
//     </div>
//   );
// }

// /* ---------------- Step 8: Billing ---------------- */
// function StepBilling({
//   customers,
//   customerId,
//   setCustomerId,
//   copies,
//   rate,
//   setRate,
//   size,
//   paper,
//   refreshCustomers,
// }) {
//   const [showNew, setShowNew] = useState(false);
//   const [form, setForm] = useState({ name: "", phone: "" });
//   const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

//   const gst = 18;
//   const subtotal = rate;
//   const gstAmt = subtotal * (gst / 100);
//   const total = subtotal + gstAmt;

//   const createCustomer = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await api.post("/customers", { ...form });
//       await refreshCustomers();
//       setCustomerId(data.id);
//       setShowNew(false);
//       toast.success("Customer created");
//     } catch (e) {
//       toast.error(formatApiError(e));
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
//       <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-4">
//         <div className="flex items-center justify-between">
//           <div className="label-uppercase">Customer</div>
//           <button
//             onClick={() => setShowNew(!showNew)}
//             className="text-[#0052FF] text-xs uppercase tracking-[0.2em]"
//           >
//             {showNew ? "Choose existing" : "+ New customer"}
//           </button>
//         </div>
//         {!showNew ? (
//           <select
//             value={customerId}
//             onChange={(e) => setCustomerId(e.target.value)}
//             data-testid="wizard-customer-select"
//             className="w-full h-10 px-3 border border-zinc-300 rounded-md bg-white"
//           >
//             <option value="">— Select customer —</option>
//             {customers.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.name} {c.phone && `(${c.phone})`}
//               </option>
//             ))}
//           </select>
//         ) : (
//           <form onSubmit={createCustomer} className="space-y-2">
//             <input
//               required
//               placeholder="Full name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="w-full h-10 px-3 border border-zinc-300 rounded-md"
//               data-testid="new-cust-name"
//             />
//             <input
//               placeholder="Phone"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               className="w-full h-10 px-3 border border-zinc-300 rounded-md"
//             />
//             <button
//               type="submit"
//               className="h-10 px-4 bg-[#0052FF] text-white rounded-md text-sm"
//             >
//               Save customer
//             </button>
//           </form>
//         )}
//       </div>

//       <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-3">
//         <div className="label-uppercase">Charge</div>
//         <div className="text-sm">
//           {copies} × {size.label}
//         </div>
//         <div className="text-xs text-zinc-500">Printed on {paper.label}</div>
//         <div className="flex items-center gap-2 mt-2">
//           <span className="text-sm">Total charge (₹):</span>
//           <input
//             type="number"
//             min="0"
//             value={rate}
//             onChange={(e) => setRate(Number(e.target.value))}
//             className="w-28 h-9 px-2 border border-zinc-300 rounded-md text-right"
//             data-testid="wizard-rate"
//           />
//         </div>
//         <div className="mt-2 space-y-1 text-sm">
//           <div className="flex justify-between">
//             <span>Subtotal</span>
//             <span className="font-mono">{inr(subtotal)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>GST 18%</span>
//             <span className="font-mono">{inr(gstAmt)}</span>
//           </div>
//           <div className="flex justify-between font-heading text-lg font-semibold border-t border-zinc-200 pt-2">
//             <span>Total</span>
//             <span data-testid="wizard-total">{inr(total)}</span>
//           </div>
//         </div>
//         <div className="text-xs text-zinc-500">
//           Invoice will be generated on next step.
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------------- Step 9: Print & Finalize ---------------- */
// function StepPrint({
//   tiles,
//   paper,
//   size,
//   copies,
//   customerId,
//   customers,
//   afterFinalize,
// }) {
//   const [busy, setBusy] = useState(false);
//   const [invoice, setInvoice] = useState(null);
//   const [order, setOrder] = useState(null);
//   const paperRef = useRef();

//   const exportPdf = async () => {
//     if (!paperRef.current) return;
//     const canvas = await html2canvas(paperRef.current, {
//       scale: 3,
//       backgroundColor: "#ffffff",
//     });
//     const img = canvas.toDataURL("image/jpeg", 0.95);
//     const isLandscape = paper.w > paper.h;
//     const pdf = new jsPDF({
//       orientation: isLandscape ? "l" : "p",
//       unit: "mm",
//       format: paper.id === "a4" ? "a4" : [paper.w, paper.h],
//     });
//     pdf.addImage(img, "JPEG", 0, 0, paper.w, paper.h);
//     pdf.save(`layout-${paper.id}.pdf`);
//     toast.success("PDF exported");
//   };

//   const exportPng = async () => {
//     if (!paperRef.current) return;
//     const canvas = await html2canvas(paperRef.current, {
//       scale: 3,
//       backgroundColor: "#ffffff",
//     });
//     const link = document.createElement("a");
//     link.href = canvas.toDataURL("image/png");
//     link.download = `layout-${paper.id}.png`;
//     link.click();
//   };

//   const finalize = async () => {
//     if (!customerId) {
//       toast.error("Select a customer in step 7");
//       return;
//     }
//     setBusy(true);
//     try {
//       // Order
//       const { data: ord } = await api.post("/orders", {
//         customer_id: customerId,
//         passport_size: size.label,
//         copies: tiles.length,
//         paper_size: paper.label,
//       });
//       setOrder(ord);
//       // Invoice (basic)
//       const { data: inv } = await api.post("/invoices", {
//         customer_id: customerId,
//         items: [
//           {
//             description: `${tiles.length} × ${size.label} on ${paper.label}`,
//             quantity: 1,
//             rate: 150,
//             gst_rate: 18,
//           },
//         ],
//         payment_method: "cash",
//         status: "paid",
//         notes: `Passport photo job (${tiles.length} copies)`,
//       });
//       setInvoice(inv);
//       toast.success("Job finalized — invoice generated");
//     } catch (e) {
//       toast.error(formatApiError(e));
//     }
//     setBusy(false);
//   };

//   const cust = customers.find((c) => c.id === customerId);

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
//       <div className="canvas-bg rounded-md p-6 flex items-center justify-center">
//         <div
//           ref={paperRef}
//           className="paper-sheet relative"
//           style={{ width: paper.w * MM_PX, height: paper.h * MM_PX }}
//         >
//           {tiles.map((t) => (
//             <div
//               key={t.id}
//               style={{
//                 position: "absolute",
//                 left: t.x,
//                 top: t.y,
//                 width: t.w,
//                 height: t.h,
//                 transform: `rotate(${t.rotation}deg)`,
//                 overflow: "hidden",
//                 border:
//                   (t.borderWidth || 0) > 0
//                     ? `${t.borderWidth}px solid ${t.borderColor || "#000"}`
//                     : undefined,
//                 borderRadius: t.borderRadius || 0,
//                 boxSizing: "border-box",
//               }}
//             >
//               <img
//                 src={t.src}
//                 alt=""
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "cover",
//                   borderRadius: Math.max(
//                     0,
//                     (t.borderRadius || 0) - (t.borderWidth || 0),
//                   ),
//                 }}
//               />
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="space-y-3">
//         <div className="bg-white border border-zinc-200 rounded-md p-5">
//           <div className="label-uppercase">Job summary</div>
//           <div className="mt-2 text-sm space-y-1">
//             <div>
//               <span className="text-zinc-500">Customer:</span>{" "}
//               <span className="font-medium">{cust?.name || "—"}</span>
//             </div>
//             <div>
//               <span className="text-zinc-500">Size:</span> {size.label}
//             </div>
//             <div>
//               <span className="text-zinc-500">Paper:</span> {paper.label}
//             </div>
//             <div>
//               <span className="text-zinc-500">Copies:</span> {copies}
//             </div>
//             <div>
//               <span className="text-zinc-500">Tiles placed:</span>{" "}
//               {tiles.length}
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={exportPdf}
//           data-testid="export-pdf"
//           className="w-full h-11 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"
//         >
//           <DownloadSimple size={16} /> Export PDF
//         </button>
//         <button
//           onClick={exportPng}
//           className="w-full h-11 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"
//         >
//           <DownloadSimple size={16} /> Export PNG
//         </button>
//         <button
//           onClick={() => window.print()}
//           className="w-full h-11 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"
//         >
//           <Printer size={16} /> Print
//         </button>

//         {!invoice ? (
//           <button
//             onClick={finalize}
//             disabled={busy}
//             data-testid="finalize-btn"
//             className="w-full h-12 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium"
//           >
//             {busy ? "Finalizing…" : "Finalize & Generate Invoice"}
//           </button>
//         ) : (
//           <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm">
//             <div className="font-medium text-green-800">✓ Invoice created</div>
//             <div className="font-mono text-xs text-green-700 mt-1">
//               {invoice.invoice_no}
//             </div>
//             <button
//               onClick={afterFinalize}
//               className="mt-3 w-full h-10 bg-zinc-900 text-white rounded-md text-sm"
//             >
//               Back to dashboard
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }







import { useEffect, useRef, useState, useCallback,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { PASSPORT_SIZES, PAPER_SIZES } from "@/lib/passportSizes";
import PageHeader from "@/components/PageHeader";
import {
  Upload,
  Crop,
  ImageSquare,
  TShirt,
  GridFour,
  Receipt,
  Printer,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Trash,
  Copy,
  Check,
  DownloadSimple,
  IdentificationCard,
  SlidersHorizontal,
  TextT,
} from "@phosphor-icons/react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Cropper from "react-easy-crop";
import {
  GST_RATES,
  DEFAULT_GST_RATE,
  inr,
  toNonNegNumber,
  computeInvoiceTotals,
} from "@/lib/billing";

const STEPS = [
  { id: 1, name: "Upload", icon: Upload },
  { id: 2, name: "Size", icon: IdentificationCard },
  { id: 3, name: "Crop", icon: Crop },
  { id: 4, name: "Background", icon: ImageSquare },
  { id: 5, name: "Adjust", icon: SlidersHorizontal },
  { id: 6, name: "Text Format", icon: TextT },
  { id: 7, name: "Layout", icon: GridFour },
  { id: 8, name: "Billing", icon: Receipt },
  { id: 9, name: "Print", icon: Printer },
];

// mm → px factor for on-screen paper display
const MM_PX = 3.2;

export default function PassportMaker() {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null); // { src, name }
  const [croppedSrc, setCroppedSrc] = useState(null);
  const [size, setSize] = useState(PASSPORT_SIZES[0]);
  const [bgWhite, setBgWhite] = useState(false);
  const [copies, setCopies] = useState(8);
  const [paper, setPaper] = useState(PAPER_SIZES[0]);
  const [tiles, setTiles] = useState([]); // {id, x, y, w, h, rotation, src}
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [rate, setRate] = useState(0)
  const [gstRate, setGstRate] = useState(DEFAULT_GST_RATE);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/customers").then(({ data }) => setCustomers(data));
  }, []);

  const finalPhotoSrc = croppedSrc || photo?.src;

  // Auto-layout: fill paper with `copies` of finalPhotoSrc
  const autoFill = useCallback(() => {
    if (!finalPhotoSrc) return;
    const pW = paper.w * MM_PX; // paper display px
    const pH = paper.h * MM_PX;
    const w = size.w * MM_PX;
    const h = size.h * MM_PX;
    const gap = 6;
    const cols = Math.max(1, Math.floor((pW + gap) / (w + gap)));
    const rows = Math.max(1, Math.floor((pH + gap) / (h + gap)));
    const max = cols * rows;
    const n = Math.min(copies, max);
    const totalW = cols * w + (cols - 1) * gap;
    const totalH = Math.ceil(n / cols) * h + (Math.ceil(n / cols) - 1) * gap;
    const offX = (pW - totalW) / 2;
    const offY = (pH - totalH) / 2;
    const newTiles = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      newTiles.push({
        id: crypto.randomUUID(),
        x: offX + c * (w + gap),
        y: offY + r * (h + gap),
        w,
        h,
        rotation: 0,
        src: finalPhotoSrc,
        borderWidth: 0,
        borderColor: "#000000",
        borderRadius: 0,
      });
    }
    setTiles(newTiles);
  }, [finalPhotoSrc, paper, size, copies]);

  useEffect(() => {
    if (step === 6 && tiles.length === 0 && finalPhotoSrc) autoFill();
    // eslint-disable-next-line
  }, [step]);

  const canNext = () => {
    if (step === 1) return !!photo;
    if (step === 2) return !!size;
    return true;
  };

  const goto = (s) => {
    if (s > step && !canNext()) {
      toast.error("Complete current step first");
      return;
    }
    setStep(Math.max(1, Math.min(STEPS.length, s)));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Passport Photo Maker"
        title={`Step ${step} — ${STEPS[step - 1].name}`}
        description="Professional passport & ID photos, layout-built on a real paper canvas."
      />
      {/* Stepper */}
      <div className="px-8 py-4 border-b border-zinc-200 bg-white sticky top-[92px] z-10">
        <ol className="flex items-center gap-2 flex-wrap">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => goto(s.id)}
                  data-testid={`step-${s.id}`}
                  className={`h-9 pl-2 pr-3 rounded-full flex items-center gap-2 text-xs uppercase tracking-[0.15em] border transition
                    ${
                      active
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : done
                          ? "bg-[#0052FF]/10 text-[#0052FF] border-[#0052FF]/30"
                          : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                    }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? "bg-white text-zinc-900" : done ? "bg-[#0052FF] text-white" : "bg-zinc-100 text-zinc-500"}`}
                  >
                    {done ? (
                      <Check size={12} weight="bold" />
                    ) : (
                      <Icon size={12} />
                    )}
                  </span>
                  <span>
                    {s.id}. {s.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="p-8 min-h-[500px]">
        {step === 1 && (
          <StepUpload
            photo={photo}
            setPhoto={setPhoto}
            onNext={() => goto(2)}
          />
        )}
        {step === 2 && <StepSize size={size} setSize={setSize} />}
        {step === 3 && (
          <StepCrop
            src={photo?.src}
            size={size}
            croppedSrc={croppedSrc}
            setCroppedSrc={setCroppedSrc}
          />
        )}
        {step === 4 && (
          <StepBackground
            src={finalPhotoSrc}
            bgWhite={bgWhite}
            setBgWhite={setBgWhite}
            setCroppedSrc={setCroppedSrc}
            croppedSrc={croppedSrc}
          />
        )}
        {step === 5 && (
          <StepAdjust src={finalPhotoSrc} setCroppedSrc={setCroppedSrc} />
        )}
        {step === 6 && (
          <TextPanel src={finalPhotoSrc} setCroppedSrc={setCroppedSrc} />
        )}
        {step === 7 && (
          <StepLayout
            paper={paper}
            setPaper={setPaper}
            size={size}
            tiles={tiles}
            setTiles={setTiles}
            finalPhotoSrc={finalPhotoSrc}
          />
          // <StepLayout
          //   paper={paper} setPaper={setPaper}
          //   size={size}
          //   copies={copies} setCopies={setCopies}
          //   tiles={tiles} setTiles={setTiles}
          //   autoFill={autoFill}
          //   finalPhotoSrc={finalPhotoSrc}
          // />
        )}
        {step === 8 && (
          <StepBilling
            customers={customers}
            customerId={customerId}
            setCustomerId={setCustomerId}
            copies={tiles.length}
            rate={rate}
            setRate={setRate}
            gstRate={gstRate}
            setGstRate={setGstRate}
            size={size}
            paper={paper}
            refreshCustomers={() =>
              api.get("/customers").then(({ data }) => setCustomers(data))
            }
          />
        )}
        {step === 9 && (
          <StepPrint
            tiles={tiles}
            paper={paper}
            size={size}
            copies={tiles.length}
            customerId={customerId}
            customers={customers}
            rate={rate}
            gstRate={gstRate}
            afterFinalize={() => nav("/dashboard")}
          />
        )}
      </div>

      {/* Footer nav */}
      <div className="border-t border-zinc-200 bg-white px-8 py-4 flex items-center justify-between sticky bottom-0">
        <button
          onClick={() => goto(step - 1)}
          disabled={step === 1}
          data-testid="wizard-back"
          className="h-10 px-4 border border-zinc-300 rounded-md text-sm flex items-center gap-2 disabled:opacity-40"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="text-xs font-mono text-zinc-500">Step {step} of {STEPS.length}</div>
        {step < STEPS.length ? (
          <button
            onClick={() => goto(step + 1)}
            data-testid="wizard-next"
            className="h-10 px-4 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm flex items-center gap-2"
          >
            Continue <ArrowRight size={14} />
          </button>
        ) : (
          <div style={{ width: 90 }} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Step 1: Upload ---------------- */
function StepUpload({ photo, setPhoto, onNext }) {
  const fileRef = useRef();
  const onPick = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto({ src: reader.result, name: file.name });
    reader.readAsDataURL(file);
  };
  return (
    <div className="max-w-3xl mx-auto">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onPick(e.dataTransfer.files?.[0]);
        }}
        className="block border-2 border-dashed border-zinc-300 rounded-md p-12 text-center bg-white hover:border-[#0052FF] cursor-pointer"
      >
        <Upload size={40} className="mx-auto text-zinc-400" />
        <div className="mt-3 font-heading text-lg">
          Drop a photo here or click to upload
        </div>
        <div className="text-sm text-zinc-500 mt-1">
          JPG / PNG · Recommended front-facing portrait
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
          data-testid="upload-input"
        />
      </label>
      {photo && (
        <div
          className="mt-6 flex items-center gap-4 bg-white border border-zinc-200 rounded-md p-4"
          data-testid="upload-preview"
        >
          <img
            src={photo.src}
            alt="preview"
            className="w-24 h-32 object-cover rounded"
          />
          <div className="flex-1">
            <div className="font-medium">{photo.name}</div>
            <div className="text-xs text-zinc-500 mt-1">
              Ready to proceed. You can crop & align in step 3.
            </div>
          </div>
          <button
            onClick={onNext}
            className="h-10 px-4 bg-[#0052FF] text-white rounded-md text-sm"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step 2: Size ---------------- */
function StepSize({ size, setSize }) {
  return (
    <div className="space-y-4 max-w-5xl">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {PASSPORT_SIZES.map((s) => {
          const active = size.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSize({ ...s })}
              data-testid={`size-${s.id}`}
              className={`p-5 rounded-md border text-left ${active ? "border-[#0052FF] bg-[#0052FF]/5" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
            >
              <div className="label-uppercase">
                {active ? "Selected" : s.custom ? "Custom" : "Passport"}
              </div>
              <div className="mt-2 font-heading font-medium">{s.label}</div>
              <div className="mt-3 flex items-end gap-2">
                <div
                  className={`border rounded-sm ${active ? "border-[#0052FF]" : "border-zinc-300"}`}
                  style={{
                    width: Math.min(s.w, 60) * 1.4,
                    height: Math.min(s.h, 80) * 1.4,
                  }}
                />
                <div className="text-[10px] font-mono text-zinc-500 pb-1">
                  {s.w}×{s.h} mm
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom size editor */}
      {size.custom && (
        <div
          className="bg-white border border-[#0052FF]/40 rounded-md p-5"
          data-testid="custom-size-panel"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-uppercase">Custom size</div>
              <div className="font-heading text-lg mt-1">
                Enter your exact dimensions
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Free-form crop with all edge & corner handles will be enabled in
                Step 3.
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="label-uppercase mb-1">Width (mm)</div>
                <input
                  data-testid="custom-width"
                  type="number"
                  min="10"
                  max="300"
                  step="1"
                  value={size.w}
                  onChange={(e) =>
                    setSize({
                      ...size,
                      w: Math.max(
                        10,
                        Math.min(300, Number(e.target.value) || 10),
                      ),
                    })
                  }
                  className="w-24 h-10 px-3 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
              <div className="text-2xl text-zinc-300 pt-5">×</div>
              <div>
                <div className="label-uppercase mb-1">Height (mm)</div>
                <input
                  data-testid="custom-height"
                  type="number"
                  min="10"
                  max="300"
                  step="1"
                  value={size.h}
                  onChange={(e) =>
                    setSize({
                      ...size,
                      h: Math.max(
                        10,
                        Math.min(300, Number(e.target.value) || 10),
                      ),
                    })
                  }
                  className="w-24 h-10 px-3 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
            </div>
          </div>
          {/* Quick presets */}
          <div className="flex items-center gap-2 pt-3 border-t border-zinc-200">
            <span className="label-uppercase mr-2">Quick set</span>
            {[
              [30, 40],
              [40, 50],
              [45, 60],
              [50, 70],
              [60, 90],
            ].map(([w, h]) => (
              <button
                key={`${w}x${h}`}
                onClick={() => setSize({ ...size, w, h })}
                className="h-8 px-3 border border-zinc-300 rounded-md text-xs font-mono hover:border-[#0052FF]"
                data-testid={`quick-${w}x${h}`}
              >
                {w}×{h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step 3: Photoshop-style Crop ---------------- */
async function getCroppedImg(imageSrc, pixelCrop, rotation, size) {
  // Renders the cropped + rotated area of imageSrc onto a canvas at print-quality resolution.
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const outW = Math.max(600, Math.round((size.w / 25.4) * 600));
  const outH = Math.max(600, Math.round((size.h / 25.4) * 600));

  // 1) Bake rotation onto a full-size canvas
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

  // 2) Crop from rotated canvas
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
  return cropCanvas.toDataURL("image/jpeg", 0.94);
}

function StepCrop({ src, size, croppedSrc, setCroppedSrc }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pixels, setPixels] = useState(null);
  const [busy, setBusy] = useState(false);
  const [freeAspect, setFreeAspect] = useState(!!size.custom);
  const [outW, setOutW] = useState(size.w);
  const [outH, setOutH] = useState(size.h);
  const aspect = freeAspect ? undefined : size.w / size.h;

  // Keep output size synced when size prop changes
  useEffect(() => {
    setOutW(size.w);
    setOutH(size.h);
  }, [size.id, size.w, size.h]);

  const onCropComplete = useCallback((_, area) => setPixels(area), []);

  const doApply = async () => {
    if (!pixels) return;
    setBusy(true);
    try {
      const outSize = freeAspect ? { w: outW, h: outH } : size;
      const out = await getCroppedImg(src, pixels, rotation, outSize);
      setCroppedSrc(out);
      toast.success("Crop applied");
    } catch (e) {
      toast.error("Crop failed");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  if (!src)
    return <div className="text-zinc-500">Upload a photo in Step 1 first.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 max-w-6xl">
      {/* Photoshop-style crop workspace */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200">
          <div className="label-uppercase">Crop workspace</div>
          <div className="flex items-center gap-3">
            <label
              className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer"
              data-testid="free-aspect-toggle"
            >
              <input
                type="checkbox"
                checked={freeAspect}
                onChange={(e) => setFreeAspect(e.target.checked)}
                className="accent-[#0052FF]"
              />
              <span className="uppercase tracking-[0.15em]">
                Free aspect (drag any edge)
              </span>
            </label>
            <div className="text-xs font-mono text-zinc-500">
              {freeAspect ? "Free" : `${size.w}:${size.h} · locked`}
            </div>
          </div>
        </div>
        <div
          className="relative bg-zinc-900 crop-photoshop"
          style={{ height: 480 }}
          data-testid="crop-workspace"
        >
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape="rect"
            showGrid={true}
            restrictPosition={false}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background: "#18181B" },
              cropAreaStyle: {
                border: "2px solid #0052FF",
                color: "rgba(0,0,0,0.55)",
              },
            }}
          />
          {!freeAspect && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="w-24 h-32 rounded-full border border-white/30"
                style={{ marginTop: -20 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="bg-white border border-zinc-200 rounded-md p-5 h-fit space-y-4">
        {freeAspect && (
          <div>
            <div className="label-uppercase mb-2">Output size (mm)</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="300"
                value={outW}
                onChange={(e) =>
                  setOutW(Math.max(10, Number(e.target.value) || 10))
                }
                className="w-full h-9 px-2 border border-zinc-300 rounded-md text-sm"
                data-testid="crop-out-w"
              />
              <span className="text-zinc-400">×</span>
              <input
                type="number"
                min="10"
                max="300"
                value={outH}
                onChange={(e) =>
                  setOutH(Math.max(10, Number(e.target.value) || 10))
                }
                className="w-full h-9 px-2 border border-zinc-300 rounded-md text-sm"
                data-testid="crop-out-h"
              />
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Free-form mode. Output will be scaled to these mm dimensions.
            </div>
          </div>
        )}

        <div>
          <div className="label-uppercase mb-2">
            Preview {freeAspect ? `${outW}×${outH}mm` : `${size.w}×${size.h}mm`}
          </div>
          <div className="flex items-center justify-center">
            <div
              style={{
                width: (freeAspect ? outW : size.w) * 3,
                height: (freeAspect ? outH : size.h) * 3,
              }}
              className="border border-zinc-300 bg-zinc-50 overflow-hidden"
            >
              {croppedSrc ? (
                <img
                  src={croppedSrc}
                  alt="cropped"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-zinc-400 text-center px-2">
                  Apply crop to see preview
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={doApply}
          disabled={busy || !pixels}
          data-testid="crop-apply"
          className="w-full h-11 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm disabled:opacity-50"
        >
          {busy ? "Applying…" : croppedSrc ? "Re-apply crop" : "Apply crop"}
        </button>

        <div className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-200 pt-3">
          {freeAspect
            ? "Drag any corner or edge handle to reshape the crop box freely · scroll to zoom · drag inside to pan."
            : "Aspect is locked to selected size. Toggle Free aspect to drag any edge/corner independently."}
        </div>
        <div className="p-4 border-t border-zinc-200 grid grid-cols-1 md:grid-cols-1 gap-4">
          <RangeRow
            label="Zoom"
            value={zoom}
            min="1"
            max="4"
            step="0.01"
            onChange={setZoom}
            testid="crop-zoom"
          />
          <RangeRow
            label="Rotate"
            value={rotation}
            min="-180"
            max="180"
            step="1"
            onChange={setRotation}
            testid="crop-rotate"
          />
          <div className="flex items-end gap-2">
            <button
              onClick={reset}
              className="h-9 px-3 border border-zinc-300 rounded-md text-xs uppercase tracking-[0.15em] flex-1"
            >
              Reset
            </button>
            <button
              onClick={() => setRotation((r) => r - 90)}
              className="h-9 px-3 border border-zinc-300 rounded-md text-xs uppercase tracking-[0.15em]"
            >
              -90°
            </button>
            <button
              onClick={() => setRotation((r) => r + 90)}
              className="h-9 px-3 border border-zinc-300 rounded-md text-xs uppercase tracking-[0.15em]"
            >
              +90°
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function RangeRow({ label, value, min, max, step, onChange, testid }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="label-uppercase">{label}</span>
        <span className="font-mono">{Number(value).toFixed(2)}</span>
      </div>
      <input
        data-testid={testid}
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

/* ---------------- Step 4: Background ---------------- */
function StepBackground({
  src,
  bgWhite,
  setBgWhite,
  setCroppedSrc,
  croppedSrc,
}) {
  const [busy, setBusy] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");

  if (!src)
    return <div className="text-zinc-500">Complete previous steps first.</div>;

  const overlayWhite = () => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, 0, 0);
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(0, 0, img.width, img.height);
      setCroppedSrc(canvas.toDataURL("image/jpeg", 0.92));
      setBgWhite(true);
      toast.success("Background lightened (offline).");
    };
    img.src = src;
  };

  // const applyInformation=async()=>{

  //   const img=await loadImg(croppedSrc || src);

  //   const lines=[];

  //   if(info.name)
  //     lines.push(info.name);

  //   if(info.template==="namedob"|| info.template==="namedobdop"|| info.template==="custom")
  //     lines.push("DOB : "+info.dob);

  //   if(info.template==="namedobdop")
  //     lines.push("DOP : "+info.dop);

  //   const padding=10;
  //   const lineHeight=info.fontSize+6;

  //   const stripHeight =
  //     Math.max(
  //         80,
  //         padding * 2 + lines.length * lineHeight
  //     );
  //   const canvas=document.createElement("canvas");

  //   canvas.width = img.width;
  //   canvas.height = img.height + stripHeight;

  //   ctx.drawImage(img, 0, 0);

  //   ctx.fillStyle = "#fff";
  //   ctx.fillRect(
  //       0,
  //       img.height,
  //       img.width,
  //       stripHeight
  //   );

  //   ctx.fillStyle = "#000";
  //   ctx.font = `${info.fontSize}px Arial`;
  //   ctx.textAlign = "center";
  //   ctx.textBaseline = "middle";

  //   let y = img.height + stripHeight / 2;

  //   lines.forEach((line, index) => {
  //     ctx.fillText(
  //         line,
  //         img.width / 2,
  //         y + index * lineHeight
  //     );
  //   });

  //   setCroppedSrc(
  //     canvas.toDataURL("image/png")
  //   );
  //   toast.success("Information added.");
  // }

  // const aiCutout = async () => {
  //   setBusy("cutout");
  //   try {
  //     const { data } = await api.post("/ai/bg-remove", { image: src });
  //     // Composite the cutout onto the selected solid bgColor at same resolution
  //     const cut = await loadImg(data.image_url);
  //     const c = document.createElement("canvas"); c.width = cut.width; c.height = cut.height;
  //     const ctx = c.getContext("2d");
  //     ctx.fillStyle = bgColor; ctx.fillRect(0, 0, c.width, c.height);
  //     ctx.drawImage(cut, 0, 0);
  //     setCroppedSrc(c.toDataURL("image/jpeg", 0.94));
  //     setBgWhite(true);
  //     toast.success("AI cutout applied — passport-safe background.");
  //   } catch (e) { toast.error(formatApiError(e)); }
  //   setBusy("");
  // };

  //   const aiCutout = async () => {
  //   setBusy("cutout");

  //   try {
  //     const { data } = await api.post("/ai/bg-remove", {
  //       image: src,
  //     });

  //     // Load returned Base64 image
  //     const cut = await loadImg(data.image);

  //     // Create new canvas
  //     const canvas = document.createElement("canvas");
  //     canvas.width = cut.width;
  //     canvas.height = cut.height;

  //     const ctx = canvas.getContext("2d");

  //     // Fill selected background color
  //     ctx.fillStyle = bgColor;
  //     ctx.fillRect(0, 0, canvas.width, canvas.height);

  //     // Draw transparent cutout
  //     ctx.drawImage(cut, 0, 0);

  //     // Save result
  //     setCroppedSrc(canvas.toDataURL("image/jpeg"));

  //     setBgWhite(true);

  //     toast.success("Background removed successfully.");
  //   } catch (e) {
  //     toast.error(e)
  //     // toast.error(formatApiError(e));
  //   } finally {
  //     setBusy("");
  //   }
  // };

  const aiCutout = async () => {
    setBusy("cutout");

    try {
      const { data } = await api.post("/ai/bg-remove", {
        image: src,
      });

      const cut = await loadImg(data.image);

      const canvas = document.createElement("canvas");
      canvas.width = cut.width;
      canvas.height = cut.height;

      const ctx = canvas.getContext("2d");

      // Better rendering quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill passport background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw transparent PNG
      ctx.drawImage(cut, 0, 0);

      // Keep PNG while editing
      setCroppedSrc(canvas.toDataURL("image/png"));

      setBgWhite(true);

      toast.success("Background removed successfully.");
    } catch (e) {
      console.error(e);
      toast.error(formatApiError(e));
    } finally {
      setBusy("");
    }
  };

  const aiFaceEnhance = async () => {
    setBusy("face");
    try {
      const { data } = await api.post("/ai/face-enhance", {
        image: src,
        fidelity: 0.7,
      });
      const enh = await loadImg(data.image_url);
      const c = document.createElement("canvas");
      c.width = enh.width;
      c.height = enh.height;
      c.getContext("2d").drawImage(enh, 0, 0);
      setCroppedSrc(c.toDataURL("image/jpeg", 0.94));
      toast.success("Face enhanced.");
    } catch (e) {
      toast.error(formatApiError(e));
    }
    setBusy("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      <div className="bg-white border border-zinc-200 rounded-md p-5">
        <img
          src={croppedSrc || src}
          alt="preview"
          className="w-full max-h-[420px] object-contain bg-zinc-50 rounded"
        />
      </div>
      <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-4">
        <div className="label-uppercase">Enhancement</div>

        <div className="space-y-2">
          <div className="border border-zinc-200 rounded-md p-3 space-y-2">
            <button
              onClick={aiCutout}
              disabled={!!busy}
              data-testid="ai-cutout-btn"
              className="w-full h-10 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md text-sm flex items-center justify-between px-4 disabled:opacity-60"
            >
              <span>AI Cutout & Remove BG</span>
              {busy === "cutout" ? (
                <span className="text-[10px]">Processing…</span>
              ) : (
                <span className="text-[10px] uppercase tracking-[0.2em]">
                  fal.ai
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="label-uppercase">BG color</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                data-testid="bg-color"
                className="w-8 h-8 rounded border border-zinc-300 cursor-pointer"
              />
              <span className="font-mono text-zinc-500">{bgColor}</span>
              <div className="ml-auto flex gap-1">
                {["#ffffff", "#f5f5f5", "#e0eaff", "#7dbfff"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBgColor(c)}
                    className="h-5 w-5 rounded border border-zinc-300"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={aiFaceEnhance}
            disabled={true}
            data-testid="ai-face-btn"
            className="w-full h-11 border border-zinc-300 rounded-md text-sm text-left px-4 flex items-center justify-between disabled:opacity-60"
          >
            <span>Face Enhance / Upscale</span>
            <span className="text-[10px] tracking-[0.2em] font-bold text-red-900">
              coming soon
            </span>
          </button>
        </div>

        {bgWhite && (
          <div className="text-xs text-green-600 uppercase tracking-[0.2em]">
            ✓ Background enhanced
          </div>
        )}
      </div>
    </div>
  );
}

function loadImg(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

/* ---------------- Step 5: Ajust brigthness ---------------- */
// function StepDress() {
//   return (
//     <div className="max-w-2xl">
//       <div className="bg-white border border-zinc-200 rounded-md p-8 text-center">
//         <TShirt size={40} className="mx-auto text-zinc-400" />
//         <div className="mt-3 font-heading text-xl">Dress & Accessories</div>
//         <p className="text-sm text-zinc-500 mt-2">Attire overlays, tie/coat presets and gender-based swaps ship in Phase 2.</p>
//         <div className="mt-4 inline-block text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-zinc-100 rounded-full">Skip for now</div>
//       </div>
//     </div>
//   );
// }
function StepAdjust({ src, setCroppedSrc }) {
  const canvasRef = useRef(null);

  const [settings, setSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hue: 0,
  });

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.filter = `
        brightness(${settings.brightness}%)
        contrast(${settings.contrast}%)
        saturate(${settings.saturate}%)
        blur(${settings.blur}px)
        grayscale(${settings.grayscale}%)
        sepia(${settings.sepia}%)
        hue-rotate(${settings.hue}deg)
      `;

      ctx.drawImage(img, 0, 0);
    };

    img.src = src;
  }, [src, settings]);

  const apply = () => {
    setCroppedSrc(canvasRef.current.toDataURL("image/png"));
  };

  const reset = () => {
    setSettings({
      brightness: 100,
      contrast: 100,
      saturate: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hue: 0,
    });
  };

  const Slider = ({ label, keyName, min, max, step = 1 }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span>{settings[keyName]}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={settings[keyName]}
        onChange={(e) =>
          setSettings((s) => ({
            ...s,
            [keyName]: Number(e.target.value),
          }))
        }
        className="w-full"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="max-h-[600px] max-w-full border rounded shadow"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-5 space-y-5">
        <h2 className="font-semibold text-lg">Image Adjustment</h2>

        <Slider label="Brightness" keyName="brightness" min={0} max={200} />

        <Slider label="Contrast" keyName="contrast" min={0} max={200} />

        <Slider label="Saturation" keyName="saturate" min={0} max={200} />

        <Slider label="Blur" keyName="blur" min={0} max={10} />

        <Slider label="Hue" keyName="hue" min={0} max={360} />

        <Slider label="Grayscale" keyName="grayscale" min={0} max={100} />

        <Slider label="Sepia" keyName="sepia" min={0} max={100} />

        <div className="flex gap-3 pt-4">
          <button onClick={reset} className="flex-1 h-11 border rounded-md">
            Reset
          </button>

          <button
            onClick={apply}
            className="flex-1 h-11 bg-[#0052FF] text-white rounded-md"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 6: Text Format ---------------- */
function TextPanel({ src, setCroppedSrc }) {
  const [info, setInfo] = useState({
    enabled: true,
    showName: true,
    showDob: true,
    showDop: false,
    name: "",
    dob: "",
    dop: "",
    fontSize: 22,
    stripHeight: 90,
    bg: "#ffffff",
    color: "#000000",
    font: "Arial",
  });
  const canvasRef = useRef();

  const apply = () => {
    setCroppedSrc(canvasRef.current.toDataURL("image/png"));
    toast.success("Photo text applied");
  };

  const drawCanvas = useCallback(async()=>{
    if (!src || !canvasRef.current) return;

    const img = await loadImg(src);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Build text lines
    const lines = [];

    if (info.enabled && info.name.trim()) lines.push(info.name);

    if (info.enabled && info.showDob && info.dob)
      lines.push(`DOB : ${info.dob}`);

    if (info.enabled && info.showDop && info.dop)
      lines.push(`DOP : ${info.dop}`);

    // Calculate strip height automatically
    const lineHeight = info.fontSize + 8;
    const padding = 18;

    const autoStripHeight =
      lines.length > 0
        ? Math.max(info.stripHeight, lines.length * lineHeight + padding * 2)
        : info.stripHeight;

    canvas.width = img.width;
    canvas.height = img.height + (info.enabled ? autoStripHeight : 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw image
    ctx.drawImage(img, 0, 0);

    if (!info.enabled) return;

    // Draw white strip
    ctx.fillStyle = info.bg;
    ctx.fillRect(0, img.height, canvas.width, autoStripHeight);

    // Draw text
    ctx.fillStyle = info.color;
    ctx.font = `bold ${info.fontSize}px ${info.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let y =
      img.height + autoStripHeight / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line) => {
      ctx.fillText(line, canvas.width / 2, y);
      y += lineHeight;
    });
  },[src, info])

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="grid grid-cols-[1fr_330px] gap-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="max-h-[600px] max-w-full border rounded shadow"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label>
          <input
            type="checkbox"
            checked={info.enabled}
            onChange={(e) =>
              setInfo((p) => ({
                ...p,
                enabled: e.target.checked,
              }))
            }
          />
          Enable
        </label>
        <div>
          <label className="text-xs font-medium text-zinc-500">Full Name</label>

          <input
            value={info.name}
            onChange={(e) =>
              setInfo((p) => ({
                ...p,
                name: e.target.value,
              }))
            }
            placeholder="Full Name"
            className="mt-1 w-full h-10 border rounded-md px-3"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500">
            Date Of Birth
          </label>
          <input
            type="date"
            value={info.dob}
            onChange={(e) =>
              setInfo((p) => ({
                ...p,
                dob: e.target.value,
              }))
            }
            className="mt-1 w-full h-10 border rounded-md px-3"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">
            Date Of Photo
          </label>

          <input
            type="date"
            value={info.dop}
            onChange={(e) =>
              setInfo((p) => ({
                ...p,
                dop: e.target.value,
              }))
            }
            className="mt-1 w-full h-10 border rounded-md px-3"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">
            Font Size ({info.fontSize}px)
          </label>

          <input
            type="range"
            min={12}
            max={40}
            value={info.fontSize}
            onChange={(e) =>
              setInfo((p) => ({
                ...p,
                fontSize: Number(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">
            Strip Height ({info.stripHeight}px)
          </label>

          <input
            type="range"
            min={60}
            max={200}
            value={info.stripHeight}
            onChange={(e) =>
              setInfo((p) => ({
                ...p,
                stripHeight: Number(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <label className="text-sm font-medium text-zinc-500">
              Text Color :-
            </label>

            <input
              type="color"
              value={info.color}
              onChange={(e) =>
                setInfo((p) => ({
                  ...p,
                  color: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center">
            <label className="text-sm  font-medium text-zinc-500">
              Strip Background :-
            </label>

            <input
              type="color"
              value={info.bg}
              onChange={(e) =>
                setInfo((p) => ({
                  ...p,
                  bg: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <button>Apply</button>
        <button
          onClick={apply}
          className="w-full h-11 bg-[#0052FF] text-white rounded-md"
        >
          Apply Photo Text
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step 7: Layout Builder ---------------- */
// function StepLayout({
//   paper,
//   setPaper,
//   size,
//   copies,
//   setCopies,
//   tiles,
//   setTiles,
//   autoFill,
//   finalPhotoSrc,
// }) {
//   const [selected, setSelected] = useState(null);
//   const [photosPerRow, setPhotosPerRow] = useState(4);
//   const [totalPhotos, setTotalPhotos] = useState(8);

//   const [hGap, setHGap] = useState(8);
//   const [vGap, setVGap] = useState(8);

//   const [topMargin, setTopMargin] = useState(10);
//   const [leftMargin, setLeftMargin] = useState(10);

//   const [autoCenter, setAutoCenter] = useState(true);
//   const [autoRotate, setAutoRotate] = useState(false);
//   const canvasRef = useRef();
//   const pW = paper.w * MM_PX;
//   const pH = paper.h * MM_PX;
  

//   // const addTile = () => {
//   //   if (!finalPhotoSrc) return;
//   //   setTiles([...tiles, {
//   //     id: crypto.randomUUID(), x: 20, y: 20,
//   //     w: size.w * MM_PX, h: size.h * MM_PX,
//   //     rotation: 0, src: finalPhotoSrc,
//   //     borderWidth: 0, borderColor: "#000000", borderRadius: 0,
//   //   }]);
//   // };

//   const generateLayout = useCallback(()=> {
//     if (!finalPhotoSrc) return;

//     // const photoW = size.w * MM_PX;
//     // const photoH = size.h * MM_PX;

//     const pW = paper.w * MM_PX;
//     const pH = paper.h * MM_PX;

//     const aspect = size.h / size.w;

//     const usableWidth = pW - 20 - (photosPerRow - 1) * hGap;

//     const photoW = usableWidth / photosPerRow;

//     const photoH = photoW * aspect;

//     const rows = Math.ceil(totalPhotos / photosPerRow);

//     const layoutWidth = photosPerRow * photoW + (photosPerRow - 1) * hGap;

//     const layoutHeight = rows * photoH + (rows - 1) * vGap;

//     const startX = autoCenter ? (pW - layoutWidth) / 2 : 10;

//     const startY = autoCenter ? (pH - layoutHeight) / 2 : 10;

//     const items = [];

//     for (let i = 0; i < totalPhotos; i++) {
//       const row = Math.floor(i / photosPerRow);

//       const col = i % photosPerRow;

//       items.push({
//         id: crypto.randomUUID(),

//         src: finalPhotoSrc,

//         x: startX + col * (photoW + hGap),

//         y: startY + row * (photoH + vGap),

//         w: photoW,

//         h: photoH,

//         rotation: 0,

//         borderWidth: 0,

//         borderRadius: 0,

//         borderColor: "#000",
//       });
//     }

//     setTiles(items);
//   },[paper,
//     size,
//     photosPerRow,
//     totalPhotos,
//     hGap,
//     vGap,
//     autoCenter,
//     finalPhotoSrc, setTiles]);

//   const removeTile = (id) => setTiles(tiles.filter((t) => t.id !== id));
//   const duplicateTile = (t) =>
//     setTiles([
//       ...tiles,
//       { ...t, id: crypto.randomUUID(), x: t.x + 10, y: t.y + 10 },
//     ]);

//   const updateTile = (id, patch) =>
//     setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
//   const applyBorderToAll = (patch) =>
//     setTiles((prev) => prev.map((t) => ({ ...t, ...patch })));

//   const selectedTile = tiles.find((t) => t.id === selected) || null;

//   const onMouseDown = (e, t) => {
//     e.stopPropagation();
//     setSelected(t.id);
//     const startX = e.clientX,
//       startY = e.clientY;
//     const orig = { ...t };
//     const move = (ev) => {
//       const dx = ev.clientX - startX,
//         dy = ev.clientY - startY;
//       setTiles((prev) =>
//         prev.map((p) =>
//           p.id === t.id
//             ? {
//                 ...p,
//                 x: Math.max(0, Math.min(pW - p.w, orig.x + dx)),
//                 y: Math.max(0, Math.min(pH - p.h, orig.y + dy)),
//               }
//             : p,
//         ),
//       );
//     };
//     const up = () => {
//       window.removeEventListener("mousemove", move);
//       window.removeEventListener("mouseup", up);
//     };
//     window.addEventListener("mousemove", move);
//     window.addEventListener("mouseup", up);
//   };

//   const onResize = (e, t) => {
//     e.stopPropagation();
//     const startX = e.clientX,
//       startY = e.clientY;
//     const orig = { ...t };
//     const ratio = t.w / t.h;
//     const move = (ev) => {
//       const dx = ev.clientX - startX;
//       const newW = Math.max(30, orig.w + dx);
//       const newH = newW / ratio;
//       setTiles((prev) =>
//         prev.map((p) => (p.id === t.id ? { ...p, w: newW, h: newH } : p)),
//       );
//     };
//     const up = () => {
//       window.removeEventListener("mousemove", move);
//       window.removeEventListener("mouseup", up);
//     };
//     window.addEventListener("mousemove", move);
//     window.addEventListener("mouseup", up);
//   };

//   useEffect(() => {
//     generateLayout();
//   }, [
//     generateLayout
//   ]);

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-4">
//       {/* Left panel */}
//       {/* <aside className="bg-white border border-zinc-200 rounded-md p-4 space-y-4 h-fit">
//         <div>
//           <div className="label-uppercase mb-2">Paper</div>
//           <select value={paper.id} onChange={(e) => setPaper(PAPER_SIZES.find(p => p.id === e.target.value))} className="w-full h-9 px-2 border border-zinc-300 rounded-md text-sm bg-white">
//             {PAPER_SIZES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
//           </select>
//           <div className="text-[10px] font-mono text-zinc-500 mt-1">{paper.w} × {paper.h} mm</div>
//         </div>
//         <div>
//           <div className="label-uppercase mb-2">Copies</div>
//           <div className="flex items-center gap-2">
//             <button onClick={() => setCopies(Math.max(1, copies - 1))} className="w-9 h-9 border border-zinc-300 rounded-md flex items-center justify-center"><Minus size={14} /></button>
//             <input value={copies} onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))} className="flex-1 h-9 text-center border border-zinc-300 rounded-md text-sm" data-testid="copies-input" />
//             <button onClick={() => setCopies(copies + 1)} className="w-9 h-9 border border-zinc-300 rounded-md flex items-center justify-center"><Plus size={14} /></button>
//           </div>
//         </div>
//         <button onClick={autoFill} data-testid="auto-fill-btn" className="w-full h-10 bg-[#0052FF] text-white rounded-md text-sm">Smart Auto Fill</button>
//         <button onClick={addTile} className="w-full h-10 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"><Plus size={14} /> Add photo</button>
//         <button onClick={() => setTiles([])} className="w-full h-10 border border-red-200 text-red-600 rounded-md text-sm flex items-center justify-center gap-2"><Trash size={14} /> Clear canvas</button>
//       </aside> */}
//       <aside className="bg-white border border-zinc-200 rounded-md p-4 space-y-5">
//         {/* Paper */}
//         <div>
//           <div className="label-uppercase mb-2">Paper Size</div>

//           <select
//             value={paper.id}
//             onChange={(e) =>
//               setPaper(PAPER_SIZES.find((p) => p.id === e.target.value))
//             }
//             className="w-full h-10 border rounded-md px-2"
//           >
//             {PAPER_SIZES.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Row */}

//         <div>
//           <div className="label-uppercase mb-2">Photos Per Row</div>

//           <input
//             type="number"
//             min={1}
//             max={10}
//             value={photosPerRow}
//             onChange={(e) => setPhotosPerRow(Number(e.target.value))}
//             className="w-full h-10 border rounded-md text-center"
//           />
//         </div>

//         {/* Total */}

//         <div>
//           <div className="label-uppercase mb-2">Total Photos</div>

//           <input
//             type="number"
//             min={1}
//             max={50}
//             value={totalPhotos}
//             onChange={(e) => setTotalPhotos(Number(e.target.value))}
//             className="w-full h-10 border rounded-md text-center"
//           />
//         </div>

//         {/* Horizontal */}

//         <div>
//           <div className="flex justify-between">
//             <span className="label-uppercase">Horizontal Gap</span>

//             <span>{hGap}px</span>
//           </div>

//           <input
//             type="range"
//             min={0}
//             max={30}
//             value={hGap}
//             onChange={(e) => setHGap(Number(e.target.value))}
//             className="w-full"
//           />
//         </div>

//         {/* Vertical */}

//         <div>
//           <div className="flex justify-between">
//             <span className="label-uppercase">Vertical Gap</span>

//             <span>{vGap}px</span>
//           </div>

//           <input
//             type="range"
//             min={0}
//             max={30}
//             value={vGap}
//             onChange={(e) => setVGap(Number(e.target.value))}
//             className="w-full"
//           />
//         </div>

//         <label className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             checked={autoCenter}
//             onChange={(e) => setAutoCenter(e.target.checked)}
//           />
//           Auto Center
//         </label>
//       </aside>

//       {/* Center canvas */}
//       <div className="canvas-bg rounded-md p-6 min-h-[540px] flex items-center justify-center">
//         <div
//           ref={canvasRef}
//           onClick={() => setSelected(null)}
//           className="paper-sheet relative"
//           style={{ width: pW, height: pH }}
//           data-testid="layout-canvas"
//         >
//           {tiles.map((t) => (
//             <div
//               key={t.id}
//               onMouseDown={(e) => onMouseDown(e, t)}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelected(t.id);
//               }}
//               className={`photo-tile ${selected === t.id ? "selected" : ""}`}
//               style={{
//                 left: t.x,
//                 top: t.y,
//                 width: t.w,
//                 height: t.h,
//                 transform: `rotate(${t.rotation}deg)`,
//                 border:
//                   (t.borderWidth || 0) > 0
//                     ? `${t.borderWidth}px solid ${t.borderColor || "#000"}`
//                     : undefined,
//                 borderRadius: t.borderRadius || 0,
//               }}
//             >
//               <img
//                 src={t.src}
//                 alt=""
//                 draggable={false}
//                 style={{
//                   borderRadius: Math.max(
//                     0,
//                     (t.borderRadius || 0) - (t.borderWidth || 0),
//                   ),
//                 }}
//               />
//               {selected === t.id && (
//                 <>
//                   <div
//                     className="resize-handle"
//                     onMouseDown={(e) => onResize(e, t)}
//                   />
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       duplicateTile(t);
//                     }}
//                     className="absolute top-1 right-8 w-6 h-6 bg-white/95 rounded shadow flex items-center justify-center text-zinc-700"
//                   >
//                     <Copy size={12} />
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       removeTile(t.id);
//                     }}
//                     className="absolute top-1 right-1 w-6 h-6 bg-white/95 rounded shadow flex items-center justify-center text-red-600"
//                   >
//                     <Trash size={12} />
//                   </button>
//                 </>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Right panel */}
//       <aside className="bg-white border border-zinc-200 rounded-md p-4 space-y-4 h-fit">
//         <div>
//           <div className="label-uppercase">Layout stats</div>
//           <div className="mt-2 space-y-2">
//             {/* <StatRow label="Tiles on paper" value={tiles.length} />
//             <StatRow label="Passport size" value={`${size.w}×${size.h}mm`} />
//             <StatRow label="Paper" value={paper.label} />
//             <StatRow label="Total Photos" value={tiles.length} /> */}
//             <StatRow label="Photos Per Row" value={photosPerRow} />

//             <StatRow label="Total Photos" value={tiles.length} />

//             <StatRow label="Horizontal Gap" value={`${hGap}px`} />

//             <StatRow label="Vertical Gap" value={`${vGap}px`} />
//           </div>
//         </div>

//         {/* Border controls */}
//         <div className="pt-4 border-t border-zinc-200">
//           <div className="flex items-center justify-between">
//             <div className="label-uppercase">Photo border</div>
//             <span className="text-[10px] font-mono text-zinc-500">
//               {selectedTile ? "Selected tile" : "Applies to all"}
//             </span>
//           </div>

//           {(() => {
//             const bw = selectedTile
//               ? selectedTile.borderWidth || 0
//               : tiles[0]?.borderWidth || 0;
//             const bc = selectedTile
//               ? selectedTile.borderColor || "#000000"
//               : tiles[0]?.borderColor || "#000000";
//             const br = selectedTile
//               ? selectedTile.borderRadius || 0
//               : tiles[0]?.borderRadius || 0;
//             const setW = (v) =>
//               selectedTile
//                 ? updateTile(selectedTile.id, { borderWidth: v })
//                 : applyBorderToAll({ borderWidth: v });
//             const setC = (v) =>
//               selectedTile
//                 ? updateTile(selectedTile.id, { borderColor: v })
//                 : applyBorderToAll({ borderColor: v });
//             const setR = (v) =>
//               selectedTile
//                 ? updateTile(selectedTile.id, { borderRadius: v })
//                 : applyBorderToAll({ borderRadius: v });

//             return (
//               <div className="mt-3 space-y-3">
//                 <div>
//                   <div className="flex justify-between text-xs mb-1">
//                     <span className="label-uppercase">Width</span>
//                     <span className="font-mono">{bw}px</span>
//                   </div>
//                   <input
//                     data-testid="border-width"
//                     type="range"
//                     min="0"
//                     max="20"
//                     step="1"
//                     value={bw}
//                     onChange={(e) => setW(Number(e.target.value))}
//                     className="w-full"
//                   />
//                 </div>
//                 <div>
//                   <div className="flex justify-between text-xs mb-1">
//                     <span className="label-uppercase">Radius</span>
//                     <span className="font-mono">{br}px</span>
//                   </div>
//                   <input
//                     data-testid="border-radius"
//                     type="range"
//                     min="0"
//                     max="60"
//                     step="1"
//                     value={br}
//                     onChange={(e) => setR(Number(e.target.value))}
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="label-uppercase flex-1">Color</div>
//                   <input
//                     data-testid="border-color"
//                     type="color"
//                     value={bc}
//                     onChange={(e) => setC(e.target.value)}
//                     className="w-10 h-9 rounded border border-zinc-300 bg-white cursor-pointer p-0.5"
//                   />
//                   <div className="font-mono text-[11px] text-zinc-500">
//                     {bc}
//                   </div>
//                 </div>

//                 {/* Presets */}
//                 <div>
//                   <div className="label-uppercase mb-2">Presets</div>
//                   <div className="grid grid-cols-4 gap-1.5">
//                     {[
//                       { label: "None", w: 0, c: "#000", r: 0 },
//                       { label: "Thin", w: 2, c: "#000", r: 0 },
//                       { label: "Bold", w: 6, c: "#000", r: 0 },
//                       { label: "Round", w: 3, c: "#000", r: 24 },
//                       { label: "White", w: 6, c: "#FFF", r: 0 },
//                       { label: "Blue", w: 4, c: "#0052FF", r: 0 },
//                       { label: "Red", w: 4, c: "#DC2626", r: 0 },
//                       { label: "Pill", w: 4, c: "#000", r: 60 },
//                     ].map((p) => (
//                       <button
//                         key={p.label}
//                         onClick={() => {
//                           const patch = {
//                             borderWidth: p.w,
//                             borderColor: p.c,
//                             borderRadius: p.r,
//                           };
//                           selectedTile
//                             ? updateTile(selectedTile.id, patch)
//                             : applyBorderToAll(patch);
//                         }}
//                         className="h-8 border border-zinc-200 rounded text-[10px] uppercase tracking-[0.1em] bg-white hover:border-zinc-400"
//                         data-testid={`border-preset-${p.label.toLowerCase()}`}
//                       >
//                         {p.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {!selectedTile && (
//                   <div className="text-[10px] text-zinc-500 leading-relaxed">
//                     Tip: click a photo on the canvas to edit just that
//                     photo&apos;s border.
//                   </div>
//                 )}
//               </div>
//             );
//           })()}
//         </div>

//         <div className="pt-3 border-t border-zinc-200 text-xs text-zinc-500 leading-relaxed">
//           Drag tiles to reposition · corner handle to resize · click a tile to
//           duplicate / delete.
//         </div>
//       </aside>
//     </div>
//   );
// }

/* ---------------- Step 7: Layout Builder ---------------- */
function StepLayout({
  paper,
  setPaper,
  size,
  copies,
  setCopies,
  tiles,
  setTiles,
  autoFill,
  finalPhotoSrc,
}) {
  const [selected, setSelected] = useState(null);
  const [photosPerRow, setPhotosPerRow] = useState(4);
  const [totalPhotos, setTotalPhotos] = useState(8);

  const [hGap, setHGap] = useState(8);
  const [vGap, setVGap] = useState(8);

  const [topMargin, setTopMargin] = useState(10);
  const [leftMargin, setLeftMargin] = useState(10);

  const [autoCenter, setAutoCenter] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const canvasRef = useRef();
  const pW = paper.w * MM_PX;
  const pH = paper.h * MM_PX;
  

  // const addTile = () => {
  //   if (!finalPhotoSrc) return;
  //   setTiles([...tiles, {
  //     id: crypto.randomUUID(), x: 20, y: 20,
  //     w: size.w * MM_PX, h: size.h * MM_PX,
  //     rotation: 0, src: finalPhotoSrc,
  //     borderWidth: 0, borderColor: "#000000", borderRadius: 0,
  //   }]);
  // };

  const generateLayout = useCallback(()=> {
    if (!finalPhotoSrc) return;

    // const photoW = size.w * MM_PX;
    // const photoH = size.h * MM_PX;

    const pW = paper.w * MM_PX;
    const pH = paper.h * MM_PX;

    const aspect = size.h / size.w;

    const usableWidth = pW - 20 - (photosPerRow - 1) * hGap;

    const photoW = usableWidth / photosPerRow;

    const photoH = photoW * aspect;

    const rows = Math.ceil(totalPhotos / photosPerRow);

    const layoutWidth = photosPerRow * photoW + (photosPerRow - 1) * hGap;

    const layoutHeight = rows * photoH + (rows - 1) * vGap;

    const startX = autoCenter ? (pW - layoutWidth) / 2 : 10;

    const startY = autoCenter ? (pH - layoutHeight) / 2 : 10;

    const items = [];

    for (let i = 0; i < totalPhotos; i++) {
      const row = Math.floor(i / photosPerRow);

      const col = i % photosPerRow;

      items.push({
        id: crypto.randomUUID(),

        src: finalPhotoSrc,

        x: startX + col * (photoW + hGap),

        y: startY + row * (photoH + vGap),

        w: photoW,

        h: photoH,

        rotation: 0,

        borderWidth: 0,

        borderRadius: 0,

        borderColor: "#000",
      });
    }

    setTiles(items);
  },[paper,
    size,
    photosPerRow,
    totalPhotos,
    hGap,
    vGap,
    autoCenter,
    finalPhotoSrc, setTiles]);

  const removeTile = (id) => setTiles(tiles.filter((t) => t.id !== id));
  const duplicateTile = (t) =>
    setTiles([
      ...tiles,
      { ...t, id: crypto.randomUUID(), x: t.x + 10, y: t.y + 10 },
    ]);

  const updateTile = (id, patch) =>
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const applyBorderToAll = (patch) =>
    setTiles((prev) => prev.map((t) => ({ ...t, ...patch })));

  const selectedTile = tiles.find((t) => t.id === selected) || null;

  const onMouseDown = (e, t) => {
    e.stopPropagation();
    setSelected(t.id);
    const startX = e.clientX,
      startY = e.clientY;
    const orig = { ...t };
    const move = (ev) => {
      const dx = ev.clientX - startX,
        dy = ev.clientY - startY;
      setTiles((prev) =>
        prev.map((p) =>
          p.id === t.id
            ? {
                ...p,
                x: Math.max(0, Math.min(pW - p.w, orig.x + dx)),
                y: Math.max(0, Math.min(pH - p.h, orig.y + dy)),
              }
            : p,
        ),
      );
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onResize = (e, t) => {
    e.stopPropagation();
    const startX = e.clientX,
      startY = e.clientY;
    const orig = { ...t };
    const ratio = t.w / t.h;
    const move = (ev) => {
      const dx = ev.clientX - startX;
      const newW = Math.max(30, orig.w + dx);
      const newH = newW / ratio;
      setTiles((prev) =>
        prev.map((p) => (p.id === t.id ? { ...p, w: newW, h: newH } : p)),
      );
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  useEffect(() => {
    generateLayout();
  }, [
    generateLayout
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-4">
      {/* Left panel */}
      {/* <aside className="bg-white border border-zinc-200 rounded-md p-4 space-y-4 h-fit">
        <div>
          <div className="label-uppercase mb-2">Paper</div>
          <select value={paper.id} onChange={(e) => setPaper(PAPER_SIZES.find(p => p.id === e.target.value))} className="w-full h-9 px-2 border border-zinc-300 rounded-md text-sm bg-white">
            {PAPER_SIZES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">{paper.w} × {paper.h} mm</div>
        </div>
        <div>
          <div className="label-uppercase mb-2">Copies</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCopies(Math.max(1, copies - 1))} className="w-9 h-9 border border-zinc-300 rounded-md flex items-center justify-center"><Minus size={14} /></button>
            <input value={copies} onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))} className="flex-1 h-9 text-center border border-zinc-300 rounded-md text-sm" data-testid="copies-input" />
            <button onClick={() => setCopies(copies + 1)} className="w-9 h-9 border border-zinc-300 rounded-md flex items-center justify-center"><Plus size={14} /></button>
          </div>
        </div>
        <button onClick={autoFill} data-testid="auto-fill-btn" className="w-full h-10 bg-[#0052FF] text-white rounded-md text-sm">Smart Auto Fill</button>
        <button onClick={addTile} className="w-full h-10 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"><Plus size={14} /> Add photo</button>
        <button onClick={() => setTiles([])} className="w-full h-10 border border-red-200 text-red-600 rounded-md text-sm flex items-center justify-center gap-2"><Trash size={14} /> Clear canvas</button>
      </aside> */}
      <aside className="bg-white border border-zinc-200 rounded-md p-4 space-y-5">
        {/* Paper */}
        <div>
          <div className="label-uppercase mb-2">Paper Size</div>

          <select
            value={paper.id}
            onChange={(e) =>
              setPaper(PAPER_SIZES.find((p) => p.id === e.target.value))
            }
            className="w-full h-10 border rounded-md px-2"
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Row */}

        <div>
          <div className="label-uppercase mb-2">Photos Per Row</div>

          <input
            type="number"
            min={1}
            max={10}
            value={photosPerRow}
            onChange={(e) => setPhotosPerRow(Number(e.target.value))}
            className="w-full h-10 border rounded-md text-center"
          />
        </div>

        {/* Total */}

        <div>
          <div className="label-uppercase mb-2">Total Photos</div>

          <input
            type="number"
            min={1}
            max={50}
            value={totalPhotos}
            onChange={(e) => setTotalPhotos(Number(e.target.value))}
            className="w-full h-10 border rounded-md text-center"
          />
        </div>

        {/* Horizontal */}

        <div>
          <div className="flex justify-between">
            <span className="label-uppercase">Horizontal Gap</span>

            <span>{hGap}px</span>
          </div>

          <input
            type="range"
            min={0}
            max={30}
            value={hGap}
            onChange={(e) => setHGap(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Vertical */}

        <div>
          <div className="flex justify-between">
            <span className="label-uppercase">Vertical Gap</span>

            <span>{vGap}px</span>
          </div>

          <input
            type="range"
            min={0}
            max={30}
            value={vGap}
            onChange={(e) => setVGap(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoCenter}
            onChange={(e) => setAutoCenter(e.target.checked)}
          />
          Auto Center
        </label>
      </aside>

      {/* Center canvas */}
      <div className="canvas-bg rounded-md p-6 min-h-[540px] flex items-center justify-center">
        <div
          ref={canvasRef}
          onClick={() => setSelected(null)}
          className="paper-sheet relative"
          style={{ width: pW, height: pH }}
          data-testid="layout-canvas"
        >
          {tiles.map((t) => (
            <div
              key={t.id}
              onMouseDown={(e) => onMouseDown(e, t)}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(t.id);
              }}
              className={`photo-tile ${selected === t.id ? "selected" : ""}`}
              style={{
                left: t.x,
                top: t.y,
                width: t.w,
                height: t.h,
                transform: `rotate(${t.rotation}deg)`,
                border:
                  (t.borderWidth || 0) > 0
                    ? `${t.borderWidth}px solid ${t.borderColor || "#000"}`
                    : undefined,
                borderRadius: t.borderRadius || 0,
              }}
            >
              <img
                src={t.src}
                alt=""
                draggable={false}
                style={{
                  borderRadius: Math.max(
                    0,
                    (t.borderRadius || 0) - (t.borderWidth || 0),
                  ),
                }}
              />
              {selected === t.id && (
                <>
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => onResize(e, t)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateTile(t);
                    }}
                    className="absolute top-1 right-8 w-6 h-6 bg-white/95 rounded shadow flex items-center justify-center text-zinc-700"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTile(t.id);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-white/95 rounded shadow flex items-center justify-center text-red-600"
                  >
                    <Trash size={12} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <aside className="bg-white border border-zinc-200 rounded-md p-4 space-y-4 h-fit">
        <div>
          <div className="label-uppercase">Layout stats</div>
          <div className="mt-2 space-y-2">
            {/* <StatRow label="Tiles on paper" value={tiles.length} />
            <StatRow label="Passport size" value={`${size.w}×${size.h}mm`} />
            <StatRow label="Paper" value={paper.label} />
            <StatRow label="Total Photos" value={tiles.length} /> */}
            <StatRow label="Photos Per Row" value={photosPerRow} />

            <StatRow label="Total Photos" value={tiles.length} />

            <StatRow label="Horizontal Gap" value={`${hGap}px`} />

            <StatRow label="Vertical Gap" value={`${vGap}px`} />
          </div>
        </div>

        {/* Border controls */}
        <div className="pt-4 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <div className="label-uppercase">Photo border</div>
            <span className="text-[10px] font-mono text-zinc-500">
              {selectedTile ? "Selected tile" : "Applies to all"}
            </span>
          </div>

          {(() => {
            const bw = selectedTile
              ? selectedTile.borderWidth || 0
              : tiles[0]?.borderWidth || 0;
            const bc = selectedTile
              ? selectedTile.borderColor || "#000000"
              : tiles[0]?.borderColor || "#000000";
            const br = selectedTile
              ? selectedTile.borderRadius || 0
              : tiles[0]?.borderRadius || 0;
            const setW = (v) =>
              selectedTile
                ? updateTile(selectedTile.id, { borderWidth: v })
                : applyBorderToAll({ borderWidth: v });
            const setC = (v) =>
              selectedTile
                ? updateTile(selectedTile.id, { borderColor: v })
                : applyBorderToAll({ borderColor: v });
            const setR = (v) =>
              selectedTile
                ? updateTile(selectedTile.id, { borderRadius: v })
                : applyBorderToAll({ borderRadius: v });

            return (
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="label-uppercase">Width</span>
                    <span className="font-mono">{bw}px</span>
                  </div>
                  <input
                    data-testid="border-width"
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={bw}
                    onChange={(e) => setW(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="label-uppercase">Radius</span>
                    <span className="font-mono">{br}px</span>
                  </div>
                  <input
                    data-testid="border-radius"
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={br}
                    onChange={(e) => setR(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="label-uppercase flex-1">Color</div>
                  <input
                    data-testid="border-color"
                    type="color"
                    value={bc}
                    onChange={(e) => setC(e.target.value)}
                    className="w-10 h-9 rounded border border-zinc-300 bg-white cursor-pointer p-0.5"
                  />
                  <div className="font-mono text-[11px] text-zinc-500">
                    {bc}
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <div className="label-uppercase mb-2">Presets</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "None", w: 0, c: "#000", r: 0 },
                      { label: "Thin", w: 2, c: "#000", r: 0 },
                      { label: "Bold", w: 6, c: "#000", r: 0 },
                      { label: "Round", w: 3, c: "#000", r: 24 },
                      { label: "White", w: 6, c: "#FFF", r: 0 },
                      { label: "Blue", w: 4, c: "#0052FF", r: 0 },
                      { label: "Red", w: 4, c: "#DC2626", r: 0 },
                      { label: "Pill", w: 4, c: "#000", r: 60 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          const patch = {
                            borderWidth: p.w,
                            borderColor: p.c,
                            borderRadius: p.r,
                          };
                          selectedTile
                            ? updateTile(selectedTile.id, patch)
                            : applyBorderToAll(patch);
                        }}
                        className="h-8 border border-zinc-200 rounded text-[10px] uppercase tracking-[0.1em] bg-white hover:border-zinc-400"
                        data-testid={`border-preset-${p.label.toLowerCase()}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!selectedTile && (
                  <div className="text-[10px] text-zinc-500 leading-relaxed">
                    Tip: click a photo on the canvas to edit just that
                    photo&apos;s border.
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="pt-3 border-t border-zinc-200 text-xs text-zinc-500 leading-relaxed">
          Drag tiles to reposition · corner handle to resize · click a tile to
          duplicate / delete.
        </div>
      </aside>
    </div>
  );
}


function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

/* ---------------- Step 8: Billing ---------------- */
// function StepBilling({
//   customers,
//   customerId,
//   setCustomerId,
//   copies,
//   rate,
//   setRate,
//   size,
//   paper,
//   refreshCustomers,
// }) {
//   const [showNew, setShowNew] = useState(false);
//   const [form, setForm] = useState({ name: "", phone: "" });
//   const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

//   const gst = 18;
//   const subtotal = rate;
//   const gstAmt = subtotal * (gst / 100);
//   const total = subtotal + gstAmt;

//   const createCustomer = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await api.post("/customers", { ...form });
//       await refreshCustomers();
//       setCustomerId(data.id);
//       setShowNew(false);
//       toast.success("Customer created");
//     } catch (e) {
//       toast.error(formatApiError(e));
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
//       <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-4">
//         <div className="flex items-center justify-between">
//           <div className="label-uppercase">Customer</div>
//           <button
//             onClick={() => setShowNew(!showNew)}
//             className="text-[#0052FF] text-xs uppercase tracking-[0.2em]"
//           >
//             {showNew ? "Choose existing" : "+ New customer"}
//           </button>
//         </div>
//         {!showNew ? (
//           <select
//             value={customerId}
//             onChange={(e) => setCustomerId(e.target.value)}
//             data-testid="wizard-customer-select"
//             className="w-full h-10 px-3 border border-zinc-300 rounded-md bg-white"
//           >
//             <option value="">— Select customer —</option>
//             {customers.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.name} {c.phone && `(${c.phone})`}
//               </option>
//             ))}
//           </select>
//         ) : (
//           <form onSubmit={createCustomer} className="space-y-2">
//             <input
//               required
//               placeholder="Full name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="w-full h-10 px-3 border border-zinc-300 rounded-md"
//               data-testid="new-cust-name"
//             />
//             <input
//               placeholder="Phone"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               className="w-full h-10 px-3 border border-zinc-300 rounded-md"
//             />
//             <button
//               type="submit"
//               className="h-10 px-4 bg-[#0052FF] text-white rounded-md text-sm"
//             >
//               Save customer
//             </button>
//           </form>
//         )}
//       </div>

//       <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-3">
//         <div className="label-uppercase">Charge</div>
//         <div className="text-sm">
//           {copies} × {size.label}
//         </div>
//         <div className="text-xs text-zinc-500">Printed on {paper.label}</div>
//         <div className="flex items-center gap-2 mt-2">
//           <span className="text-sm">Total charge (₹):</span>
//           <input
//             type="number"
//             min="0"
//             value={rate}
//             onChange={(e) => setRate(Number(e.target.value))}
//             className="w-28 h-9 px-2 border border-zinc-300 rounded-md text-right"
//             data-testid="wizard-rate"
//           />
//         </div>
//         <div className="mt-2 space-y-1 text-sm">
//           <div className="flex justify-between">
//             <span>Subtotal</span>
//             <span className="font-mono">{inr(subtotal)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>GST 18%</span>
//             <span className="font-mono">{inr(gstAmt)}</span>
//           </div>
//           <div className="flex justify-between font-heading text-lg font-semibold border-t border-zinc-200 pt-2">
//             <span>Total</span>
//             <span data-testid="wizard-total">{inr(total)}</span>
//           </div>
//         </div>
//         <div className="text-xs text-zinc-500">
//           Invoice will be generated on next step.
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useMemo, useCallback } from "react";
// import { api, formatApiError } from "@/lib/api";
// import { toast } from "sonner";



function StepBilling({
  customers,
  customerId,
  setCustomerId,
  copies,
  rate,
  setRate,
  gstRate,
  setGstRate,
  size,
  paper,
  refreshCustomers,
}) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [manualGst, setManualGst] = useState(false); // false = pick from GST_RATES, true = free-typed %

  // One line item: quantity = number of pieces (copies), rate = price PER PIECE.
  // Subtotal is now `copies × rate`, computed automatically — no more typing a flat total.
  const { subtotal, gst, total } = useMemo(
    () => computeInvoiceTotals([{ quantity: copies, rate }], { overrideGstRate: gstRate }),
    [copies, rate, gstRate]
  );

  const createCustomer = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.name.trim()) return toast.error("Name is required");
      setCreatingCustomer(true);
      try {
        const { data } = await api.post("/customers", { ...form });
        await refreshCustomers();
        setCustomerId(data.id);
        setForm({ name: "", phone: "" });
        setShowNew(false);
        toast.success("Customer created");
      } catch (err) {
        toast.error(formatApiError(err));
      } finally {
        setCreatingCustomer(false);
      }
    },
    [form, refreshCustomers, setCustomerId]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      {/* Customer */}
      <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="label-uppercase">Customer</div>
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="text-[#0052FF] text-xs uppercase tracking-[0.2em]"
          >
            {showNew ? "Choose existing" : "+ New customer"}
          </button>
        </div>

        {!showNew ? (
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            data-testid="wizard-customer-select"
            className="w-full h-10 px-3 border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
          >
            <option value="">— Select customer —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone && `(${c.phone})`}
              </option>
            ))}
          </select>
        ) : (
          <form onSubmit={createCustomer} className="space-y-2">
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full h-10 px-3 border border-zinc-300 rounded-md"
              data-testid="new-cust-name"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full h-10 px-3 border border-zinc-300 rounded-md"
            />
            <button
              type="submit"
              disabled={creatingCustomer}
              className="h-10 px-4 bg-[#0052FF] text-white rounded-md text-sm disabled:opacity-60"
            >
              {creatingCustomer ? "Saving…" : "Save customer"}
            </button>
          </form>
        )}
      </div>

      {/* Charge */}
      <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-3">
        <div className="label-uppercase">Charge</div>
        <div className="text-xs text-zinc-500">Printed on {paper.label}</div>

        {/* Pieces is read straight from the layout — not editable here, since it's
            already determined by how many tiles were placed in Step 7. */}
        <div className="flex items-center justify-between rounded-md bg-zinc-50 border border-zinc-200 px-3 py-2">
          <span className="text-sm text-zinc-500">Pieces (from layout)</span>
          <span className="font-mono text-sm" data-testid="wizard-copies">
            {copies} × {size.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm flex-1">Rate per piece (₹)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={rate}
            onChange={(e) => setRate(toNonNegNumber(e.target.value))}
            className="w-28 h-9 px-2 border border-zinc-300 rounded-md text-right"
            data-testid="wizard-rate"
          />
        </div>

        {/* Auto-calculated breakdown so it's clear subtotal = pieces × rate, not typed directly */}
        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>
            {copies} piece{copies === 1 ? "" : "s"} × {inr(rate)}
          </span>
          <span>= {inr(copies * rate)}</span>
        </div>

        {/* GST — manual by default toggle, not silently fixed at 18% */}
        <div className="border-t border-zinc-200 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">GST rate</span>
            <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
              <input
                type="checkbox"
                checked={manualGst}
                onChange={(e) => setManualGst(e.target.checked)}
              />
              Enter manually
            </label>
          </div>

          {manualGst ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={gstRate}
                onChange={(e) =>
                  setGstRate(Math.min(100, toNonNegNumber(e.target.value, DEFAULT_GST_RATE)))
                }
                className="w-20 h-9 px-2 border border-zinc-300 rounded-md text-right"
                data-testid="wizard-gst-manual"
              />
              <span className="text-sm text-zinc-500">%</span>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-1">
              {GST_RATES.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGstRate(g)}
                  aria-pressed={gstRate === g}
                  className={`h-8 rounded-md text-xs border ${
                    gstRate === g
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-300"
                  }`}
                >
                  {g}%
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono">{inr(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST {gstRate}%</span>
            <span className="font-mono">{inr(gst)}</span>
          </div>
          <div className="flex justify-between font-heading text-lg font-semibold border-t border-zinc-200 pt-2">
            <span>Total</span>
            <span data-testid="wizard-total">{inr(total)}</span>
          </div>
        </div>

        <div className="text-xs text-zinc-500">Invoice will be generated on next step.</div>
      </div>
    </div>
  );
}



/* ---------------- Step 9: Print & Finalize ---------------- */
function StepPrint({
  tiles,
  paper,
  size,
  copies,
  customerId,
  customers,
  rate,
  gstRate,
  afterFinalize,
}) {
  const [busy, setBusy] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [order, setOrder] = useState(null);
  const paperRef = useRef();

  const { total } = computeInvoiceTotals(
    [{ quantity: copies, rate }],
    { overrideGstRate: gstRate }
  );

  const exportPdf = async () => {
    if (!paperRef.current) return;
    const canvas = await html2canvas(paperRef.current, {
      scale: 3,
      backgroundColor: "#ffffff",
    });
    const img = canvas.toDataURL("image/jpeg", 0.95);
    const isLandscape = paper.w > paper.h;
    const pdf = new jsPDF({
      orientation: isLandscape ? "l" : "p",
      unit: "mm",
      format: paper.id === "a4" ? "a4" : [paper.w, paper.h],
    });
    pdf.addImage(img, "JPEG", 0, 0, paper.w, paper.h);
    pdf.save(`layout-${paper.id}.pdf`);
    toast.success("PDF exported");
  };

  const exportPng = async () => {
    if (!paperRef.current) return;
    const canvas = await html2canvas(paperRef.current, {
      scale: 3,
      backgroundColor: "#ffffff",
    });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `layout-${paper.id}.png`;
    link.click();
  };

  const finalize = async () => {
    if (!customerId) {
      toast.error("Select a customer in step 7");
      return;
    }
    setBusy(true);
    try {
      // Order
      const { data: ord } = await api.post("/orders", {
        customer_id: customerId,
        passport_size: size.label,
        copies: tiles.length,
        paper_size: paper.label,
      });
      setOrder(ord);
      // Invoice (basic)
      const { data: inv } = await api.post("/invoices", {
        customer_id: customerId,
        items: [
          {
            description: `${tiles.length} × ${size.label} on ${paper.label}`,
            quantity: 1,
            rate: total,
            gst_rate: gstRate,
          },
        ],
        payment_method: "cash",
        status: "paid",
        notes: `Passport photo job (${tiles.length} copies)`,
      });
      setInvoice(inv);
      toast.success("Job finalized — invoice generated");
    } catch (e) {
      toast.error(formatApiError(e));
    }
    setBusy(false);
  };

  const cust = customers.find((c) => c.id === customerId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="canvas-bg rounded-md p-6 flex items-center justify-center">
        <div
          ref={paperRef}
          className="paper-sheet relative"
          style={{ width: paper.w * MM_PX, height: paper.h * MM_PX }}
        >
          {tiles.map((t) => (
            <div
              key={t.id}
              style={{
                position: "absolute",
                left: t.x,
                top: t.y,
                width: t.w,
                height: t.h,
                transform: `rotate(${t.rotation}deg)`,
                overflow: "hidden",
                border:
                  (t.borderWidth || 0) > 0
                    ? `${t.borderWidth}px solid ${t.borderColor || "#000"}`
                    : undefined,
                borderRadius: t.borderRadius || 0,
                boxSizing: "border-box",
              }}
            >
              <img
                src={t.src}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: Math.max(
                    0,
                    (t.borderRadius || 0) - (t.borderWidth || 0),
                  ),
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-white border border-zinc-200 rounded-md p-5">
          <div className="label-uppercase">Job summary</div>
          <div className="mt-2 text-sm space-y-1">
            <div>
              <span className="text-zinc-500">Customer:</span>{" "}
              <span className="font-medium">{cust?.name || "—"}</span>
            </div>
            <div>
              <span className="text-zinc-500">Size:</span> {size.label}
            </div>
            <div>
              <span className="text-zinc-500">Paper:</span> {paper.label}
            </div>
            <div>
              <span className="text-zinc-500">Copies:</span> {copies}
            </div>
            <div>
              <span className="text-zinc-500">Tiles placed:</span>{" "}
              {tiles.length}
            </div>
          </div>
        </div>

        <button
          onClick={exportPdf}
          data-testid="export-pdf"
          className="w-full h-11 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"
        >
          <DownloadSimple size={16} /> Export PDF
        </button>
        <button
          onClick={exportPng}
          className="w-full h-11 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"
        >
          <DownloadSimple size={16} /> Export PNG
        </button>
        <button
          onClick={() => window.print()}
          className="w-full h-11 border border-zinc-300 rounded-md text-sm flex items-center justify-center gap-2"
        >
          <Printer size={16} /> Print
        </button>

        {!invoice ? (
          <button
            onClick={finalize}
            disabled={busy}
            data-testid="finalize-btn"
            className="w-full h-12 bg-[#0052FF] hover:bg-[#0040CC] text-white rounded-md font-medium"
          >
            {busy ? "Finalizing…" : "Finalize & Generate Invoice"}
          </button>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm">
            <div className="font-medium text-green-800">✓ Invoice created</div>
            <div className="font-mono text-xs text-green-700 mt-1">
              {invoice.invoice_no}
            </div>
            <button
              onClick={afterFinalize}
              className="mt-3 w-full h-10 bg-zinc-900 text-white rounded-md text-sm"
            >
              Back to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}