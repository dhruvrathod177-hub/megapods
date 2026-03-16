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
import QuoteHistoryPage from "./pages/QuoteHistoryPage";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

// ✅ Only these pages require login
const PROTECTED_PAGES = ["quotation", "account", "quote-history"];

function AppInner() {
  const [currentPage, setCurrentPage] = useState("home");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [startOnForgot, setStartOnForgot] = useState(false);

  const openSignup = () => { setAuthMode("register"); setStartOnForgot(false); setAuthModalOpen(true); };
  const openLogin  = () => { setAuthMode("login");    setStartOnForgot(false); setAuthModalOpen(true); };
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

    // Only protect quotation, account and quote-history
    if (PROTECTED_PAGES.includes(currentPage)) {
      return (
        <ProtectedRoute onOpenLogin={openLogin}>
          {pageContent()}
        </ProtectedRoute>
      );
    }

    // All other pages are public — no login required
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
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}