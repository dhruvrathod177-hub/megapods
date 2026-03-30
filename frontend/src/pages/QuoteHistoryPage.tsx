import { useState, useEffect, useRef } from "react";
import {
  FileText, Calendar, Package, RefreshCw, Calculator,
  Trash2, Pencil, HandshakeIcon, X, Download, ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import QuotationPage, { SavedQuote } from "./QuotationPage";
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

interface Negotiation {
  _id: string; quotationId: string; quoteNumber: string;
  originalTotal: number; offeredPrice: number; message: string;
  status: "pending" | "accepted" | "rejected"; adminResponse: string; createdAt: string;
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function NegotiationBadge({ status }: { status: Negotiation["status"] }) {
  const map = {
    pending:  { label: "Negotiation Pending",  cls: "bg-amber-50 text-amber-700 border-amber-200" },
    accepted: { label: "Negotiation Accepted", cls: "bg-green-50 text-green-700 border-green-200" },
    rejected: { label: "Negotiation Rejected", cls: "bg-red-50 text-red-600 border-red-200" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

interface NegotiateModalProps {
  quote: SavedQuote; onClose: () => void; onSubmitted: (neg: Negotiation) => void;
}

function NegotiateModal({ quote, onClose, onSubmitted }: NegotiateModalProps) {
  const { token } = useAuth();
  const [offeredPrice, setOfferedPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numericOffer = parseFloat(offeredPrice);
  const discount = offeredPrice && numericOffer < quote.total
    ? (((quote.total - numericOffer) / quote.total) * 100).toFixed(1)
    : null;

  const handleSubmit = async () => {
    const price = parseFloat(offeredPrice);
    if (!price || price <= 0) { setError("Please enter a valid offered price"); return; }
    if (price >= quote.total) { setError("Offered price must be lower than the original total"); return; }
    if (!message.trim()) { setError("Please add a message explaining your offer"); return; }
    setLoading(true); setError("");
    try {
      const neg = await apiFetch("/negotiations", {
        method: "POST", body: JSON.stringify({ quotationId: quote._id, offeredPrice: price, message }),
      }, token);
      onSubmitted(neg.negotiation);
    } catch (err: any) { setError(err.message || "Failed to submit. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">

        {/* Modal header */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-5 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <HandshakeIcon size={18} />
              </div>
              <div>
                <h2 className="font-bold text-base leading-tight">Make an Offer</h2>
                <p className="text-orange-200 text-xs font-mono">{quote.quoteNumber}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-orange-200 text-sm">Original Total</span>
            <span className="font-bold text-lg tabular-nums">{formatINR(quote.total)}</span>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Offered Price (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-base">₹</span>
              <input
                type="number" value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                placeholder={String(Math.round(quote.total * 0.9))}
                className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-gray-900 text-lg font-bold transition-all"
              />
            </div>
            {discount && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">Discount requested</span>
                <span className="font-bold text-orange-600">{discount}% off — saving {formatINR(quote.total - numericOffer)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message to Megapodsindia</label>
            <textarea
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why you're requesting this price — bulk order, long-term relationship, budget constraints…"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm text-gray-700 placeholder-gray-400 resize-none transition-all"
            />
          </div>

          <p className="text-xs text-gray-400 text-center">Our team will review your offer and reach out directly.</p>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-all text-sm"
            >Cancel</button>
            <button
              onClick={handleSubmit} disabled={loading}
              className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold transition-all shadow-md shadow-orange-100 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <HandshakeIcon size={14} />}
              {loading ? "Submitting…" : "Submit Offer"}
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
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [negotiations, setNegotiations] = useState<Record<string, Negotiation>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingQuote, setEditingQuote] = useState<SavedQuote | null>(null);
  const [negotiatingQuote, setNegotiatingQuote] = useState<SavedQuote | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [qs, negs]: [SavedQuote[], Negotiation[]] = await Promise.all([
        apiFetch("/quotations/my-quotes", {}, token),
        apiFetch("/negotiations/my", {}, token),
      ]);
      setQuotes(qs);
      const negMap: Record<string, Negotiation> = {};
      negs.forEach((n) => { negMap[n.quotationId] = n; });
      setNegotiations(negMap);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleDelete = async (e: React.MouseEvent, quoteId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this quote?")) return;
    setDeletingId(quoteId);
    try {
      await apiFetch(`/quotations/${quoteId}`, { method: "DELETE" }, token);
      setQuotes((prev) => prev.filter((q) => q._id !== quoteId));
      if (expanded === quoteId) setExpanded(null);
    } catch { alert("Failed to delete quote. Please try again."); }
    finally { setDeletingId(null); }
  };

  const handleNegotiationSubmitted = (neg: Negotiation) => {
    setNegotiations((prev) => ({ ...prev, [neg.quotationId]: neg }));
    setNegotiatingQuote(null);
    setTimeout(() => fetchAll(), 500);
  };

  const handleEditSaved = () => { setEditingQuote(null); fetchAll(); };

  const buildQuoteHTML = (quote: SavedQuote, neg: Negotiation | undefined, quoteDate: string): string => {
    const displayTotal = neg?.status === "accepted" ? neg.offeredPrice : quote.total;
    const addonRows = quote.addons?.map(a => `
      <tr><td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;font-weight:600">${a.name}<br/><span style="font-size:11px;color:#9ca3af;font-weight:400">Add-on</span></td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;color:#374151">1</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;color:#374151">${formatINR(a.price)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;color:#374151">${formatINR(a.price)}</td></tr>`).join("") ?? "";
    const negotiatedRow = neg?.status === "accepted"
      ? `<div style="display:flex;justify-content:space-between;font-size:14px;color:#16a34a;font-weight:600;padding:4px 0"><span>Negotiated Price</span><span>${formatINR(neg.offeredPrice)}</span></div>`
      : "";
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${quote.quoteNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;display:flex;justify-content:center;padding:40px 16px;}.page{background:#fff;width:100%;max-width:720px;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.13);}.header{background:linear-gradient(135deg,#ea580c,#c2410c);color:#fff;padding:36px 40px 28px;}.header-top{display:flex;justify-content:space-between;align-items:flex-start;}.brand-name{font-size:22px;font-weight:700;}.brand-loc{font-size:12px;color:#fed7aa;margin-top:2px;}.quote-label{text-align:right;}.quote-label .title{font-size:28px;font-weight:800;letter-spacing:2px;}.quote-label .num{font-size:13px;color:#fed7aa;margin-top:4px;}.quote-label .date{font-size:13px;color:#fed7aa;}.divider{border:none;border-top:1px solid rgba(255,255,255,0.25);margin:20px 0 16px;}.body{padding:36px 40px;}table{width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;}thead th{padding:10px 8px;color:#6b7280;font-weight:600;text-align:left;border-bottom:2px solid #e5e7eb;}thead th.right{text-align:right;}thead th.center{text-align:center;}.totals{border-top:1px solid #e5e7eb;padding-top:16px;margin-top:8px;}.total-row{display:flex;justify-content:space-between;font-size:14px;color:#4b5563;padding:4px 0;}.total-final{display:flex;justify-content:space-between;font-size:20px;font-weight:800;color:#111827;border-top:2px solid #111827;margin-top:10px;padding-top:12px;}.total-final .amount{color:#ea580c;}.strip{background:#fff7ed;border-top:1px solid #fed7aa;padding:14px 40px;display:flex;justify-content:space-between;font-size:12px;color:#9ca3af;}.strip strong{color:#ea580c;}</style></head>
<body><div class="page"><div class="header"><div class="header-top"><div><div class="brand-name">Megapodsindia</div><div class="brand-loc">Surat, Gujarat, India</div></div><div class="quote-label"><div class="title">QUOTATION</div><div class="num">#${quote.quoteNumber}</div><div class="date">${quoteDate}</div></div></div><hr class="divider"/><div style="font-size:12px;color:#fed7aa;margin-bottom:4px">Prepared for:</div><div style="font-size:16px;font-weight:700">${user?.fullName ?? ""}</div><div style="font-size:13px;color:#fed7aa">${user?.email ?? ""}</div></div>
<div class="body"><table><thead><tr><th>Description</th><th class="center">Qty</th><th class="right">Unit Price</th><th class="right">Amount</th></tr></thead><tbody><tr><td style="padding:12px 8px;font-weight:600;color:#111827">${quote.containerSize} Container<br/><span style="font-size:12px;color:#9ca3af;font-weight:400">Material: ${(quote as any).materialTypeNote || quote.materialType}</span></td><td style="padding:12px 8px;text-align:center">${quote.quantity}</td><td style="padding:12px 8px;text-align:right">${formatINR(quote.unitPrice)}</td><td style="padding:12px 8px;text-align:right;font-weight:700">${formatINR(quote.unitPrice * quote.quantity)}</td></tr>${addonRows}</tbody></table>
<div class="totals"><div class="total-row"><span>Subtotal</span><span>${formatINR(quote.subtotal)}</span></div><div class="total-row"><span>GST (18%)</span><span>${formatINR(quote.taxAmount)}</span></div>${negotiatedRow}<div class="total-final"><span>TOTAL</span><span class="amount">${formatINR(displayTotal)}</span></div></div>
<p style="font-size:11px;color:#9ca3af;font-style:italic;margin-top:28px;line-height:1.6">* Indicative quotation. Final pricing may vary based on site conditions, customizations, and delivery location. Valid for 30 days from the date of issue.</p></div>
<div class="strip"><span>Generated by <strong>Megapodsindia</strong> Quotation System</span><span>${quoteDate}</span></div></div></body></html>`;
  };

  const handleDownload = async (e: React.MouseEvent, quote: SavedQuote) => {
    e.stopPropagation(); setDownloadingId(quote._id);
    const neg = negotiations[quote._id];
    const quoteDate = new Date(quote.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const html = buildQuoteHTML(quote, neg, quoteDate);
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-99999px;left:-99999px;width:794px;height:1123px;border:none;background:white;";
    document.body.appendChild(iframe);
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error("Iframe error");
      doc.open(); doc.write(html); doc.close();
      await new Promise((r) => setTimeout(r, 700));
      const pageEl = doc.querySelector(".page") as HTMLElement;
      const canvas = await html2canvas(pageEl, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${quote.quoteNumber}.pdf`);
    } catch (err) { console.error(err); alert("PDF download failed"); }
    finally { document.body.removeChild(iframe); setDownloadingId(null); }
  };

  if (editingQuote) {
    return (
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
          <button
            onClick={() => setEditingQuote(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors text-sm font-semibold mb-2 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Quote History
          </button>
        </div>
        <QuotationPage editQuote={editingQuote} onEditSaved={handleEditSaved} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6]">

      {negotiatingQuote && (
        <NegotiateModal
          quote={negotiatingQuote}
          onClose={() => setNegotiatingQuote(null)}
          onSubmitted={handleNegotiationSubmitted}
        />
      )}

      {/* ── PAGE HEADER ── */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #ea580c 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-1">Project Records</p>
              <Heading3D tag="h1" className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Quotation History
              </Heading3D>
              <p className="text-gray-400 text-sm mt-1">
                {loading ? 'Loading…' : `${quotes.length} saved quote${quotes.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => onNavigate("quotation")}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-orange-100 transition-all duration-200 text-sm whitespace-nowrap flex-shrink-0"
            >
              <Calculator size={15} /> New Quote
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={28} className="animate-spin text-orange-400" />
              <p className="text-gray-400 text-sm">Loading quotes…</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && quotes.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 sm:p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border-2 border-dashed border-orange-200 flex items-center justify-center mx-auto mb-5">
              <FileText size={34} className="text-orange-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-300 mb-2">No quotes saved yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              Generate and save a quotation to see it here
            </p>
            <button
              onClick={() => onNavigate("quotation")}
              className="bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-orange-100 text-sm"
            >
              Generate Your First Quote
            </button>
          </div>
        )}

        {/* Quote list */}
        {!loading && quotes.length > 0 && (
          <div className="space-y-3">
            {quotes.map((quote) => {
              const neg = negotiations[quote._id];
              const displayTotal = neg?.status === "accepted" ? neg.offeredPrice : quote.total;
              const isExpanded = expanded === quote._id;
              const isDownloading = downloadingId === quote._id;

              return (
                <div
                  key={quote._id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
                    isExpanded ? 'border-orange-200 shadow-md shadow-orange-50' : 'border-gray-100 shadow-sm hover:border-gray-200'
                  }`}
                >
                  {/* Card top row */}
                  <div
                    className="flex items-center gap-3 p-4 sm:p-5 cursor-pointer select-none"
                    onClick={() => setExpanded(isExpanded ? null : quote._id)}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isExpanded ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600'
                    }`}>
                      <Package size={18} />
                    </div>

                    {/* Quote info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{quote.quoteNumber}</span>
                        {neg && <NegotiationBadge status={neg.status} />}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400 truncate">
                          {quote.containerSize} · {(quote as any).materialTypeNote || quote.materialType} · Qty {quote.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Right side: price + date + chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="font-extrabold text-orange-600 tabular-nums text-base leading-tight">
                          {formatINR(displayTotal)}
                        </p>
                        {neg?.status === "accepted" && (
                          <p className="text-xs text-green-600 font-semibold">Negotiated ✓</p>
                        )}
                        <p className="text-xs text-gray-400 flex items-center gap-0.5 justify-end mt-0.5">
                          <Calendar size={9} />
                          {new Date(quote.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Mobile price row */}
                  <div className="sm:hidden px-4 pb-3 flex items-center justify-between">
                    <p className="font-extrabold text-orange-600 tabular-nums">
                      {formatINR(displayTotal)}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(quote.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Action buttons row */}
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex items-center gap-1.5 border-t border-gray-50 pt-3">
                    {/* Download */}
                    <button
                      onClick={(e) => handleDownload(e, quote)}
                      disabled={isDownloading}
                      title="Download PDF"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all text-xs font-medium disabled:opacity-50"
                    >
                      {isDownloading ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    {/* Negotiate */}
                    {!neg && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setNegotiatingQuote(quote); }}
                        title="Negotiate price"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all text-xs font-medium"
                      >
                        <HandshakeIcon size={12} />
                        <span className="hidden sm:inline">Negotiate</span>
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingQuote(quote); }}
                      title="Edit quote"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all text-xs font-medium"
                    >
                      <Pencil size={12} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(e, quote._id)}
                      disabled={deletingId === quote._id}
                      title="Delete quote"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-medium disabled:opacity-50 ml-auto"
                    >
                      {deletingId === quote._id ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>

                  {/* ── EXPANDED DETAIL ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-4 sm:px-6 pb-5 pt-4 space-y-4">

                      {/* Line items table */}
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Item</th>
                            <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="py-3">
                              <p className="font-semibold text-gray-900">{quote.containerSize} Container × {quote.quantity}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{(quote as any).materialTypeNote || quote.materialType}</p>
                            </td>
                            <td className="py-3 text-right font-semibold tabular-nums">{formatINR(quote.unitPrice * quote.quantity)}</td>
                          </tr>
                          {quote.addons?.map((addon) => (
                            <tr key={addon.name}>
                              <td className="py-2.5">
                                <p className="text-gray-700 font-medium">{addon.name}</p>
                                <p className="text-xs text-gray-400">Add-on</p>
                              </td>
                              <td className="py-2.5 text-right text-gray-600 tabular-nums">{formatINR(addon.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Totals */}
                      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Subtotal</span><span className="tabular-nums font-medium">{formatINR(quote.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>GST (18%)</span><span className="tabular-nums font-medium">{formatINR(quote.taxAmount)}</span>
                        </div>
                        {neg?.status === "accepted" && (
                          <div className="flex justify-between text-sm font-semibold text-green-600">
                            <span>Negotiated Price</span><span className="tabular-nums">{formatINR(neg.offeredPrice)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-100 pt-2.5 mt-1 flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm">Total</span>
                          <span className="font-extrabold text-orange-600 text-lg tabular-nums">{formatINR(displayTotal)}</span>
                        </div>
                      </div>

                      {/* Negotiation block */}
                      {neg && (
                        <div className={`rounded-xl border p-4 ${
                          neg.status === "pending" ? "bg-amber-50 border-amber-100" :
                          neg.status === "accepted" ? "bg-green-50 border-green-100" :
                          "bg-red-50 border-red-100"
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Negotiation</p>
                            <NegotiationBadge status={neg.status} />
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Original</p>
                              <p className="font-bold text-gray-800 text-sm tabular-nums">{formatINR(neg.originalTotal)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Your Offer</p>
                              <p className="font-bold text-green-600 text-sm tabular-nums">{formatINR(neg.offeredPrice)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Discount</p>
                              <p className="font-bold text-orange-600 text-sm">
                                {(((neg.originalTotal - neg.offeredPrice) / neg.originalTotal) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <div className="bg-white/60 rounded-lg px-3 py-2.5">
                            <p className="text-xs text-gray-500 italic leading-relaxed">"{neg.message}"</p>
                          </div>
                          {neg.adminResponse && (
                            <div className="mt-3 pt-3 border-t border-current/10">
                              <p className="text-xs font-semibold text-gray-500 mb-1">Response from Megapodsindia</p>
                              <p className="text-sm text-gray-700">{neg.adminResponse}</p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}