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

  useEffect(() => { if (startOnForgot) { setCurrentMode("forgot"); } else if (mode) { setCurrentMode(mode); } }, [mode, startOnForgot]);
  useEffect(() => { setError(""); setSuccess(""); }, [currentMode]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
  
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await fetch("https://megapods.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          contact: formData.contact,
          email: formData.email,
          password: formData.password,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message || "Registration failed");
  
      login(data.token, data.user);
      onClose();
  
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      const res = await fetch("https://megapods.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message || "Login failed");
  
      login(data.token, data.user);
      onClose();
  
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      const res = await fetch("https://megapods.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
  
      setSuccess("OTP sent! Please check your email inbox.");
  
      setTimeout(() => {
        setSuccess("");
        setCurrentMode("otp");
      }, 2000);
  
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
  
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }
  
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await fetch("https://megapods.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          otp: otpValue,
          newPassword,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message || "Reset failed");
  
      setSuccess("Password reset successfully! Please login.");
  
      setTimeout(() => {
        setCurrentMode("login");
        setForgotEmail("");
        setOtpValue("");
        setNewPassword("");
        setConfirmNewPassword("");
      }, 2000);
  
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  const titles: Record<ModalMode, string> = {
    login: "Welcome Back", register: "Create Account",
    forgot: "Forgot Password", otp: "Enter OTP", reset: "Set New Password",
  };

  const backMode: Partial<Record<ModalMode, ModalMode>> = {
    forgot: "login", otp: "forgot", reset: "otp",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {backMode[currentMode] && (
              <button type="button" onClick={() => setCurrentMode(backMode[currentMode]!)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold">←
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-800">{titles[currentMode]}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">{success}</div>}

        {/* LOGIN */}
        {currentMode === "login" && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <input type="email" name="email" placeholder="Email Address" required
              value={formData.email} onChange={handleChange}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required
                value={formData.password} onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 cursor-pointer text-gray-500">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="text-right -mt-2">
              <button type="button" onClick={() => { setCurrentMode("forgot"); setForgotEmail(formData.email); }}
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
                Forgot Password?
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold shadow-lg transition">
              {loading ? "Logging in…" : "Login"}
            </button>
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <span className="text-orange-600 cursor-pointer font-semibold" onClick={() => setCurrentMode("register")}>Register</span>
            </p>
          </form>
        )}

        {/* REGISTER */}
        {currentMode === "register" && (
          <form className="space-y-4" onSubmit={handleRegister}>
            <input type="text" name="fullName" placeholder="Full Name" required
              value={formData.fullName} onChange={handleChange}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <input type="tel" name="contact" placeholder="Contact Number" required
              value={formData.contact} onChange={handleChange}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <input type="email" name="email" placeholder="Email Address" required
              value={formData.email} onChange={handleChange}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required
                value={formData.password} onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 cursor-pointer text-gray-500">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" required
                value={formData.confirmPassword} onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-4 cursor-pointer text-gray-500">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold shadow-lg transition">
              {loading ? "Creating Account…" : "Create Account"}
            </button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <span className="text-orange-600 cursor-pointer font-semibold" onClick={() => setCurrentMode("login")}>Login</span>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {currentMode === "forgot" && (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <p className="text-gray-500 text-sm">Enter your registered email and we'll send you a 6-digit reset code.</p>
            <input type="email" placeholder="Email Address" required
              value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button type="submit" disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold shadow-lg transition">
              {loading ? "Sending OTP…" : "Send Reset Code"}
            </button>
            <p className="text-center text-sm text-gray-500">
              Remember password?{" "}
              <span className="text-orange-600 cursor-pointer font-semibold" onClick={() => setCurrentMode("login")}>Login</span>
            </p>
          </form>
        )}

        {/* OTP */}
        {currentMode === "otp" && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <p className="text-gray-500 text-sm">
              Enter the 6-digit code sent to <span className="font-semibold text-gray-800">{forgotEmail}</span>
            </p>
            <input type="text" placeholder="Enter OTP" required maxLength={6}
              value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-center text-3xl tracking-[1rem] font-bold"
            />
            <button type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold shadow-lg transition">
              Verify Code
            </button>
            <p className="text-center text-sm text-gray-500">
              Didn't get it?{" "}
              <span className="text-orange-600 cursor-pointer font-semibold" onClick={() => setCurrentMode("forgot")}>Resend</span>
            </p>
          </form>
        )}

        {/* RESET PASSWORD */}
        {currentMode === "reset" && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <p className="text-gray-500 text-sm">Enter your new password below.</p>
            <div className="relative">
              <input type={showNewPassword ? "text" : "password"} placeholder="New Password" required
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <span onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-4 cursor-pointer text-gray-500">
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" required
                value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-4 cursor-pointer text-gray-500">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold shadow-lg transition">
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}