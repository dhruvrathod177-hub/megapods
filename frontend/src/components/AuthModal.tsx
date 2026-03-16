import { useState, useEffect, FormEvent } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    contact: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (startOnForgot) setCurrentMode("forgot");
    else if (mode) setCurrentMode(mode);
  }, [mode, startOnForgot]);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [currentMode]);

  /* LOGIN */

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      login(data.token, data.user);

      onClose();

    } catch (err: any) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  /* SEND OTP */

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if (!forgotEmail) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccess("OTP sent to your email");

      setTimeout(() => {
        setCurrentMode("otp");
      }, 1500);

    } catch (err: any) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  /* VERIFY OTP */

  const handleVerifyOtp = (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if (otpValue.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }

    setCurrentMode("reset");

  };

  /* RESET PASSWORD */

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {

      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: otpValue,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccess("Password reset successful");

      setTimeout(() => {

        setCurrentMode("login");
        setForgotEmail("");
        setOtpValue("");

      }, 2000);

    } catch (err: any) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">

      <div className="bg-white p-8 rounded-3xl w-full max-w-md">

        <h2 className="text-2xl font-bold mb-4 text-center">

          {currentMode === "login" && "Welcome Back"}
          {currentMode === "forgot" && "Forgot Password"}
          {currentMode === "otp" && "Enter OTP"}
          {currentMode === "reset" && "Reset Password"}

        </h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}

        {/* LOGIN */}

        {currentMode === "login" && (

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e)=>setFormData({...formData,email:e.target.value})}
              className="w-full border p-3 rounded-xl"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e)=>setFormData({...formData,password:e.target.value})}
              className="w-full border p-3 rounded-xl"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-xl"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p
              className="text-sm text-center cursor-pointer text-orange-600"
              onClick={()=>setCurrentMode("forgot")}
            >
              Forgot Password?
            </p>

          </form>

        )}

        {/* FORGOT EMAIL */}

        {currentMode === "forgot" && (

          <form onSubmit={handleForgotPassword} className="space-y-4">

            <input
              type="email"
              placeholder="Enter your email"
              required
              value={forgotEmail}
              onChange={(e)=>setForgotEmail(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-xl"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

          </form>

        )}

        {/* OTP */}

        {currentMode === "otp" && (

          <form onSubmit={handleVerifyOtp} className="space-y-4">

            <input
              type="text"
              placeholder="Enter OTP"
              maxLength={6}
              value={otpValue}
              onChange={(e)=>setOtpValue(e.target.value)}
              className="w-full border p-3 rounded-xl text-center"
            />

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 rounded-xl"
            >
              Verify OTP
            </button>

          </form>

        )}

        {/* RESET */}

        {currentMode === "reset" && (

          <form onSubmit={handleResetPassword} className="space-y-4">

            <input
              type="password"
              placeholder="New Password"
              required
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmNewPassword}
              onChange={(e)=>setConfirmNewPassword(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 rounded-xl"
            >
              Reset Password
            </button>

          </form>

        )}

      </div>

    </div>

  );
}