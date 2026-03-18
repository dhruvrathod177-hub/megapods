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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes orb1  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.08)} }
        @keyframes orb2  { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-25px,35px)} 66%{transform:translate(20px,-15px)} }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-20px) rotate(1deg)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes shimmer   { 0%{background-position:-400% center} 100%{background-position:400% center} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(234,88,12,0.4)} 50%{box-shadow:0 0 0 14px rgba(234,88,12,0)} }
        @keyframes scan      { 0%{top:-2px} 100%{top:100%} }
        @keyframes gridpulse { 0%,100%{opacity:0.03} 50%{opacity:0.07} }

        .login-page {
          min-height: 100vh;
          background: #07070c;
          display: grid;
          grid-template-columns: 1fr 480px;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
          position: relative;
        }
        @media(max-width:860px) {
          .login-page { grid-template-columns: 1fr; }
          .right-col  { display: none !important; }
          .left-col   { padding: 40px 24px !important; }
        }

        /* ── LEFT ── */
        .left-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 72px;
          position: relative;
          z-index: 2;
        }
        .form-wrap {
          width: 100%;
          max-width: 380px;
          animation: slideUp 0.65s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* ── LOGO BLOCK ── */
        .logo-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 44px;
        }
        .logo-frame {
          width: 88px; height: 88px;
          border-radius: 26px;
          background: linear-gradient(145deg, rgba(234,88,12,0.12), rgba(154,52,18,0.06));
          border: 1px solid rgba(234,88,12,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          animation: glow-pulse 3.5s ease-in-out infinite;
          position: relative;
        }
        .logo-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 26px;
          background: linear-gradient(145deg, rgba(234,88,12,0.25) 0%, transparent 60%);
          opacity: 0.4;
          pointer-events: none;
        }
        .logo-frame img {
          width: 64px; height: 64px;
          object-fit: contain;
          border-radius: 16px;
          position: relative; z-index: 1;
        }
        .pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(234,88,12,0.1);
          border: 1px solid rgba(234,88,12,0.22);
          border-radius: 999px;
          padding: 5px 14px;
          margin-bottom: 18px;
        }
        .pill-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #ea580c;
          box-shadow: 0 0 8px #ea580c;
        }
        .pill-badge span {
          font-size: 11px; font-weight: 700;
          color: #fb923c; letter-spacing: 0.1em; text-transform: uppercase;
        }
        .page-title {
          font-size: 32px; font-weight: 800;
          color: #fff; letter-spacing: -0.03em;
          line-height: 1; margin-bottom: 7px;
          text-align: center;
        }
        .page-sub {
          font-size: 13px; color: rgba(255,255,255,0.28);
          font-weight: 400; text-align: center;
          letter-spacing: 0.01em;
        }

        /* ── FORM CARD ── */
        .card {
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px 26px 24px;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .err-box {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 11px;
          padding: 11px 14px;
          margin-bottom: 18px;
          color: #fca5a5; font-size: 13px;
        }
        .field { margin-bottom: 18px; }
        .f-label {
          display: block;
          font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.32);
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 7px;
        }
        .f-wrap { position: relative; }
        .f-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #fff;
          font-size: 14px; font-family: 'Outfit', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .f-input:focus {
          background: rgba(255,255,255,0.08);
          border-color: rgba(234,88,12,0.55);
          box-shadow: 0 0 0 3px rgba(234,88,12,0.1);
        }
        .f-input::placeholder {
          color: rgba(255,255,255,0.18);
          font-family: 'DM Mono', monospace;
          font-size: 12.5px;
          letter-spacing: 0.04em;
        }
        .eye-btn {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.28); padding: 4px;
          display: flex; transition: color 0.2s;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.65); }
        .sub-btn {
          width: 100%; padding: 14px;
          border-radius: 13px; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 700; letter-spacing: 0.02em;
          color: #fff;
          background: linear-gradient(135deg, #ea580c, #c2410c);
          position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 4px;
        }
        .sub-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.13), transparent);
          background-size: 400% 100%;
          animation: shimmer 2.5s linear infinite;
        }
        .sub-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(234,88,12,0.45);
        }
        .sub-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .footer-txt {
          text-align: center; margin-top: 22px;
          font-size: 12px; color: rgba(255,255,255,0.17);
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .fdot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.17); }

        /* ── RIGHT ── */
        .right-col {
          background: linear-gradient(165deg, #160700 0%, #0c0300 50%, #07070c 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .rp-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; gap: 36px;
          padding: 48px 40px;
          text-align: center;
          animation: slideLeft 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .rp-logo {
          width: 110px; height: 110px;
          border-radius: 30px;
          background: rgba(234,88,12,0.07);
          border: 1px solid rgba(234,88,12,0.13);
          display: flex; align-items: center; justify-content: center;
          animation: float 7s ease-in-out infinite;
        }
        .rp-logo img { width: 84px; height: 84px; object-fit: contain; border-radius: 20px; }
        .rp-heading { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.02em; line-height: 1.25; }
        .rp-desc { font-size: 13px; color: rgba(255,255,255,0.3); line-height: 1.7; max-width: 240px; }
        .rp-features { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .rp-feat {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 13px; padding: 13px 16px;
          text-align: left;
        }
        .rp-feat-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(234,88,12,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .rp-feat-lbl { font-size: 11px; color: rgba(255,255,255,0.3); }
        .rp-feat-val { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }
      `}</style>

      <div className="login-page">

        {/* ── BG mesh ── */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}}>
          <div style={{
            position:'absolute',top:'0%',left:'5%',
            width:500,height:500,borderRadius:'50%',
            background:'radial-gradient(circle,rgba(234,88,12,0.09) 0%,transparent 65%)',
            filter:'blur(70px)', animation:'orb1 16s ease-in-out infinite',
          }}/>
          <div style={{
            position:'absolute',bottom:'5%',left:'20%',
            width:350,height:350,borderRadius:'50%',
            background:'radial-gradient(circle,rgba(194,65,12,0.07) 0%,transparent 65%)',
            filter:'blur(50px)', animation:'orb2 20s ease-in-out infinite',
          }}/>
          <div style={{
            position:'absolute',inset:0,
            backgroundImage:`linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),
                             linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`,
            backgroundSize:'52px 52px',
            animation:'gridpulse 5s ease-in-out infinite',
          }}/>
          {/* scan line */}
          <div style={{
            position:'absolute',left:0,right:0,height:1,
            background:'linear-gradient(90deg,transparent,rgba(234,88,12,0.07),transparent)',
            animation:'scan 9s linear infinite',
          }}/>
        </div>

        {/* ── LEFT FORM COL ── */}
        <div className="left-col">
          <div className="form-wrap">

            {/* Logo block */}
            <div className="logo-block">
              <div className="logo-frame">
                <img
                  src="/img/logo1.JPG"
                  alt="Megapodsindia"
                  onError={(e) => {
                    e.currentTarget.style.display='none';
                    (e.currentTarget.parentElement as HTMLElement).innerHTML +=
                      `<div style="font-size:30px;font-weight:900;color:#ea580c">M</div>`;
                  }}
                />
              </div>

              {/* Badge — fully separate from logo */}
              <div className="pill-badge">
                <div className="pill-dot"/>
                <span>Secure Admin Access</span>
              </div>

              <h1 className="page-title">Admin Portal</h1>
              <p className="page-sub">Megapodsindia Internal Dashboard</p>
            </div>

            {/* Card */}
            <div className="card">

              {error && (
                <div className="err-box">
                  <span style={{fontSize:15}}>⚠</span> {error}
                </div>
              )}

              {/* Email */}
              <div className="field">
                <label className="f-label">Email Address</label>
                <div className="f-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && handleSubmit()}
                    placeholder="e.g. admin@megapodsindia.shop"
                    className="f-input"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <label className="f-label">Password</label>
                <div className="f-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && handleSubmit()}
                    placeholder="e.g. ••••••••••"
                    className="f-input"
                    style={{paddingRight:46}}
                    autoComplete="new-password"
                  />
                  <button className="eye-btn" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={17}/> : <Eye size={17}/>}
                  </button>
                </div>
              </div>

              <button className="sub-btn" onClick={handleSubmit} disabled={loading}>
                <span className="btn-inner">
                  {loading
                    ? <><RefreshCw size={16} style={{animation:'spin 1s linear infinite'}}/> Authenticating…</>
                    : <><ShieldCheck size={16}/> Sign In to Dashboard</>
                  }
                </span>
              </button>

            </div>

            <div className="footer-txt">
              <span>Protected</span><div className="fdot"/>
              <span>Megapodsindia</span><div className="fdot"/>
              <span>Admin v2</span>
            </div>

          </div>
        </div>

        {/* ── RIGHT DECORATIVE COL ── */}
        <div className="right-col">
          {/* orbs */}
          <div style={{
            position:'absolute',top:'15%',right:'10%',
            width:280,height:280,borderRadius:'50%',
            background:'radial-gradient(circle,rgba(234,88,12,0.14) 0%,transparent 70%)',
            filter:'blur(40px)', animation:'orb1 12s ease-in-out infinite',
          }}/>
          <div style={{
            position:'absolute',bottom:'20%',left:'5%',
            width:200,height:200,borderRadius:'50%',
            background:'radial-gradient(circle,rgba(194,65,12,0.1) 0%,transparent 70%)',
            filter:'blur(30px)', animation:'orb2 14s ease-in-out infinite',
          }}/>
          <div style={{
            position:'absolute',inset:0,
            backgroundImage:`linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),
                             linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
            backgroundSize:'40px 40px',
          }}/>

          <div className="rp-content">
            <div className="rp-logo">
              <img
                src="/img/logo1.JPG"
                alt="Megapodsindia"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).innerHTML =
                    `<div style="font-size:42px;font-weight:900;color:#ea580c">M</div>`;
                }}
              />
            </div>

            <div>
              <div className="rp-heading">Megapodsindia<br/>Admin Portal</div>
              <div className="rp-desc" style={{marginTop:10}}>
                Manage quotations, handle negotiations, and monitor your business in real time.
              </div>
            </div>

            <div className="rp-features">
              {[
                {icon:'📦', label:'Quotation Management', val:'View all customer quotes'},
                {icon:'🤝', label:'Negotiation Control',  val:'Accept or reject offers'},
                {icon:'📊', label:'Live Analytics',       val:'Auto-refresh every 30s'},
                {icon:'🔒', label:'Secure Access',        val:'JWT protected routes'},
              ].map(f => (
                <div key={f.label} className="rp-feat">
                  <div className="rp-feat-icon">{f.icon}</div>
                  <div>
                    <div className="rp-feat-lbl">{f.label}</div>
                    <div className="rp-feat-val">{f.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}