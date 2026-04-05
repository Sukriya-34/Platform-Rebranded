import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, BookOpen, LayoutDashboard, User, LogOut } from "lucide-react";

export default function LearnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  const navLinks = [
    { name: "Explore", to: "/learner/dashboard", icon: LayoutDashboard },
    { name: "My Learning", to: "/learner/my-courses", icon: BookOpen },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-porcelain text-ink-black font-poppins">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-soft-linen shadow-sm px-6 py-4 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <Link to="/learner/dashboard" className="flex items-center shrink-0">
          <img src="/pathway.svg" alt="Logo" className="h-8 w-auto object-contain" />
        </Link>

        {/* Center / Search Area */}
        <div className="flex-1 max-w-2xl mx-8 hidden lg:flex items-center gap-8">
          <nav className="flex space-x-6">
            {navLinks.map((link) => {
              const isActive = path.includes(link.to);
              return (
                <Link
                  key={link.name}
                  to={link.to}
                  className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-soft-periwinkle border-b-2 border-soft-periwinkle"
                      : "text-lavender-grey hover:text-ink-black"
                  } pb-1`}
                >
                  <link.icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Box */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-lavender-grey group-focus-within:text-soft-periwinkle transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for courses, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-porcelain/50 border border-soft-linen rounded-full py-2 pl-10 pr-4 text-sm text-ink-black focus:outline-none focus:ring-2 focus:ring-soft-periwinkle/30 focus:border-soft-periwinkle transition-all"
            />
          </div>
        </div>

        {/* Right Section / Profile */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="relative p-2 text-lavender-grey hover:text-soft-periwinkle transition-colors sm:block hidden">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative">
            <div 
              className="flex items-center gap-3 pl-4 border-l border-soft-linen cursor-pointer group"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-ink-black leading-tight group-hover:text-soft-periwinkle transition-colors">{user?.fullName || "Student User"}</p>
                <p className="text-[10px] uppercase font-bold text-warm-taupe tracking-wider">{user?.role || "Learner"}</p>
              </div>
              <button className="w-10 h-10 bg-soft-periwinkle/10 text-soft-periwinkle rounded-full flex items-center justify-center font-bold group-hover:bg-soft-periwinkle group-hover:text-white transition-colors border border-soft-periwinkle/20">
                <User size={18} />
              </button>
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-soft-linen rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-soft-linen mb-2 sm:hidden">
                   <p className="text-sm font-bold text-ink-black">{user?.fullName || "Student User"}</p>
                   <p className="text-[10px] uppercase font-bold text-warm-taupe">{user?.role || "Learner"}</p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full relative">
        <Outlet context={{ searchQuery }} />
      </main>

      {/* Footer (Simplified from Wireframe) */}
      <footer className="mt-auto bg-white border-t border-soft-linen py-10 px-8 text-center text-sm text-lavender-grey">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-ink-black font-playfair">
            PLATFORM<span className="text-soft-periwinkle">.X</span>
          </div>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-soft-periwinkle">Terms</Link>
            <Link to="#" className="hover:text-soft-periwinkle">Privacy</Link>
            <Link to="#" className="hover:text-soft-periwinkle">Support</Link>
          </div>
          <p>© 2026 Platform.x - All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
