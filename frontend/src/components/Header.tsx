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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    if (headerRef.current) {
      VanillaTilt.init(headerRef.current, {
        max: 1, speed: 400, glare: true, "max-glare": 0.1,
      });
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home",       value: "home" },
    { label: "About Us",   value: "about" },
    { label: "Solutions",  value: "solutions" },
    { label: "Gallery",    value: "gallery" },
    { label: "Contact Us", value: "contact" },
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
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center px-4 sm:px-6 lg:px-8 pointer-events-none transition-all duration-700">

      {/* ── PILL HEADER ── */}
      <header
        ref={headerRef}
        className={`w-full max-w-[1400px] transition-all duration-700 pointer-events-auto
          ${scrolled
            ? "mt-2 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border border-white/40 py-2 rounded-full"
            : "mt-3 bg-white/20 backdrop-blur-md shadow-2xl border border-white/30 py-3 rounded-full"}`}
      >
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-14 gap-4">

            {/* LOGO */}
            <div
              className="flex items-center gap-3 cursor-pointer flex-shrink-0 group"
              onClick={() => handleNavigate("home")}
            >
              <div className="relative h-10 w-10 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-orange-500 blur-md opacity-40 group-hover:opacity-70 transition duration-300"></div>
                <div className="relative h-full w-full rounded-full overflow-hidden border border-white shadow-sm">
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div className="absolute top-0 -left-[100%] h-full w-[100%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:left-[100%] transition-all duration-500"></div>
                  </div>
                  <img
                    src="/img/logo1.JPG"
                    alt="Megapods India"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-all duration-500">
                  MEGAPODS
                </span>
                <span className="text-xs font-bold tracking-[0.3em] text-orange-600 group-hover:text-slate-900 transition-all duration-500">
                  INDIA
                </span>
              </div>
            </div>

            {/* DESKTOP NAV — only visible on xl+ when logged in, lg+ when logged out */}
            <nav className="hidden xl:flex items-center gap-6 2xl:gap-8">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleNavigate(item.value)}
                  className={`relative text-[13px] font-black uppercase tracking-[0.12em] transition-all duration-300 whitespace-nowrap group px-1 py-1
                    ${currentPage === item.value
                      ? "text-orange-600"
                      : "text-slate-700 hover:text-orange-600"}`}
                >
                  {item.label}
                  <span className={`absolute -bottom-0.5 left-0 h-[2.5px] bg-orange-600 transition-all duration-300 rounded-full
                    ${currentPage === item.value ? "w-full" : "w-0 group-hover:w-full"}`}
                  ></span>
                </button>
              ))}
            </nav>

            {/* RIGHT SIDE ACTIONS */}
            <div className="hidden xl:flex items-center gap-3 flex-shrink-0">

              {/* GET QUOTE */}
              <button
                onClick={() => handleNavigate("quotation")}
                className={`group relative px-5 py-2.5 rounded-full font-black uppercase tracking-widest text-[12px] overflow-hidden transition-all duration-500 whitespace-nowrap border-2
                  ${currentPage === "quotation"
                    ? "bg-orange-600 text-white border-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                    : "border-orange-500 text-orange-600 hover:text-white"}`}
              >
                <span className="relative z-10">GET QUOTE</span>
                <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>

              {/* AUTH */}
              {isAuthenticated && user ? (
                <div className="relative flex-shrink-0" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-full hover:bg-orange-700 transition-all duration-300 shadow-lg shadow-orange-600/20 group"
                  >
                    <div className="bg-white/20 p-1 rounded-full flex-shrink-0">
                      <User size={13} />
                    </div>
                    <span className="text-[12px] font-black uppercase tracking-wider max-w-[90px] truncate">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <ChevronDown size={13} className={`transition-transform duration-300 flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
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
                          <User size={16} className="text-orange-500" /> Account Details
                        </button>
                        <button onClick={() => handleNavigate("quote-history")}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          <History size={16} className="text-orange-500" /> Quotation History
                        </button>
                        <button onClick={() => { setDropdownOpen(false); openForgotPassword?.(); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          <Key size={16} className="text-orange-500" /> Change Password
                        </button>
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut size={16} /> Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openSignup}
                  className="group relative px-6 py-2.5 bg-orange-600 text-white rounded-full font-black uppercase tracking-widest text-[12px] overflow-hidden transition-all duration-500 hover:scale-105 shadow-xl shadow-orange-600/20 whitespace-nowrap"
                >
                  <span className="relative z-10">SIGN IN</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-800 pointer-events-auto flex-shrink-0"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="xl:hidden w-full max-w-[1400px] mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 pointer-events-auto overflow-hidden">
          <div className="px-4 py-4 space-y-2">

            {isAuthenticated && user && (
              <div className="bg-orange-50 rounded-xl px-4 py-3 mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-600 text-white p-1.5 rounded-full">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{user.fullName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleNavigate("account")}
                    className="flex-1 text-xs bg-white border border-orange-200 text-orange-600 py-2 rounded-lg font-semibold">
                    Account
                  </button>
                  <button onClick={() => handleNavigate("quote-history")}
                    className="flex-1 text-xs bg-white border border-orange-200 text-orange-600 py-2 rounded-lg font-semibold">
                    History
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); openForgotPassword?.(); }}
                    className="flex-1 text-xs bg-white border border-orange-200 text-orange-600 py-2 rounded-lg font-semibold">
                    Password
                  </button>
                </div>
              </div>
            )}

            {[...navItems, { label: "Get Quote", value: "quotation" }].map((item) => (
              <button
                key={item.value}
                onClick={() => handleNavigate(item.value)}
                className={`block w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors
                  ${item.value === "quotation" ? "bg-white text-black font-black" : ""}
                  ${currentPage === item.value && item.value !== "quotation" ? "bg-orange-50 text-orange-600" : item.value !== "quotation" ? "text-slate-700 hover:bg-slate-50" : ""}`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-1 border-t border-slate-100">
              <a href="tel:+918758176693" className="flex items-center gap-2 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm">
                <Phone size={16} className="text-orange-500" />
                <span>+91 87581 76693</span>
              </a>
              <a href="tel:+919265380907" className="flex items-center gap-2 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm">
                <Phone size={16} className="text-orange-500" />
                <span>+91 92653 80907</span>
              </a>
            </div>

            {isAuthenticated ? (
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 text-sm">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <button onClick={openSignup}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 text-sm">
                Sign Up / Login
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
}