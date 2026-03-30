import { useState, useEffect, useRef } from "react";
import { Calculator, Download, Save, CheckCircle, RefreshCw, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import { generateQuotationPDF } from "../utils/pdfGenerator";
import VanillaTilt from 'vanilla-tilt';

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

interface Heading3DProps {
  children: React.ReactNode;
  className?: string;
  tag?: HTMLTag;
}

function Heading3D({ children, className = '', tag: Tag = 'h2' }: Heading3DProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      VanillaTilt.init(ref.current, {
        max: 12,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        scale: 1.05,
      });
    }
    return () => {
      (ref.current as any)?.vanillaTilt?.destroy();
    };
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`heading-3d ${className}`}
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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    cardRefs.current.forEach((ref) => {
      if (ref) {
        VanillaTilt.init(ref, {
          max: 4,
          speed: 1000,
          glare: true,
          "max-glare": 0.1,
          perspective: 2000,
        });
      }
    });
    return () => cardRefs.current.forEach((ref) => (ref as any)?.vanillaTilt?.destroy());
  }, [quote]);

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

  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!quote || downloadLoading) return;
    setDownloadLoading(true);
    try {
      const pdfData = {
        quoteNumber,
        quoteDate,
        customerName: user?.fullName ?? "Customer",
        customerEmail: user?.email ?? "",
        items: [
          {
            description: `${quote.containerSize} Container`,
            subtext: `Material: ${form.materialTypeNote || quote.materialType}`,
            quantity: quote.quantity,
            unitPrice: quote.unitPrice,
            total: quote.unitPrice * quote.quantity,
          },
          ...quote.addonBreakdown.map((a) => ({
            description: a.name,
            subtext: "Add-on",
            quantity: 1,
            unitPrice: a.price,
            total: a.price,
          })),
        ],
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        total: quote.total,
        notes: [
          form.containerSizeNote && { label: "Container Size", text: form.containerSizeNote },
          form.materialTypeNote && { label: "Material Type", text: form.materialTypeNote },
          form.addonsNote && { label: "Additional Options", text: form.addonsNote },
        ].filter(Boolean) as { label: string; text: string }[],
      };

      await generateQuotationPDF(pdfData);
    } catch (err) {
      console.error("PDF download failed:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

 const handleReset = () => {
    setForm({ materialType: "Standard Steel", containerSize: "", quantity: 1, selectedAddons: [], containerSizeNote: "", materialTypeNote: "", addonsNote: "" });
    setQuote(null); setSaved(false); setError("");
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10 overflow-hidden">

      {/* HERO */}
      <section className="no-print relative py-24 lg:py-40 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600/30 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center relative z-10">
          <div className="inline-block px-6 py-2 mb-10 rounded-full bg-orange-600/10 backdrop-blur-xl border border-orange-600/30 text-orange-600 text-[10px] font-black uppercase tracking-[0.5em] animate-fade-in shadow-2xl shadow-orange-600/10">
            Systemic Valuation Protocol
          </div>
          <div className="flex flex-col items-center justify-center gap-6 mb-12">
            <div className="bg-orange-600 text-white p-6 rounded-[2rem] shadow-2xl shadow-orange-600/30 mb-4 animate-bounce">
              {isEditMode ? <Pencil size={48} /> : <Calculator size={48} />}
            </div>
            <Heading3D tag="h1" className="text-6xl sm:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-[0.8]">
              {isEditMode ? "UPDATE" : "QUOTATION"} <br/>
              <span className="text-orange-600">{isEditMode ? "PROTOCOL" : "ENGINE"}</span>
            </Heading3D>
          </div>
          <p className="text-xl text-slate-500 max-w-4xl mx-auto font-light leading-relaxed uppercase tracking-widest animate-fade-up">
            {isEditMode
              ? "Re-calibrating architectural parameters for updated project <span className='text-slate-900 font-black'>valuation metrics</span>."
              : "Instantaneous project <span className='text-slate-900 font-black'>valuation stream</span> utilizing real-time modular engineering variables."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-start">

          {/* FORM */}
          <div className="no-print">
            <div 
              ref={(el) => (cardRefs.current[0] = el)}
              className="glass-card rounded-[4rem] p-12 lg:p-20 border border-white/10 transform-gpu"
            >

              <Heading3D tag="h2" className="text-4xl font-black text-slate-900 mb-14 uppercase tracking-tighter flex items-center gap-6">
                <span className="bg-slate-950 text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-xl font-black shadow-2xl">01</span>
                Parameters
              </Heading3D>

              {error && (
                <div className="mb-10 bg-red-600/10 border border-red-600/30 text-red-500 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] animate-shake">{error}</div>
              )}

              {!config ? (
                <div className="text-center py-20 flex flex-col items-center gap-6">
                  <RefreshCw className="animate-spin text-orange-600" size={40} />
                  <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Pricing Protocols…</p>
                </div>
              ) : (
              <div className="space-y-12">
                <div className="tilt-inner">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2">Module Dimension</label>
                  <div className="relative">
                    <select
                      className="w-full px-8 py-5 glass-input rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-black uppercase tracking-widest appearance-none cursor-pointer text-slate-900"
                      value={form.containerSize}
                      onChange={(e) => setForm((p) => ({ ...p, containerSize: e.target.value }))}
                    >
                      <option value="">Initialize Size</option>
                      {config?.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-orange-600">
                      <Calculator size={20} />
                    </div>
                  </div>
                  <textarea
                    placeholder="Specific architectural constraints..."
                    className="mt-6 w-full px-8 py-5 glass-input rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none text-sm font-bold h-32 leading-relaxed"
                    value={form.containerSizeNote}
                    onChange={(e) => setForm((p) => ({ ...p, containerSizeNote: e.target.value }))}
                  />
                </div>

                <div className="tilt-inner">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2">Material Specification</label>
                  <div className="grid grid-cols-2 gap-6">
                    {config?.materials.map((m) => (
                      <button
                        key={m}
                        onClick={() => setForm((p) => ({ ...p, materialType: m }))}
                        className={`px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-700 border-2 ${
                          form.materialType === m
                            ? "bg-orange-600 text-white border-orange-600 shadow-2xl shadow-orange-600/30 scale-105"
                            : "bg-white/5 backdrop-blur-3xl border-white/10 text-slate-500 hover:bg-white/10"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Metallurgical requirements..."
                    className="mt-6 w-full px-8 py-5 glass-input rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none text-sm font-bold h-32 leading-relaxed"
                    value={form.materialTypeNote}
                    onChange={(e) => setForm((p) => ({ ...p, materialTypeNote: e.target.value }))}
                  />
                </div>

                <div className="tilt-inner">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2">Module Density ({form.quantity})</label>
                  <div className="flex items-center gap-10 bg-slate-950/5 p-8 rounded-[2rem] border border-slate-950/5">
                    <input
                      type="range" min="1" max="20"
                      className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-600"
                      value={form.quantity}
                      onChange={(e) => setForm((p) => ({ ...p, quantity: parseInt(e.target.value) }))}
                    />
                    <span className="text-4xl font-black text-slate-900 tracking-tighter w-16 text-center">{form.quantity}</span>
                  </div>
                </div>

                <div className="tilt-inner">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 ml-2">System Add-ons</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {config?.addons.map((a) => (
                      <button
                        key={a.name}
                        onClick={() => toggleAddon(a.name)}
                        className={`px-8 py-6 rounded-2xl text-left transition-all duration-700 border-2 flex items-center justify-between group/addon ${
                          form.selectedAddons.includes(a.name)
                            ? "bg-orange-600/10 border-orange-600 text-orange-600 scale-105 shadow-xl shadow-orange-600/10"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        <span className="font-black text-xs uppercase tracking-widest">{a.name}</span>
                        {form.selectedAddons.includes(a.name) ? <CheckCircle size={20} /> : <div className="w-6 h-6 rounded-lg border-2 border-current opacity-20 group-hover/addon:opacity-100 transition-opacity"></div>}
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Supplementary integration notes..."
                    className="mt-6 w-full px-8 py-5 glass-input rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none text-sm font-bold h-32 leading-relaxed"
                    value={form.addonsNote}
                    onChange={(e) => setForm((p) => ({ ...p, addonsNote: e.target.value }))}
                  />
                </div>

                <div className="flex gap-6 pt-10 tilt-inner">
                  <button
                    onClick={handleCalculate}
                    disabled={loading}
                    className="flex-1 bg-orange-600 text-white px-12 py-6 rounded-full font-black uppercase tracking-[0.3em] hover:bg-orange-700 transition-all duration-700 hover:scale-110 shadow-2xl shadow-orange-600/40 flex items-center justify-center gap-5 group"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={26} /> : <Calculator size={26} className="group-hover:rotate-12 transition-transform" />}
                    {loading ? "Processing..." : "Run Valuation"}
                  </button>
                  <button onClick={handleReset} className="w-24 rounded-full bg-slate-950 text-white hover:bg-orange-600 transition-all duration-700 flex items-center justify-center shadow-2xl hover:scale-110">
                    <RefreshCw size={26} />
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* RESULTS */}
          <div id="quote-result" className="lg:sticky lg:top-40">
            {!quote ? (
              <div className="glass-card rounded-[4rem] p-24 text-center border-2 border-dashed border-slate-200/50 flex flex-col items-center justify-center min-h-[700px] group animate-fade-in">
                <div className="bg-orange-600/5 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000">
                  <Calculator size={64} className="text-orange-200" />
                </div>
                <h3 className="text-3xl font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Valuation Pending</h3>
                <p className="text-slate-400 font-light max-w-sm mx-auto leading-relaxed text-lg">
                  Initialize project parameters and execute "Run Valuation" to generate project <span className="text-slate-900 font-black">financial metrics</span>.
                </p>
              </div>
            ) : (
              <div 
                ref={(el) => (cardRefs.current[1] = el)}
                className="glass-card rounded-[4rem] p-12 lg:p-20 border border-orange-600/20 overflow-hidden relative group animate-fade-in shadow-2xl transform-gpu"
              >
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-700"></div>
                
                <div className="flex justify-between items-start mb-16 tilt-inner">
                  <div>
                    <div className="text-orange-600 font-black text-[10px] uppercase tracking-[0.5em] mb-3">Protocol Identity</div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">#{quoteNumber.split('-')[1]}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em] mb-3">Time Variant</div>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-widest">{quoteDate}</p>
                  </div>
                </div>

                <div className="space-y-12 mb-16 tilt-inner">
                  <div className="flex justify-between items-end border-b border-slate-950/5 pb-10">
                    <div>
                      <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Core Module</p>
                      <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{quote.containerSize} Container</h4>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-3">{(form as any).materialTypeNote || quote.materialType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatINR(quote.unitPrice * quote.quantity)}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Density: {quote.quantity}</p>
                    </div>
                  </div>

                  {quote.addonBreakdown.length > 0 && (
                    <div className="space-y-6">
                      <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em]">Systemic Add-ons</p>
                      {quote.addonBreakdown.map((a) => (
                        <div key={a.name} className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-bold uppercase tracking-tight">{a.name}</span>
                          <span className="text-slate-900 font-black tracking-tighter text-lg">{formatINR(a.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/5 rounded-[3rem] p-10 lg:p-14 space-y-6 mb-16 tilt-inner border border-slate-950/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Valuation Base</span>
                    <span className="text-slate-900 font-black tracking-tighter text-lg">{formatINR(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">GST Protocol ({(quote.taxRate * 100).toFixed(0)}%)</span>
                    <span className="text-slate-900 font-black tracking-tighter text-lg">{formatINR(quote.taxAmount)}</span>
                  </div>
                  <div className="pt-10 border-t border-orange-600/20 flex justify-between items-center">
                    <span className="text-orange-600 font-black uppercase tracking-[0.4em] text-sm">Gross Settlement</span>
                    <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{formatINR(quote.total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 tilt-inner">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadLoading}
                    className="flex-1 bg-white/5 backdrop-blur-3xl border-2 border-slate-950/10 text-slate-900 px-10 py-6 rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-slate-950 hover:text-white transition-all duration-700 flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {downloadLoading ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
                    Protocol
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveLoading || saved}
                    className={`flex-1 px-10 py-6 rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-700 flex items-center justify-center gap-4 shadow-2xl
                      ${saved 
                        ? "bg-green-600 text-white shadow-green-600/30" 
                        : "bg-orange-600 text-white shadow-orange-600/30 hover:scale-110"}`}
                  >
                    {saveLoading ? <RefreshCw className="animate-spin" size="20" /> : saved ? <CheckCircle size="20" /> : <Save size="20" />}
                    {saved ? "Archived" : "Commit Record"}
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