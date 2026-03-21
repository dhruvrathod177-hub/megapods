import { useState, useEffect } from "react";
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

// ── Pages that require login ──────────────────────────────────────────────────
const PROTECTED_PAGES = ["quotation", "account", "quote-history"];

// ── Map URL path → page key ───────────────────────────────────────────────────
const PATH_TO_PAGE: Record<string, string> = {
  "/":              "home",
  "/home":          "home",
  "/about":         "about",
  "/solutions":     "solutions",
  "/gallery":       "gallery",
  "/contact":       "contact",
  "/quotation":     "quotation",
  "/account":       "account",
  "/quote-history": "quote-history",
};

const PAGE_TO_PATH: Record<string, string> = {
  "home":          "/",
  "about":         "/about",
  "solutions":     "/solutions",
  "gallery":       "/gallery",
  "contact":       "/contact",
  "quotation":     "/quotation",
  "account":       "/account",
  "quote-history": "/quote-history",
};

function getPageFromPath(): string {
  const path = window.location.pathname;
  return PATH_TO_PAGE[path] ?? "home";
}

// ── Admin portal ──────────────────────────────────────────────────────────────
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
  const [currentPage, setCurrentPage] = useState<string>(getPageFromPath);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [startOnForgot, setStartOnForgot] = useState(false);

  // ── Push page to browser history with clean URL ───────────────────────────
  const navigateTo = (page: string) => {
    if (page === currentPage) return;
    const path = PAGE_TO_PATH[page] ?? "/";
    window.history.pushState({ page }, "", path);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Listen for browser back/forward ──────────────────────────────────────
  useEffect(() => {
    const initPage = getPageFromPath();
    const initPath = PAGE_TO_PATH[initPage] ?? "/";
    window.history.replaceState({ page: initPage }, "", initPath);
    setCurrentPage(initPage);

    const handlePopState = (e: PopStateEvent) => {
      const page = e.state?.page ?? getPageFromPath();
      setCurrentPage(page in PAGE_TO_PATH ? page : "home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openSignup         = () => { setAuthMode("login");  setStartOnForgot(false); setAuthModalOpen(true); };
  const openLogin          = () => { setAuthMode("login");  setStartOnForgot(false); setAuthModalOpen(true); };
  const openForgotPassword = () => { setStartOnForgot(true); setAuthModalOpen(true); };

  const handleNavigate = (page: string) => {
    // ✅ FIXED: use correct mp_token key
    if (PROTECTED_PAGES.includes(page)) {
      const token = localStorage.getItem("mp_token");
      if (!token) {
        openSignup();
        return;
      }
    }
    navigateTo(page);
  };

  const renderPage = () => {
    const pageContent = () => {
      switch (currentPage) {
        case "home":          return <Home          onNavigate={handleNavigate} />;
        case "about":         return <About         onNavigate={handleNavigate} />;
        case "solutions":     return <Solutions     onNavigate={handleNavigate} />;
        case "gallery":       return <Gallery       onNavigate={handleNavigate} />;
        case "contact":       return <Contact />;
        case "quotation":     return <QuotationPage />;
        case "account":       return <AccountPage   onOpenForgotPassword={openForgotPassword} />;
        case "quote-history": return <QuoteHistoryPage onNavigate={handleNavigate} />;
        default:              return <Home          onNavigate={handleNavigate} />;
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
        onNavigate={handleNavigate}
        openSignup={openSignup}
        openForgotPassword={openForgotPassword}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={handleNavigate} />
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