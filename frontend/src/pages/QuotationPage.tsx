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
    materialType:      editQuote?.materialType      ?? "",
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

  // Auto-calculate when opening in edit mode and config is ready
  useEffect(() => {
    if (isEditMode && config && form.materialType && form.containerSize) {
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
    if (!form.materialType || !form.containerSize) {
      setError("Please select material type and container size");
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

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://megapods.onrender.com/api"}/quotations/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ form, quote, user }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handlePrint = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://megapods.onrender.com/api"}/quotations/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ form, quote, user }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank");
      if (!newWindow) { alert("Allow popup to print"); return; }
      setTimeout(() => { newWindow.print(); }, 500);
    } catch (err) {
      console.error("Print failed", err);
    }
  };

  const handleReset = () => {
    setForm({
      materialType: "", containerSize: "", quantity: 1, selectedAddons: [],
      containerSizeNote: "", materialTypeNote: "", addonsNote: "",
    });
    setQuote(null);
    setSaved(false);
    setError("");
  };

  // Shared textarea style
  const noteStyle = "mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm text-gray-700 placeholder-gray-400 resize-none bg-orange-50/30";

  return (
    <div className="min-h-screen bg-gray-50">

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            box-shadow: none !important; border-radius: 0 !important;
          }
          .no-print { display: none !important; }
        }
        select {
          -webkit-appearance: auto;
          appearance: auto;
        }
      `}</style>

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

                  {/* Material Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Material Type *</label>
                    <select
                      value={form.materialType}
                      onChange={(e) => setForm((p) => ({ ...p, materialType: e.target.value }))}
                      style={{ WebkitAppearance: "auto" as React.CSSProperties["WebkitAppearance"], appearance: "auto" }}
                      className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-800"
                    >
                      <option value="">-- Select material --</option>
                      {config.materials.map((m) => (
                        <option key={m} value={m}>
                          {m}{config.materialSurcharges[m] > 0 ? ` (+${formatINR(config.materialSurcharges[m])})` : " (Included)"}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={form.materialTypeNote}
                      onChange={(e) => setForm((p) => ({ ...p, materialTypeNote: e.target.value }))}
                      placeholder="Any material preference or special treatment? e.g. Anti-rust coating, thicker gauge, specific finish…"
                      rows={2}
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
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-8">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 mb-2">
                      <img src="/img/logo1.JPG" alt="Logo" className="h-12 w-12 rounded-full object-contain bg-white p-1" />
                      <div>
                        <h3 className="text-xl font-bold">Megapodsindia</h3>
                        <p className="text-orange-200 text-xs">Surat, Gujarat, India</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">QUOTATION</div>
                      <div className="text-orange-200 text-sm mt-1">#{quoteNumber}</div>
                      <div className="text-orange-200 text-sm">{quoteDate}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-orange-500">
                    <p className="text-orange-200 text-sm">Prepared for:</p>
                    <p className="font-semibold">{user?.fullName}</p>
                    <p className="text-orange-200 text-sm">{user?.email}</p>
                  </div>
                </div>

                <div className="p-8">

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
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span><span>{formatINR(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST ({(quote.taxRate * 100).toFixed(0)}%)</span><span>{formatINR(quote.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-900 pt-3 mt-3">
                      <span>TOTAL</span><span className="text-orange-600">{formatINR(quote.total)}</span>
                    </div>
                  </div>

                  {/* Customer Notes — only shown if at least one note is filled */}
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
                  <div className="no-print flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-semibold transition"
                    >
                      <Download size={18} /> Download PDF
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-3 rounded-xl font-semibold transition"
                    >
                      <Printer size={18} /> Print
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saveLoading || saved}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${
                        saved
                          ? "bg-green-50 border-2 border-green-500 text-green-600"
                          : "border-2 border-orange-300 hover:border-orange-500 text-orange-600"
                      }`}
                    >
                      {saved ? <CheckCircle size={18} /> : isEditMode ? <Pencil size={18} /> : <Save size={18} />}
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