import { useState, useEffect, useRef } from "react";
import {
  FileText, Calendar, Package, RefreshCw, Calculator,
  Trash2, Pencil, HandshakeIcon, X, Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import QuotationPage, { SavedQuote } from "./QuotationPage";

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
interface Heading3DProps { children: React.ReactNode; className?: string; tag?: HTMLTag; }

function Heading3D({ children, className = '', tag: Tag = 'h2' }: Heading3DProps) {
  const ref = useRef<HTMLElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const rotateX = (((e.clientY - rect.top) - rect.height / 2) / (rect.height / 2)) * -10;
    const rotateY = (((e.clientX - rect.left) - rect.width  / 2) / (rect.width  / 2)) *  14;
    el.style.transform  = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    el.style.textShadow = `${-rotateY * 0.6}px ${rotateX * 0.6}px 18px rgba(234,88,12,0.22)`;
  };
  const handleMouseLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform  = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.textShadow = 'none';
  };
  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={`heading-3d ${className}`}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
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
    pending:  { label: "Negotiation Pending",  classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    accepted: { label: "Negotiation Accepted", classes: "bg-green-50  text-green-700  border-green-200"  },
    rejected: { label: "Negotiation Rejected", classes: "bg-red-50    text-red-600    border-red-200"    },
  };
  const { label, classes } = map[status];
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${classes}`}>{label}</span>
  );
}

interface NegotiateModalProps {
  quote: SavedQuote;
  onClose: () => void;
  onSubmitted: (neg: Negotiation) => void;
}

function NegotiateModal({ quote, onClose, onSubmitted }: NegotiateModalProps) {
  const { token } = useAuth();
  const [offeredPrice, setOfferedPrice] = useState<string>("");
  const [message, setMessage]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <HandshakeIcon size={22} />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">Make an Offer</h2>
                <p className="text-orange-200 text-xs">{quote.quoteNumber}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 bg-white/10 rounded-2xl p-4 flex justify-between items-center">
            <span className="text-orange-200 text-sm">Original Total</span>
            <span className="font-bold text-xl">{formatINR(quote.total)}</span>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Your Offered Price (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
              <input
                type="number"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                placeholder={String(Math.round(quote.total * 0.9))}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-gray-800 text-lg font-semibold"
              />
            </div>

            {discount && parseFloat(offeredPrice) < quote.total && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Discount requested</span>
                <span className="font-bold text-orange-600">
                  {discount}% off — saving {formatINR(quote.total - parseFloat(offeredPrice))}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Message to Megapodsindia</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why you're requesting this price — bulk order, long-term relationship, budget constraints…"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm text-gray-700 placeholder-gray-400 resize-none"
            />
          </div>

          <p className="text-xs text-gray-400 text-center">
            Our team will review your offer and reach out to you directly.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold hover:border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold transition flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <HandshakeIcon size={16} />}
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
  const [quotes,           setQuotes]           = useState<SavedQuote[]>([]);
  const [negotiations,     setNegotiations]     = useState<Record<string, Negotiation>>({});
  const [loading,          setLoading]          = useState(true);
  const [expanded,         setExpanded]         = useState<string | null>(null);
  const [deletingId,       setDeletingId]       = useState<string | null>(null);
  const [editingQuote,     setEditingQuote]     = useState<SavedQuote | null>(null);
  const [negotiatingQuote, setNegotiatingQuote] = useState<SavedQuote | null>(null);

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

  // ── Poll every 10s so status updates without needing manual reload ──
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
    } catch {
      alert("Failed to delete quote. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleNegotiationSubmitted = (neg: Negotiation) => {
    setNegotiations((prev) => ({ ...prev, [neg.quotationId]: neg }));
    setNegotiatingQuote(null);
    // Immediately re-fetch so status is fresh
    setTimeout(() => fetchAll(), 500);
  };

  const handleEditSaved = () => {
    setEditingQuote(null);
    fetchAll();
  };

  // ── Download quote as HTML ──
  const handleDownload = async (quote: SavedQuote) => {
    const quoteDate = new Date(quote.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const neg = negotiations[quote._id];
    const displayTotal = neg?.status === "accepted" ? neg.offeredPrice : quote.total;

    const addonRows = quote.addons?.map(a => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151">${a.name}<br/><span style="font-size:11px;color:#9ca3af">Add-on</span></td>
        <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:center">1</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right">${formatINR(a.price)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f3f4f6;text-align:right">${formatINR(a.price)}</td>
      </tr>`).join("") ?? "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${quote.quoteNumber}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:#f3f4f6; display:flex; justify-content:center; padding:40px 16px; }
  .page { background:#fff; width:100%; max-width:720px; border-radius:16px; overflow:hidden; box-shadow:0 8px 40px rgba(0,0,0,0.13); }
  .header { background:linear-gradient(135deg,#ea580c,#c2410c); color:#fff; padding:36px 40px 28px; }
  .header-top { display:flex; justify-content:space-between; align-items:flex-start; }
  .brand-name { font-size:22px; font-weight:700; }
  .brand-loc { font-size:12px; color:#fed7aa; margin-top:2px; }
  .quote-label { text-align:right; }
  .quote-label .title { font-size:28px; font-weight:800; letter-spacing:2px; }
  .quote-label .num { font-size:13px; color:#fed7aa; margin-top:4px; }
  .quote-label .date { font-size:13px; color:#fed7aa; }
  .divider { border:none; border-top:1px solid rgba(255,255,255,0.25); margin:20px 0 16px; }
  .client-name { font-size:16px; font-weight:700; }
  .client-email { font-size:13px; color:#fed7aa; }
  .body { padding:36px 40px; }
  table { width:100%; border-collapse:collapse; font-size:14px; margin-bottom:8px; }
  thead th { padding:10px 8px; color:#6b7280; font-weight:600; text-align:left; border-bottom:2px solid #e5e7eb; }
  thead th.right { text-align:right; }
  thead th.center { text-align:center; }
  tbody td { padding:12px 8px; color:#111827; vertical-align:top; }
  .totals { border-top:1px solid #e5e7eb; padding-top:16px; margin-top:8px; }
  .total-row { display:flex; justify-content:space-between; font-size:14px; color:#4b5563; padding:4px 0; }
  .total-final { display:flex; justify-content:space-between; font-size:20px; font-weight:800; color:#111827; border-top:2px solid #111827; margin-top:10px; padding-top:12px; }
  .total-final .amount { color:#ea580c; }
  .strip { background:#fff7ed; border-top:1px solid #fed7aa; padding:14px 40px; display:flex; justify-content:space-between; font-size:12px; color:#9ca3af; }
  .strip strong { color:#ea580c; }
  @media print { body{background:white;padding:0} .page{box-shadow:none;border-radius:0;max-width:100%} }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div>
        <div class="brand-name">Megapodsindia</div>
        <div class="brand-loc">Surat, Gujarat, India</div>
      </div>
      <div class="quote-label">
        <div class="title">QUOTATION</div>
        <div class="num">#${quote.quoteNumber}</div>
        <div class="date">${quoteDate}</div>
      </div>
    </div>
    <hr class="divider"/>
    <div style="font-size:12px;color:#fed7aa;margin-bottom:4px">Prepared for:</div>
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
          <td style="padding:12px 8px">
            <div style="font-weight:600;color:#111827">${quote.containerSize} Container</div>
            <div style="font-size:12px;color:#9ca3af">Material: ${quote.materialTypeNote || quote.materialType}</div>
          </td>
          <td style="padding:12px 8px;text-align:center">${quote.quantity}</td>
          <td style="padding:12px 8px;text-align:right">${formatINR(quote.unitPrice)}</td>
          <td style="padding:12px 8px;text-align:right;font-weight:700">${formatINR(quote.unitPrice * quote.quantity)}</td>
        </tr>
        ${addonRows}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${formatINR(quote.subtotal)}</span></div>
      <div class="total-row"><span>GST (18%)</span><span>${formatINR(quote.taxAmount)}</span></div>
      ${neg?.status === "accepted" ? `<div class="total-row" style="color:#16a34a"><span>Negotiated Price</span><span>${formatINR(neg.offeredPrice)}</span></div>` : ""}
      <div class="total-final"><span>TOTAL</span><span class="amount">${formatINR(displayTotal)}</span></div>
    </div>
    <p style="font-size:11px;color:#9ca3af;font-style:italic;margin-top:28px;line-height:1.6">
      * This is an indicative quotation. Final pricing may vary based on site conditions, customizations, and delivery location. Valid for 30 days from the date of issue.
    </p>
  </div>
  <div class="strip">
    <span>Generated by <strong>Megapodsindia</strong> Quotation System</span>
    <span>${quoteDate}</span>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${quote.quoteNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (editingQuote) {
    return (
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <button onClick={() => setEditingQuote(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition text-sm font-semibold mb-2">
            ← Back to Quotation History
          </button>
        </div>
        <QuotationPage editQuote={editingQuote} onEditSaved={handleEditSaved} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">

      {negotiatingQuote && (
        <NegotiateModal
          quote={negotiatingQuote}
          onClose={() => setNegotiatingQuote(null)}
          onSubmitted={handleNegotiationSubmitted}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Heading3D tag="h1" className="text-3xl font-bold text-gray-900">Quotation History</Heading3D>
            <p className="text-gray-500 mt-1">{quotes.length} saved quote{quotes.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => onNavigate("quotation")}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base">
            <Calculator size={16} className="sm:w-[18px] sm:h-[18px]" /> New Quote
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="animate-spin text-orange-400" />
          </div>
        )}

        {!loading && quotes.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={36} className="text-orange-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">No quotes saved yet</h3>
            <p className="text-gray-400 text-sm mb-6">Generate and save a quotation to see it here</p>
            <button onClick={() => onNavigate("quotation")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition">
              Generate Your First Quote
            </button>
          </div>
        )}

        {!loading && quotes.length > 0 && (
          <div className="space-y-4">
            {quotes.map((quote) => {
              const neg = negotiations[quote._id];
              // ── FIX: show negotiated price if accepted ──
              const displayTotal = neg?.status === "accepted" ? neg.offeredPrice : quote.total;

              return (
                <div key={quote._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">

                  {/* ── Card row ── */}
                  <div className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors">

                    {/* Left — info */}
                    <button
                      onClick={() => setExpanded(expanded === quote._id ? null : quote._id)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <div className="bg-orange-100 p-2.5 sm:p-3 rounded-xl flex-shrink-0">
                        <Package size={18} className="text-orange-600 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{quote.quoteNumber}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {quote.containerSize} · {quote.materialTypeNote || quote.materialType} · Qty {quote.quantity}
                        </p>
                        {neg && <div className="mt-1"><NegotiationBadge status={neg.status} /></div>}
                      </div>
                    </button>

                    {/* Right — price + actions */}
                    <div className="flex flex-col items-end gap-1.5 ml-2 flex-shrink-0">

                      {/* Price + date */}
                      <button
                        onClick={() => setExpanded(expanded === quote._id ? null : quote._id)}
                        className="text-right"
                      >
                        <p className="font-bold text-orange-600 text-sm sm:text-lg leading-tight">
                          {formatINR(displayTotal)}
                        </p>
                        {neg?.status === "accepted" && (
                          <p className="text-xs text-green-600 font-semibold">Negotiated ✓</p>
                        )}
                        <p className="text-xs text-gray-400 flex items-center gap-0.5 justify-end">
                          <Calendar size={9} />
                          {new Date(quote.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </button>

                      {/* Action buttons row */}
                      <div className="flex items-center gap-1">

                        {/* Download */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(quote); }}
                          className="p-1.5 sm:p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
                          title="Download quote"
                        >
                          <Download size={14} className="sm:w-4 sm:h-4" />
                        </button>

                        {/* Negotiate — hidden if negotiation exists */}
                        {!neg && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setNegotiatingQuote(quote); }}
                            className="p-1.5 sm:p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
                            title="Negotiate price"
                          >
                            <HandshakeIcon size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingQuote(quote); }}
                          className="p-1.5 sm:p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
                          title="Edit quote"
                        >
                          <Pencil size={14} className="sm:w-4 sm:h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => handleDelete(e, quote._id)}
                          disabled={deletingId === quote._id}
                          className="p-1.5 sm:p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Delete quote"
                        >
                          {deletingId === quote._id
                            ? <RefreshCw size={14} className="animate-spin sm:w-4 sm:h-4" />
                            : <Trash2 size={14} className="sm:w-4 sm:h-4" />}
                        </button>

                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expanded === quote._id && (
                    <div className="border-t border-gray-100 px-4 sm:px-6 pb-6 pt-4 bg-gray-50 space-y-4">

                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-gray-500 font-semibold">Item</th>
                            <th className="text-right py-2 text-gray-500 font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="py-3">
                              <p className="font-semibold text-gray-900">{quote.containerSize} Container × {quote.quantity}</p>
                              <p className="text-xs text-gray-400">{quote.materialTypeNote || quote.materialType}</p>
                            </td>
                            <td className="py-3 text-right font-semibold">{formatINR(quote.unitPrice * quote.quantity)}</td>
                          </tr>
                          {quote.addons?.map((addon) => (
                            <tr key={addon.name}>
                              <td className="py-2 text-gray-600">{addon.name}</td>
                              <td className="py-2 text-right">{formatINR(addon.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="space-y-1 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span><span>{formatINR(quote.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>GST (18%)</span><span>{formatINR(quote.taxAmount)}</span>
                        </div>
                        {/* ── FIX: show negotiated price line if accepted ── */}
                        {neg?.status === "accepted" && (
                          <div className="flex justify-between text-sm font-semibold text-green-600">
                            <span>Negotiated Price</span><span>{formatINR(neg.offeredPrice)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-300">
                          <span>Total</span>
                          <span className="text-orange-600">{formatINR(displayTotal)}</span>
                        </div>
                      </div>

                      {neg && (
                        <div className={`rounded-2xl p-4 border ${
                          neg.status === "pending"  ? "bg-yellow-50 border-yellow-200" :
                          neg.status === "accepted" ? "bg-green-50  border-green-200"  :
                                                      "bg-red-50    border-red-200"
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Your Negotiation</p>
                            <NegotiationBadge status={neg.status} />
                          </div>
                          <div className="flex gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-400 text-xs">Original</p>
                              <p className="font-semibold text-gray-700">{formatINR(neg.originalTotal)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Your Offer</p>
                              <p className="font-semibold text-green-600">{formatINR(neg.offeredPrice)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Discount</p>
                              <p className="font-semibold text-orange-600">
                                {(((neg.originalTotal - neg.offeredPrice) / neg.originalTotal) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 italic">"{neg.message}"</p>
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