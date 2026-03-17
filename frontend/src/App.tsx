import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Solutions from "./pages/Solutions";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import QuotationPage from "./pages/QuotationPage";
import AccountPage from "./pages/AccountPage";
import QuoteHistoryPage from "./pages/QuoteHistoryPage.tsx";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

// ✅ Only these pages require login
const PROTECTED_PAGES = ["quotation", "account", "quote-history"];

// ── Admin portal — completely separate from main app ──────────────────────────
function AdminPortal() {
  const [adminToken, setAdminToken] = useState<string | null>(
    sessionStorage.getItem("adminToken")
  );
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(
    () => {
      const stored = sessionStorage.getItem("adminUser");
      return stored ? JSON.parse(stored) : null;
    }
  );

  const handleLogin = (token: string, admin: { email: string; name: string }) => {
    sessionStorage.setItem("adminToken", token);
    sessionStorage.setItem("adminUser", JSON.stringify(admin));
    setAdminToken(token);
    setAdminUser(admin);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    setAdminToken(null);
    setAdminUser(null);
  };

  if (adminToken && adminUser) {
    return <AdminDashboard token={adminToken} admin={adminUser} onLogout={handleLogout} />;
  }

  return <AdminLoginPage onLogin={handleLogin} />;
}

// ── Main app ──────────────────────────────────────────────────────────────────
function AppInner() {
  const [currentPage, setCurrentPage] = useState("home");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [startOnForgot, setStartOnForgot] = useState(false);

  const openSignup  = () => { setAuthMode("login");  setStartOnForgot(false); setAuthModalOpen(true); };
  const openLogin   = () => { setAuthMode("login");  setStartOnForgot(false); setAuthModalOpen(true); };
  const openForgotPassword = () => { setStartOnForgot(true); setAuthModalOpen(true); };

  const renderPage = () => {
    const pageContent = () => {
      switch (currentPage) {
        case "home":          return <Home          onNavigate={setCurrentPage} />;
        case "about":         return <About         onNavigate={setCurrentPage} />;
        case "solutions":     return <Solutions     onNavigate={setCurrentPage} />;
        case "gallery":       return <Gallery       onNavigate={setCurrentPage} />;
        case "contact":       return <Contact />;
        case "quotation":     return <QuotationPage />;
        case "account":       return <AccountPage   onOpenForgotPassword={openForgotPassword} />;
        case "quote-history": return <QuoteHistoryPage onNavigate={setCurrentPage} />;
        default:              return <Home          onNavigate={setCurrentPage} />;
      }
    };

    if (PROTECTED_PAGES.includes(currentPage)) {
      return (
        <ProtectedRoute onOpenLogin={openLogin}>
          {pageContent()}
        </ProtectedRoute>
      );
    }

    return pageContent();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        openSignup={openSignup}
        openForgotPassword={openForgotPassword}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={setCurrentPage} />
      <WhatsAppButton />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setStartOnForgot(false); }}
        mode={authMode}
        startOnForgot={startOnForgot}
      />
    </div>
  );
}

export default function App() {
  // If URL path is /admin, show the admin portal (no header/footer)
  const isAdmin = window.location.pathname === "/admin";

  if (isAdmin) {
    return <AdminPortal />;
  }

  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}