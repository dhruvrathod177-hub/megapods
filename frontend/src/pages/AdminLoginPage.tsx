import { useState } from "react";
import { ShieldCheck, RefreshCw, Eye, EyeOff } from "lucide-react";

interface AdminLoginPageProps {
  onLogin: (token: string, admin: { email: string; name: string }) => void;
}

const API = import.meta.env.VITE_API_URL || "https://megapods.onrender.com/api";

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Both fields are required"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      onLogin(data.token, data.admin);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes orb1     { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.1)} }
        @keyframes orb2     { 0%,100%{transform:translate(0,0)} 40%{transform:translate(-30px,25px)} 70%{transform:translate(18px,-18px)} }
        @keyframes orb3     { 0%,100%{transform:translate(0,0)} 60%{transform:translate(22px,32px)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes shimmer  { 0%{background-position:-400% center} 100%{background-position:400% center} }
        @keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(234,88,12,0.35),0 0 0 0 rgba(234,88,12,0.15)} 50%{box-shadow:0 0 0 10px rgba(234,88,12,0),0 0 0 20px rgba(234,88,12,0)} }
        @keyframes gridpulse { 0%,100%{opacity:0.025} 50%{opacity:0.055} }
        @keyframes scan     { 0%{top:0%} 100%{top:100%} }
        @keyframes float-logo { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }

        .alp-page {
          min-height: 100vh;
          background: #06060b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }

        /* ── BG effects ── */
        .alp-orb1 {
          position: absolute; top: -10%; left: -10%;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 60%);
          filter: blur(80px);
          animation: orb1 18s ease-in-out infinite;
          pointer-events: none;
        }
        .alp-orb2 {
          position: absolute; bottom: -15%; right: -10%;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(194,65,12,0.1) 0%, transparent 60%);
          filter: blur(70px);
          animation: orb2 22s ease-in-out infinite;
          pointer-events: none;
        }
        .alp-orb3 {
          position: absolute; top: 40%; right: 15%;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 60%);
          filter: blur(50px);
          animation: orb3 14s ease-in-out infinite;
          pointer-events: none;
        }
        .alp-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
          background-size: 56px 56px;
          animation: gridpulse 6s ease-in-out infinite;
        }
        .alp-scan {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(234,88,12,0.08), transparent);
          animation: scan 10s linear infinite;
          pointer-events: none;
        }

        /* ── Card ── */
        .alp-card {
          position: relative; z-index: 2;
          width: 100%; max-width: 420px;
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* ── Logo ── */
        .alp-logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 36px;
        }
        .alp-logo-ring {
          width: 96px; height: 96px;
          border-radius: 28px;
          background: linear-gradient(145deg, rgba(234,88,12,0.15), rgba(154,52,18,0.07));
          border: 1px solid rgba(234,88,12,0.25);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
          animation: pulse-ring 4s ease-in-out infinite, float-logo 6s ease-in-out infinite;
          box-shadow: 0 0 40px rgba(234,88,12,0.08);
        }
        .alp-logo-ring img {
          width: 66px; height: 66px;
          object-fit: contain; border-radius: 18px;
        }
        .alp-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(234,88,12,0.08);
          border: 1px solid rgba(234,88,12,0.2);
          border-radius: 999px;
          padding: 5px 16px;
          margin-bottom: 16px;
        }
        .alp-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #ea580c;
          box-shadow: 0 0 8px #ea580c;
        }
        .alp-badge span {
          font-size: 10px; font-weight: 700;
          color: #fb923c; letter-spacing: 0.12em; text-transform: uppercase;
        }
        .alp-title {
          font-size: 34px; font-weight: 900;
          color: #fff; letter-spacing: -0.04em;
          text-align: center; line-height: 1; margin-bottom: 8px;
        }
        .alp-title span { color: #ea580c; }
        .alp-sub {
          font-size: 13px; color: rgba(255,255,255,0.25);
          text-align: center; letter-spacing: 0.01em;
        }

        /* ── Form panel ── */
        .alp-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px;
          padding: 30px 28px 26px;
          backdrop-filter: blur(24px);
          box-shadow:
            0 32px 80px rgba(0,0,0,0.6),
            0 0 0 1px rgba(255,255,255,0.025) inset,
            0 1px 0 rgba(255,255,255,0.06) inset;
        }

        /* top accent line */
        .alp-panel::before {
          content: '';
          display: block;
          height: 2px;
          margin: -30px -28px 26px;
          border-radius: 22px 22px 0 0;
          background: linear-gradient(90deg, transparent, rgba(234,88,12,0.6), rgba(251,146,60,0.8), rgba(234,88,12,0.6), transparent);
        }

        .alp-err {
          display: flex; align-items: center; gap: 9px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 12px;
          padding: 11px 14px;
          margin-bottom: 20px;
          color: #fca5a5; font-size: 13px;
        }

        .alp-field { margin-bottom: 18px; }
        .alp-label {
          display: block;
          font-size: 10.5px; font-weight: 700;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.11em; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .alp-input-wrap { position: relative; }
        .alp-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 13px;
          color: #fff;
          font-size: 14px; font-family: 'Outfit', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .alp-input:focus {
          background: rgba(255,255,255,0.07);
          border-color: rgba(234,88,12,0.6);
          box-shadow: 0 0 0 3px rgba(234,88,12,0.1), 0 0 20px rgba(234,88,12,0.05);
        }
        .alp-input::placeholder {
          color: rgba(255,255,255,0.15);
          font-family: 'DM Mono', monospace;
          font-size: 12.5px;
        }
        .alp-eye {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.25); padding: 4px;
          display: flex; transition: color 0.2s;
        }
        .alp-eye:hover { color: rgba(255,255,255,0.6); }

        .alp-btn {
          width: 100%; padding: 14.5px;
          margin-top: 6px;
          border-radius: 14px; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 700; letter-spacing: 0.02em;
          color: #fff;
          background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
          position: relative; overflow: hidden;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 4px 24px rgba(234,88,12,0.3);
        }
        .alp-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
          background-size: 400% 100%;
          animation: shimmer 2.8s linear infinite;
        }
        .alp-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(234,88,12,0.5);
        }
        .alp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .alp-btn-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center; gap: 9px;
        }

        /* ── Divider stats row ── */
        .alp-stats {
          display: flex; align-items: center; justify-content: center;
          gap: 0; margin-top: 24px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
        }
        .alp-stat {
          flex: 1; text-align: center;
          padding: 11px 8px;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .alp-stat:last-child { border-right: none; }
        .alp-stat-val {
          font-size: 15px; font-weight: 800; color: #ea580c;
          line-height: 1; margin-bottom: 3px;
        }
        .alp-stat-lbl {
          font-size: 9.5px; color: rgba(255,255,255,0.22);
          letter-spacing: 0.07em; text-transform: uppercase;
        }

        /* ── Footer ── */
        .alp-footer {
          text-align: center; margin-top: 22px;
          font-size: 11px; color: rgba(255,255,255,0.14);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .alp-fdot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.14); }
      `}</style>

      <div className="alp-page">

        {/* BG */}
        <div className="alp-orb1"/>
        <div className="alp-orb2"/>
        <div className="alp-orb3"/>
        <div className="alp-grid"/>
        <div className="alp-scan"/>

        {/* Card */}
        <div className="alp-card">

          {/* Logo */}
          <div className="alp-logo-wrap">
            <div className="alp-logo-ring">
              <img
                src="/img/logo1.JPG"
                alt="Megapodsindia"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.parentElement as HTMLElement).innerHTML +=
                    `<div style="font-size:32px;font-weight:900;color:#ea580c;letter-spacing:-2px">M</div>`;
                }}
              />
            </div>
            <div className="alp-badge">
              <div className="alp-badge-dot"/>
              <span>Secure Admin Access</span>
            </div>
            <h1 className="alp-title">Admin <span>Portal</span></h1>
            <p className="alp-sub">Megapodsindia Internal Dashboard</p>
          </div>

          {/* Panel */}
          <div className="alp-panel">

            {error && (
              <div className="alp-err">
                <span style={{fontSize:15}}>⚠</span> {error}
              </div>
            )}

            {/* Email */}
            <div className="alp-field">
              <label className="alp-label">Email Address</label>
              <div className="alp-input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="admin@megapodsindia.shop"
                  className="alp-input"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password */}
            <div className="alp-field">
              <label className="alp-label">Password</label>
              <div className="alp-input-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••••••"
                  className="alp-input"
                  style={{paddingRight: 46}}
                  autoComplete="new-password"
                />
                <button className="alp-eye" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
            </div>

            <button className="alp-btn" onClick={handleSubmit} disabled={loading}>
              <span className="alp-btn-inner">
                {loading
                  ? <><RefreshCw size={16} style={{animation:'spin 1s linear infinite'}}/> Authenticating…</>
                  : <><ShieldCheck size={16}/> Sign In to Dashboard</>
                }
              </span>
            </button>

            {/* Mini stats */}
            <div className="alp-stats">
              {[
                {val:'256-bit', lbl:'Encryption'},
                {val:'JWT',     lbl:'Auth Token'},
                {val:'30s',     lbl:'Auto Refresh'},
              ].map(s => (
                <div key={s.lbl} className="alp-stat">
                  <div className="alp-stat-val">{s.val}</div>
                  <div className="alp-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

          </div>

          <div className="alp-footer">
            <span>Protected</span>
            <div className="alp-fdot"/>
            <span>Megapodsindia</span>
            <div className="alp-fdot"/>
            <span>Admin v2</span>
          </div>

        </div>

      </div>
    </>
  );
}