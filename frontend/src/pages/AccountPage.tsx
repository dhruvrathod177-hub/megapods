
import { useState } from "react";
import { User, Mail, Phone, Calendar, Key, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AccountPageProps {
  onOpenForgotPassword: () => void;
}

export default function AccountPage({ onOpenForgotPassword }: AccountPageProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handlePasswordClick = () => {
    setSaved(true);
    onOpenForgotPassword();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Details</h1>
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
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Personal Information
          </h3>

          <div className="space-y-4">

            {/* Full Name */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="bg-orange-100 p-2 rounded-xl">
                <User size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Full Name
                </p>
                <p className="font-semibold text-gray-900">{user?.fullName}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Mail size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Email Address
                </p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Phone size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Phone
                </p>
                <p className="font-semibold text-gray-900">
                  {user?.phone || "Not Provided"}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Member Since
                </p>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Security</h3>
          <p className="text-gray-500 text-sm mb-6">
            Manage your password and account security
          </p>

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
                <p className="text-xs text-gray-500">
                  Update your account password
                </p>
              </div>
            </div>

            <span className="text-orange-600 font-bold text-lg group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>

          {/* Success Message */}
          {saved && (
            <div className="flex items-center gap-2 text-green-600 mt-4">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">
                Action triggered successfully
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
