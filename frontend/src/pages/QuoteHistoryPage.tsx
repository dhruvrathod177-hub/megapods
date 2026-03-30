import { useState, useEffect, useRef } from "react";
import {
  FileText, Calendar, Package, RefreshCw, Calculator,
  Trash2, Pencil, HandshakeIcon, X, Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import QuotationPage, { SavedQuote } from "./QuotationPage";
import { generateQuotationPDF } from "../utils/pdfGenerator";
import VanillaTilt from 'vanilla-tilt';

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
interface Heading3DProps { children: React.ReactNode; className?: string; tag?: HTMLTag; }

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
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={`heading-3d ${className}`}>
      {children}
    </Tag>
  );
}

interface Negotiation {
  _id: string;
  quotationId: string;
  quoteNumber: string;
  originalTotal: number;
  offeredPrice: number;
  message: string;
  status: "pending" | "accepted" | "rejected";
  adminResponse: string;
  createdAt: string;
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function NegotiationBadge({ status }: { status: Negotiation["status"] }) {
  const map = {
    pending:  { label: "Pending",  classes: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    accepted: { label: "Accepted", classes: "bg-green-500/10  text-green-600  border-green-500/20"  },
    rejected: { label: "Rejected", classes: "bg-red-500/10    text-red-600    border-red-500/20"    },
  };
  const { label, classes } = map[status];
  return (
    <span className={`inline-flex items-center whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${classes}`}>
      {label}
    </span>
  );
}

interface NegotiateModalProps {
  quote: SavedQuote;
  onClose: () => void;
  onSubmitted: (neg: Negotiation) => void;
}

function NegotiateModal({ quote, onClose, onSubmitted }: NegotiateModalProps) {
  const { token } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [offeredPrice, setOfferedPrice] = useState<string>("");
  const [message, setMessage]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  useEffect(() => {
    if (modalRef.current) {
      VanillaTilt.init(modalRef.current, {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
      });
    }
    return () => (modalRef.current as any)?.vanillaTilt?.destroy();
  }, []);

  const discount = offeredPrice
    ? Math.max(0, (((quote.total - parseFloat(offeredPrice)) / quote.total) * 100)).toFixed(1)
    : null;

  const handleSubmit = async () => {
    const price = parseFloat(offeredPrice);
    if (!price || price <= 0)  { setError("Please enter a valid offered price"); return; }
    if (price >= quote.total)  { setError("Offered price must be lower than the original total"); return; }
    if (!message.trim())       { setError("Please add a message explaining your offer"); return; }
    setLoading(true);
    setError("");
    try {
      const neg = await apiFetch("/negotiations", {
        method: "POST",
        body: JSON.stringify({ quotationId: quote._id, offeredPrice: price, message }),
      }, token);
      onSubmitted(neg.negotiation);
    } catch (err: any) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[30px]">
      <div ref={modalRef} className="glass-card rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/10 transform-gpu">
        <div className="bg-slate-950 p-10 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="bg-orange-600 text-white p-4 rounded-[1.5rem] shadow-2xl shadow-orange-600/30 tilt-inner"><HandshakeIcon size={28} /></div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Negotiate <span className="text-orange-600">Price</span></h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">{quote.quoteNumber}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-all duration-500 p-2.5 bg-white/5 rounded-full backdrop-blur-xl border border-white/10"><X size={20} /></button>
          </div>
          <div className="mt-10 bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 flex justify-between items-center border border-white/10 tilt-inner">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Original Total</span>
            <span className="font-black text-3xl tracking-tighter text-white">{formatINR(quote.total)}</span>
          </div>
        </div>
        <div className="p-12 space-y-10">
          {error && <div className="bg-red-600/10 border border-red-600/30 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] animate-shake">{error}</div>}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">Proposed Investment (₹)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₹</span>
              <input type="number" value={offeredPrice} onChange={(e) => setOfferedPrice(e.target.value)}
                placeholder={String(Math.round(quote.total * 0.9))}
                className="w-full pl-12 pr-8 py-5 glass-input rounded-2xl outline-none text-slate-900 text-2xl font-black tracking-tighter" />
            </div>
            {discount && parseFloat(offeredPrice) < quote.total && (
              <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] px-1">
                <span className="text-gray-400">Strategic Discount</span>
                <span className="text-orange-600 bg-orange-600/10 px-3 py-1 rounded-full">{discount}% OFF</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">Operational Justification</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Detail your requirements or budget constraints..."
              rows={4} className="w-full px-8 py-5 glass-input rounded-2xl outline-none text-sm text-slate-700 font-bold placeholder-gray-400 resize-none leading-relaxed" />
          </div>
          <div className="flex gap-6">
            <button onClick={onClose} className="flex-1 py-5 rounded-full border border-slate-950/10 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-950/5 transition-all duration-700">Cancel</button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-5 rounded-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-700 shadow-2xl shadow-orange-600/30 flex items-center justify-center gap-3">
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <HandshakeIcon size={18} />}
              {loading ? "Transmitting…" : "Submit Offer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuoteHistoryPageProps { onNavigate: (page: string) => void; }

export default function QuoteHistoryPage({ onNavigate }: QuoteHistoryPageProps) {
  const { token, user } = useAuth();
  const [quotes,           setQuotes]           = useState<SavedQuote[]>([]);
  const [negotiations,     setNegotiations]     = useState<Record<string, Negotiation>>({});
  const [loading,          setLoading]          = useState(true);
  const [expanded,         setExpanded]         = useState<string | null>(null);
  const [deletingId,       setDeletingId]       = useState<string | null>(null);
  const [editingQuote,     setEditingQuote]     = useState<SavedQuote | null>(null);
  const [negotiatingQuote, setNegotiatingQuote] = useState<SavedQuote | null>(null);
  const [downloadingId,    setDownloadingId]    = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [qs, negs]: [SavedQuote[], Negotiation[]] = await Promise.all([
        apiFetch("/quotations/my-quotes", {}, token),
        apiFetch("/negotiations/my",      {}, token),
      ]);
      setQuotes(qs);
      const negMap: Record<string, Negotiation> = {};
      negs.forEach((n) => { negMap[n.quotationId] = n; });
      setNegotiations(negMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), 10000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    cardRefs.current.forEach((ref) => {
      if (ref) {
        VanillaTilt.init(ref, {
          max: 3,
          speed: 1000,
          glare: true,
          "max-glare": 0.05,
          perspective: 2000,
        });
      }
    });
    return () => cardRefs.current.forEach((ref) => (ref as any)?.vanillaTilt?.destroy());
  }, [quotes, expanded]);

  const handleDelete = async (e: React.MouseEvent, quoteId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this quote?")) return;
    setDeletingId(quoteId);
    try {
      await apiFetch(`/quotations/${quoteId}`, { method: "DELETE" }, token);
      setQuotes((prev) => prev.filter((q) => q._id !== quoteId));
      if (expanded === quoteId) setExpanded(null);
    } catch {
      alert("Failed to delete quote. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleNegotiationSubmitted = (neg: Negotiation) => {
    setNegotiations((prev) => ({ ...prev, [neg.quotationId]: neg }));
    setNegotiatingQuote(null);
    setTimeout(() => fetchAll(), 500);
  };

  const handleEditSaved = () => {
    setEditingQuote(null);
    fetchAll();
  };

  const handleDownload = async (e: React.MouseEvent, quote: SavedQuote) => {
    e.stopPropagation();
    if (downloadingId === quote._id) return;
    setDownloadingId(quote._id);

    const neg = negotiations[quote._id];
    const quoteDate = new Date(quote.createdAt).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });

    try {
      const pdfData = {
        quoteNumber: quote.quoteNumber,
        quoteDate: quoteDate,
        customerName: user?.fullName ?? "Customer",
        customerEmail: user?.email ?? "",
        items: [
          {
            description: `${quote.containerSize} Container`,
            subtext: `Material: ${(quote as any).materialTypeNote || quote.materialType}`,
            quantity: quote.quantity,
            unitPrice: quote.unitPrice,
            total: quote.unitPrice * quote.quantity,
          },
          ...(quote.addons || []).map((a) => ({
            description: a.name,
            subtext: "Add-on",
            quantity: 1,
            unitPrice: a.price,
            total: a.price,
          })),
        ],
        subtotal: quote.subtotal,
        taxRate: 0.18, // GST 18%
        taxAmount: quote.taxAmount,
        total: quote.total,
        negotiatedPrice: neg?.status === "accepted" ? neg.offeredPrice : undefined,
        notes: [
          quote.containerSizeNote && { label: "Container Size", text: quote.containerSizeNote },
          (quote as any).materialTypeNote && { label: "Material Type", text: (quote as any).materialTypeNote },
          quote.addonsNote && { label: "Additional Options", text: quote.addonsNote },
        ].filter(Boolean) as { label: string; text: string }[],
      };

      await generateQuotationPDF(pdfData);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };
  if (editingQuote) {
    return (
      <div className="bg-transparent min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
          <button onClick={() => setEditingQuote(null)}
            className="flex items-center gap-3 text-slate-400 hover:text-orange-600 transition-all text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-xl">
            ← Return to History
          </button>
        </div>
        <QuotationPage editQuote={editingQuote} onEditSaved={handleEditSaved} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-24 lg:py-40 relative z-10 overflow-hidden">

      {negotiatingQuote && (
        <NegotiateModal
          quote={negotiatingQuote}
          onClose={() => setNegotiatingQuote(null)}
          onSubmitted={handleNegotiationSubmitted}
        />
      )}

      <div className="max-w-5xl mx-auto px-6 sm:px-10">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-24 gap-12">
          <div>
            <div className="text-orange-600 font-black uppercase tracking-[0.5em] text-[10px] mb-6 animate-fade-in">Project Records</div>
            <Heading3D tag="h1" className="text-6xl sm:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none">ARCHIVE <span className="text-orange-600">HUB</span></Heading3D>
            <p className="text-slate-500 mt-4 font-light text-xl tracking-wide uppercase">{quotes.length} Estimates Synchronized</p>
          </div>
          <button onClick={() => onNavigate("quotation")}
            className="group flex items-center gap-4 bg-orange-600 text-white px-10 py-6 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-orange-600/30 transition-all duration-700 hover:scale-110 active:scale-95">
            <Calculator size={22} className="group-hover:rotate-12 transition-transform" /> New Configuration
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-[80px] opacity-20 animate-pulse"></div>
              <RefreshCw size={64} className="animate-spin text-orange-600 relative z-10" />
            </div>
            <p className="text-orange-600 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Synchronizing Data Streams...</p>
          </div>
        )}

        {!loading && quotes.length === 0 && (
          <div className="glass-card rounded-[4rem] p-32 text-center border-2 border-dashed border-slate-200/50 group animate-fade-up">
            <div className="bg-orange-600/5 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000">
              <FileText size={64} className="text-orange-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-300 uppercase tracking-[0.2em] mb-6 leading-none">Archive Empty</h3>
            <p className="text-slate-400 font-light max-w-sm mx-auto leading-relaxed mb-12 text-lg">Initiate your first modular configuration to begin your project timeline.</p>
            <button onClick={() => onNavigate("quotation")}
              className="bg-orange-600 text-white px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-orange-600/30 transition-all duration-700 hover:scale-110">
              Create Configuration
            </button>
          </div>
        )}

        {!loading && quotes.length > 0 && (
          <div className="space-y-8">
            {quotes.map((quote, idx) => {
              const neg = negotiations[quote._id];
              const isExpanded = expanded === quote._id;
              const isDownloading = downloadingId === quote._id;

              return (
                <div key={quote._id}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  className={`glass-card transition-all duration-700 overflow-hidden cursor-pointer transform-gpu
                    ${isExpanded ? "rounded-[3.5rem] border-orange-600/30 shadow-2xl scale-[1.02] bg-white/30" : "rounded-[2.5rem] border-white/10 hover:border-orange-600/30"}`}
                  onClick={() => setExpanded(isExpanded ? null : quote._id)}>
                  
                  <div className="p-10 lg:p-14">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                      <div className="flex items-center gap-10 w-full lg:w-auto">
                        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-1000 shadow-2xl ${isExpanded ? "bg-orange-600 text-white shadow-orange-600/40 rotate-12" : "bg-orange-600/5 text-orange-600"}`}>
                          <Package size={40} className="tilt-inner" />
                        </div>
                        <div className="tilt-inner">
                          <div className="flex items-center gap-6 mb-4">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                              #{quote.quoteNumber.split('-')[1]}
                            </h3>
                            {neg && <NegotiationBadge status={neg.status} />}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            <span className="flex items-center gap-3"><Calendar size={18} className="text-orange-600" /> {new Date(quote.createdAt).toLocaleDateString()}</span>
                            <span className="text-orange-600 text-xl font-black tracking-tighter">{formatINR(neg?.status === "accepted" ? neg.offeredPrice : quote.total)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full lg:w-auto justify-center lg:justify-end tilt-inner">
                        <button
                          onClick={(e) => handleDownload(e, quote)}
                          disabled={isDownloading}
                          className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-slate-400 hover:text-orange-600 hover:border-orange-600/30 transition-all duration-500 backdrop-blur-xl disabled:opacity-50"
                          title="Generate PDF Protocol"
                        >
                          {isDownloading ? <RefreshCw size={24} className="animate-spin" /> : <Download size={24} />}
                        </button>

                        {!neg && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setNegotiatingQuote(quote); }}
                            className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-slate-400 hover:text-orange-600 hover:border-orange-600/30 transition-all duration-500 backdrop-blur-xl"
                            title="Negotiate Investment"
                          >
                            <HandshakeIcon size={24} />
                          </button>
                        )}

                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingQuote(quote); }}
                          className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-slate-400 hover:text-orange-600 hover:border-orange-600/30 transition-all duration-500 backdrop-blur-xl"
                          title="Edit Configuration"
                        >
                          <Pencil size={24} />
                        </button>

                        <button
                          onClick={(e) => handleDelete(e, quote._id)}
                          disabled={deletingId === quote._id}
                          className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-slate-400 hover:text-red-600 hover:border-red-600/30 transition-all duration-500 backdrop-blur-xl disabled:opacity-50"
                          title="Purge Record"
                        >
                          {deletingId === quote._id ? <RefreshCw size={24} className="animate-spin" /> : <Trash2 size={24} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-14 pt-14 border-t border-slate-950/5 space-y-12 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">
                                <th className="pb-8">System Module</th>
                                <th className="pb-8 text-right">Investment</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-950/5">
                              <tr>
                                <td className="py-8">
                                  <p className="font-black text-slate-900 text-xl tracking-tighter uppercase">{quote.containerSize} Container Module × {quote.quantity}</p>
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mt-2">{(quote as any).materialTypeNote || quote.materialType}</p>
                                </td>
                                <td className="py-8 text-right font-black text-slate-900 text-xl tracking-tighter">{formatINR(quote.unitPrice * quote.quantity)}</td>
                              </tr>
                              {quote.addons?.map((addon) => (
                                <tr key={addon.name}>
                                  <td className="py-6 text-slate-500 font-bold uppercase tracking-tight">{addon.name}</td>
                                  <td className="py-6 text-right font-black text-slate-700">{formatINR(addon.price)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="bg-slate-950/5 rounded-[2.5rem] p-10 lg:p-14 space-y-5 border border-slate-950/5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                            <span>Subtotal Stream</span><span>{formatINR(quote.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                            <span>GST Protocol (18%)</span><span>{formatINR(quote.taxAmount)}</span>
                          </div>
                          {neg?.status === "accepted" && (
                            <div className="flex justify-between text-xs font-black uppercase tracking-[0.3em] text-green-600 pt-4 border-t border-green-500/10">
                              <span>Negotiated Settlement</span><span>{formatINR(neg.offeredPrice)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-black text-slate-950 text-4xl pt-8 border-t border-orange-600/20 tracking-tighter uppercase">
                            <span>Total Investment</span>
                            <span className="text-orange-600">{formatINR(neg?.status === "accepted" ? neg.offeredPrice : quote.total)}</span>
                          </div>
                        </div>

                        {neg && (
                          <div className={`rounded-[3rem] p-10 lg:p-14 border ${
                            neg.status === "pending"  ? "bg-yellow-600/5 border-yellow-600/20" :
                            neg.status === "accepted" ? "bg-green-600/5  border-green-600/20"  :
                                                        "bg-red-600/5    border-red-600/20"
                          }`}>
                            <div className="flex items-center justify-between mb-10">
                              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Negotiation Pipeline</p>
                              <NegotiationBadge status={neg.status} />
                            </div>
                            <div className="grid grid-cols-3 gap-10 mb-10">
                              <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Original</p>
                                <p className="font-black text-slate-900 text-lg tracking-tighter">{formatINR(neg.originalTotal)}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Proposed</p>
                                <p className="font-black text-green-600 text-lg tracking-tighter">{formatINR(neg.offeredPrice)}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Differential</p>
                                <p className="font-black text-orange-600 text-lg tracking-tighter">
                                  {(((neg.originalTotal - neg.offeredPrice) / neg.originalTotal) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/30">
                              <p className="text-slate-600 font-bold italic text-lg leading-relaxed">"{neg.message}"</p>
                            </div>
                            {neg.adminResponse && (
                              <div className="mt-10 pt-10 border-t border-slate-950/5">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Admin Determination</p>
                                <p className="text-lg text-slate-900 font-black tracking-tight uppercase">{neg.adminResponse}</p>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}