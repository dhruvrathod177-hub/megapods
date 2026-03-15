import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  onOpenLogin: () => void;
}

export default function ProtectedRoute({ children, onOpenLogin }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center border border-gray-100">
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-orange-600" size={36} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Login Required</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            You need to be logged in to access this page. Create a free account or login to continue.
          </p>
          <button
            onClick={onOpenLogin}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition"
          >
            Login / Create Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
