import { Menu, X, Phone, LogOut, User, ChevronDown,  Key, History } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  openSignup: () => void;
  openForgotPassword?: () => void;
}

export default function Header({ currentPage, onNavigate, openSignup, openForgotPassword }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    onNavigate("home");
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
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
    <header className="border-b-2 border-gray-200 hover:border-orange-500 transition-all duration-300 sticky top-0 z-50 bg-white shadow-2xl w-full">
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex justify-between items-center h-20">

          {/* LOGO */}
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => handleNavigate("home")}>
            <img src="/img/logo1.JPG" alt="Megapods India" className="h-20 w-20 object-contain hover:scale-105 transition-transform duration-300" />
            <span className="text-3xl font-bold text-gray-900 hover:text-orange-500 transition-all duration-300">
              Megapodsindia
            </span>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleNavigate(item.value)}
                className={`relative text-base font-medium transition-all duration-300 transform whitespace-nowrap
                  ${item.value === "quotation" ? "text-orange-600 font-semibold" : ""}
                  ${currentPage === item.value ? "text-orange-600 scale-110" : "text-gray-700 hover:text-orange-600 hover:scale-110"}
                  after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-[4px]
                  after:bg-orange-600 after:transition-all after:duration-300
                  ${currentPage === item.value ? "after:w-full" : "after:w-0 hover:after:w-full"}`}
              >
                {item.label}
              </button>
            ))}

            {/* AUTH AREA */}
            {isAuthenticated && user ? (
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                {/* Username Button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full hover:bg-orange-100 transition-colors"
                >
                  <User size={16} className="text-orange-600" />
                  <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">
                    {user.fullName.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className={`text-orange-600 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="bg-orange-50 px-4 py-3 border-b border-orange-100">
                      <p className="font-bold text-gray-900 text-sm">{user.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => handleNavigate("account")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <User size={16} className="text-orange-500" />
                        Account Details
                      </button>

                      <button
                        onClick={() => handleNavigate("quote-history")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <History size={16} className="text-orange-500" />
                        Quotation History
                      </button>

                      <button
                        onClick={() => { setDropdownOpen(false); openForgotPassword?.(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <Key size={16} className="text-orange-500" />
                        Change Password
                      </button>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openSignup}
                className="flex-shrink-0 bg-orange-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-700 transition-colors hover:scale-105 duration-300 whitespace-nowrap"
              >
                Sign Up / Login
              </button>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-700">
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated && user && (
              <div className="bg-orange-50 rounded-xl px-4 py-3 mb-2">
                <div className="flex items-center gap-3 mb-2">
                  <User size={20} className="text-orange-600" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
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
                  ${item.value === "quotation" ? "bg-orange-600 text-white" : ""}
                  ${currentPage === item.value && item.value !== "quotation" ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"}`}>
                {item.label}
              </button>
            ))}

            <a href="tel:+918758176693" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Phone size={20} /><span className="font-medium">+91 87581 76693</span>
            </a>
            <a href="tel:+919265380907" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Phone size={20} /><span className="font-medium">+91 92653 80907</span>
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