import { useState, useRef } from "react";
import { User, Mail, Phone, Calendar, Key, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

interface Heading3DProps {
  children: React.ReactNode;
  className?: string;
  tag?: HTMLTag;
}

function Heading3D({ children, className = '', tag: Tag = 'h2' }: Heading3DProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -10;
    const rotateY = ((x - cx) / cx) * 14;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    el.style.textShadow = `${-rotateY * 0.6}px ${rotateX * 0.6}px 18px rgba(234,88,12,0.22), 0 2px 32px rgba(0,0,0,0.10)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.textShadow = 'none';
  };

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`heading-3d ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Tag>
  );
}

interface AccountPageProps {
  onOpenForgotPassword: () => void;
}

export default function AccountPage({ onOpenForgotPassword }: AccountPageProps) {
  const { user } = useAuth();
  const [clicked, setClicked] = useState(false);

  const handlePasswordClick = () => {
    setClicked(true);
    onOpenForgotPassword();
    setTimeout(() => setClicked(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        <div className="mb-8">
          <Heading3D tag="h1" className="text-3xl font-bold text-gray-900">
            Account Details
          </Heading3D>
          <p className="text-gray-500 mt-1">View and manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 h-24" />
          <div className="px-8 pb-6">
            <div className="-mt-10 mb-4">
              <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-orange-600">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <Heading3D tag="h3" className="text-lg font-bold text-gray-900 mb-6">
            Personal Information
          </Heading3D>
          <div className="space-y-4">

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="bg-orange-100 p-2 rounded-xl">
                <User size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Full Name</p>
                <p className="font-semibold text-gray-900">{user?.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Mail size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Email Address</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Phone size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Phone</p>
                <p className="font-semibold text-gray-900">
                  {user?.contact ? `+91 ${user.contact}` : "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Member Since</p>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <Heading3D tag="h3" className="text-lg font-bold text-gray-900 mb-2">
            Security
          </Heading3D>
          <p className="text-gray-500 text-sm mb-6">Manage your password and account security</p>
          <button
            onClick={handlePasswordClick}
            className="w-full flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-100 hover:border-orange-400 rounded-2xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Key size={20} className="text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Change Password</p>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
            </div>
            <span className="text-orange-600 font-bold text-lg group-hover:translate-x-1 transition-transform">→</span>
          </button>
          {clicked && (
            <div className="flex items-center gap-2 text-green-600 mt-4">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Password reset email sent!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}