import { useState, useEffect, ChangeEvent, FormEvent } from "react";
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    finally { setLoading(true); }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(false);
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

  if (!isOpen) return null;

  const titles: Record<ModalMode, string> = {
    login: "Welcome Back",
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

  const inputClass =
    "w-full px-4 py-3.5 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all duration-200";

  const eyeButtonClass =
    "absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#f97316] transition-colors duration-200 cursor-pointer";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-modal-overlay {
          animation: fadeIn 0.2s ease;
        }
        .auth-modal-card {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .auth-btn-primary {
          position: relative;
          overflow: hidden;
        }
        .auth-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #fb923c, #ea580c, #c2410c);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .auth-btn-primary:hover::before {
          opacity: 1;
        }
        .auth-btn-primary span {
          position: relative;
          z-index: 1;
        }
        .otp-input {
          letter-spacing: 0.8rem;
          font-family: 'Syne', sans-serif;
        }
        .orb-1 {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%);
          top: -60px;
          right: -60px;
          pointer-events: none;
        }
        .orb-2 {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%);
          bottom: -40px;
          left: -40px;
          pointer-events: none;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #2e2e2e, transparent);
        }
      `}</style>

      <div className="auth-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        />

        {/* Card */}
        <div
          className="auth-modal-card relative w-full max-w-[420px] rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #141414 0%, #0f0f0f 100%)",
            border: "1px solid #232323",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {/* Decorative orbs */}
          <div className="orb-1" />
          <div className="orb-2" />

          {/* Top accent line */}
          <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #f97316, transparent)" }} />

          <div className="relative p-8">

            {/* Header */}
            <div className="flex justify-between items-start mb-7">
              <div className="flex items-center gap-3">
                {backMode[currentMode] && (
                  <button
                    type="button"
                    onClick={() => setCurrentMode(backMode[currentMode]!)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#666] hover:text-white hover:bg-[#1e1e1e] transition-all duration-200 text-base"
                  >
                    ←
                  </button>
                )}
                <div>
                  
                  {/* Logo + Company Name */}
<div className="flex items-center gap-2 mb-2">
  <img
    src="/favicon.ico"   // 👈 or use /logo.png if you upload better logo
    alt="MegapodsIndia Logo"
    className="w-7 h-7 object-contain"
  />
  <span
    style={{
      fontSize: "11px",
      letterSpacing: "0.18em",
      color: "#f97316",
      fontWeight: 700,
      textTransform: "uppercase"
    }}
  >
    MEGAPODSINDIA
  </span>
</div>
                  <h2 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em"
                  }}>
                    {titles[currentMode]}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#666", marginTop: "3px" }}>
                    {subtitles[currentMode]}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#1e1e1e] transition-all duration-200"
                style={{ fontSize: "16px", marginTop: "2px" }}
              >
                ✕
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                <span style={{ fontSize: "15px", marginTop: "1px" }}>⚠</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                <span style={{ fontSize: "15px", marginTop: "1px" }}>✓</span>
                <span>{success}</span>
              </div>
            )}

            {/* ── LOGIN ── */}
            {currentMode === "login" && (
              <form className="space-y-3" onSubmit={handleLogin}>
                <div>
                  <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: "6px" }}>
                    Email
                  </label>
                  <input type="email" name="email" placeholder="you@example.com" required
                    value={formData.email} onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
                      Password
                    </label>
                    <button type="button"
                      onClick={() => { setCurrentMode("forgot"); setForgotEmail(formData.email); }}
                      style={{ fontSize: "12px", color: "#f97316", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required
                      value={formData.password} onChange={handleChange}
                      className={inputClass} style={{ paddingRight: "44px" }}
                    />
                    <span onClick={() => setShowPassword(!showPassword)} className={eyeButtonClass}>
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </span>
                  </div>
                </div>

                <div style={{ paddingTop: "4px" }}>
                  <button type="submit" disabled={loading}
                    className="auth-btn-primary w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", letterSpacing: "0.02em" }}>
                    <span>{loading ? "Signing in…" : "Sign In"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <div className="divider-line" />
                  <span style={{ fontSize: "11px", color: "#444", whiteSpace: "nowrap" }}>New here?</span>
                  <div className="divider-line" />
                </div>

                <button type="button"
                  onClick={() => setCurrentMode("register")}
                  className="w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{ background: "transparent", border: "1px solid #2e2e2e", color: "#aaa", letterSpacing: "0.02em" }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "#f97316"; (e.target as HTMLButtonElement).style.color = "#f97316"; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "#2e2e2e"; (e.target as HTMLButtonElement).style.color = "#aaa"; }}>
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
                    <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: "6px" }}>
                      {field.label}
                    </label>
                    <input type={field.type} name={field.name} placeholder={field.placeholder} required
                      value={formData[field.name as keyof FormData]} onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                ))}

                {[
                  { label: "Password", value: formData.password, name: "password", show: showPassword, toggle: () => setShowPassword(!showPassword) },
                  { label: "Confirm Password", value: formData.confirmPassword, name: "confirmPassword", show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword) },
                ].map(field => (
                  <div key={field.name}>
                    <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: "6px" }}>
                      {field.label}
                    </label>
                    <div className="relative">
                      <input type={field.show ? "text" : "password"} name={field.name} placeholder="••••••••" required
                        value={field.value} onChange={handleChange}
                        className={inputClass} style={{ paddingRight: "44px" }}
                      />
                      <span onClick={field.toggle} className={eyeButtonClass}>
                        {field.show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </span>
                    </div>
                  </div>
                ))}

                <div style={{ paddingTop: "4px" }}>
                  <button type="submit" disabled={loading}
                    className="auth-btn-primary w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", letterSpacing: "0.02em" }}>
                    <span>{loading ? "Creating Account…" : "Create Account"}</span>
                  </button>
                </div>
                <p style={{ textAlign: "center", fontSize: "13px", color: "#555" }}>
                  Already a member?{" "}
                  <span onClick={() => setCurrentMode("login")}
                    style={{ color: "#f97316", cursor: "pointer", fontWeight: 500 }}>
                    Sign In
                  </span>
                </p>
              </form>
            )}

            {/* ── FORGOT ── */}
            {currentMode === "forgot" && (
              <form className="space-y-4" onSubmit={handleForgotPassword}>
                <div>
                  <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <input type="email" placeholder="you@example.com" required
                    value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div style={{ paddingTop: "4px" }}>
                  <button type="submit" disabled={loading}
                    className="auth-btn-primary w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", letterSpacing: "0.02em" }}>
                    <span>{loading ? "Sending Code…" : "Send Reset Code"}</span>
                  </button>
                </div>
                <p style={{ textAlign: "center", fontSize: "13px", color: "#555" }}>
                  Remembered it?{" "}
                  <span onClick={() => setCurrentMode("login")}
                    style={{ color: "#f97316", cursor: "pointer", fontWeight: 500 }}>
                    Back to Sign In
                  </span>
                </p>
              </form>
            )}

            {/* ── OTP ── */}
            {currentMode === "otp" && (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div style={{ padding: "16px", borderRadius: "12px", background: "#1a1a1a", border: "1px solid #2a2a2a", marginBottom: "4px" }}>
                  <p style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Code sent to</p>
                  <p style={{ fontSize: "14px", color: "#f97316", fontWeight: 600 }}>{forgotEmail}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: "6px" }}>
                    6-Digit OTP
                  </label>
                  <input type="text" placeholder="000000" required maxLength={6}
                    value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    className={`${inputClass} otp-input`}
                    style={{ textAlign: "center", fontSize: "22px", fontWeight: 700, paddingRight: "16px" }}
                  />
                </div>
                <div style={{ paddingTop: "4px" }}>
                  <button type="submit"
                    className="auth-btn-primary w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", letterSpacing: "0.02em" }}>
                    <span>Verify Code</span>
                  </button>
                </div>
                <p style={{ textAlign: "center", fontSize: "13px", color: "#555" }}>
                  Didn't receive it?{" "}
                  <span onClick={() => setCurrentMode("forgot")}
                    style={{ color: "#f97316", cursor: "pointer", fontWeight: 500 }}>
                    Resend
                  </span>
                </p>
              </form>
            )}

            {/* ── RESET ── */}
            {currentMode === "reset" && (
              <form className="space-y-3" onSubmit={handleResetPassword}>
                {[
                  { label: "New Password", value: newPassword, setter: setNewPassword, show: showNewPassword, toggle: () => setShowNewPassword(!showNewPassword) },
                  { label: "Confirm New Password", value: confirmNewPassword, setter: setConfirmNewPassword, show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword) },
                ].map((field, i) => (
                  <div key={i}>
                    <label style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, display: "block", marginBottom: "6px" }}>
                      {field.label}
                    </label>
                    <div className="relative">
                      <input type={field.show ? "text" : "password"} placeholder="••••••••" required
                        value={field.value} onChange={(e) => field.setter(e.target.value)}
                        className={inputClass} style={{ paddingRight: "44px" }}
                      />
                      <span onClick={field.toggle} className={eyeButtonClass}>
                        {field.show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </span>
                    </div>
                  </div>
                ))}
                <div style={{ paddingTop: "4px" }}>
                  <button type="submit" disabled={loading}
                    className="auth-btn-primary w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", letterSpacing: "0.02em" }}>
                    <span>{loading ? "Resetting…" : "Reset Password"}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
}