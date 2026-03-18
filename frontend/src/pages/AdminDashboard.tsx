import { useState, useEffect, useRef, useCallback } from "react";
import {
  LogOut, RefreshCw, CheckCircle, XCircle,
  HandshakeIcon, ChevronDown, ChevronUp,
  Users, Clock,
  FileText, Bell, BarChart2, Mail, Phone, Calendar,
  ShoppingBag,
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

interface UserRecord {
  _id: string;
  fullName: string;
  email: string;
  contact: string;
  createdAt: string;
  quoteCount: number;
  negCount: number;
  totalSpend: number;
}

interface UserDetail {
  user: UserRecord;
  quotes: Quotation[];
  negotiations: Negotiation[];
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

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ data, colors, labels }: { data: number[]; colors: string[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110, padding: '0 4px' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{v > 0 ? v : ''}</span>
          <div style={{
            width: '100%',
            height: `${Math.max((v / max) * 82, v > 0 ? 6 : 2)}%`,
            background: colors[i % colors.length],
            borderRadius: '5px 5px 3px 3px',
            transition: 'height 0.8s cubic-bezier(0.34,1.56,0.64,1)',
            minHeight: 3, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 60%)', borderRadius: '5px 5px 0 0' }}/>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.2 }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ pending, accepted, rejected, total }: Stats) {
  const size = 130; const sw = 15;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2; const cy = size / 2;
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
            strokeDashoffset={a.offset} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', marginTop: 2 }}>TOTAL</span>
      </div>
    </div>
  );
}

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [negotiations,  setNegotiations]  = useState<Negotiation[]>([]);
  const [quotations,    setQuotations]    = useState<Quotation[]>([]);
  const [usersList,     setUsersList]     = useState<UserRecord[]>([]);
  const [userDetail,    setUserDetail]    = useState<UserDetail | null>(null);
  const [userDetailId,  setUserDetailId]  = useState<string | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [stats,         setStats]         = useState<Stats | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [expanded,      setExpanded]      = useState<string | null>(null);
  const [responding,    setResponding]    = useState<string | null>(null);
  const [responseText,  setResponseText]  = useState<Record<string, string>>({});
  const [filter,        setFilter]        = useState<"all"|"pending"|"accepted"|"rejected">("all");
  const [activeTab,     setActiveTab]     = useState<"negotiations"|"quotations"|"users">("negotiations");
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
      const [nr, sr, qr, ur] = await Promise.allSettled([
        fetch(`${API}/admin/negotiations`, { headers: hdrs }).then(r => r.json()),
        fetch(`${API}/admin/stats`,        { headers: hdrs }).then(r => r.json()),
        fetch(`${API}/admin/quotations`,   { headers: hdrs }).then(r => r.json()),
        fetch(`${API}/admin/users`,        { headers: hdrs }).then(r => r.json()),
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
      if (ur.status === 'fulfilled' && Array.isArray(ur.value)) setUsersList(ur.value);
      setLastRefresh(new Date());
      setCountdown(30);
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { const t = setInterval(() => fetchAll(true), 30000); return () => clearInterval(t); }, [fetchAll]);
  useEffect(() => { const t = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000); return () => clearInterval(t); }, [lastRefresh]);

  const loadUserDetail = async (id: string) => {
    if (userDetailId === id) { setUserDetailId(null); setUserDetail(null); return; }
    setUserDetailId(id);
    setUserDetailLoading(true);
    try {
      const res = await fetch(`${API}/admin/users/${id}`, { headers: hdrs });
      const data = await res.json();
      setUserDetail(data);
    } catch { showToast('⚠️ Failed to load user details.'); }
    finally { setUserDetailLoading(false); }
  };

  const handleRespond = async (id: string, status: "accepted"|"rejected") => {
    setResponding(id);
    try {
      const res = await fetch(`${API}/admin/negotiations/${id}`, {
        method: 'PUT', headers: hdrs,
        body: JSON.stringify({ status, adminResponse: responseText[id] || '' }),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(status === 'accepted'
        ? '✅ Negotiation accepted! Email sent to customer.'
        : '❌ Negotiation rejected. Email sent to customer.');
      await fetchAll();
      setExpanded(null);
    } catch { showToast('⚠️ Failed to respond. Please try again.'); }
    finally { setResponding(null); }
  };

  const filtered = negotiations.filter(n => filter === 'all' || n.status === filter);

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return negotiations.filter(n => n.createdAt.slice(0,10) === d.toISOString().slice(0,10)).length;
  });
  const last7Labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return days[d.getDay() === 0 ? 6 : d.getDay() - 1];
  });

  const totalQuoteValue = quotations.reduce((s, q) => s + q.total, 0);
  const totalDiscounts  = negotiations.filter(n => n.status === 'accepted').reduce((s, n) => s + (n.originalTotal - n.offeredPrice), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideD  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes progbar { from{width:100%} to{width:0%} }
        @keyframes pulseG  { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 8px rgba(34,197,94,0)} }

        .dash-root { min-height:100vh; background:#07070c; color:#fff; font-family:'Outfit',sans-serif; }

        .dash-header {
          position:sticky; top:0; z-index:100; height:58px;
          background:rgba(7,7,12,0.88); backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(255,255,255,0.06);
          display:flex; align-items:center; justify-content:space-between; padding:0 22px;
        }
        .h-brand { display:flex; align-items:center; gap:11px; }
        .h-logo {
          width:34px; height:34px; border-radius:9px; overflow:hidden;
          border:1px solid rgba(234,88,12,0.28); background:rgba(234,88,12,0.08);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .h-logo img { width:26px; height:26px; object-fit:contain; border-radius:5px; }
        .h-title { font-size:14px; font-weight:700; letter-spacing:-0.01em; }
        .h-sub   { font-size:10px; color:rgba(255,255,255,0.3); }
        .h-right { display:flex; align-items:center; gap:8px; }
        .h-pill {
          display:flex; align-items:center; gap:5px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
          border-radius:8px; padding:5px 10px; font-size:11px; color:rgba(255,255,255,0.38);
        }
        .live-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; box-shadow:0 0 6px #22c55e; animation:pulseG 2s infinite; }
        .h-icon-btn {
          width:32px; height:32px; display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:8px; cursor:pointer; color:rgba(255,255,255,0.45); transition:all 0.2s;
        }
        .h-icon-btn:hover { color:#fff; border-color:rgba(255,255,255,0.15); }
        .logout-btn {
          display:flex; align-items:center; gap:5px; padding:6px 13px;
          background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.18);
          border-radius:8px; cursor:pointer; color:#f87171; font-size:12px; font-weight:600;
          font-family:'Outfit',sans-serif; transition:all 0.2s;
        }
        .logout-btn:hover { background:rgba(239,68,68,0.15); }

        .dash-body { max-width:1080px; margin:0 auto; padding:22px 18px; }

        .stat-grid {
          display:grid; grid-template-columns:repeat(6,1fr); gap:11px; margin-bottom:18px;
        }
        @media(max-width:900px) { .stat-grid{grid-template-columns:repeat(3,1fr)} }
        @media(max-width:520px) { .stat-grid{grid-template-columns:repeat(2,1fr)} }

        .stat-card {
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
          border-radius:14px; padding:14px 14px 12px;
          transition:all 0.2s; animation:fadeIn 0.5s ease both;
        }
        .stat-card:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.15); transform:translateY(-3px); box-shadow:0 12px 36px rgba(0,0,0,0.32); }
        .sc-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
        .sc-val  { font-size:24px; font-weight:800; line-height:1; margin-bottom:3px; }
        .sc-lbl  { font-size:11px; color:rgba(255,255,255,0.33); font-weight:500; }

        .charts-row { display:grid; grid-template-columns:1fr 1fr; gap:13px; margin-bottom:18px; }
        @media(max-width:700px) { .charts-row{grid-template-columns:1fr} }

        .chart-card {
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
          border-radius:14px; padding:18px 18px 14px;
        }
        .chart-title {
          font-size:11px; font-weight:700; color:rgba(255,255,255,0.33);
          letter-spacing:0.09em; text-transform:uppercase; margin-bottom:14px;
          display:flex; align-items:center; gap:7px;
        }

        .tab-bar { display:flex; align-items:center; gap:7px; margin-bottom:14px; flex-wrap:wrap; }
        .tab-btn { padding:7px 16px; border-radius:8px; font-size:12px; font-weight:600; border:none; cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.2s; }
        .tab-btn.active { background:linear-gradient(135deg,#ea580c,#c2410c); color:#fff; box-shadow:0 3px 12px rgba(234,88,12,0.28); }
        .tab-btn.inactive { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); color:rgba(255,255,255,0.4); }
        .tab-btn.inactive:hover { color:rgba(255,255,255,0.7); }
        .tab-time { margin-left:auto; font-size:11px; color:rgba(255,255,255,0.2); }

        .filter-bar { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
        .flt-btn { padding:5px 12px; border-radius:7px; font-size:11px; font-weight:600; cursor:pointer; border:none; font-family:'Outfit',sans-serif; text-transform:capitalize; transition:all 0.2s; }

        .neg-card {
          background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
          border-radius:13px; overflow:hidden; animation:fadeIn 0.35s ease both;
          transition:border-color 0.2s; margin-bottom:9px;
        }
        .neg-card:hover { border-color:rgba(255,255,255,0.1); }
        .card-btn {
          width:100%; display:flex; align-items:center; justify-content:space-between;
          padding:14px 16px; background:none; border:none; cursor:pointer;
          color:#fff; text-align:left; transition:background 0.2s;
        }
        .card-btn:hover { background:rgba(255,255,255,0.02); }

        .exp-section {
          border-top:1px solid rgba(255,255,255,0.06); padding:16px;
          display:flex; flex-direction:column; gap:14px; animation:slideD 0.2s ease;
        }
        .exp-label { font-size:10px; font-weight:700; color:rgba(255,255,255,0.28); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:7px; }
        .info-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:7px; }
        .info-cell { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:9px; padding:9px 11px; }
        .info-cell-lbl { font-size:9px; color:rgba(255,255,255,0.27); letter-spacing:0.06em; margin-bottom:3px; }
        .info-cell-val { font-size:12px; font-weight:600; color:#e2e8f0; }

        .breakdown-row { display:flex; justify-content:space-between; align-items:center; padding:8px 13px; font-size:12px; color:rgba(255,255,255,0.55); border-bottom:1px solid rgba(255,255,255,0.04); }
        .breakdown-row:last-child { border-bottom:none; }
        .breakdown-total { display:flex; justify-content:space-between; align-items:center; padding:10px 13px; font-size:14px; font-weight:800; color:#818cf8; }

        .resp-btns { display:flex; gap:9px; }
        .resp-btn {
          flex:1; padding:10px; border-radius:10px; border:none; cursor:pointer;
          font-weight:700; font-size:13px; font-family:'Outfit',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s;
        }
        .resp-btn:not(:disabled):hover { filter:brightness(1.12); transform:translateY(-1px); }
        .resp-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .resp-textarea {
          width:100%; padding:10px 13px; background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.09); border-radius:10px; color:#fff;
          font-size:12px; font-family:'Outfit',sans-serif; resize:none; outline:none;
          transition:border-color 0.2s; margin-bottom:9px;
        }
        .resp-textarea:focus { border-color:rgba(234,88,12,0.45); }
        .resp-textarea::placeholder { color:rgba(255,255,255,0.2); }

        .s-badge { font-size:10px; font-weight:700; padding:3px 9px; border-radius:999px; border:1px solid; letter-spacing:0.04em; text-transform:uppercase; }

        /* ── USER CARDS ── */
        .user-card {
          background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.07);
          border-radius:13px; overflow:hidden; margin-bottom:9px;
          animation:fadeIn 0.35s ease both; transition:border-color 0.2s;
        }
        .user-card:hover { border-color:rgba(255,255,255,0.1); }
        .user-avatar {
          width:40px; height:40px; border-radius:11px; flex-shrink:0;
          background:linear-gradient(135deg,rgba(52,211,153,0.2),rgba(52,211,153,0.08));
          border:1px solid rgba(52,211,153,0.18);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; font-weight:800; color:#34d399;
        }
        .user-stat-pill {
          display:inline-flex; align-items:center; gap:4px;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          border-radius:7px; padding:4px 9px; font-size:11px; color:rgba(255,255,255,0.5);
        }

        .toast {
          position:fixed; top:18px; right:18px; z-index:9999;
          background:rgba(10,10,18,0.97); border:1px solid rgba(234,88,12,0.32);
          border-radius:12px; padding:12px 16px; font-size:13px; font-weight:500; color:#fff;
          box-shadow:0 14px 40px rgba(0,0,0,0.5); animation:toastIn 0.3s ease;
          display:flex; align-items:center; gap:9px; max-width:290px; backdrop-filter:blur(20px); overflow:hidden;
        }
        .toast-bar { position:absolute; bottom:0; left:0; height:2px; background:linear-gradient(90deg,#ea580c,#fb923c); animation:progbar 3.5s linear forwards; }

        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.09); border-radius:999px; }
      `}</style>

      <div className="dash-root">

        {/* Toast */}
        {toast && (
          <div className="toast">
            <Bell size={14} color="#ea580c"/>
            {toast}
            <div className="toast-bar"/>
          </div>
        )}

        {/* Header */}
        <header className="dash-header">
          <div className="h-brand">
            <div className="h-logo">
              <img src="/img/logo1.JPG" alt="Logo"
                onError={e => {
                  e.currentTarget.style.display='none';
                  (e.currentTarget.parentElement as HTMLElement).innerHTML=`<span style="font-weight:900;color:#ea580c;font-size:13px">M</span>`;
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
            <button className="h-icon-btn" onClick={() => fetchAll()} title="Refresh">
              <RefreshCw size={14} style={loading ? {animation:'spin 1s linear infinite'} : {}}/>
            </button>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={13}/> Logout
            </button>
          </div>
        </header>

        <div className="dash-body">

          {/* Stat cards */}
          {stats && (
            <div className="stat-grid">
              {[
                {label:'Negotiations', val:stats.total,        color:'#fff',    bg:'rgba(255,255,255,0.08)', icon:<HandshakeIcon size={15}/>, delay:0,    tab:'negotiations' as const, filterVal: 'all'      },
                {label:'Pending',      val:stats.pending,      color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  icon:<Clock size={15}/>,         delay:0.05, tab:'negotiations' as const, filterVal: 'pending'  },
                {label:'Accepted',     val:stats.accepted,     color:'#22c55e', bg:'rgba(34,197,94,0.12)',   icon:<CheckCircle size={15}/>,   delay:0.1,  tab:'negotiations' as const, filterVal: 'accepted' },
                {label:'Rejected',     val:stats.rejected,     color:'#ef4444', bg:'rgba(239,68,68,0.12)',   icon:<XCircle size={15}/>,       delay:0.15, tab:'negotiations' as const, filterVal: 'rejected' },
                {label:'Quotations',   val:quotations.length,  color:'#818cf8', bg:'rgba(129,140,248,0.12)', icon:<FileText size={15}/>,      delay:0.2,  tab:'quotations'   as const, filterVal: 'all'      },
                {label:'Users',        val:usersList.length,   color:'#34d399', bg:'rgba(52,211,153,0.12)',  icon:<Users size={15}/>,         delay:0.25, tab:'users'        as const, filterVal: 'all'      },
              ].map((s,i) => (
                <div
                  key={i}
                  className="stat-card"
                  style={{animationDelay:`${s.delay}s`, cursor:'pointer'}}
                  onClick={() => {
                    setActiveTab(s.tab);
                    if (s.tab === 'negotiations') setFilter(s.filterVal as any);
                    // scroll to tab bar
                    setTimeout(() => {
                      document.querySelector('.tab-bar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }}
                >
                  <div className="sc-icon" style={{background:s.bg,color:s.color}}>{s.icon}</div>
                  <div className="sc-val"  style={{color:s.color}}>{s.val}</div>
                  <div className="sc-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Charts — dynamic based on active tab */}
          {stats && (
            <div className="charts-row">

              {/* LEFT chart */}
              <div className="chart-card">
                {activeTab === 'negotiations' && (
                  <>
                    <div className="chart-title"><BarChart2 size={12}/> Negotiations — Last 7 Days</div>
                    <BarChart data={last7} labels={last7Labels}
                      colors={['#ea580c','#fb923c','#ea580c','#fb923c','#ea580c','#fb923c','#ea580c']}
                    />
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:11,color:'rgba(255,255,255,0.22)'}}>
                      <span>Total: {negotiations.length}</span>
                      <span>Peak: {Math.max(...last7)}</span>
                    </div>
                  </>
                )}
                {activeTab === 'quotations' && (
                  <>
                    <div className="chart-title"><BarChart2 size={12}/> Quotations — Last 7 Days</div>
                    <BarChart
                      data={Array.from({length:7},(_,i)=>{
                        const d=new Date(); d.setDate(d.getDate()-(6-i));
                        return quotations.filter(q=>q.createdAt.slice(0,10)===d.toISOString().slice(0,10)).length;
                      })}
                      labels={last7Labels}
                      colors={['#818cf8','#a78bfa','#818cf8','#a78bfa','#818cf8','#a78bfa','#818cf8']}
                    />
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:11,color:'rgba(255,255,255,0.22)'}}>
                      <span>Total: {quotations.length}</span>
                      <span>Value: {formatINR(totalQuoteValue)}</span>
                    </div>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    <div className="chart-title"><BarChart2 size={12}/> User Registrations — Last 7 Days</div>
                    <BarChart
                      data={Array.from({length:7},(_,i)=>{
                        const d=new Date(); d.setDate(d.getDate()-(6-i));
                        return usersList.filter(u=>u.createdAt.slice(0,10)===d.toISOString().slice(0,10)).length;
                      })}
                      labels={last7Labels}
                      colors={['#34d399','#6ee7b7','#34d399','#6ee7b7','#34d399','#6ee7b7','#34d399']}
                    />
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:11,color:'rgba(255,255,255,0.22)'}}>
                      <span>Total Users: {usersList.length}</span>
                      <span>Active: {usersList.filter(u=>u.negCount>0).length}</span>
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT chart */}
              <div className="chart-card">
                {activeTab === 'negotiations' && (
                  <>
                    <div className="chart-title"><HandshakeIcon size={12}/> Negotiation Status</div>
                    <div style={{display:'flex',alignItems:'center',gap:18,marginBottom:14}}>
                      <DonutChart {...stats}/>
                      <div style={{display:'flex',flexDirection:'column',gap:9,flex:1}}>
                        {[
                          {label:'Accepted',val:stats.accepted,color:'#22c55e'},
                          {label:'Pending', val:stats.pending, color:'#f59e0b'},
                          {label:'Rejected',val:stats.rejected,color:'#ef4444'},
                        ].map(s => (
                          <div key={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                            <div style={{display:'flex',alignItems:'center',gap:7}}>
                              <div style={{width:7,height:7,borderRadius:'50%',background:s.color,boxShadow:`0 0 5px ${s.color}`}}/>
                              <span style={{fontSize:11,color:'rgba(255,255,255,0.45)'}}>{s.label}</span>
                            </div>
                            <span style={{fontSize:13,fontWeight:700,color:s.color}}>{s.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:10}}>
                      {[
                        {label:'Total Quote Value', val:formatINR(totalQuoteValue), color:'#818cf8'},
                        {label:'Discounts Given',   val:formatINR(totalDiscounts),  color:'#f59e0b'},
                      ].map(r => (
                        <div key={r.label} style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                          <span style={{color:'rgba(255,255,255,0.35)'}}>{r.label}</span>
                          <span style={{fontWeight:700,color:r.color}}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'quotations' && (
                  <>
                    <div className="chart-title"><FileText size={12}/> Quotation Summary</div>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {/* Top container sizes */}
                      {['10ft * 10ft','15ft * 10ft','20ft * 10ft','40ft * 10ft'].map(size => {
                        const cnt = quotations.filter(q=>q.containerSize===size).length;
                        const pct = quotations.length > 0 ? (cnt/quotations.length)*100 : 0;
                        return (
                          <div key={size}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}>
                              <span style={{color:'rgba(255,255,255,0.5)'}}>{size}</span>
                              <span style={{color:'#818cf8',fontWeight:700}}>{cnt}</span>
                            </div>
                            <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:999,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#818cf8,#a78bfa)',borderRadius:999,transition:'width 0.8s ease'}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:10,marginTop:14}}>
                      {[
                        {label:'Total Quote Value', val:formatINR(totalQuoteValue),                                             color:'#818cf8'},
                        {label:'Avg Quote Value',   val:formatINR(quotations.length>0?Math.round(totalQuoteValue/quotations.length):0), color:'#a78bfa'},
                      ].map(r => (
                        <div key={r.label} style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                          <span style={{color:'rgba(255,255,255,0.35)'}}>{r.label}</span>
                          <span style={{fontWeight:700,color:r.color}}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    <div className="chart-title"><Users size={12}/> User Activity</div>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {[
                        {label:'With Quotes',        val:usersList.filter(u=>u.quoteCount>0).length,  color:'#818cf8', total:usersList.length},
                        {label:'With Negotiations',  val:usersList.filter(u=>u.negCount>0).length,    color:'#f59e0b', total:usersList.length},
                        {label:'No Activity',        val:usersList.filter(u=>u.quoteCount===0).length,color:'rgba(255,255,255,0.3)', total:usersList.length},
                      ].map(r => {
                        const pct = usersList.length > 0 ? (r.val/usersList.length)*100 : 0;
                        return (
                          <div key={r.label}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}>
                              <span style={{color:'rgba(255,255,255,0.5)'}}>{r.label}</span>
                              <span style={{color:r.color,fontWeight:700}}>{r.val}</span>
                            </div>
                            <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:999,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${pct}%`,background:r.color,borderRadius:999,transition:'width 0.8s ease'}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:10,marginTop:14}}>
                      {[
                        {label:'Total Revenue',    val:formatINR(usersList.reduce((s,u)=>s+u.totalSpend,0)), color:'#34d399'},
                        {label:'Avg Spend / User', val:formatINR(usersList.length>0?Math.round(usersList.reduce((s,u)=>s+u.totalSpend,0)/usersList.length):0), color:'#6ee7b7'},
                      ].map(r => (
                        <div key={r.label} style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                          <span style={{color:'rgba(255,255,255,0.35)'}}>{r.label}</span>
                          <span style={{fontWeight:700,color:r.color}}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

          {/* Tabs */}
          <div className="tab-bar">
            {([
              {key:'negotiations', label:`Negotiations (${negotiations.length})`},
              {key:'quotations',   label:`Quotations (${quotations.length})`},
              {key:'users',        label:`Users (${usersList.length})`},
            ] as const).map(t => (
              <button key={t.key} className={`tab-btn ${activeTab===t.key?'active':'inactive'}`}
                onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
            <span className="tab-time">
              {lastRefresh.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
            </span>
          </div>

          {/* ── NEGOTIATIONS TAB ── */}
          {activeTab === 'negotiations' && (
            <>
              <div className="filter-bar">
                {(['all','pending','accepted','rejected'] as const).map(f => {
                  const cnt = f==='all' ? negotiations.length : negotiations.filter(n=>n.status===f).length;
                  const c: Record<string,{bg:string,color:string,border:string}> = {
                    all:      {bg:'rgba(234,88,12,0.1)',  color:'#fb923c',border:'rgba(234,88,12,0.28)'},
                    pending:  {bg:'rgba(245,158,11,0.1)', color:'#f59e0b',border:'rgba(245,158,11,0.28)'},
                    accepted: {bg:'rgba(34,197,94,0.1)',  color:'#22c55e',border:'rgba(34,197,94,0.28)'},
                    rejected: {bg:'rgba(239,68,68,0.1)',  color:'#ef4444',border:'rgba(239,68,68,0.28)'},
                  };
                  const active = filter===f;
                  return (
                    <button key={f} className="flt-btn" onClick={() => setFilter(f)} style={{
                      background:active?c[f].bg:'rgba(255,255,255,0.04)',
                      color:active?c[f].color:'rgba(255,255,255,0.32)',
                      border:`1px solid ${active?c[f].border:'rgba(255,255,255,0.07)'}`,
                    }}>
                      {f==='all'?`All (${cnt})`:`${f.charAt(0).toUpperCase()+f.slice(1)} (${cnt})`}
                    </button>
                  );
                })}
              </div>

              {loading && <div style={{display:'flex',justifyContent:'center',padding:'44px 0'}}><RefreshCw size={24} style={{color:'#ea580c',animation:'spin 1s linear infinite'}}/></div>}
              {!loading && filtered.length===0 && (
                <div style={{textAlign:'center',padding:'44px 0',color:'rgba(255,255,255,0.18)'}}>
                  <HandshakeIcon size={34} style={{margin:'0 auto 9px',opacity:0.2}}/>
                  <p style={{fontSize:13}}>No {filter==='all'?'':filter} negotiations</p>
                </div>
              )}

              {filtered.map((neg,idx) => {
                const sm: Record<string,{bg:string,color:string,border:string}> = {
                  pending:  {bg:'rgba(245,158,11,0.1)', color:'#f59e0b',border:'rgba(245,158,11,0.28)'},
                  accepted: {bg:'rgba(34,197,94,0.1)',  color:'#22c55e',border:'rgba(34,197,94,0.28)'},
                  rejected: {bg:'rgba(239,68,68,0.1)',  color:'#ef4444',border:'rgba(239,68,68,0.28)'},
                };
                const sc = sm[neg.status];
                return (
                  <div key={neg._id} className="neg-card" style={{animationDelay:`${idx*0.04}s`}}>
                    <button className="card-btn" onClick={() => setExpanded(expanded===neg._id?null:neg._id)}>
                      <div style={{display:'flex',alignItems:'center',gap:11,minWidth:0}}>
                        <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:'rgba(234,88,12,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <HandshakeIcon size={16} color="#ea580c"/>
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{neg.quoteNumber}</div>
                          <div style={{fontSize:11,color:'rgba(255,255,255,0.42)'}}>{neg.userName} · {neg.userEmail}</div>
                          {neg.userContact && <div style={{fontSize:10,color:'rgba(255,255,255,0.26)'}}>{neg.userContact}</div>}
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:11,color:'rgba(255,255,255,0.28)',textDecoration:'line-through'}}>{formatINR(neg.originalTotal)}</div>
                          <div style={{fontSize:13,fontWeight:700,color:'#22c55e'}}>{formatINR(neg.offeredPrice)}</div>
                        </div>
                        <span className="s-badge" style={{background:sc.bg,color:sc.color,borderColor:sc.border}}>{neg.status}</span>
                        <span style={{color:'rgba(255,255,255,0.25)'}}>{expanded===neg._id?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</span>
                      </div>
                    </button>

                    {expanded===neg._id && (
                      <div className="exp-section">
                        <div className="info-grid">
                          {[
                            {label:'Original',  val:formatINR(neg.originalTotal),  color:'#fff'},
                            {label:'Offered',   val:formatINR(neg.offeredPrice),   color:'#22c55e'},
                            {label:'Discount',  val:`${(((neg.originalTotal-neg.offeredPrice)/neg.originalTotal)*100).toFixed(1)}%`, color:'#f59e0b'},
                            {label:'Date',      val:new Date(neg.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}), color:'rgba(255,255,255,0.5)'},
                          ].map(c => (
                            <div key={c.label} className="info-cell">
                              <div className="info-cell-lbl">{c.label}</div>
                              <div className="info-cell-val" style={{color:c.color}}>{c.val}</div>
                            </div>
                          ))}
                        </div>

                        {neg.quotationId && (
                          <div>
                            <div className="exp-label">📦 Quotation Info</div>
                            <div className="info-grid">
                              {[
                                {label:'Size',    val:neg.quotationId.containerSize},
                                {label:'Material',val:neg.quotationId.materialType},
                                {label:'Qty',     val:String(neg.quotationId.quantity)},
                              ].map(c => (
                                <div key={c.label} className="info-cell" style={{border:'1px solid rgba(129,140,248,0.12)'}}>
                                  <div className="info-cell-lbl">{c.label}</div>
                                  <div className="info-cell-val" style={{color:'#c7d2fe'}}>{c.val}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="exp-label">💬 Customer Message</div>
                          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:9,padding:'10px 13px',fontSize:13,color:'rgba(255,255,255,0.72)',lineHeight:1.6}}>
                            {neg.message}
                          </div>
                        </div>

                        {neg.status==='pending' ? (
                          <div>
                            <div className="exp-label">✍️ Respond</div>
                            <textarea value={responseText[neg._id]||''} onChange={e=>setResponseText(p=>({...p,[neg._id]:e.target.value}))}
                              placeholder="Optional response message…" rows={2} className="resp-textarea"/>
                            <div className="resp-btns">
                              <button className="resp-btn" style={{background:'linear-gradient(135deg,#16a34a,#15803d)',color:'#fff'}}
                                onClick={() => handleRespond(neg._id,'accepted')} disabled={responding===neg._id}>
                                {responding===neg._id?<RefreshCw size={13} style={{animation:'spin 1s linear infinite'}}/>:<CheckCircle size={13}/>} Accept
                              </button>
                              <button className="resp-btn" style={{background:'linear-gradient(135deg,#dc2626,#b91c1c)',color:'#fff'}}
                                onClick={() => handleRespond(neg._id,'rejected')} disabled={responding===neg._id}>
                                {responding===neg._id?<RefreshCw size={13} style={{animation:'spin 1s linear infinite'}}/>:<XCircle size={13}/>} Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          neg.adminResponse && (
                            <div>
                              <div className="exp-label">📩 Your Response</div>
                              <div style={{background:neg.status==='accepted'?'rgba(34,197,94,0.07)':'rgba(239,68,68,0.07)',border:`1px solid ${neg.status==='accepted'?'rgba(34,197,94,0.18)':'rgba(239,68,68,0.18)'}`,borderRadius:9,padding:'10px 13px',fontSize:13,color:'rgba(255,255,255,0.68)'}}>
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
          {activeTab==='quotations' && (
            <>
              {loading && <div style={{display:'flex',justifyContent:'center',padding:'44px 0'}}><RefreshCw size={24} style={{color:'#ea580c',animation:'spin 1s linear infinite'}}/></div>}
              {!loading && quotations.length===0 && (
                <div style={{textAlign:'center',padding:'44px 0',color:'rgba(255,255,255,0.18)'}}>
                  <FileText size={34} style={{margin:'0 auto 9px',opacity:0.2}}/>
                  <p style={{fontSize:13}}>No quotations yet</p>
                </div>
              )}
              {quotations.map((q,idx) => (
                <div key={q._id} className="neg-card" style={{animationDelay:`${idx*0.04}s`}}>
                  <button className="card-btn" onClick={() => setExpanded(expanded===q._id?null:q._id)}>
                    <div style={{display:'flex',alignItems:'center',gap:11,minWidth:0}}>
                      <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:'linear-gradient(135deg,rgba(129,140,248,0.2),rgba(129,140,248,0.07))',border:'1px solid rgba(129,140,248,0.14)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#818cf8'}}>
                        {q.userName?.charAt(0)?.toUpperCase()??"U"}
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{q.quoteNumber}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.42)'}}>👤 {q.userName} {q.userContact && `· 📞 ${q.userContact}`}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.28)'}}>{q.containerSize} · {q.materialType} · Qty {q.quantity}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:800,fontSize:13,color:'#818cf8'}}>{formatINR(q.total)}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.26)'}}>{new Date(q.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                      </div>
                      <span style={{color:'rgba(255,255,255,0.25)'}}>{expanded===q._id?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</span>
                    </div>
                  </button>

                  {expanded===q._id && (
                    <div className="exp-section">
                      <div>
                        <div className="exp-label">👤 Customer</div>
                        <div className="info-grid">
                          {[{label:'Name',val:q.userName??'—',color:'#c7d2fe'},{label:'Contact',val:q.userContact??'—',color:'#c7d2fe'}].map(c => (
                            <div key={c.label} className="info-cell" style={{border:'1px solid rgba(129,140,248,0.12)'}}>
                              <div className="info-cell-lbl">{c.label}</div>
                              <div className="info-cell-val" style={{color:c.color}}>{c.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="exp-label">📦 Details</div>
                        <div className="info-grid">
                          {[
                            {label:'Quote No.',val:q.quoteNumber},
                            {label:'Size',     val:q.containerSize},
                            {label:'Material', val:q.materialType},
                            {label:'Qty',      val:`${q.quantity} unit${q.quantity>1?'s':''}`},
                            {label:'Unit Price',val:formatINR(q.unitPrice)},
                            {label:'Created',  val:new Date(q.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})},
                          ].map(c => (
                            <div key={c.label} className="info-cell">
                              <div className="info-cell-lbl">{c.label}</div>
                              <div className="info-cell-val">{c.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {q.addons && q.addons.length>0 && (
                        <div>
                          <div className="exp-label">✨ Add-ons</div>
                          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:9,overflow:'hidden'}}>
                            {q.addons.map((a,i) => (
                              <div key={a.name} style={{display:'flex',justifyContent:'space-between',padding:'8px 13px',borderBottom:i<q.addons!.length-1?'1px solid rgba(255,255,255,0.04)':'none',fontSize:12}}>
                                <span style={{color:'rgba(255,255,255,0.6)'}}>{a.name}</span>
                                <span style={{fontWeight:700,color:'#fb923c'}}>{formatINR(a.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(q.containerSizeNote||q.materialTypeNote||q.addonsNote) && (
                        <div>
                          <div className="exp-label">📝 Requirements</div>
                          {[{label:'Container',val:q.containerSizeNote},{label:'Material',val:q.materialTypeNote},{label:'Add-ons',val:q.addonsNote}].filter(n=>n.val).map(n => (
                            <div key={n.label} className="info-cell" style={{marginBottom:6}}>
                              <div className="info-cell-lbl">{n.label}</div>
                              <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',marginTop:3}}>{n.val}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div>
                        <div className="exp-label">💰 Breakdown</div>
                        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:9,overflow:'hidden'}}>
                          <div className="breakdown-row"><span>Base × {q.quantity}</span><span>{formatINR(q.unitPrice*q.quantity)}</span></div>
                          {q.addons?.map(a => <div key={a.name} className="breakdown-row"><span>{a.name}</span><span>{formatINR(a.price)}</span></div>)}
                          <div className="breakdown-row"><span>Subtotal</span><span>{formatINR(q.subtotal)}</span></div>
                          <div className="breakdown-row"><span>GST 18%</span><span>{formatINR(q.taxAmount)}</span></div>
                          <div className="breakdown-total"><span>TOTAL</span><span>{formatINR(q.total)}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── USERS TAB ── */}
          {activeTab==='users' && (
            <>
              {loading && <div style={{display:'flex',justifyContent:'center',padding:'44px 0'}}><RefreshCw size={24} style={{color:'#ea580c',animation:'spin 1s linear infinite'}}/></div>}
              {!loading && usersList.length===0 && (
                <div style={{textAlign:'center',padding:'44px 0',color:'rgba(255,255,255,0.18)'}}>
                  <Users size={34} style={{margin:'0 auto 9px',opacity:0.2}}/>
                  <p style={{fontSize:13}}>No users registered yet</p>
                </div>
              )}

              {/* Users summary row */}
              {!loading && usersList.length>0 && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:11,marginBottom:16}}>
                  {[
                    {label:'Total Users',    val:usersList.length,                                                               color:'#34d399'},
                    {label:'Total Quotes',   val:usersList.reduce((s,u)=>s+u.quoteCount,0),                                     color:'#818cf8'},
                    {label:'Total Revenue',  val:formatINR(usersList.reduce((s,u)=>s+u.totalSpend,0)),                          color:'#fb923c'},
                    {label:'Active (Negs)',  val:usersList.filter(u=>u.negCount>0).length,                                      color:'#f59e0b'},
                  ].map(s => (
                    <div key={s.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'12px 14px'}}>
                      <div style={{fontSize:18,fontWeight:800,color:s.color,marginBottom:3}}>{s.val}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.32)'}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {usersList.map((u,idx) => (
                <div key={u._id} className="user-card" style={{animationDelay:`${idx*0.04}s`}}>
                  <button className="card-btn" onClick={() => loadUserDetail(u._id)}>
                    <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
                      <div className="user-avatar">{u.fullName?.charAt(0)?.toUpperCase()??"U"}</div>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{u.fullName}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.42)',display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                          <span style={{display:'flex',alignItems:'center',gap:3}}><Mail size={10}/>{u.email}</span>
                          {u.contact && <span style={{display:'flex',alignItems:'center',gap:3}}><Phone size={10}/>{u.contact}</span>}
                        </div>
                        <div style={{marginTop:5,display:'flex',gap:5,flexWrap:'wrap'}}>
                          <span className="user-stat-pill"><FileText size={10}/>{u.quoteCount} quote{u.quoteCount!==1?'s':''}</span>
                          <span className="user-stat-pill"><HandshakeIcon size={10}/>{u.negCount} neg{u.negCount!==1?'s':''}</span>
                          <span className="user-stat-pill" style={{color:'#fb923c'}}><ShoppingBag size={10}/>{formatINR(u.totalSpend)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:12,fontWeight:700,color:'#34d399'}}>{formatINR(u.totalSpend)}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,0.25)',display:'flex',alignItems:'center',gap:3,justifyContent:'flex-end'}}>
                          <Calendar size={9}/>
                          {new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </div>
                      </div>
                      <span style={{color:'rgba(255,255,255,0.25)'}}>
                        {userDetailId===u._id?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
                      </span>
                    </div>
                  </button>

                  {/* User detail expanded */}
                  {userDetailId===u._id && (
                    <div className="exp-section">
                      {userDetailLoading && (
                        <div style={{display:'flex',justifyContent:'center',padding:'20px 0'}}>
                          <RefreshCw size={20} style={{color:'#ea580c',animation:'spin 1s linear infinite'}}/>
                        </div>
                      )}
                      {!userDetailLoading && userDetail && (
                        <>
                          {/* Account info */}
                          <div>
                            <div className="exp-label">👤 Account Details</div>
                            <div className="info-grid">
                              {[
                                {label:'Full Name', val:userDetail.user.fullName,  color:'#34d399'},
                                {label:'Email',     val:userDetail.user.email,     color:'rgba(255,255,255,0.7)'},
                                {label:'Contact',   val:userDetail.user.contact||'—', color:'rgba(255,255,255,0.7)'},
                                {label:'Joined',    val:new Date(userDetail.user.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}), color:'rgba(255,255,255,0.5)'},
                              ].map(c => (
                                <div key={c.label} className="info-cell" style={{border:'1px solid rgba(52,211,153,0.1)'}}>
                                  <div className="info-cell-lbl">{c.label}</div>
                                  <div className="info-cell-val" style={{color:c.color}}>{c.val}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Their quotes */}
                          {userDetail.quotes.length>0 && (
                            <div>
                              <div className="exp-label">📦 Quotations ({userDetail.quotes.length})</div>
                              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                {userDetail.quotes.map(q => (
                                  <div key={q._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:9,padding:'9px 13px'}}>
                                    <div>
                                      <div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{q.quoteNumber}</div>
                                      <div style={{fontSize:10,color:'rgba(255,255,255,0.38)'}}>{q.containerSize} · {q.materialType} · Qty {q.quantity}</div>
                                    </div>
                                    <div style={{textAlign:'right'}}>
                                      <div style={{fontSize:13,fontWeight:700,color:'#818cf8'}}>{formatINR(q.total)}</div>
                                      <div style={{fontSize:10,color:'rgba(255,255,255,0.28)'}}>{new Date(q.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Their negotiations */}
                          {userDetail.negotiations.length>0 && (
                            <div>
                              <div className="exp-label">🤝 Negotiations ({userDetail.negotiations.length})</div>
                              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                {userDetail.negotiations.map(n => {
                                  const sc: Record<string,string> = {pending:'#f59e0b',accepted:'#22c55e',rejected:'#ef4444'};
                                  return (
                                    <div key={n._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:9,padding:'9px 13px'}}>
                                      <div>
                                        <div style={{fontSize:12,fontWeight:600,color:'#fff'}}>{n.quoteNumber}</div>
                                        <div style={{fontSize:10,color:'rgba(255,255,255,0.38)'}}>
                                          {formatINR(n.originalTotal)} → <span style={{color:'#22c55e'}}>{formatINR(n.offeredPrice)}</span>
                                        </div>
                                      </div>
                                      <span className="s-badge" style={{background:`${sc[n.status]}20`,color:sc[n.status],borderColor:`${sc[n.status]}40`}}>
                                        {n.status}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
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