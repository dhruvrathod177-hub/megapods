import { useState, useEffect, useRef } from "react";
import { Calculator, Download, Save, CheckCircle, RefreshCw, Pencil, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
interface Heading3DProps { children: React.ReactNode; className?: string; tag?: HTMLTag; }

function Heading3D({ children, className = '', tag: Tag = 'h2' }: Heading3DProps) {
  const ref = useRef<HTMLElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const rotateX = (((e.clientY - rect.top) - rect.height / 2) / (rect.height / 2)) * -8;
    const rotateY = (((e.clientX - rect.left) - rect.width / 2) / (rect.width / 2)) * 10;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    el.style.textShadow = `${-rotateY * 0.5}px ${rotateX * 0.5}px 16px rgba(234,88,12,0.18)`;
  };
  const handleMouseLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.textShadow = 'none';
  };
  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={`heading-3d ${className}`}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{children}</Tag>
  );
}

interface AddonOption { name: string; price: number; }
interface PricingConfig {
  materials: string[]; sizes: string[]; addons: AddonOption[];
  taxRate: number; materialSurcharges: Record<string, number>; basePrices: Record<string, number>;
}
interface QuoteResult {
  materialType: string; containerSize: string; quantity: number; unitPrice: number;
  addonBreakdown: AddonOption[]; addonTotal: number; subtotal: number;
  taxRate: number; taxAmount: number; total: number;
}
export interface SavedQuote {
  _id: string; quoteNumber: string; materialType: string; containerSize: string;
  quantity: number; unitPrice: number; subtotal: number; taxAmount: number; total: number;
  addons: { name: string; price: number }[]; createdAt: string;
  containerSizeNote?: string; materialTypeNote?: string; addonsNote?: string;
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface QuotationPageProps { editQuote?: SavedQuote | null; onEditSaved?: () => void; }

export default function QuotationPage({ editQuote, onEditSaved }: QuotationPageProps) {
  const { token, user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const isEditMode = !!editQuote;

  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoteNumber] = useState(editQuote?.quoteNumber ?? `MPI-${Date.now()}`);
  const [quoteDate] = useState(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));

  const [form, setForm] = useState({
    materialType: editQuote?.materialType ?? "Standard Steel",
    containerSize: editQuote?.containerSize ?? "",
    quantity: editQuote?.quantity ?? 1,
    selectedAddons: editQuote?.addons?.map((a) => a.name) ?? [] as string[],
    containerSizeNote: editQuote?.containerSizeNote ?? "",
    materialTypeNote: editQuote?.materialTypeNote ?? "",
    addonsNote: editQuote?.addonsNote ?? "",
  });

  useEffect(() => {
    apiFetch("/quotations/config", {}, token)
      .then(setConfig)
      .catch(() => setError("Failed to load pricing config. Check if backend is running."));
  }, [token]);

