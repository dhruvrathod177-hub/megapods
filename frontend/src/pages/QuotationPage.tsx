import { useState, useEffect, useRef } from "react";
import { Calculator, Download, Printer, Save, CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

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

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function QuotationPage() {
  const { token, user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoteNumber] = useState(`MPI-${Date.now()}`);
  const [quoteDate] = useState(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));

  const [form, setForm] = useState({
    materialType:   "",
    containerSize:  "",
    quantity:       1,
    selectedAddons: [] as string[],
  });

  useEffect(() => {
    apiFetch("/quotations/config", {}, token)
      .then(setConfig)
      .catch(() => setError("Failed to load pricing config. Check if backend is running."));
  }, [token]);

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
      await apiFetch("/quotations/save", { method: "POST", body: JSON.stringify(form) }, token);
      setSaved(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePrint = () => window.print();
  const handleDownloadPDF = () => window.print();

  const handleReset = () => {
    setForm({ materialType: "", containerSize: "", quantity: 1, selectedAddons: [] });
    setQuote(null);
    setSaved(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── PRINT STYLES ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Hero — hidden on print */}
      <section className="no-print bg-gradient-to-br from-orange-600 to-orange-700 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator size={36} />
            <h1 className="text-4xl sm:text-5xl font-bold">Quotation Generator</h1>
          </div>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Get an instant price estimate for your container solution — customized to your exact needs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* ── FORM — hidden on print ── */}
          <div className="no-print">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Configure Your Container
              </h2>

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
                  </div>

                  {/* Material Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Material Type *</label>
                    <select
                      value={form.materialType}
                      onChange={(e) => setForm((p) => ({ ...p, materialType: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-800"
                    >
                      <option value="">-- Select material --</option>
                      {config.materials.map((m) => (
                        <option key={m} value={m}>
                          {m}{config.materialSurcharges[m] > 0 ? ` (+${formatINR(config.materialSurcharges[m])})` : " (Included)"}
                        </option>
                      ))}
                    </select>
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

                  {/* Add-ons */}
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
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCalculate}
                      disabled={loading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCw size={18} className="animate-spin" /> : <Calculator size={18} />}
                      {loading ? "Calculating…" : "Generate Quote"}
                    </button>
                    <button onClick={handleReset} className="px-5 py-4 rounded-2xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition">
                      <RefreshCw size={18} />
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* ── QUOTE RESULT ── */}
          <div id="quote-result">
            {!quote ? (
              <div className="no-print bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                  <Calculator size={40} className="text-orange-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">Your quote will appear here</h3>
                <p className="text-gray-400 text-sm">Fill in the form and click "Generate Quote"</p>
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

                {/* Line Items */}
                <div className="p-8">
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
                      <span>Subtotal</span>
                      <span>{formatINR(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST ({(quote.taxRate * 100).toFixed(0)}%)</span>
                      <span>{formatINR(quote.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-900 pt-3 mt-3">
                      <span>TOTAL</span>
                      <span className="text-orange-600">{formatINR(quote.total)}</span>
                    </div>
                  </div>

                  {/* Note */}
                  <p className="text-xs text-gray-400 mt-6 italic">
                    * This is an indicative quotation. Final pricing may vary based on site conditions, customizations, and delivery location.
                    Valid for 30 days from the date of issue.
                  </p>

                  {/* Action Buttons — hidden on print */}
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
                      {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                      {saved ? "Saved!" : saveLoading ? "Saving…" : "Save Quote"}
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