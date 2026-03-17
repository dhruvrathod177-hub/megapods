import { useState, useEffect } from "react";
import {
  LogOut, RefreshCw, CheckCircle, XCircle,
   HandshakeIcon, ChevronDown, ChevronUp,
} from "lucide-react";

interface Negotiation {
  _id: string;
  quoteNumber: string;
  originalTotal: number;
  offeredPrice: number;
  message: string;
  status: "pending" | "accepted" | "rejected";
  adminResponse: string;
  userName: string;
  userEmail: string;
  userContact: string;
  createdAt: string;
  quotationId?: { containerSize: string; materialType: string; quantity: number };
}

interface Stats {
  total: number; pending: number; accepted: number; rejected: number;
}

interface AdminDashboardProps {
  token: string;
  admin: { email: string; name: string };
  onLogout: () => void;
}

const API = import.meta.env.VITE_API_URL || "https://megapods.onrender.com/api";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard({ token, admin, onLogout }: AdminDashboardProps) {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [responding,   setResponding]   = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [filter,       setFilter]       = useState<"all" | "pending" | "accepted" | "rejected">("all");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [negsRes, statsRes] = await Promise.all([
        fetch(`${API}/admin/negotiations`, { headers }),
        fetch(`${API}/admin/stats`,        { headers }),
      ]);
      setNegotiations(await negsRes.json());
      setStats(await statsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRespond = async (id: string, status: "accepted" | "rejected") => {
    setResponding(id);
    try {
      const res = await fetch(`${API}/admin/negotiations/${id}`, {
        method:  "PUT",
        headers,
        body:    JSON.stringify({ status, adminResponse: responseText[id] || "" }),
      });
      if (!res.ok) throw new Error("Failed");
      await fetchAll();
      setExpanded(null);
    } catch (err) {
      alert("Failed to respond. Please try again.");
    } finally {
      setResponding(null);
    }
  };

  const filtered = negotiations.filter((n) => filter === "all" || n.status === filter);

  const statusBadge = (status: Negotiation["status"]) => {
    const map = {
      pending:  "bg-yellow-900/50 text-yellow-400 border-yellow-700",
      accepted: "bg-green-900/50  text-green-400  border-green-700",
      rejected: "bg-red-900/50    text-red-400    border-red-700",
    };
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${map[status]} capitalize`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-xl">
            <HandshakeIcon size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin Dashboard</h1>
            <p className="text-gray-400 text-xs">Megapodsindia</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">{admin.email}</span>
          <button
            onClick={fetchAll}
            className="p-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total"    value={stats.total}    color="text-white" />
            <StatCard label="Pending"  value={stats.pending}  color="text-yellow-400" />
            <StatCard label="Accepted" value={stats.accepted} color="text-green-400" />
            <StatCard label="Rejected" value={stats.rejected} color="text-red-400" />
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition capitalize ${
                filter === f
                  ? "bg-orange-600 text-white"
                  : "bg-gray-900 border border-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <RefreshCw size={32} className="animate-spin text-orange-400" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <HandshakeIcon size={48} className="mx-auto mb-4 opacity-30" />
            <p>No {filter === "all" ? "" : filter} negotiations yet</p>
          </div>
        )}

        {/* Negotiations list */}
        {!loading && (
          <div className="space-y-4">
            {filtered.map((neg) => (
              <div key={neg._id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

                {/* Card header */}
                <button
                  onClick={() => setExpanded(expanded === neg._id ? null : neg._id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-800/50 transition text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-600/20 p-2 rounded-xl">
                      <HandshakeIcon size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{neg.quoteNumber}</p>
                      <p className="text-sm text-gray-400">{neg.userName} · {neg.userEmail}</p>
                      {neg.userContact && <p className="text-xs text-gray-500">{neg.userContact}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-400 line-through">{formatINR(neg.originalTotal)}</p>
                      <p className="font-bold text-green-400">{formatINR(neg.offeredPrice)}</p>
                    </div>
                    {statusBadge(neg.status)}
                    {expanded === neg._id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded === neg._id && (
                  <div className="border-t border-gray-800 p-5 space-y-5">

                    {/* Price comparison */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-800 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Original</p>
                        <p className="font-bold text-white">{formatINR(neg.originalTotal)}</p>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Offered</p>
                        <p className="font-bold text-green-400">{formatINR(neg.offeredPrice)}</p>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Discount</p>
                        <p className="font-bold text-orange-400">
                          {(((neg.originalTotal - neg.offeredPrice) / neg.originalTotal) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Customer message */}
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Customer Message</p>
                      <p className="text-gray-200 text-sm leading-relaxed">{neg.message}</p>
                    </div>

                    <p className="text-xs text-gray-500">
                      Submitted {new Date(neg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>

                    {/* Respond section — only for pending */}
                    {neg.status === "pending" ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Response message to customer <span className="text-gray-500 font-normal">(optional)</span>
                          </label>
                          <textarea
                            value={responseText[neg._id] || ""}
                            onChange={(e) => setResponseText((p) => ({ ...p, [neg._id]: e.target.value }))}
                            placeholder="e.g. Thank you for your offer! We can accommodate ₹2,80,000 as the final price…"
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm resize-none"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleRespond(neg._id, "accepted")}
                            disabled={responding === neg._id}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold transition"
                          >
                            {responding === neg._id ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond(neg._id, "rejected")}
                            disabled={responding === neg._id}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold transition"
                          >
                            {responding === neg._id ? <RefreshCw size={16} className="animate-spin" /> : <XCircle size={16} />}
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      neg.adminResponse && (
                        <div className="bg-gray-800 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Response</p>
                          <p className="text-gray-200 text-sm">{neg.adminResponse}</p>
                        </div>
                      )
                    )}

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