  useEffect(() => {
    if (isEditMode && config && form.containerSize) handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const toggleAddon = (name: string) => {
    setForm((prev) => ({
      ...prev,
      selectedAddons: prev.selectedAddons.includes(name)
        ? prev.selectedAddons.filter((a) => a !== name)
        : [...prev.selectedAddons, name],
    }));
  };

  const handleCalculate = async () => {
    if (!form.containerSize) { setError("Please select a container size"); return; }
    setError(""); setLoading(true); setSaved(false);
    try {
      const data = await apiFetch("/quotations/calculate", { method: "POST", body: JSON.stringify(form) }, token);
      setQuote(data);
      setTimeout(() => document.getElementById("quote-result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      if (isEditMode && editQuote) {
        await apiFetch(`/quotations/${editQuote._id}`, { method: "PUT", body: JSON.stringify(form) }, token);
        setSaved(true); onEditSaved?.();
      } else {
        await apiFetch("/quotations/save", { method: "POST", body: JSON.stringify(form) }, token);
        setSaved(true);
      }
    } catch (err: any) { setError(err.message); }
    finally { setSaveLoading(false); }
  };

  const getLogoBase64 = async (): Promise<string> => {
    try {
      const response = await fetch("/img/logo1.JPG");
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch { return ""; }
  };

  const buildBillHTML = async (): Promise<string> => {
    if (!quote) return "";
    const logoBase64 = await getLogoBase64();
    const logoHTML = logoBase64
      ? `<img src="${logoBase64}" alt="Logo" style="height:52px;width:52px;border-radius:50%;object-fit:contain;background:#fff;padding:4px;margin-right:14px;flex-shrink:0;"/>`
      : "";
    const addonRows = quote.addonBreakdown.map((a) => `
      <tr><td class="desc">${a.name}<br/><span class="sub">Add-on</span></td>
      <td class="center">1</td><td class="right">${formatINR(a.price)}</td>
      <td class="right">${formatINR(a.price)}</td></tr>`).join("");
    const noteRows = [
      form.containerSizeNote && `<div class="note-block"><p class="note-label">Container Size</p><p class="note-text">${form.containerSizeNote}</p></div>`,
      form.materialTypeNote && `<div class="note-block"><p class="note-label">Material Type</p><p class="note-text">${form.materialTypeNote}</p></div>`,
      form.addonsNote && `<div class="note-block"><p class="note-label">Additional Options</p><p class="note-text">${form.addonsNote}</p></div>`,
    ].filter(Boolean).join("");
    const displayMaterial = form.materialTypeNote || quote.materialType;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${quoteNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;display:flex;justify-content:center;padding:40px 16px;}.page{background:#fff;width:100%;max-width:720px;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.13);}.header{background:linear-gradient(135deg,#ea580c,#c2410c);color:#fff;padding:36px 40px 28px;}.header-top{display:flex;justify-content:space-between;align-items:flex-start;}.brand{display:flex;align-items:center;}.brand-name{font-size:22px;font-weight:700;}.brand-loc{font-size:12px;color:#fed7aa;margin-top:2px;}.quote-label{text-align:right;flex-shrink:0;}.quote-label .title{font-size:28px;font-weight:800;letter-spacing:2px;}.quote-label .num{font-size:13px;color:#fed7aa;margin-top:4px;}.quote-label .date{font-size:13px;color:#fed7aa;}.divider{border:none;border-top:1px solid rgba(255,255,255,0.25);margin:20px 0 16px;}.prepared{font-size:12px;color:#fed7aa;margin-bottom:4px;}.client-name{font-size:16px;font-weight:700;}.client-email{font-size:13px;color:#fed7aa;}.body{padding:36px 40px;}table{width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;}thead tr{border-bottom:2px solid #e5e7eb;}thead th{padding:10px 8px;color:#6b7280;font-weight:600;text-align:left;}thead th.right{text-align:right;}thead th.center{text-align:center;}tbody tr{border-bottom:1px solid #f3f4f6;}tbody td{padding:12px 8px;color:#111827;vertical-align:top;}td.desc{font-weight:600;}.sub{font-size:12px;color:#9ca3af;font-weight:400;}td.center{text-align:center;}td.right{text-align:right;}td.right.bold{font-weight:700;}.totals{border-top:1px solid #e5e7eb;padding-top:16px;margin-top:8px;}.total-row{display:flex;justify-content:space-between;font-size:14px;color:#4b5563;padding:4px 0;}.total-final{display:flex;justify-content:space-between;font-size:20px;font-weight:800;color:#111827;border-top:2px solid #111827;margin-top:10px;padding-top:12px;}.total-final .amount{color:#ea580c;}.notes-box{background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-top:28px;}.notes-title{font-size:11px;font-weight:700;color:#ea580c;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;}.note-block{margin-bottom:12px;}.note-label{font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;}.note-text{font-size:13px;color:#374151;line-height:1.5;}.footer{font-size:11px;color:#9ca3af;font-style:italic;margin-top:28px;line-height:1.6;}.strip{background:#fff7ed;border-top:1px solid #fed7aa;padding:14px 40px;display:flex;justify-content:space-between;font-size:12px;color:#9ca3af;}.strip strong{color:#ea580c;}</style></head>
<body><div class="page"><div class="header"><div class="header-top"><div class="brand">${logoHTML}<div><div class="brand-name">Megapodsindia</div><div class="brand-loc">Surat, Gujarat, India</div></div></div><div class="quote-label"><div class="title">QUOTATION</div><div class="num">#${quoteNumber}</div><div class="date">${quoteDate}</div></div></div><hr class="divider"/><div class="prepared">Prepared for:</div><div class="client-name">${user?.fullName ?? ""}</div><div class="client-email">${user?.email ?? ""}</div></div><div class="body"><table><thead><tr><th>Description</th><th class="center">Qty</th><th class="right">Unit Price</th><th class="right">Amount</th></tr></thead><tbody><tr><td class="desc">${quote.containerSize} Container<br/><span class="sub">Material: ${displayMaterial}</span></td><td class="center">${quote.quantity}</td><td class="right">${formatINR(quote.unitPrice)}</td><td class="right bold">${formatINR(quote.unitPrice * quote.quantity)}</td></tr>${addonRows}</tbody></table><div class="totals"><div class="total-row"><span>Subtotal</span><span>${formatINR(quote.subtotal)}</span></div><div class="total-row"><span>GST (${(quote.taxRate * 100).toFixed(0)}%)</span><span>${formatINR(quote.taxAmount)}</span></div><div class="total-final"><span>TOTAL</span><span class="amount">${formatINR(quote.total)}</span></div></div>${noteRows ? `<div class="notes-box"><div class="notes-title">Customer Requirements &amp; Notes</div>${noteRows}</div>` : ""}<p class="footer">* This is an indicative quotation. Final pricing may vary based on site conditions, customizations, and delivery location. Valid for 30 days from the date of issue.</p></div><div class="strip"><span>Generated by <strong>Megapodsindia</strong> Quotation System</span><span>${quoteDate}</span></div></div></body></html>`;
  };

  const handleDownloadPDF = async () => {
    const html = await buildBillHTML(); if (!html) return;
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;top:-99999px;left:-99999px;width:720px;background:#f3f4f6;padding:40px 16px;";
    container.innerHTML = html; document.body.appendChild(container);
    const pageEl = container.querySelector(".page") as HTMLElement | null;
    await new Promise((r) => setTimeout(r, 300));
    const canvas = await html2canvas(pageEl ?? container, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    document.body.removeChild(container);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${quoteNumber}.pdf`);
  };

  const handleReset = () => {
    setForm({ materialType: "Standard Steel", containerSize: "", quantity: 1, selectedAddons: [], containerSizeNote: "", materialTypeNote: "", addonsNote: "" });
    setQuote(null); setSaved(false); setError("");
  };

  const textareaClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm text-gray-700 placeholder-gray-400 bg-white transition-all duration-200 hover:border-gray-300 resize-none mt-3";

  return (
    <div className="min-h-screen bg-[#f8f8f6]">

      {/* ── HERO ── */}
      <section className="no-print relative overflow-hidden bg-white border-b border-gray-100 pt-28 sm:pt-32">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #ea580c 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
              {isEditMode ? <Pencil size={22} className="text-white" /> : <Calculator size={22} className="text-white" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-0.5">
                {isEditMode ? `Editing · ${editQuote.quoteNumber}` : 'Instant Pricing'}
              </p>
              <Heading3D tag="h1" className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {isEditMode ? 'Update Your Quote' : 'Quotation Generator'}
              </Heading3D>
            </div>
          </div>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            {isEditMode
              ? 'Adjust the configuration below and save your changes to update the quote.'
              : "Get an instant price estimate for your container solution — customized to your specifications. Fill in the form and we'll calculate your project cost in seconds."}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5">
            {['Transparent Pricing', 'No Hidden Charges', 'Valid 30 Days', 'GST Inclusive'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block flex-shrink-0" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">

          {/* ── FORM CARD ── */}
          <div className="no-print">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Card title bar */}
              <div className="px-6 sm:px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                    {isEditMode ? 'Update Configuration' : 'Configure Your Container'}
                  </h2>
                </div>
                {config && (
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {config.sizes.length} sizes · {config.addons.length} add-ons
                  </span>
                )}
              </div>

              <div className="px-6 sm:px-8 py-6 sm:py-8">
                {error && (
                  <div className="mb-6 flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" /><span>{error}</span>
                  </div>
                )}

                {!config ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RefreshCw className="animate-spin text-orange-400" size={26} />
                    <p className="text-gray-400 text-sm">Loading pricing data…</p>
                  </div>
                ) : (
                  <div className="space-y-7">

                    {/* ── Container Size ── */}
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <label className="text-sm font-semibold text-gray-800">
                          Container Size <span className="text-orange-500">*</span>
                        </label>
                        {form.containerSize && (
                          <span className="text-xs text-orange-600 font-semibold">
                            Base: {formatINR(config.basePrices[form.containerSize] ?? 0)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Select the standard footprint that fits your project</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {config.sizes.map((size) => {
                          const isSel = form.containerSize === size;
                          return (
                            <button
                              key={size}
                              onClick={() => setForm((p) => ({ ...p, containerSize: size }))}
                              className={`relative p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                                isSel
                                  ? "border-orange-500 bg-orange-50 shadow-sm"
                                  : "border-gray-150 hover:border-orange-300 hover:bg-orange-50/30 bg-gray-50/50"
                              }`}
                            >
                              {isSel && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </span>
                              )}
                              <div className={`text-sm font-bold ${isSel ? 'text-orange-700' : 'text-gray-800'}`}>{size}</div>
                              <div className="text-xs text-gray-400 mt-0.5 font-normal tabular-nums">{formatINR(config.basePrices[size])}</div>
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        value={form.containerSizeNote}
                        onChange={(e) => setForm((p) => ({ ...p, containerSizeNote: e.target.value }))}
                        placeholder="Custom size requirements? e.g. extra ventilation, modified door placement, non-standard dimensions…"
                        rows={2}
                        className={textareaClass}
                      />
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* ── Material Type ── */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">Material Type</label>
                      <p className="text-xs text-gray-400 mb-3">Describe your preferred material or leave blank for standard steel</p>
                      <textarea
                        value={form.materialTypeNote}
                        onChange={(e) => setForm((p) => ({ ...p, materialTypeNote: e.target.value }))}
                        placeholder="e.g. Standard Steel, Corten Steel, Anti-rust coating, thicker gauge, specific finish…"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm text-gray-700 placeholder-gray-400 bg-white transition-all duration-200 hover:border-gray-300 resize-none"
                      />
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* ── Quantity ── */}
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <label className="text-sm font-semibold text-gray-800">Quantity</label>
                        <span className="text-xl font-extrabold text-orange-600 tabular-nums leading-none">{form.quantity}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Number of container units required (1–20)</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setForm((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                          className="w-9 h-9 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center text-lg flex-shrink-0"
                        >−</button>
                        <div className="flex-1">
                          <input
                            type="range" min={1} max={20} value={form.quantity}
                            onChange={(e) => setForm((p) => ({ ...p, quantity: +e.target.value }))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, #f97316 ${((form.quantity - 1) / 19) * 100}%, #e5e7eb ${((form.quantity - 1) / 19) * 100}%)` }}
                          />
                        </div>
                        <button
                          onClick={() => setForm((p) => ({ ...p, quantity: Math.min(20, p.quantity + 1) }))}
                          className="w-9 h-9 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center text-lg flex-shrink-0"
                        >+</button>
                      </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* ── Add-ons ── */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">Additional Options</label>
                      <p className="text-xs text-gray-400 mb-3">Select any upgrades or add-ons for your container build</p>
                      <div className="space-y-2">
                        {config.addons.map((addon) => {
                          const isSel = form.selectedAddons.includes(addon.name);
                          return (
                            <label
                              key={addon.name}
                              className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                isSel ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-orange-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSel ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white'}`}>
                                  {isSel && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  )}
                                </div>
                                <span className={`text-sm font-medium ${isSel ? 'text-orange-800' : 'text-gray-700'}`}>{addon.name}</span>
                              </div>
                              <span className={`text-sm font-bold tabular-nums ${isSel ? 'text-orange-600' : 'text-gray-400'}`}>
                                +{formatINR(addon.price)}
                              </span>
                              <input type="checkbox" checked={isSel} onChange={() => toggleAddon(addon.name)} className="sr-only" />
                            </label>
                          );
                        })}
                      </div>
                      <textarea
                        value={form.addonsNote}
                        onChange={(e) => setForm((p) => ({ ...p, addonsNote: e.target.value }))}
                        placeholder="Need something not listed? e.g. custom lighting, specific AC brand, extra shelving, partition walls…"
                        rows={2}
                        className={textareaClass}
                      />
                    </div>

                    {/* ── CTA ── */}
                    <div className="flex gap-2.5 pt-1">
                      <button
                        onClick={handleCalculate}
                        disabled={loading}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-md shadow-orange-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                      >
                        {loading ? <RefreshCw size={15} className="animate-spin" /> : <Calculator size={15} />}
                        {loading ? "Calculating…" : isEditMode ? "Recalculate" : form.materialTypeNote ? "Request Custom Quote" : "Generate Quote"}
                      </button>
                      <button
                        onClick={handleReset}
                        title="Reset form"
                        className="px-4 py-3.5 rounded-xl border-2 border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200"
                      >
                        <RefreshCw size={15} />
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RESULT PANEL ── */}
          <div id="quote-result" className="lg:static lg:top-6">
            {!quote ? (
              <div className="no-print bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-20 h-20 rounded-2xl bg-orange-50 border-2 border-dashed border-orange-200 flex items-center justify-center mb-5">
                  <Calculator size={34} className="text-orange-300" />
                </div>
                <h3 className="text-base font-bold text-gray-300 mb-2">Your quote will appear here</h3>
                <p className="text-gray-400 text-sm max-w-[220px] leading-relaxed">
                  Configure your container and click "{isEditMode ? 'Recalculate' : 'Generate Quote'}" to see your instant estimate.
                </p>
              </div>
            ) : (
              <div ref={printRef} id="print-area" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Quote header */}
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-5 sm:p-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src="/img/logo1.JPG" alt="Logo" className="h-10 w-10 rounded-full object-contain bg-white p-1 flex-shrink-0 shadow-md" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-base leading-tight">Megapodsindia</h3>
                        <p className="text-orange-200 text-xs">Surat, Gujarat, India</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-extrabold tracking-widest">QUOTATION</div>
                      <div className="text-orange-200 text-xs mt-0.5 font-mono">#{quoteNumber}</div>
                      <div className="text-orange-200 text-xs">{quoteDate}</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-orange-200 text-xs mb-0.5">Prepared for</p>
                      <p className="font-semibold text-sm leading-tight">{user?.fullName}</p>
                      <p className="text-orange-200 text-xs">{user?.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-orange-200 text-xs mb-0.5">Valid</p>
                      <p className="text-sm font-bold">30 days</p>
                    </div>
                  </div>
                </div>

                {/* Line items */}
                <div className="px-5 sm:px-6 pt-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left pb-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Description</th>
                        <th className="text-center pb-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide w-10">Qty</th>
                        <th className="text-right pb-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Unit Price</th>
                        <th className="text-right pb-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="py-3.5">
                          <div className="font-semibold text-gray-900 text-sm">{quote.containerSize} Container</div>
                          <div className="text-gray-400 text-xs mt-0.5">{form.materialTypeNote || quote.materialType}</div>
                        </td>
                        <td className="py-3.5 text-center text-gray-600 font-medium">{quote.quantity}</td>
                        <td className="py-3.5 text-right text-gray-500 text-xs hidden sm:table-cell">{formatINR(quote.unitPrice)}</td>
                        <td className="py-3.5 text-right font-bold text-gray-900 tabular-nums">{formatINR(quote.unitPrice * quote.quantity)}</td>
                      </tr>
                      {quote.addonBreakdown.map((addon) => (
                        <tr key={addon.name}>
                          <td className="py-3">
                            <div className="text-gray-700 font-medium text-sm">{addon.name}</div>
                            <div className="text-gray-400 text-xs">Add-on</div>
                          </td>
                          <td className="py-3 text-center text-gray-500 text-sm">1</td>
                          <td className="py-3 text-right text-gray-400 text-xs hidden sm:table-cell">{formatINR(addon.price)}</td>
                          <td className="py-3 text-right text-gray-700 font-medium tabular-nums">{formatINR(addon.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals box */}
                <div className="mx-5 sm:mx-6 mb-5 mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-medium tabular-nums">{formatINR(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>GST ({(quote.taxRate * 100).toFixed(0)}%)</span>
                    <span className="font-medium tabular-nums">{formatINR(quote.taxAmount)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="font-extrabold text-orange-600 text-xl tabular-nums">{formatINR(quote.total)}</span>
                  </div>
                </div>

                {/* Custom material warning */}
                {form.materialTypeNote && (
                  <div className="mx-5 sm:mx-6 mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-700">Custom material requested</p>
                      <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">Base estimate only. Our team will contact you with the final price within 24 hours.</p>
                    </div>
                  </div>
                )}

                {/* Customer notes */}
                {(form.containerSizeNote || form.materialTypeNote || form.addonsNote) && (
                  <div className="mx-5 sm:mx-6 mb-4 rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Customer Requirements</p>
                    <div className="space-y-2.5">
                      {form.containerSizeNote && (
                        <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Container Size</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{form.containerSizeNote}</p></div>
                      )}
                      {form.materialTypeNote && (
                        <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Material Type</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{form.materialTypeNote}</p></div>
                      )}
                      {form.addonsNote && (
                        <div><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Additional Options</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{form.addonsNote}</p></div>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 px-5 sm:px-6 mb-5 italic leading-relaxed">
                  * Indicative quotation. Final pricing may vary based on site conditions, customizations, and delivery location. Valid for 30 days.
                </p>

                {/* Action row */}
                <div className="no-print px-5 sm:px-6 pb-5 sm:pb-6 flex flex-wrap gap-2.5">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm shadow-orange-100 text-sm"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveLoading || saved}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm border-2 disabled:opacity-60 ${
                      saved
                        ? "bg-green-50 border-green-400 text-green-600"
                        : "border-orange-300 text-orange-600 hover:border-orange-500 hover:bg-orange-50"
                    }`}
                  >
                    {saved ? <CheckCircle size={14} /> : isEditMode ? <Pencil size={14} /> : <Save size={14} />}
                    {saved ? (isEditMode ? "Updated!" : "Saved!") : saveLoading ? (isEditMode ? "Updating…" : "Saving…") : (isEditMode ? "Save Changes" : "Save Quote")}
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}