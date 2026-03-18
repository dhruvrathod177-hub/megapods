import { useState, useEffect, useRef } from "react";
import { Calculator, Download, Printer, Save, CheckCircle, RefreshCw, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

interface Heading3DProps {
  children: React.ReactNode;
  className?: string;
  tag?: HTMLTag;
}

function Heading3D({ children, className = '', tag: Tag = 'h2' }: Heading3DProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -10;
    const rotateY = ((x - cx) / cx) * 14;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    el.style.textShadow = `${-rotateY * 0.6}px ${rotateX * 0.6}px 18px rgba(234,88,12,0.22), 0 2px 32px rgba(0,0,0,0.10)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.textShadow = 'none';
  };

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`heading-3d ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Tag>
  );
}

interface AddonOption {
  name: string;
  price: number;
}

interface PricingConfig {
  materials: string[];
  sizes: string[];
  addons: AddonOption[];
  taxRate: number;
  materialSurcharges: Record<string, number>;
  basePrices: Record<string, number>;
}

interface QuoteResult {
  materialType: string;
  containerSize: string;
  quantity: number;
  unitPrice: number;
  addonBreakdown: AddonOption[];
  addonTotal: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface SavedQuote {
  _id: string;
  quoteNumber: string;
  materialType: string;
  containerSize: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  addons: { name: string; price: number }[];
  createdAt: string;
  containerSizeNote?: string;
  materialTypeNote?: string;
  addonsNote?: string;
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface QuotationPageProps {
  editQuote?: SavedQuote | null;
  onEditSaved?: () => void;
}

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
    materialType:      editQuote?.materialType      ?? "Standard Steel",
    containerSize:     editQuote?.containerSize     ?? "",
    quantity:          editQuote?.quantity          ?? 1,
    selectedAddons:    editQuote?.addons?.map((a) => a.name) ?? [] as string[],
    containerSizeNote: editQuote?.containerSizeNote ?? "",
    materialTypeNote:  editQuote?.materialTypeNote  ?? "",
    addonsNote:        editQuote?.addonsNote        ?? "",
  });

  useEffect(() => {
    apiFetch("/quotations/config", {}, token)
      .then(setConfig)
      .catch(() => setError("Failed to load pricing config. Check if backend is running."));
  }, [token]);

  useEffect(() => {
    if (isEditMode && config && form.containerSize) {
      handleCalculate();
    }
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
    if (!form.containerSize) {
      setError("Please select a container size");
      return;
    }
    setError("");
    setLoading(true);
    setSaved(false);
    try {
      const data = await apiFetch(
        "/quotations/calculate",
        { method: "POST", body: JSON.stringify(form) },
        token
      );
      setQuote(data);
      setTimeout(() => {
        document.getElementById("quote-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      if (isEditMode && editQuote) {
        await apiFetch(
          `/quotations/${editQuote._id}`,
          { method: "PUT", body: JSON.stringify(form) },
          token
        );
        setSaved(true);
        onEditSaved?.();
      } else {
        await apiFetch("/quotations/save", { method: "POST", body: JSON.stringify(form) }, token);
        setSaved(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
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
    } catch {
      return "";
    }
  };

  const buildBillHTML = async (): Promise<string> => {
    if (!quote) return "";

    const logoBase64 = await getLogoBase64();
    const logoHTML = logoBase64
      ? `<img src="${logoBase64}" alt="Logo" style="height:52px;width:52px;border-radius:50%;object-fit:contain;background:#fff;padding:4px;margin-right:14px;flex-shrink:0;"/>`
      : "";

    const addonRows = quote.addonBreakdown.map((a) => `
      <tr>
        <td class="desc">${a.name}<br/><span class="sub">Add-on</span></td>
        <td class="center">1</td>
        <td class="right">${formatINR(a.price)}</td>
        <td class="right">${formatINR(a.price)}</td>
      </tr>`).join("");

    const noteRows = [
      form.containerSizeNote && `<div class="note-block"><p class="note-label">Container Size</p><p class="note-text">${form.containerSizeNote}</p></div>`,
      form.materialTypeNote  && `<div class="note-block"><p class="note-label">Material Type</p><p class="note-text">${form.materialTypeNote}</p></div>`,
      form.addonsNote        && `<div class="note-block"><p class="note-label">Additional Options</p><p class="note-text">${form.addonsNote}</p></div>`,
    ].filter(Boolean).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${quoteNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; display: flex; justify-content: center; padding: 40px 16px; }
  .page { background: #fff; width: 100%; max-width: 720px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.13); }
  .header { background: linear-gradient(135deg, #ea580c, #c2410c); color: #fff; padding: 36px 40px 28px; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .brand { display: flex; align-items: center; }
  .brand-name { font-size: 22px; font-weight: 700; }
  .brand-loc { font-size: 12px; color: #fed7aa; margin-top: 2px; }
  .quote-label { text-align: right; flex-shrink: 0; }
  .quote-label .title { font-size: 28px; font-weight: 800; letter-spacing: 2px; }
  .quote-label .num { font-size: 13px; color: #fed7aa; margin-top: 4px; }
  .quote-label .date { font-size: 13px; color: #fed7aa; }
  .divider { border: none; border-top: 1px solid rgba(255,255,255,0.25); margin: 20px 0 16px; }
  .prepared { font-size: 12px; color: #fed7aa; margin-bottom: 4px; }
  .client-name { font-size: 16px; font-weight: 700; }
  .client-email { font-size: 13px; color: #fed7aa; }
  .body { padding: 36px 40px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 8px; }
  thead tr { border-bottom: 2px solid #e5e7eb; }
  thead th { padding: 10px 8px; color: #6b7280; font-weight: 600; text-align: left; }
  thead th.right { text-align: right; }
  thead th.center { text-align: center; }
  tbody tr { border-bottom: 1px solid #f3f4f6; }
  tbody td { padding: 12px 8px; color: #111827; vertical-align: top; }
  td.desc { font-weight: 600; }
  .sub { font-size: 12px; color: #9ca3af; font-weight: 400; }
  td.center { text-align: center; color: #374151; }
  td.right { text-align: right; color: #374151; }
  td.right.bold { font-weight: 700; }
  .totals { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 8px; }
  .total-row { display: flex; justify-content: space-between; font-size: 14px; color: #4b5563; padding: 4px 0; }
  .total-final { display: flex; justify-content: space-between; font-size: 20px; font-weight: 800; color: #111827; border-top: 2px solid #111827; margin-top: 10px; padding-top: 12px; }
  .total-final .amount { color: #ea580c; }
  .notes-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px 24px; margin-top: 28px; }
  .notes-title { font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; }
  .note-block { margin-bottom: 12px; }
  .note-block:last-child { margin-bottom: 0; }
  .note-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .note-text { font-size: 13px; color: #374151; line-height: 1.5; }
  .footer { font-size: 11px; color: #9ca3af; font-style: italic; margin-top: 28px; line-height: 1.6; }
  .strip { background: #fff7ed; border-top: 1px solid #fed7aa; padding: 14px 40px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #9ca3af; }
  .strip strong { color: #ea580c; }
  @media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; border-radius: 0; max-width: 100%; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div class="brand">
        ${logoHTML}
        <div>
          <div class="brand-name">Megapodsindia</div>
          <div class="brand-loc">Surat, Gujarat, India</div>
        </div>
      </div>
      <div class="quote-label">
        <div class="title">QUOTATION</div>
        <div class="num">#${quoteNumber}</div>
        <div class="date">${quoteDate}</div>
      </div>
    </div>
    <hr class="divider"/>
    <div class="prepared">Prepared for:</div>
    <div class="client-name">${user?.fullName ?? ""}</div>
    <div class="client-email">${user?.email ?? ""}</div>
  </div>
  <div class="body">
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="center">Qty</th>
          <th class="right">Unit Price</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="desc">${quote.containerSize} Container<br/><span class="sub">Material: ${quote.materialType}</span></td>
          <td class="center">${quote.quantity}</td>
          <td class="right">${formatINR(quote.unitPrice)}</td>
          <td class="right bold">${formatINR(quote.unitPrice * quote.quantity)}</td>
        </tr>
        ${addonRows}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${formatINR(quote.subtotal)}</span></div>
      <div class="total-row"><span>GST (${(quote.taxRate * 100).toFixed(0)}%)</span><span>${formatINR(quote.taxAmount)}</span></div>
      <div class="total-final"><span>TOTAL</span><span class="amount">${formatINR(quote.total)}</span></div>
    </div>
    ${noteRows ? `<div class="notes-box"><div class="notes-title">Customer Requirements &amp; Notes</div>${noteRows}</div>` : ""}
    <p class="footer">* This is an indicative quotation. Final pricing may vary based on site conditions, customizations, and delivery location. Valid for 30 days from the date of issue.</p>
  </div>
  <div class="strip">
    <span>Generated by <strong>Megapodsindia</strong> Quotation System</span>
    <span>${quoteDate}</span>
  </div>
</div>
</body>
</html>`;
  };

  const handleDownloadPDF = async () => {
    const html = await buildBillHTML();
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${quoteNumber}.html`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    const html = await buildBillHTML();
    if (!html) return;
    const printFrame = document.createElement("iframe");
    printFrame.style.cssText = "position:fixed;top:-10000px;left:-10000px;width:0;height:0;border:none;";
    document.body.appendChild(printFrame);
    const doc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => document.body.removeChild(printFrame), 1000);
    }, 600);
  };

  const handleReset = () => {
    setForm({ materialType: "Standard Steel", containerSize: "", quantity: 1, selectedAddons: [], containerSizeNote: "", materialTypeNote: "", addonsNote: "" });
    setQuote(null); setSaved(false); setError("");
  };

  const noteStyle = "mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm text-gray-700 placeholder-gray-400 resize-none bg-orange-50/30";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="no-print bg-gradient-to-br from-orange-600 to-orange-700 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {isEditMode ? <Pencil size={36} /> : <Calculator size={36} />}
            <Heading3D tag="h1" className="text-4xl sm:text-5xl font-bold">
              {isEditMode ? `Editing ${editQuote.quoteNumber}` : "Quotation Generator"}
            </Heading3D>
          </div>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            {isEditMode
              ? "Update the configuration below and save your changes."
              : "Get an instant price estimate for your container solution — customized to your exact needs."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* FORM */}
          <div className="no-print">
            <div className="bg-white rounded-3xl shadow-xl p-8">

              <Heading3D tag="h2" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                {isEditMode ? "Update Configuration" : "Configure Your Container"}
              </Heading3D>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
              )}

              {!config ? (
                <div className="text-center py-8 text-gray-400">
                  {error ? "⚠️ " + error : "Loading pricing data…"}
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Container Size */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Container Size *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {config.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setForm((p) => ({ ...p, containerSize: size }))}
                          className={`p-4 rounded-2xl border-2 font-semibold transition-all ${
                            form.containerSize === size
                              ? "border-orange-600 bg-orange-50 text-orange-700"
                              : "border-gray-200 hover:border-orange-300 text-gray-700"
                          }`}
                        >
                          <div className="text-lg">{size}</div>
                          <div className="text-xs text-gray-500 mt-1">{formatINR(config.basePrices[size])}</div>
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={form.containerSizeNote}
                      onChange={(e) => setForm((p) => ({ ...p, containerSizeNote: e.target.value }))}
                      placeholder="Any custom size requirement? e.g. Need extra ventilation, modified door placement, non-standard dimensions…"
                      rows={2}
                      className={noteStyle}
                    />
                  </div>

                  {/* Material Type — text box only */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Material Type</label>
                    <textarea
                      value={form.materialTypeNote}
                      onChange={(e) => setForm((p) => ({ ...p, materialTypeNote: e.target.value }))}
                      placeholder="Describe your material preference… e.g. Standard Steel, Corten Steel, Anti-rust coating, thicker gauge, specific finish…"
                      rows={3}
                      className={noteStyle}
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Quantity: <span className="text-orange-600">{form.quantity}</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setForm((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 font-bold text-lg hover:border-orange-500 hover:text-orange-600 transition"
                      >−</button>
                      <input
                        type="range" min={1} max={20} value={form.quantity}
                        onChange={(e) => setForm((p) => ({ ...p, quantity: +e.target.value }))}
                        className="flex-1 accent-orange-600"
                      />
                      <button
                        onClick={() => setForm((p) => ({ ...p, quantity: Math.min(20, p.quantity + 1) }))}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 font-bold text-lg hover:border-orange-500 hover:text-orange-600 transition"
                      >+</button>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Additional Options</label>
                    <div className="space-y-2">
                      {config.addons.map((addon) => (
                        <label
                          key={addon.name}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            form.selectedAddons.includes(addon.name)
                              ? "border-orange-600 bg-orange-50"
                              : "border-gray-100 hover:border-orange-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={form.selectedAddons.includes(addon.name)}
                              onChange={() => toggleAddon(addon.name)}
                              className="accent-orange-600 w-4 h-4"
                            />
                            <span className="text-sm text-gray-800">{addon.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-orange-600">+{formatINR(addon.price)}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      value={form.addonsNote}
                      onChange={(e) => setForm((p) => ({ ...p, addonsNote: e.target.value }))}
                      placeholder="Need something not listed? e.g. Custom lighting, specific AC brand, extra shelving, partition walls…"
                      rows={2}
                      className={noteStyle}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCalculate}
                      disabled={loading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCw size={18} className="animate-spin" /> : <Calculator size={18} />}
                      {loading ? "Calculating…" : isEditMode ? "Recalculate" : "Generate Quote"}
                    </button>
                    <button onClick={handleReset} className="px-5 py-4 rounded-2xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition">
                      <RefreshCw size={18} />
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* QUOTE RESULT */}
          <div id="quote-result">
            {!quote ? (
              <div className="no-print bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                  <Calculator size={40} className="text-orange-300" />
                </div>
                <Heading3D tag="h3" className="text-xl font-bold text-gray-400 mb-2">
                  Your quote will appear here
                </Heading3D>
                <p className="text-gray-400 text-sm">Fill in the form and click "{isEditMode ? "Recalculate" : "Generate Quote"}"</p>
              </div>
            ) : (
              <div ref={printRef} id="print-area" className="bg-white rounded-3xl shadow-xl overflow-hidden">

                {/* Quote Header */}
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-6 sm:p-8">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src="/img/logo1.JPG"
                        alt="Logo"
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-contain bg-white p-1 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-xl font-bold leading-tight">Megapodsindia</h3>
                        <p className="text-orange-200 text-xs">Surat, Gujarat, India</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-2xl font-bold tracking-wide">QUOTATION</div>
                      <div className="text-orange-200 text-xs sm:text-sm mt-1">#{quoteNumber}</div>
                      <div className="text-orange-200 text-xs sm:text-sm">{quoteDate}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-orange-500">
                    <p className="text-orange-200 text-xs sm:text-sm">Prepared for:</p>
                    <p className="font-semibold text-sm sm:text-base">{user?.fullName}</p>
                    <p className="text-orange-200 text-xs sm:text-sm">{user?.email}</p>
                  </div>
                </div>

                <div className="p-5 sm:p-8">

                  {/* Line items */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 text-gray-500 font-semibold">Description</th>
                        <th className="text-right py-3 text-gray-500 font-semibold">Qty</th>
                        <th className="text-right py-3 text-gray-500 font-semibold">Unit Price</th>
                        <th className="text-right py-3 text-gray-500 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-4">
                          <div className="font-semibold text-gray-900">{quote.containerSize} Container</div>
                          <div className="text-gray-500 text-xs">Material: {quote.materialType}</div>
                        </td>
                        <td className="py-4 text-right">{quote.quantity}</td>
                        <td className="py-4 text-right">{formatINR(quote.unitPrice)}</td>
                        <td className="py-4 text-right font-semibold">{formatINR(quote.unitPrice * quote.quantity)}</td>
                      </tr>
                      {quote.addonBreakdown.map((addon) => (
                        <tr key={addon.name}>
                          <td className="py-3">
                            <div className="text-gray-700">{addon.name}</div>
                            <div className="text-gray-400 text-xs">Add-on</div>
                          </td>
                          <td className="py-3 text-right">1</td>
                          <td className="py-3 text-right">{formatINR(addon.price)}</td>
                          <td className="py-3 text-right">{formatINR(addon.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="mt-6 border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Subtotal</span><span>{formatINR(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>GST ({(quote.taxRate * 100).toFixed(0)}%)</span><span>{formatINR(quote.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 border-t-2 border-gray-900 pt-3 mt-3">
                      <span>TOTAL</span><span className="text-orange-600">{formatINR(quote.total)}</span>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {(form.containerSizeNote || form.materialTypeNote || form.addonsNote) && (
                    <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-5">
                      <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">
                        Customer Requirements &amp; Notes
                      </p>
                      <div className="space-y-4">
                        {form.containerSizeNote && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Container Size</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{form.containerSizeNote}</p>
                          </div>
                        )}
                        {form.materialTypeNote && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Material Type</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{form.materialTypeNote}</p>
                          </div>
                        )}
                        {form.addonsNote && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Additional Options</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{form.addonsNote}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-6 italic">
                    * This is an indicative quotation. Final pricing may vary based on site conditions, customizations, and delivery location. Valid for 30 days from the date of issue.
                  </p>

                  {/* Actions */}
                  <div className="no-print flex flex-wrap gap-2 sm:gap-3 mt-6">
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base"
                    >
                      <Download size={16} className="sm:w-[18px] sm:h-[18px]" /> Download
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base"
                    >
                      <Printer size={16} className="sm:w-[18px] sm:h-[18px]" /> Print
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saveLoading || saved}
                      className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base ${
                        saved
                          ? "bg-green-50 border-2 border-green-500 text-green-600"
                          : "border-2 border-orange-300 hover:border-orange-500 text-orange-600"
                      }`}
                    >
                      {saved ? <CheckCircle size={16} /> : isEditMode ? <Pencil size={16} /> : <Save size={16} />}
                      {saved
                        ? (isEditMode ? "Updated!" : "Saved!")
                        : saveLoading
                        ? (isEditMode ? "Updating…" : "Saving…")
                        : (isEditMode ? "Save Changes" : "Save Quote")}
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}