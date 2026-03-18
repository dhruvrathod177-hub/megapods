import { useState, useEffect, useRef, useCallback } from "react";
import {
  LogOut, RefreshCw, CheckCircle, XCircle,
  HandshakeIcon, ChevronDown, ChevronUp,
  Users, Clock,
  FileText, Bell, BarChart2,
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
  userContact?: string;
  materialType: string;
  containerSize: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  addons?: { name: string; price: number }[];
  containerSizeNote?: string;
  materialTypeNote?: string;
  addonsNote?: string;
  status: string;
  createdAt: string;
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

// ── Bar Chart Component ────────────────────────────────────────────────────────
function BarChart({ data, colors, labels }: { data: number[]; colors: string[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{v}</span>
          <div style={{
            width: '100%',
            height: `${Math.max((v / max) * 85, v > 0 ? 6 : 2)}%`,
            background: colors[i % colors.length],
            borderRadius: '6px 6px 3px 3px',
            transition: 'height 0.8s cubic-bezier(0.34,1.56,0.64,1)',
            minHeight: 3,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
              borderRadius: '6px 6px 0 0',
            }}/>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.2 }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ pending, accepted, rejected, total }: { pending: number; accepted: number; rejected: number; total: number }) {
  const size = 140;
  const sw = 16;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;

  const segs = [
    { v: accepted, color: '#22c55e' },
    { v: pending,  color: '#f59e0b' },
    { v: rejected, color: '#ef4444' },
  ];

  let cum = 0;
  const arcs = segs.map(s => {
    const pct = total > 0 ? s.v / total : 0;
    const dash = pct * circ;
    const offset = circ * (1 - cum) - circ * 0.25;
    cum += pct;
    return { ...s, dash, offset };
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        {arcs.map((a, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth={sw}
            strokeDasharray={`${a.dash} ${circ - a.dash}`}
            strokeDashoffset={a.offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        ))}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', marginTop: 2 }}>TOTAL</span>
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
  const [filter,        setFilter]        = useState<"all"|"pending"|"accepted"|"rejected">("all");
  const [activeTab,     setActiveTab]     = useState<"negotiations"|"quotations">("negotiations");
  const [lastRefresh,   setLastRefresh]   = useState(new Date());
  const [countdown,     setCountdown]     = useState(30);
  const [toast,         setToast]         = useState<string | null>(null);
  const prevPending = useRef(0);

  const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [nr, sr, qr] = await Promise.allSettled([
        fetch(`${API}/admin/negotiations`, { headers: hdrs }).then(r => r.json()),
        fetch(`${API}/admin/stats`,        { headers: hdrs }).then(r => r.json()),
        fetch(`${API}/admin/quotations`,   { headers: hdrs }).then(r => r.json()),
      ]);
      if (nr.status === 'fulfilled') {
        const negs: Negotiation[] = nr.value;
        setNegotiations(negs);
        const np = negs.filter(n => n.status === 'pending').length;
        if (silent && np > prevPending.current) showToast(`🔔 ${np - prevPending.current} new negotiation(s)!`);
        prevPending.current = np;
      }
      if (sr.status === 'fulfilled') setStats(sr.value);
      if (qr.status === 'fulfilled' && Array.isArray(qr.value)) setQuotations(qr.value);
      setLastRefresh(new Date());
      setCountdown(30);
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const t = setInterval(() => fetchAll(true), 30000);
    return () => clearInterval(t);
  }, [fetchAll]);
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000);
    return () => clearInterval(t);
  }, [lastRefresh]);

  const handleRespond = async (id: string, status: "accepted"|"rejected") => {
    setResponding(id);
    try {
      const res = await fetch(`${API}/admin/negotiations/${id}`, {
        method: 'PUT', headers: hdrs,
        body: JSON.stringify({ status, adminResponse: responseText[id] || '' }),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(status === 'accepted' ? '✅ Negotiation accepted!' : '❌ Negotiation rejected.');
      await fetchAll();
      setExpanded(null);
    } catch { showToast('⚠️ Failed to respond. Please try again.'); }
    finally { setResponding(null); }
  };

  const filtered = negotiations.filter(n => filter === 'all' || n.status === filter);

  // Chart: last 7 days
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().slice(0, 10);
    return negotiations.filter(n => n.createdAt.slice(0, 10) === ds).length;
  });
  const last7Labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return days[d.getDay() === 0 ? 6 : d.getDay() - 1];
  });

  // Revenue data
  const totalQuoteValue   = quotations.reduce((s, q) => s + q.total, 0);
  const totalDiscounts    = negotiations.filter(n => n.status === 'accepted').reduce((s, n) => s + (n.originalTotal - n.offeredPrice), 0);
  const uniqueUsers       = [...new Set(negotiations.map(n => n.userEmail))].length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideD  { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(20px) scale(0.95)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes progbar { from{width:100%} to{width:0%} }
        @keyframes pulseG  { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 8px rgba(34,197,94,0)} }

        .dash-root {
          min-height: 100vh;
          background: #07070c;
          color: #fff;
          font-family: 'Outfit', sans-serif;
        }

        /* ── HEADER ── */
        .dash-header {
          position: sticky; top: 0; z-index: 100;
          height: 60px;
          background: rgba(7,7,12,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
        }
        .h-brand { display: flex; align-items: center; gap: 12px; }
        .h-logo {
          width: 36px; height: 36px; border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(234,88,12,0.3);
          background: rgba(234,88,12,0.08);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .h-logo img { width: 28px; height: 28px; object-fit: contain; border-radius: 6px; }
        .h-title { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
        .h-sub   { font-size: 11px; color: rgba(255,255,255,0.3); }
        .h-right { display: flex; align-items: center; gap: 10px; }
        .h-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 5px 11px;
          font-size: 12px; color: rgba(255,255,255,0.4);
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          animation: pulseG 2s infinite;
        }
        .h-icon-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px; cursor: pointer;
          color: rgba(255,255,255,0.5); transition: all 0.2s;
        }
        .h-icon-btn:hover { color: #fff; border-color: rgba(255,255,255,0.15); }
        .logout-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 9px; cursor: pointer;
          color: #f87171; font-size: 13px; font-weight: 600;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s;
        }
        .logout-btn:hover { background: rgba(239,68,68,0.15); }

        /* ── BODY ── */
        .dash-body { max-width: 1080px; margin: 0 auto; padding: 24px 20px; }

        /* ── STAT CARDS ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        @media(max-width:900px) { .stat-grid { grid-template-columns: repeat(3,1fr); } }
        @media(max-width:520px) { .stat-grid { grid-template-columns: repeat(2,1fr); } }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 16px 16px 14px;
          transition: all 0.25s;
          animation: fadeIn 0.5s ease both;
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .sc-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
        }
        .sc-val { font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 3px; }
        .sc-lbl { font-size: 11px; color: rgba(255,255,255,0.35); font-weight: 500; }

        /* ── CHARTS ROW ── */
        .charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 20px;
        }
        @media(max-width:700px) { .charts-row { grid-template-columns: 1fr; } }

        .chart-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px 20px 16px;
        }
        .chart-title {
          font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.09em; text-transform: uppercase;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── TABS ── */
        .tab-bar {
          display: flex; align-items: center;
          gap: 8px; margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .tab-btn {
          padding: 8px 18px; border-radius: 9px;
          font-size: 13px; font-weight: 600;
          border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #ea580c, #c2410c);
          color: #fff;
          box-shadow: 0 4px 16px rgba(234,88,12,0.3);
        }
        .tab-btn.inactive {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.45);
        }
        .tab-btn.inactive:hover { color: rgba(255,255,255,0.75); }
        .tab-time {
          margin-left: auto;
          font-size: 11px; color: rgba(255,255,255,0.22);
        }

        /* ── FILTER ── */
        .filter-bar { display: flex; gap: 7px; margin-bottom: 16px; flex-wrap: wrap; }
        .flt-btn {
          padding: 6px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 600;
          cursor: pointer; border: none;
          font-family: 'Outfit', sans-serif;
          text-transform: capitalize; transition: all 0.2s;
        }

        /* ── CARDS ── */
        .neg-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; overflow: hidden;
          animation: fadeIn 0.35s ease both;
          transition: border-color 0.2s;
          margin-bottom: 10px;
        }
        .neg-card:hover { border-color: rgba(255,255,255,0.11); }
        .card-btn {
          width: 100%; display: flex; align-items: center;
          justify-content: space-between; padding: 16px 18px;
          background: none; border: none; cursor: pointer;
          color: #fff; text-align: left; transition: background 0.2s;
        }
        .card-btn:hover { background: rgba(255,255,255,0.025); }

        /* ── EXPANDED ── */
        .exp-section {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 18px;
          display: flex; flex-direction: column; gap: 16px;
          animation: slideD 0.22s ease;
        }
        .exp-label {
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }
        .info-cell {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 10px 12px;
        }
        .info-cell-lbl { font-size: 10px; color: rgba(255,255,255,0.28); letter-spacing: 0.06em; margin-bottom: 4px; }
        .info-cell-val { font-size: 13px; font-weight: 600; color: #e2e8f0; }

        .breakdown-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 14px; font-size: 13px; color: rgba(255,255,255,0.6);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .breakdown-row:last-child { border-bottom: none; }
        .breakdown-total {
          display: flex; justify-content: space-between; align-items: center;
          padding: 11px 14px; font-size: 15px; font-weight: 800; color: #818cf8;
        }

        /* ── RESPOND BTNS ── */
        .resp-btns { display: flex; gap: 10px; }
        .resp-btn {
          flex: 1; padding: 11px; border-radius: 11px;
          border: none; cursor: pointer; font-weight: 700;
          font-size: 14px; font-family: 'Outfit', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: all 0.2s;
        }
        .resp-btn:not(:disabled):hover { filter: brightness(1.15); transform: translateY(-1px); }
        .resp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .resp-textarea {
          width: 100%; padding: 11px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 11px; color: #fff;
          font-size: 13px; font-family: 'Outfit', sans-serif;
          resize: none; outline: none; transition: border-color 0.2s;
        }
        .resp-textarea:focus { border-color: rgba(234,88,12,0.45); }
        .resp-textarea::placeholder { color: rgba(255,255,255,0.22); }

        /* ── STATUS BADGE ── */
        .s-badge {
          font-size: 10px; font-weight: 700;
          padding: 3px 10px; border-radius: 999px;
          border: 1px solid; letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* ── TOAST ── */
        .toast {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          background: rgba(12,12,20,0.96);
          border: 1px solid rgba(234,88,12,0.35);
          border-radius: 13px; padding: 13px 18px;
          font-size: 14px; font-weight: 500; color: #fff;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
          display: flex; align-items: center; gap: 10px;
          max-width: 300px; backdrop-filter: blur(20px);
          overflow: hidden;
        }
        .toast-bar {
          position: absolute; bottom: 0; left: 0; height: 2px;
          background: linear-gradient(90deg, #ea580c, #fb923c);
          animation: progbar 3.5s linear forwards;
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
      `}</style>

      <div className="dash-root">

        {/* ── TOAST ── */}
        {toast && (
          <div className="toast">
            <Bell size={15} color="#ea580c" />
            {toast}
            <div className="toast-bar"/>
          </div>
        )}

        {/* ── HEADER ── */}
        <header className="dash-header">
          <div className="h-brand">
            <div className="h-logo">
              <img
                src="/img/logo1.JPG"
                alt="Logo"
                onError={e => {
                  e.currentTarget.style.display='none';
                  (e.currentTarget.parentElement as HTMLElement).innerHTML =
                    `<span style="font-weight:900;color:#ea580c;font-size:14px">M</span>`;
                }}
              />
            </div>
            <div>
              <div className="h-title">Admin Dashboard</div>
              <div className="h-sub">Megapodsindia</div>
            </div>
          </div>

          <div className="h-right">
            <div className="h-pill">
              <div className="live-dot"/>
              Refresh in {countdown}s
            </div>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.3)',display:'none'}} className="sm-email">
              {admin.email}
            </span>
            <button
              className="h-icon-btn"
              onClick={() => fetchAll()}
              title="Refresh"
            >
              <RefreshCw size={15} style={loading ? {animation:'spin 1s linear infinite'} : {}}/>
            </button>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={14}/> Logout
            </button>
          </div>
        </header>

        <div className="dash-body">

          {/* ── STAT CARDS ── */}
          {stats && (
            <div className="stat-grid">
              {[
                { label:'Total Negs',   val: stats.total,           color:'#fff',    bg:'rgba(255,255,255,0.08)',  icon:<HandshakeIcon size={16}/>, delay:0   },
                { label:'Pending',      val: stats.pending,         color:'#f59e0b', bg:'rgba(245,158,11,0.12)',   icon:<Clock size={16}/>,        delay:0.05 },
                { label:'Accepted',     val: stats.accepted,        color:'#22c55e', bg:'rgba(34,197,94,0.12)',    icon:<CheckCircle size={16}/>,   delay:0.1  },
                { label:'Rejected',     val: stats.rejected,        color:'#ef4444', bg:'rgba(239,68,68,0.12)',    icon:<XCircle size={16}/>,       delay:0.15 },
                { label:'All Quotes',   val: quotations.length,     color:'#818cf8', bg:'rgba(129,140,248,0.12)',  icon:<FileText size={16}/>,      delay:0.2  },
                { label:'Unique Users', val: uniqueUsers,           color:'#34d399', bg:'rgba(52,211,153,0.12)',   icon:<Users size={16}/>,         delay:0.25 },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{animationDelay:`${s.delay}s`}}>
                  <div className="sc-icon" style={{background: s.bg, color: s.color}}>{s.icon}</div>
                  <div className="sc-val" style={{color: s.color}}>{s.val}</div>
                  <div className="sc-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── CHARTS ── */}
          {stats && (
            <div className="charts-row">

              {/* Bar chart: negotiations per day */}
              <div className="chart-card">
                <div className="chart-title">
                  <BarChart2 size={13}/> Negotiations — Last 7 Days
                </div>
                <BarChart
                  data={last7}
                  labels={last7Labels}
                  colors={['#ea580c','#fb923c','#ea580c','#fb923c','#ea580c','#fb923c','#ea580c']}
                />
                <div style={{display:'flex',justifyContent:'space-between',marginTop:10,fontSize:11,color:'rgba(255,255,255,0.25)'}}>
                  <span>Total: {negotiations.length}</span>
                  <span>Peak: {Math.max(...last7)}</span>
                </div>
              </div>

              {/* Donut + legend + financials */}
              <div className="chart-card">
                <div className="chart-title">
                  <HandshakeIcon size={13}/> Status Breakdown
                </div>
                <div style={{display:'flex', alignItems:'center', gap:20, marginBottom:16}}>
                  <DonutChart {...stats} />
                  <div style={{display:'flex',flexDirection:'column',gap:10,flex:1}}>
                    {[
                      {label:'Accepted', val:stats.accepted, color:'#22c55e'},
                      {label:'Pending',  val:stats.pending,  color:'#f59e0b'},
                      {label:'Rejected', val:stats.rejected, color:'#ef4444'},
                    ].map(s => (
                      <div key={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:8,height:8,borderRadius:'50%',background:s.color,boxShadow:`0 0 6px ${s.color}`}}/>
                          <span style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>{s.label}</span>
                        </div>
                        <span style={{fontSize:14,fontWeight:700,color:s.color}}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Financial mini summary */}
                <div style={{display:'flex',flexDirection:'column',gap:6,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:12}}>
                  {[
                    {label:'Quote Value',    val:formatINR(totalQuoteValue),  color:'#818cf8'},
                    {label:'Discounts Given',val:formatINR(totalDiscounts),   color:'#f59e0b'},
                  ].map(r => (
                    <div key={r.label} style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                      <span style={{color:'rgba(255,255,255,0.4)'}}>{r.label}</span>
                      <span style={{fontWeight:700,color:r.color}}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── TABS ── */}
          <div className="tab-bar">
            {(['negotiations','quotations'] as const).map(t => (
              <button
                key={t}
                className={`tab-btn ${activeTab===t?'active':'inactive'}`}
                onClick={() => setActiveTab(t)}
              >
                {t === 'negotiations'
                  ? `Negotiations (${negotiations.length})`
                  : `All Quotations (${quotations.length})`}
              </button>
            ))}
            <span className="tab-time">
              Updated {lastRefresh.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
            </span>
          </div>

          {/* ── NEGOTIATIONS ── */}
          {activeTab === 'negotiations' && (
            <>
              <div className="filter-bar">
                {(['all','pending','accepted','rejected'] as const).map(f => {
                  const cnt = f==='all' ? negotiations.length : negotiations.filter(n=>n.status===f).length;
                  const colors: Record<string,{bg:string,color:string,border:string}> = {
                    all:      {bg:'rgba(234,88,12,0.1)',   color:'#fb923c', border:'rgba(234,88,12,0.3)'},
                    pending:  {bg:'rgba(245,158,11,0.1)',  color:'#f59e0b', border:'rgba(245,158,11,0.3)'},
                    accepted: {bg:'rgba(34,197,94,0.1)',   color:'#22c55e', border:'rgba(34,197,94,0.3)'},
                    rejected: {bg:'rgba(239,68,68,0.1)',   color:'#ef4444', border:'rgba(239,68,68,0.3)'},
                  };
                  const active = filter === f;
                  return (
                    <button
                      key={f}
                      className="flt-btn"
                      onClick={() => setFilter(f)}
                      style={{
                        background: active ? colors[f].bg : 'rgba(255,255,255,0.04)',
                        color: active ? colors[f].color : 'rgba(255,255,255,0.35)',
                        border: `1px solid ${active ? colors[f].border : 'rgba(255,255,255,0.07)'}`,
                      }}
                    >
                      {f === 'all' ? `All (${cnt})` : `${f.charAt(0).toUpperCase()+f.slice(1)} (${cnt})`}
                    </button>
                  );
                })}
              </div>

              {loading && <div style={{display:'flex',justifyContent:'center',padding:'48px 0'}}><RefreshCw size={26} style={{color:'#ea580c',animation:'spin 1s linear infinite'}}/></div>}

              {!loading && filtered.length === 0 && (
                <div style={{textAlign:'center',padding:'48px 0',color:'rgba(255,255,255,0.2)'}}>
                  <HandshakeIcon size={36} style={{margin:'0 auto 10px',opacity:0.25}}/>
                  <p style={{fontSize:14}}>No {filter === 'all' ? '' : filter} negotiations</p>
                </div>
              )}

              {filtered.map((neg, idx) => {
                const smap: Record<string,{bg:string,color:string,border:string}> = {
                  pending:  {bg:'rgba(245,158,11,0.12)',  color:'#f59e0b', border:'rgba(245,158,11,0.3)'},
                  accepted: {bg:'rgba(34,197,94,0.12)',   color:'#22c55e', border:'rgba(34,197,94,0.3)'},
                  rejected: {bg:'rgba(239,68,68,0.12)',   color:'#ef4444', border:'rgba(239,68,68,0.3)'},
                };
                const sc = smap[neg.status];
                return (
                  <div key={neg._id} className="neg-card" style={{animationDelay:`${idx*0.04}s`}}>
                    <button className="card-btn" onClick={() => setExpanded(expanded===neg._id?null:neg._id)}>
                      <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
                        <div style={{
                          width:38,height:38,borderRadius:11,flexShrink:0,
                          background:'rgba(234,88,12,0.1)',
                          display:'flex',alignItems:'center',justifyContent:'center',
                        }}>
                          <HandshakeIcon size={17} color="#ea580c"/>
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{neg.quoteNumber}</div>
                          <div style={{fontSize:11,color:'rgba(255,255,255,0.45)'}}>
                            {neg.userName} · {neg.userEmail}
                          </div>
                          {neg.userContact && <div style={{fontSize:10,color:'rgba(255,255,255,0.28)'}}>{neg.userContact}</div>}
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',textDecoration:'line-through'}}>{formatINR(neg.originalTotal)}</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#22c55e'}}>{formatINR(neg.offeredPrice)}</div>
                        </div>
                        <span className="s-badge" style={{background:sc.bg,color:sc.color,borderColor:sc.border}}>
                          {neg.status}
                        </span>
                        <span style={{color:'rgba(255,255,255,0.28)'}}>
                          {expanded===neg._id ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                        </span>
                      </div>
                    </button>

                    {expanded === neg._id && (
                      <div className="exp-section">

                        {/* Price grid */}
                        <div className="info-grid">
                          {[
                            {label:'Original',  val:formatINR(neg.originalTotal),  color:'#fff'},
                            {label:'Offered',   val:formatINR(neg.offeredPrice),   color:'#22c55e'},
                            {label:'Discount',  val:`${(((neg.originalTotal-neg.offeredPrice)/neg.originalTotal)*100).toFixed(1)}%`, color:'#f59e0b'},
                            {label:'Submitted', val:new Date(neg.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}), color:'rgba(255,255,255,0.6)'},
                          ].map(c => (
                            <div key={c.label} className="info-cell">
                              <div className="info-cell-lbl">{c.label}</div>
                              <div className="info-cell-val" style={{color:c.color}}>{c.val}</div>
                            </div>
                          ))}
                        </div>

                        {/* Quotation details */}
                        {neg.quotationId && (
                          <div>
                            <div className="exp-label">📦 Quotation Info</div>
                            <div className="info-grid">
                              {[
                                {label:'Size',     val:neg.quotationId.containerSize},
                                {label:'Material', val:neg.quotationId.materialType},
                                {label:'Qty',      val:String(neg.quotationId.quantity)},
                              ].map(c => (
                                <div key={c.label} className="info-cell" style={{border:'1px solid rgba(129,140,248,0.15)'}}>
                                  <div className="info-cell-lbl">{c.label}</div>
                                  <div className="info-cell-val" style={{color:'#c7d2fe'}}>{c.val}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message */}
                        <div>
                          <div className="exp-label">💬 Customer Message</div>
                          <div style={{
                            background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',
                            borderRadius:10,padding:'11px 14px',fontSize:13,color:'rgba(255,255,255,0.75)',lineHeight:1.6,
                          }}>
                            {neg.message}
                          </div>
                        </div>

                        {/* Respond / response */}
                        {neg.status === 'pending' ? (
                          <div>
                            <div className="exp-label">✍️ Respond to Customer</div>
                            <textarea
                              value={responseText[neg._id]||''}
                              onChange={e => setResponseText(p=>({...p,[neg._id]:e.target.value}))}
                              placeholder="Optional response message to the customer…"
                              rows={2}
                              className="resp-textarea"
                              style={{marginBottom:10}}
                            />
                            <div className="resp-btns">
                              <button
                                className="resp-btn"
                                style={{background:'linear-gradient(135deg,#16a34a,#15803d)',color:'#fff'}}
                                onClick={() => handleRespond(neg._id,'accepted')}
                                disabled={responding===neg._id}
                              >
                                {responding===neg._id ? <RefreshCw size={14} style={{animation:'spin 1s linear infinite'}}/> : <CheckCircle size={14}/>}
                                Accept
                              </button>
                              <button
                                className="resp-btn"
                                style={{background:'linear-gradient(135deg,#dc2626,#b91c1c)',color:'#fff'}}
                                onClick={() => handleRespond(neg._id,'rejected')}
                                disabled={responding===neg._id}
                              >
                                {responding===neg._id ? <RefreshCw size={14} style={{animation:'spin 1s linear infinite'}}/> : <XCircle size={14}/>}
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          neg.adminResponse && (
                            <div>
                              <div className="exp-label">📩 Your Response</div>
                              <div style={{
                                background: neg.status==='accepted' ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
                                border: `1px solid ${neg.status==='accepted' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
                                borderRadius:10, padding:'11px 14px',
                                fontSize:13, color:'rgba(255,255,255,0.7)',
                              }}>
                                {neg.adminResponse}
                              </div>
                            </div>
                          )
                        )}

                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── QUOTATIONS TAB ── */}
          {activeTab === 'quotations' && (
            <>
              {loading && <div style={{display:'flex',justifyContent:'center',padding:'48px 0'}}><RefreshCw size={26} style={{color:'#ea580c',animation:'spin 1s linear infinite'}}/></div>}
              {!loading && quotations.length === 0 && (
                <div style={{textAlign:'center',padding:'48px 0',color:'rgba(255,255,255,0.2)'}}>
                  <FileText size={36} style={{margin:'0 auto 10px',opacity:0.25}}/>
                  <p style={{fontSize:14}}>No quotations in database yet</p>
                </div>
              )}

              {quotations.map((q, idx) => (
                <div key={q._id} className="neg-card" style={{animationDelay:`${idx*0.04}s`}}>
                  <button className="card-btn" onClick={() => setExpanded(expanded===q._id?null:q._id)}>
                    <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
                      {/* Avatar */}
                      <div style={{
                        width:38,height:38,borderRadius:11,flexShrink:0,
                        background:'linear-gradient(135deg,rgba(129,140,248,0.2),rgba(129,140,248,0.08))',
                        border:'1px solid rgba(129,140,248,0.15)',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:15,fontWeight:800,color:'#818cf8',
                      }}>
                        {q.userName?.charAt(0)?.toUpperCase()??"U"}
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{q.quoteNumber}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>
                          👤 {q.userName ?? '—'}
                          {q.userContact && <span style={{color:'rgba(255,255,255,0.3)',marginLeft:8}}>📞 {q.userContact}</span>}
                        </div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.3)'}}>
                          {q.containerSize} · {q.materialType} · Qty {q.quantity}
                        </div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:800,fontSize:14,color:'#818cf8'}}>{formatINR(q.total)}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.28)'}}>
                          {new Date(q.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </div>
                      </div>
                      <span style={{color:'rgba(255,255,255,0.28)'}}>
                        {expanded===q._id ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                      </span>
                    </div>
                  </button>

                  {expanded === q._id && (
                    <div className="exp-section">

                      {/* Customer info */}
                      <div>
                        <div className="exp-label">👤 Customer Information</div>
                        <div className="info-grid">
                          {[
                            {label:'Name',    val:q.userName??'—',      color:'#c7d2fe'},
                            {label:'Contact', val:q.userContact??'—',   color:'#c7d2fe'},
                          ].map(c => (
                            <div key={c.label} className="info-cell" style={{border:'1px solid rgba(129,140,248,0.12)'}}>
                              <div className="info-cell-lbl">{c.label}</div>
                              <div className="info-cell-val" style={{color:c.color}}>{c.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quotation details */}
                      <div>
                        <div className="exp-label">📦 Quotation Details</div>
                        <div className="info-grid">
                          {[
                            {label:'Quote No.',      val:q.quoteNumber},
                            {label:'Container Size', val:q.containerSize},
                            {label:'Material',       val:q.materialType},
                            {label:'Quantity',       val:`${q.quantity} unit${q.quantity>1?'s':''}`},
                            {label:'Unit Price',     val:formatINR(q.unitPrice)},
                            {label:'Created',        val:new Date(q.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})},
                          ].map(c => (
                            <div key={c.label} className="info-cell">
                              <div className="info-cell-lbl">{c.label}</div>
                              <div className="info-cell-val">{c.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add-ons */}
                      {q.addons && q.addons.length > 0 && (
                        <div>
                          <div className="exp-label">✨ Add-ons</div>
                          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,overflow:'hidden'}}>
                            {q.addons.map((a,i) => (
                              <div key={a.name} style={{display:'flex',justifyContent:'space-between',padding:'9px 14px',borderBottom:i<q.addons!.length-1?'1px solid rgba(255,255,255,0.05)':'none',fontSize:13}}>
                                <span style={{color:'rgba(255,255,255,0.65)'}}>{a.name}</span>
                                <span style={{fontWeight:700,color:'#fb923c'}}>{formatINR(a.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {(q.containerSizeNote || q.materialTypeNote || q.addonsNote) && (
                        <div>
                          <div className="exp-label">📝 Customer Requirements</div>
                          <div style={{display:'flex',flexDirection:'column',gap:7}}>
                            {[
                              {label:'Container Size Note', val:q.containerSizeNote},
                              {label:'Material Note',       val:q.materialTypeNote},
                              {label:'Add-ons Note',        val:q.addonsNote},
                            ].filter(n=>n.val).map(n => (
                              <div key={n.label} className="info-cell">
                                <div className="info-cell-lbl">{n.label}</div>
                                <div style={{fontSize:13,color:'rgba(255,255,255,0.65)',marginTop:3}}>{n.val}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price breakdown */}
                      <div>
                        <div className="exp-label">💰 Price Breakdown</div>
                        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,overflow:'hidden'}}>
                          <div className="breakdown-row">
                            <span>Base ({q.containerSize} × {q.quantity})</span>
                            <span>{formatINR(q.unitPrice * q.quantity)}</span>
                          </div>
                          {q.addons?.map(a => (
                            <div key={a.name} className="breakdown-row">
                              <span>{a.name}</span><span>{formatINR(a.price)}</span>
                            </div>
                          ))}
                          <div className="breakdown-row">
                            <span>Subtotal</span><span>{formatINR(q.subtotal)}</span>
                          </div>
                          <div className="breakdown-row">
                            <span>GST (18%)</span><span>{formatINR(q.taxAmount)}</span>
                          </div>
                          <div className="breakdown-total">
                            <span>TOTAL</span><span>{formatINR(q.total)}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </>
  );
}