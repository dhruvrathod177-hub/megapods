import { useState, useEffect, useRef } from "react";
import { FileText, Calendar, Package, RefreshCw, Calculator, Trash2 } from "lucide-react";
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

interface SavedQuote {
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
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface QuoteHistoryPageProps {
  onNavigate: (page: string) => void;
}

export default function QuoteHistoryPage({ onNavigate }: QuoteHistoryPageProps) {
  const { token } = useAuth();
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/quotations/my-quotes", {}, token)
      .then(setQuotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (e: React.MouseEvent, quoteId: string) => {
    e.stopPropagation(); // prevent card expand/collapse
    if (!confirm("Are you sure you want to delete this quote?")) return;

    setDeletingId(quoteId);
    try {
      await apiFetch(`/quotations/${quoteId}`, { method: "DELETE" }, token);
      setQuotes((prev) => prev.filter((q) => q._id !== quoteId));
      if (expanded === quoteId) setExpanded(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete quote. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Heading3D tag="h1" className="text-3xl font-bold text-gray-900">
              Quotation History
            </Heading3D>
            <p className="text-gray-500 mt-1">{quotes.length} saved quote{quotes.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => onNavigate("quotation")}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-semibold transition"
          >
            <Calculator size={18} /> New Quote
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="animate-spin text-orange-400" />
          </div>
        )}

        {/* Empty State */}
        {!loading && quotes.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={36} className="text-orange-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">No quotes saved yet</h3>
            <p className="text-gray-400 text-sm mb-6">Generate and save a quotation to see it here</p>
            <button
              onClick={() => onNavigate("quotation")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Generate Your First Quote
            </button>
          </div>
        )}

        {/* Quote List */}
        {!loading && quotes.length > 0 && (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">

                <div className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                  {/* Clickable area for expand/collapse */}
                  <button
                    onClick={() => setExpanded(expanded === quote._id ? null : quote._id)}
                    className="flex items-center gap-4 flex-1 text-left"
                  >
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <Package size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{quote.quoteNumber}</p>
                      <p className="text-sm text-gray-500">{quote.containerSize} · {quote.materialType} · Qty {quote.quantity}</p>
                    </div>
                  </button>

                  {/* Right side: price + date + delete */}
                  <div className="flex items-center gap-4 ml-4">
                    <button
                      onClick={() => setExpanded(expanded === quote._id ? null : quote._id)}
                      className="text-right"
                    >
                      <p className="font-bold text-orange-600 text-lg">{formatINR(quote.total)}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                        <Calendar size={10} />
                        {new Date(quote.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, quote._id)}
                      disabled={deletingId === quote._id}
                      className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete quote"
                    >
                      {deletingId === quote._id
                        ? <RefreshCw size={16} className="animate-spin" />
                        : <Trash2 size={16} />
                      }
                    </button>
                  </div>
                </div>

                {expanded === quote._id && (
                  <div className="border-t border-gray-100 px-6 pb-6 pt-4 bg-gray-50">
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
                            <p className="text-xs text-gray-400">{quote.materialType}</p>
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

                    <div className="mt-4 space-y-1 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span><span>{formatINR(quote.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>GST (18%)</span><span>{formatINR(quote.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-300">
                        <span>Total</span><span className="text-orange-600">{formatINR(quote.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}