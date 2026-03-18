import { useState } from "react";
import { ShieldCheck, RefreshCw, Eye, EyeOff, Lock } from "lucide-react";

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
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
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
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[#0a0a0f]">

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(25px, -15px) scale(0.92); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 35px) scale(1.1); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.07; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          0%   { opacity: 0; transform: scale(0.8) translateY(-8px); }
          70%  { transform: scale(1.05) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin360 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(234,88,12,0.2), 0 0 20px rgba(234,88,12,0.05); }
          50%       { box-shadow: 0 0 0 1px rgba(234,88,12,0.5), 0 0 40px rgba(234,88,12,0.15); }
        }

        .card-enter { animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .badge-enter { animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }

        .input-field {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.25s ease;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.25); }
        .input-field:focus {
          background: rgba(255,255,255,0.07);
          border-color: rgba(234,88,12,0.6);
          box-shadow: 0 0 0 3px rgba(234,88,12,0.1);
        }
        .submit-btn {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.02em;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          border: none;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          background: linear-gradient(135deg, #ea580c, #c2410c);
          color: white;
        }
        .submit-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(234,88,12,0.4);
        }
        .submit-btn:not(:disabled):active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
        }
      `}</style>

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '10%', left: '15%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'floatOrb1 12s ease-in-out infinite',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(194,65,12,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'floatOrb2 15s ease-in-out infinite',
          filter: 'blur(50px)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '60%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'floatOrb3 10s ease-in-out infinite',
          filter: 'blur(30px)',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          animation: 'gridPulse 4s ease-in-out infinite',
        }} />
      </div>

      {/* Card */}
      <div className="card-enter relative w-full max-w-[420px]">

        {/* Top badge */}
        <div className="badge-enter flex justify-center mb-8">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(234,88,12,0.1)',
            border: '1px solid rgba(234,88,12,0.25)',
            borderRadius: 999, padding: '6px 16px',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#ea580c',
              boxShadow: '0 0 8px #ea580c',
            }} />
            <span style={{ color: '#fb923c', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
              SECURE ADMIN ACCESS
            </span>
          </div>
        </div>

        {/* Logo + title */}
        <div className="text-center mb-8">
          {/* Company logo with glow ring */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <div style={{
              width: 88, height: 88,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #1a0a00, #2d1200)',
              boxShadow: '0 0 0 1px rgba(234,88,12,0.4), 0 0 40px rgba(234,88,12,0.3), 0 20px 60px rgba(0,0,0,0.5)',
              animation: 'borderGlow 3s ease-in-out infinite',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src="/img/logo1.JPG"
                alt="Megapodsindia"
                style={{
                  width: 72, height: 72,
                  objectFit: 'contain',
                  borderRadius: 16,
                }}
                onError={(e) => {
                  // Fallback to ShieldCheck if logo fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`;
                }}
              />
            </div>
            {/* Admin badge pill on logo */}
            <div style={{
              position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              borderRadius: 999, padding: '3px 10px',
              boxShadow: '0 4px 12px rgba(234,88,12,0.4)',
              whiteSpace: 'nowrap',
            }}>
              <Lock size={9} color="white" />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.1em' }}>ADMIN</span>
            </div>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 30, fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 6,
            marginTop: 8,
          }}>
            Admin Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            Megapodsindia — Internal Dashboard
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '36px 32px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>

          {error && (
            <div style={{
              marginBottom: 20,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠</span> {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="admin@megapodsindia.shop"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••••"
                  className="input-field"
                  style={{ paddingRight: 50 }}
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="submit-btn"
              style={{ marginTop: 4 }}
            >
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading
                  ? <><RefreshCw size={18} style={{ animation: 'spin360 1s linear infinite' }} /> Signing in…</>
                  : <><ShieldCheck size={18} /> Sign In to Dashboard</>
                }
              </span>
            </button>

          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
          Protected · Megapodsindia Admin System
        </p>
      </div>
    </div>
  );
}