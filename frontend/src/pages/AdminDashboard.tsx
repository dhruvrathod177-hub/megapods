import { useState, useEffect, useRef, useCallback } from "react";
import {
  LogOut, RefreshCw, CheckCircle, XCircle,
  HandshakeIcon, ChevronDown, ChevronUp,
  Package, Users, TrendingUp, Clock,
  FileText, Bell,
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

interface Quotation {
  _id: string;
  quoteNumber: string;
  userName: string;
  userEmail?: string;
  materialType: string;
  containerSize: string;
  quantity: number;
  total: number;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

interface AdminDashboardProps {
  token: string;
  admin: { email: string; name: string };
  onLogout: () => void;
}

const API = import.meta.env.VITE_API_URL || "https://megapods.onrender.com/api";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// ── Mini bar chart ────────────────────────────────────────────────────────────
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            minHeight: 3,
            background: color,
            borderRadius: 3,
            opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.5,
            transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      ))}
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ pending, accepted, rejected, total }: { pending: number; accepted: number; rejected: number; total: number }) {
  const size = 160;
  const strokeWidth = 18;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  const segments = [
    { value: accepted, color: '#22c55e', label: 'Accepted' },
    { value: pending,  color: '#f59e0b', label: 'Pending'  },
    { value: rejected, color: '#ef4444', label: 'Rejected' },
  ];

  let cumulative = 0;
  const finalArcs = segments.map((s) => {
    const pct = total > 0 ? s.value / total : 0;
    const dashLength = pct * circumference;
    const dashOffset = circumference * (1 - cumulative) - circumference * 0.25;
    cumulative += pct;
    return { ...s, dashLength, dashOffset };
  });

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {finalArcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.dashLength} ${circumference - arc.dashLength}`}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
        ))}
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif" }}>{total}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>TOTAL</span>
      </div>
    </div>
  );
}

export default function AdminDashboard({ token, admin, onLogout }: AdminDashboardProps) {
  const [negotiations,  setNegotiations]  = useState<Negotiation[]>([]);
  const [quotations,    setQuotations]    = useState<Quotation[]>([]);
  const [stats,         setStats]         = useState<Stats | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [expanded,      setExpanded]      = useState<string | null>(null);
  const [responding,    setResponding]    = useState<string | null>(null);
  const [responseText,  setResponseText]  = useState<Record<string, string>>({});
  const [filter,        setFilter]        = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [activeTab,     setActiveTab]     = useState<"negotiations" | "quotations">("negotiations");
  const [lastRefresh,   setLastRefresh]   = useState(new Date());
  const [countdown,     setCountdown]     = useState(30);
  const [notification,  setNotification]  = useState<string | null>(null);
  const prevPendingRef = useRef<number>(0);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetch(`${API}/admin/negotiations`, { headers }).then(r => r.json()),
        fetch(`${API}/admin/stats`,        { headers }).then(r => r.json()),
        fetch(`${API}/admin/quotations`,   { headers }).then(r => r.json()),
      ]);

      if (results[0].status === 'fulfilled') {
        const negs: Negotiation[] = results[0].value;
        setNegotiations(negs);
        const newPending = negs.filter(n => n.status === 'pending').length;
        if (silent && newPending > prevPendingRef.current) {
          showNotif(`🔔 ${newPending - prevPendingRef.current} new negotiation(s) received!`);
        }
        prevPendingRef.current = newPending;
      }
      if (results[1].status === 'fulfilled') setStats(results[1].value);
      if (results[2].status === 'fulfilled') {
        const val = results[2].value;
        if (Array.isArray(val)) setQuotations(val);
      }

      setLastRefresh(new Date());
      setCountdown(30);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchAll(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000);
    return () => clearInterval(timer);
  }, [lastRefresh]);

  const handleRespond = async (id: string, status: "accepted" | "rejected") => {
    setResponding(id);
    try {
      const res = await fetch(`${API}/admin/negotiations/${id}`, {
        method:  "PUT",
        headers,
        body:    JSON.stringify({ status, adminResponse: responseText[id] || "" }),
      });
      if (!res.ok) throw new Error("Failed");
      showNotif(status === 'accepted' ? '✅ Negotiation accepted!' : '❌ Negotiation rejected.');
      await fetchAll();
      setExpanded(null);
    } catch {
      showNotif('⚠️ Failed to respond. Please try again.');
    } finally {
      setResponding(null);
    }
  };

  const filtered = negotiations.filter((n) => filter === "all" || n.status === filter);

  // Chart data: last 7 days negotiation counts
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return negotiations.filter(n => n.createdAt.slice(0, 10) === dateStr).length;
  });

  const totalRevenueSaved = negotiations
    .filter(n => n.status === 'accepted')
    .reduce((sum, n) => sum + (n.originalTotal - n.offeredPrice), 0);

  const totalQuoteValue = quotations.reduce((sum, q) => sum + (q.total || 0), 0);

  const statusBadge = (status: Negotiation["status"]) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', label: 'Pending'  },
      accepted: { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e', label: 'Accepted' },
      rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444', label: 'Rejected' },
    };
    const s = map[status];
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '4px 12px',
        borderRadius: 999,
        background: s.bg, color: s.color,
        border: `1px solid ${s.color}40`,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#080810', color: '#fff' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        @keyframes slideDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
        @keyframes spin360   { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(234,88,12,0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(234,88,12,0); }
          100% { box-shadow: 0 0 0 0 rgba(234,88,12,0); }
        }
        @keyframes notifIn {
          from { opacity:0; transform:translateY(-20px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to   { width: 0%; }
        }

        .dash-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          transition: all 0.25s ease;
        }
        .dash-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .neg-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
          animation: fadeIn 0.4s ease both;
        }
        .neg-card:hover { border-color: rgba(255,255,255,0.12); }
        .tab-btn {
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .filter-btn {
          padding: 7px 16px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          text-transform: capitalize;
          letter-spacing: 0.02em;
        }
        .respond-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .respond-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .respond-btn:not(:disabled):hover { filter: brightness(1.15); transform: translateY(-1px); }
        .textarea-dark {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          resize: none;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .textarea-dark:focus { border-color: rgba(234,88,12,0.5); }
        .textarea-dark::placeholder { color: rgba(255,255,255,0.25); }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
      `}</style>

      {/* ── Notification toast ── */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'rgba(15,15,25,0.95)',
          border: '1px solid rgba(234,88,12,0.4)',
          borderRadius: 14,
          padding: '14px 20px',
          fontSize: 14, fontWeight: 500,
          color: '#fff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'notifIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex', alignItems: 'center', gap: 10,
          maxWidth: 320,
          backdropFilter: 'blur(20px)',
        }}>
          <Bell size={16} color="#ea580c" />
          {notification}
          {/* Progress bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, height: 3,
            background: 'linear-gradient(90deg, #ea580c, #fb923c)',
            borderRadius: '0 0 14px 14px',
            animation: 'progressBar 3.5s linear forwards',
          }} />
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(8,8,16,0.8)',
        backdropFilter: 'blur(20px)',
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #1a0a00, #2d1200)',
            boxShadow: '0 0 0 1px rgba(234,88,12,0.35), 0 4px 16px rgba(234,88,12,0.25)',
            animation: 'pulseRing 3s infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <img
              src="/img/logo1.JPG"
              alt="Megapodsindia"
              style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 8 }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.parentElement as HTMLElement).style.background = 'linear-gradient(135deg, #ea580c, #9a3412)';
                (e.currentTarget.parentElement as HTMLElement).innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`;
              }}
            />
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>
              Admin Dashboard
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Megapodsindia</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Auto-refresh indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '6px 12px',
            fontSize: 12, color: 'rgba(255,255,255,0.4)',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              animation: 'pulseRing 2s infinite',
            }} />
            Auto-refresh in {countdown}s
          </div>

          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, display: 'none' }} className="sm:block">
            {admin.email}
          </span>

          <button
            onClick={() => fetchAll()}
            style={{
              padding: 8, borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            <RefreshCw size={16} style={loading ? { animation: 'spin360 1s linear infinite' } : {}} />
          </button>

          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>

        {/* ── Stat cards ── */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Negotiations', value: stats.total,    color: '#fff',    icon: <HandshakeIcon size={18} />, bg: 'rgba(255,255,255,0.08)', chart: last7 },
              { label: 'Pending',            value: stats.pending,  color: '#f59e0b', icon: <Clock size={18} />,         bg: 'rgba(245,158,11,0.15)', chart: last7.map(v => Math.round(v * 0.3)) },
              { label: 'Accepted',           value: stats.accepted, color: '#22c55e', icon: <CheckCircle size={18} />,   bg: 'rgba(34,197,94,0.15)',  chart: last7.map(v => Math.round(v * 0.5)) },
              { label: 'Rejected',           value: stats.rejected, color: '#ef4444', icon: <XCircle size={18} />,       bg: 'rgba(239,68,68,0.15)',  chart: last7.map(v => Math.round(v * 0.2)) },
              { label: 'Total Quotes',       value: quotations.length, color: '#818cf8', icon: <FileText size={18} />,   bg: 'rgba(129,140,248,0.15)', chart: last7 },
              { label: 'Total Users',        value: [...new Set(negotiations.map(n => n.userEmail))].length, color: '#34d399', icon: <Users size={18} />, bg: 'rgba(52,211,153,0.15)', chart: last7 },
            ].map((card, i) => (
              <div key={i} className="dash-card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: card.bg, color: card.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {card.icon}
                  </div>
                  <TrendingUp size={13} style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: card.color, lineHeight: 1, marginBottom: 4 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>{card.label}</div>
                <MiniBarChart data={card.chart} color={card.color} />
              </div>
            ))}
          </div>
        )}

        {/* ── Charts row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>

          {/* Donut */}
          <div className="dash-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: 20 }}>
              NEGOTIATION BREAKDOWN
            </div>
            {stats && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <DonutChart {...stats} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Accepted', value: stats.accepted, color: '#22c55e' },
                    { label: 'Pending',  value: stats.pending,  color: '#f59e0b' },
                    { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
                  ].map((s) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Revenue summary */}
          <div className="dash-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: 20 }}>
              FINANCIAL SUMMARY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Total Quote Value',     value: formatINR(totalQuoteValue),    color: '#818cf8', icon: <Package size={16} /> },
                { label: 'Total Offered (Neg.)',  value: formatINR(negotiations.reduce((s, n) => s + n.offeredPrice, 0)), color: '#34d399', icon: <HandshakeIcon size={16} /> },
                { label: 'Discounts Given',       value: formatINR(totalRevenueSaved),  color: '#f59e0b', icon: <TrendingUp size={16} /> },
              ].map((row) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    <span style={{ color: row.color }}>{row.icon}</span>
                    {row.label}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab nav ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['negotiations', 'quotations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="tab-btn"
              style={{
                background: activeTab === tab ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'rgba(255,255,255,0.05)',
                border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.08)',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.5)',
                boxShadow: activeTab === tab ? '0 4px 20px rgba(234,88,12,0.3)' : 'none',
              }}
            >
              {tab === 'negotiations' ? `Negotiations (${negotiations.length})` : `All Quotations (${quotations.length})`}
            </button>
          ))}

          {/* Last refresh */}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>
            Last updated: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* ── NEGOTIATIONS TAB ── */}
        {activeTab === 'negotiations' && (
          <>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="filter-btn"
                  style={{
                    background: filter === f
                      ? f === 'all'      ? 'rgba(234,88,12,0.2)'
                      : f === 'pending'  ? 'rgba(245,158,11,0.2)'
                      : f === 'accepted' ? 'rgba(34,197,94,0.2)'
                      :                   'rgba(239,68,68,0.2)'
                      : 'rgba(255,255,255,0.04)',
                    border: filter === f
                      ? f === 'all'      ? '1px solid rgba(234,88,12,0.4)'
                      : f === 'pending'  ? '1px solid rgba(245,158,11,0.4)'
                      : f === 'accepted' ? '1px solid rgba(34,197,94,0.4)'
                      :                   '1px solid rgba(239,68,68,0.4)'
                      : '1px solid rgba(255,255,255,0.08)',
                    color: filter === f
                      ? f === 'all'      ? '#fb923c'
                      : f === 'pending'  ? '#f59e0b'
                      : f === 'accepted' ? '#22c55e'
                      :                   '#ef4444'
                      : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {f === 'all' ? `All (${negotiations.length})` : `${f} (${negotiations.filter(n => n.status === f).length})`}
                </button>
              ))}
            </div>

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <RefreshCw size={28} style={{ color: '#ea580c', animation: 'spin360 1s linear infinite' }} />
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.25)' }}>
                <HandshakeIcon size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 15 }}>No {filter === 'all' ? '' : filter} negotiations</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((neg, idx) => (
                <div key={neg._id} className="neg-card" style={{ animationDelay: `${idx * 0.05}s` }}>

                  {/* Card header */}
                  <button
                    onClick={() => setExpanded(expanded === neg._id ? null : neg._id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', padding: '18px 20px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#fff', textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: 'rgba(234,88,12,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <HandshakeIcon size={18} color="#ea580c" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Syne', sans-serif" }}>{neg.quoteNumber}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                          {neg.userName} · {neg.userEmail}
                        </div>
                        {neg.userContact && (
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{neg.userContact}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>
                          {formatINR(neg.originalTotal)}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e' }}>
                          {formatINR(neg.offeredPrice)}
                        </div>
                      </div>
                      {statusBadge(neg.status)}
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {expanded === neg._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </button>

                  {/* Expanded */}
                  {expanded === neg._id && (
                    <div style={{
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      padding: '20px',
                      display: 'flex', flexDirection: 'column', gap: 16,
                      animation: 'slideDown 0.25s ease',
                    }}>

                      {/* Price comparison */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        {[
                          { label: 'Original',  value: formatINR(neg.originalTotal),  color: '#fff'    },
                          { label: 'Offered',   value: formatINR(neg.offeredPrice),   color: '#22c55e' },
                          { label: 'Discount',  value: `${(((neg.originalTotal - neg.offeredPrice) / neg.originalTotal) * 100).toFixed(1)}%`, color: '#f59e0b' },
                        ].map((c) => (
                          <div key={c.label} style={{
                            background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                            padding: '12px 14px', textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: '0.04em' }}>{c.label.toUpperCase()}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Customer message */}
                      <div style={{
                        background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                        padding: '14px 16px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', marginBottom: 8 }}>CUSTOMER MESSAGE</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{neg.message}</div>
                      </div>

                      {/* Quotation details if available */}
                      {neg.quotationId && (
                        <div style={{
                          background: 'rgba(129,140,248,0.08)', borderRadius: 12,
                          padding: '12px 16px',
                          border: '1px solid rgba(129,140,248,0.15)',
                          display: 'flex', gap: 20,
                        }}>
                          <div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>SIZE</div><div style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>{neg.quotationId.containerSize}</div></div>
                          <div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>MATERIAL</div><div style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>{neg.quotationId.materialType}</div></div>
                          <div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>QTY</div><div style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>{neg.quotationId.quantity}</div></div>
                        </div>
                      )}

                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                        Submitted {new Date(neg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>

                      {/* Respond */}
                      {neg.status === 'pending' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.05em' }}>
                              RESPONSE MESSAGE <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(optional)</span>
                            </label>
                            <textarea
                              value={responseText[neg._id] || ""}
                              onChange={(e) => setResponseText((p) => ({ ...p, [neg._id]: e.target.value }))}
                              placeholder="e.g. Thank you for your offer! We can accommodate ₹2,80,000 as the final price…"
                              rows={3}
                              className="textarea-dark"
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button
                              onClick={() => handleRespond(neg._id, 'accepted')}
                              disabled={responding === neg._id}
                              className="respond-btn"
                              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff' }}
                            >
                              {responding === neg._id
                                ? <RefreshCw size={16} style={{ animation: 'spin360 1s linear infinite' }} />
                                : <CheckCircle size={16} />
                              }
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespond(neg._id, 'rejected')}
                              disabled={responding === neg._id}
                              className="respond-btn"
                              style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff' }}
                            >
                              {responding === neg._id
                                ? <RefreshCw size={16} style={{ animation: 'spin360 1s linear infinite' }} />
                                : <XCircle size={16} />
                              }
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        neg.adminResponse && (
                          <div style={{
                            background: neg.status === 'accepted' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${neg.status === 'accepted' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            borderRadius: 12, padding: '14px 16px',
                          }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', marginBottom: 6 }}>YOUR RESPONSE</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{neg.adminResponse}</div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── QUOTATIONS TAB ── */}
        {activeTab === 'quotations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <RefreshCw size={28} style={{ color: '#ea580c', animation: 'spin360 1s linear infinite' }} />
              </div>
            )}
            {!loading && quotations.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.25)' }}>
                <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>No quotations in database yet</p>
              </div>
            )}
            {quotations.map((q, idx) => (
              <div key={q._id} className="neg-card" style={{ animationDelay: `${idx * 0.04}s`, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(129,140,248,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Package size={17} color="#818cf8" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "'Syne', sans-serif" }}>{q.quoteNumber}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                        {q.userName} · {q.containerSize} · {q.materialType} · Qty {q.quantity}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#818cf8' }}>{formatINR(q.total)}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        {new Date(q.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}