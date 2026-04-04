import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "login" | "register";
  startOnForgot?: boolean;
}

interface FormData {
  fullName: string;
  contact: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type ModalMode = "login" | "register" | "forgot" | "otp" | "reset";

const API = import.meta.env.VITE_API_URL || "https://megapods.onrender.com/api";

export default function AuthModal({ isOpen, onClose, mode, startOnForgot }: AuthModalProps) {
  const { login } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [currentMode, setCurrentMode] = useState<ModalMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "", contact: "", email: "", password: "", confirmPassword: "",
  });

  useEffect(() => {
    if (startOnForgot) { setCurrentMode("forgot"); }
    else if (mode) { setCurrentMode(mode); }
  }, [mode, startOnForgot]);

  useEffect(() => { setError(""); setSuccess(""); }, [currentMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: formData.fullName, contact: formData.contact, email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess("Account created successfully! Please login.");
      setFormData({ fullName: "", contact: "", email: formData.email, password: "", confirmPassword: "" });
      setTimeout(() => { setSuccess(""); setCurrentMode("login"); }, 2000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      login(data.token, data.user);
      onClose();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setSuccess("OTP sent! Please check your email inbox.");
      setTimeout(() => { setSuccess(""); setCurrentMode("otp"); }, 2000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (otpValue.length !== 6) { setError("Please enter the 6-digit OTP"); return; }
    setCurrentMode("reset");
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmNewPassword) { setError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: otpValue, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setSuccess("Password reset successfully! Please login.");
      setTimeout(() => {
        setCurrentMode("login");
        setForgotEmail(""); setOtpValue(""); setNewPassword(""); setConfirmNewPassword("");
      }, 2000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };
  function AuthParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
  
      let width = window.innerWidth;
      let height = window.innerHeight;
      let animId: number;
  
      interface P {
        x: number; y: number; vx: number; vy: number;
        w: number; h: number; rotation: number; rotSpeed: number;
        opacity: number; color: string;
      }
  
      const COLORS = [
        "#ea580c", "#f97316", "#fb923c", "#fed7aa", "#c2410c",
        "#fdba74", "#1e293b", "#334155", "#64748b", "#94a3b8",
      ];
  
      const make = (fromBottom = false): P => ({
        x: Math.random() * width,
        y: fromBottom ? height + Math.random() * 100 : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -(Math.random() * 0.5 + 0.15),
        w: Math.random() * 18 + 6,
        h: Math.random() * 3 + 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.018,
        opacity: Math.random() * 0.45 + 0.15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
  
      let particles: P[] = Array.from({ length: 120 }, () => make(false));
  
      const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
      };
  
      const onMouse = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      };
  
      window.addEventListener("resize", resize);
      window.addEventListener("mousemove", onMouse);
      resize();
  
      const drawPill = (p: P) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        const r = p.h / 2;
        ctx.beginPath();
        ctx.moveTo(-p.w / 2 + r, -p.h / 2);
        ctx.lineTo(p.w / 2 - r, -p.h / 2);
        ctx.arcTo(p.w / 2, -p.h / 2, p.w / 2, p.h / 2, r);
        ctx.lineTo(p.w / 2 - r, p.h / 2);
        ctx.arcTo(p.w / 2, p.h / 2, -p.w / 2, p.h / 2, r);
        ctx.lineTo(-p.w / 2 + r, p.h / 2);
        ctx.arcTo(-p.w / 2, p.h / 2, -p.w / 2, -p.h / 2, r);
        ctx.lineTo(-p.w / 2, -p.h / 2 + r);
        ctx.arcTo(-p.w / 2, -p.h / 2, p.w / 2, -p.h / 2, r);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };
  
      const render = () => {
        ctx.clearRect(0, 0, width, height);
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
  
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130 && dist > 0) {
            const force = (1 - dist / 130) * 0.7;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.vy -= 0.003;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotSpeed;
          if (p.y < -30) { particles[i] = make(true); continue; }
          if (p.x < -40) p.x = width + 30;
          if (p.x > width + 40) p.x = -30;
          drawPill(p);
        }
  
        animId = requestAnimationFrame(render);
      };
  
      render();
  
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouse);
        cancelAnimationFrame(animId);
      };
    }, []);
  
    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    );
  }
  if (!isOpen) return null;

  const titles: Record<ModalMode, string> = {
    login: "Welcome Back!",
    register: "Create Account",
    forgot: "Reset Password",
    otp: "Verify Code",
    reset: "New Password",
  };

  const subtitles: Record<ModalMode, string> = {
    login: "Sign in to your Megapods account",
    register: "Join Megapods today",
    forgot: "We'll send a reset code to your email",
    otp: "Enter the 6-digit code we sent you",
    reset: "Choose a strong new password",
  };

  const backMode: Partial<Record<ModalMode, ModalMode>> = {
    forgot: "login", otp: "forgot", reset: "otp",
  };

  // ── GLASSY WHITE THEME ──
  const inputStyle = {
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
  };
  const eyeButtonClass =
    "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-200 cursor-pointer";

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#6b7280",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 600,
    display: "block",
    marginBottom: "6px",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-modal-overlay { animation: fadeIn 0.2s ease; }
        .auth-modal-card    { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        .auth-btn-primary { position: relative; overflow: hidden; }
        .auth-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .auth-btn-primary:hover::after { opacity: 1; }
        .auth-btn-primary span { position: relative; z-index: 1; }

        .auth-btn-ghost:hover {
          background: rgba(249,115,22,0.06) !important;
          border-color: #f97316 !important;
          color: #ea580c !important;
        }

        .glass-input:hover {
          background: rgba(255,255,255,0.85) !important;
          border-color: rgba(249,115,22,0.4) !important;
        }
        .glass-input:focus {
          background: rgba(255,255,255,0.95) !important;
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.12), inset 0 1px 3px rgba(0,0,0,0.04) !important;
          outline: none;
        }

        .otp-input {
          letter-spacing: 0.8rem;
          font-family: 'Syne', sans-serif;
        }

        .glass-divider {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0,0,0,0.1), transparent);
        }

        .blob-1 {
          position: absolute; width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(251,146,60,0.35) 0%, rgba(249,115,22,0.1) 50%, transparent 70%);
          top: -100px; right: -80px; pointer-events: none; filter: blur(2px);
        }
        .blob-2 {
          position: absolute; width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,237,213,0.8) 0%, rgba(254,215,170,0.4) 40%, transparent 70%);
          bottom: -60px; left: -60px; pointer-events: none; filter: blur(4px);
        }
        .blob-3 {
          position: absolute; width: 120px; height: 120px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%);
          top: 40%; left: -30px; pointer-events: none; filter: blur(6px);
        }
      `}</style>

      <div
        className="auth-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
       <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(255,237,213,0.55) 0%, rgba(251,191,36,0.15) 40%, rgba(255,255,255,0.4) 100%)",
            backdropFilter: "blur(18px) saturate(1.4)",
            WebkitBackdropFilter: "blur(18px) saturate(1.4)",
          }}
          onClick={onClose}
        >
          <AuthParticles />
        </div>
        <div
          ref={modalRef}
          className="auth-modal-card relative w-full max-w-[420px] rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.82) 0%, rgba(255,250,245,0.88) 100%)",
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow:
              "0 8px 32px rgba(249,115,22,0.12), 0 24px 64px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <div className="blob-1" />
          <div className="blob-2" />
          <div className="blob-3" />

          <div style={{
            height: "3px",
            background: "linear-gradient(90deg, #fed7aa, #f97316, #fb923c, #fed7aa)",
          }} />

          <div className="relative p-8">

            <div className="flex justify-between items-start mb-7">
              <div className="flex items-center gap-3">
                {backMode[currentMode] && (
                  <button
                    type="button"
                    onClick={() => setCurrentMode(backMode[currentMode]!)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 text-base"
                    style={{ color: "#9ca3af", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(249,115,22,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                  >
                    ←
                  </button>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src="/img/logo1.JPG"
                      alt="Megapods"
                      style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        objectFit: "cover",
                        boxShadow: "0 4px 12px rgba(249,115,22,0.25)",
                        border: "1px solid rgba(249,115,22,0.15)",
                      }}
                    />
                    <span style={{
                      fontSize: "12px", letterSpacing: "0.2em",
                      color: "#ea580c", fontWeight: 900, textTransform: "uppercase",
                      fontFamily: "'Archivo Black', sans-serif",
                    }}>
                      Megapodsindia
                    </span>
                  </div>
                  <h2 className="heading-3d" style={{
                    fontFamily: "'Archivo Black', Georgia, serif",
                    fontSize: "28px", fontWeight: 900,
                    color: "#111111", lineHeight: 1.1, letterSpacing: "-0.01em",
                    display: "inline-block", visibility: "visible",
                  }}>
                    {titles[currentMode]}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#78716c", marginTop: "4px", display: "block" }}>
                    {subtitles[currentMode]}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200"
                style={{ fontSize: "15px", color: "#9ca3af", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", marginTop: "2px" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#9ca3af"; }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-2xl text-sm"
                style={{ background: "rgba(254,226,226,0.7)", border: "1px solid rgba(252,165,165,0.6)", color: "#dc2626", backdropFilter: "blur(8px)" }}>
                <span style={{ fontSize: "14px", marginTop: "1px" }}>⚠</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-2xl text-sm"
                style={{ background: "rgba(220,252,231,0.7)", border: "1px solid rgba(134,239,172,0.6)", color: "#16a34a", backdropFilter: "blur(8px)" }}>
                <span style={{ fontSize: "14px", marginTop: "1px" }}>✓</span>
                <span>{success}</span>
              </div>
            )}

            {/* ── LOGIN ── */}
            {currentMode === "login" && (
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" name="email" placeholder="you@example.com" required
                    value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none transition-all duration-200 glass-input" style={inputStyle}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={labelStyle}>Password</label>
                    <button type="button"
                      onClick={() => { setCurrentMode("forgot"); setForgotEmail(formData.email); }}
                      style={{ fontSize: "12px", color: "#f97316", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required
                      value={formData.password} onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none transition-all duration-200 glass-input" style={{ ...inputStyle, paddingRight: "44px" }}
                    />
                    <span onClick={() => setShowPassword(!showPassword)} className={eyeButtonClass}>
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </span>
                  </div>
                </div>

                <div style={{ paddingTop: "4px" }}>
                  <button type="submit" disabled={loading}
                    className="auth-btn-primary w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-60 transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      boxShadow: "0 6px 20px rgba(249,115,22,0.4), 0 2px 6px rgba(249,115,22,0.2)",
                      letterSpacing: "0.02em",
                    }}>
                    <span>{loading ? "Signing in…" : "Sign In"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <div className="glass-divider" />
                  <span style={{ fontSize: "11px", color: "#a8a29e", whiteSpace: "nowrap" }}>New here?</span>
                  <div className="glass-divider" />
                </div>

                <button type="button" onClick={() => setCurrentMode("register")}
                  className="auth-btn-ghost w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    color: "#78716c",
                    letterSpacing: "0.02em",
                  }}>
                  Create an Account
                </button>
              </form>
            )}

            {/* ── REGISTER ── */}
            {currentMode === "register" && (
              <form className="space-y-3" onSubmit={handleRegister}>
                {[
                  { label: "Full Name", name: "fullName", type: "text", placeholder: "John Doe" },
                  { label: "Contact Number", name: "contact", type: "tel", placeholder: "+91 98765 43210" },
                  { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
                ].map(field => (
                  <div key={field.name}>
                    <label style={labelStyle}>{field.label}</label>
                    <input type={field.type} name={field.name} placeholder={field.placeholder} required
                      value={formData[field.name as keyof FormData]} onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none transition-all duration-200 glass-input" style={inputStyle}
                    />
                  </div>
                ))}

                {[
                  { label: "Password", value: formData.password, name: "password", show: showPassword, toggle: () => setShowPassword(!showPassword) },
                  { label: "Confirm Password", value: formData.confirmPassword, name: "confirmPassword", show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword) },
                ].map(field => (
                  <div key={field.name}>
                    <label style={labelStyle}>{field.label}</label>
                    <div className="relative">
                      <input type={field.show ? "text" : "password"} name={field.name} placeholder="••••••••" required
                        value={field.value} onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none transition-all duration-200 glass-input" style={{ ...inputStyle, paddingRight: "44px" }}
                      />
                      <span onClick={field.toggle} className={eyeButtonClass}>
                        {field.show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </span>
                    </div>
                  </div>
                ))}

                <div style={{ paddingTop: "8px" }}>
                  <button type="submit" disabled={loading}
                    className="auth-btn-primary w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-60 transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      boxShadow: "0 6px 20px rgba(249,115,22,0.4), 0 2px 6px rgba(249,115,22,0.2)",
                      letterSpacing: "0.02em",
                    }}>
                    <span>{loading ? "Processing…" : "Create Account"}</span>
                  </button>
                </div>

                <button type="button" onClick={() => setCurrentMode("login")}
                  className="auth-btn-ghost w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 mt-2"
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    color: "#78716c",
                  }}>
                  Back to Sign In
                </button>
              </form>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {currentMode === "forgot" && (
              <form className="space-y-4" onSubmit={handleForgotPassword}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" placeholder="you@example.com" required
                    value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none transition-all duration-200 glass-input" style={inputStyle}
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="auth-btn-primary w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-60 transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    boxShadow: "0 6px 20px rgba(249,115,22,0.4), 0 2px 6px rgba(249,115,22,0.2)",
                  }}>
                  <span>{loading ? "Sending…" : "Send Reset Code"}</span>
                </button>
              </form>
            )}

            {/* ── OTP ── */}
            {currentMode === "otp" && (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label style={labelStyle}>Verification Code</label>
                  <input type="text" placeholder="••••••" required maxLength={6}
                    value={otpValue} onChange={(e) => setOtpValue(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-200 glass-input otp-input text-center text-xl font-bold" style={inputStyle}
                  />
                </div>
                <button type="submit"
                  className="auth-btn-primary w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    boxShadow: "0 6px 20px rgba(249,115,22,0.4), 0 2px 6px rgba(249,115,22,0.2)",
                  }}>
                  <span>Verify Code</span>
                </button>
              </form>
            )}

            {/* ── RESET PASSWORD ── */}
            {currentMode === "reset" && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} placeholder="••••••••" required
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none transition-all duration-200 glass-input" style={{ ...inputStyle, paddingRight: "44px" }}
                    />
                    <span onClick={() => setShowNewPassword(!showNewPassword)} className={eyeButtonClass}>
                      {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input type="password" placeholder="••••••••" required
                    value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none transition-all duration-200 glass-input" style={inputStyle}
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="auth-btn-primary w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-60 transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    boxShadow: "0 6px 20px rgba(249,115,22,0.4), 0 2px 6px rgba(249,115,22,0.2)",
                  }}>
                  <span>{loading ? "Updating…" : "Update Password"}</span>
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
}