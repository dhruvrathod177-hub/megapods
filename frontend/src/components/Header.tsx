import { Menu, X, Phone, LogOut, User, ChevronDown, Key, History } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import VanillaTilt from 'vanilla-tilt';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  openSignup: () => void;
  openForgotPassword?: () => void;
}

export default function Header({ currentPage, onNavigate, openSignup, openForgotPassword }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    if (headerRef.current) {
      VanillaTilt.init(headerRef.current, {
        max: 1,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
      });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = [
    { label: "Home",       value: "home" },
    { label: "About Us",   value: "about" },
    { label: "Solutions",  value: "solutions" },
    { label: "Gallery",    value: "gallery" },
    { label: "Contact Us", value: "contact" },
    { label: "Get Quote",  value: "quotation" },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate("home");
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-50 w-full transition-all duration-700 
        ${scrolled 
          ? "bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] border-b border-white/20 py-2" 
          : "bg-transparent py-5"}`}
    >
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex justify-between items-center h-20">

          {/* LOGO */}
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0 group" onClick={() => handleNavigate("home")}>
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
              <img src="/img/logo1.JPG" alt="Megapods India" className="h-12 w-12 md:h-14 md:w-14 object-contain transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 relative z-10" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-all duration-500">
                MEGAPODS
              </span>
              <span className="text-sm md:text-base font-bold tracking-[0.3em] text-orange-600 group-hover:text-slate-900 transition-all duration-500">
                INDIA
              </span>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.filter(item => item.value !== "quotation").map((item) => (
              <button
                key={item.value}
                onClick={() => handleNavigate(item.value)}
                className={`relative text-[13px] font-black uppercase tracking-[0.15em] transition-all duration-500 transform
                  ${currentPage === item.value ? "text-orange-600 scale-105" : "text-slate-700 hover:text-orange-600 hover:scale-105"}
                  group px-2 py-1`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-[3px] bg-orange-600 transition-all duration-500 rounded-full ${currentPage === item.value ? "w-full" : "w-0 group-hover:w-full"}`}></span>
              </button>
            ))}

            <div className="h-8 w-px bg-slate-200/50 mx-2"></div>

            {/* GET QUOTE BUTTON */}
            <button
              onClick={() => handleNavigate("quotation")}
              className={`group relative px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[12px] overflow-hidden transition-all duration-500 
                ${currentPage === "quotation" 
                  ? "bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]" 
                  : "glass text-orange-600 hover:text-white"}`}
            >
              <span className="relative z-10">Get Quote</span>
              <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>

            {/* AUTH AREA */}
            {isAuthenticated && user ? (
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 bg-white/40 backdrop-blur-xl border border-slate-200/30 px-5 py-2.5 rounded-full hover:bg-orange-50 transition-all duration-300 shadow-lg shadow-black/5 group"
                >
                  <div className="bg-orange-600 text-white p-1.5 rounded-full shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">
                    <User size={14} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-wider text-slate-800">
                    {user.fullName.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className={`text-orange-600 transition-transform duration-500 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                    <div className="bg-orange-50/50 px-4 py-3 border-b border-slate-100">
                      <p className="font-bold text-slate-900 text-sm">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <button onClick={() => handleNavigate("account")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <User size={16} className="text-orange-500" />
                        Account Details
                      </button>
                      <button onClick={() => handleNavigate("quote-history")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <History size={16} className="text-orange-500" />
                        Quotation History
                      </button>
                      <button onClick={() => { setDropdownOpen(false); openForgotPassword?.(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <Key size={16} className="text-orange-500" />
                        Change Password
                      </button>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={openSignup}
                className="group relative px-8 py-3 bg-orange-600 text-white rounded-full font-black uppercase tracking-widest text-[12px] overflow-hidden transition-all duration-500 hover:scale-110 shadow-xl shadow-orange-600/20">
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-800">
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100">
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated && user && (
              <div className="bg-orange-50 rounded-xl px-4 py-3 mb-2">
                <div className="flex items-center gap-3 mb-2">
                  <User size={20} className="text-orange-600" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{user.fullName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleNavigate("account")}
                    className="flex-1 text-xs bg-white border border-orange-200 text-orange-600 py-2 rounded-lg font-medium">
                    Account
                  </button>
                  <button onClick={() => handleNavigate("quote-history")}
                    className="flex-1 text-xs bg-white border border-orange-200 text-orange-600 py-2 rounded-lg font-medium">
                    History
                  </button>
                </div>
              </div>
            )}

            {navItems.map((item) => (
              <button key={item.value} onClick={() => handleNavigate(item.value)}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium
                  ${item.value === "quotation" ? "text-orange-600 font-black" : ""}
                  ${currentPage === item.value && item.value !== "quotation" ? "bg-orange-50 text-orange-600" : "text-slate-700 hover:bg-slate-50"}`}>
                {item.label}
              </button>
            ))}

            <a href="tel:+918758176693" className="flex items-center gap-2 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg">
              <Phone size={20} /><span className="font-medium text-slate-900">+91 87581 76693</span>
            </a>
            <a href="tel:+919265380907" className="flex items-center gap-2 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg">
              <Phone size={20} /><span className="font-medium text-slate-900">+91 92653 80907</span>
            </a>

            {isAuthenticated ? (
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-100">
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <button onClick={openSignup}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700">
                Sign Up / Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}