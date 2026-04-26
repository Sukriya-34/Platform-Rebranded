import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut } from "lucide-react";

export default function CreatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // 1. Just track what the user types. No navigation needed!
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

  return (
    <div className="flex h-screen w-full bg-porcelain text-ink-black font-poppins overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-ink-black text-white flex flex-col shadow-lg z-10 shrink-0">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-8 border-b border-gray-800 flex flex-col items-start">
            <img
              src="/pathway.svg"
              alt="Logo"
              className="w-full max-w-45 h-auto object-contain mb-3"
            />
            <span className="text-xs text-warm-taupe uppercase tracking-[0.3em] font-bold block">
              Creator Studio
            </span>
          </div>

          <nav className="p-4 space-y-3 mt-6">
            {[
              { name: "Dashboard", to: "/creator/dashboard" },
              { name: "My Courses", to: "/creator/courses" },
              { name: "Upload Content", to: "/creator/upload" },
              { name: "Manage Content", to: "/creator/manage" },
              { name: "Manage Quizzes", to: "/creator/quizzes" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-6 py-4 rounded-2xl transition-all duration-200 text-lg font-semibold tracking-wide ${
                  path.includes(item.to)
                    ? "bg-soft-periwinkle text-white shadow-lg shadow-soft-periwinkle/20"
                    : "text-warm-taupe hover:bg-lavender-grey/20 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile */}
        <div className="p-6 border-t border-gray-800 bg-ink-black shrink-0">
          <div className="flex items-center gap-4 px-2 py-2">
            <div className="w-12 h-12 bg-soft-periwinkle rounded-full flex items-center justify-center text-base font-bold text-white shadow-sm shrink-0">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.fullName || "Content Creator"}
              </p>
              <p className="text-xs text-warm-taupe truncate">
                {user?.email || "creator@platfrm.x"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-soft-linen flex items-center px-10 justify-end shrink-0">
          <div className="flex items-center gap-8">
            {/* LIVE Search Bar */}
            <div className="hidden md:flex items-center bg-porcelain px-5 py-2.5 rounded-xl border border-soft-linen focus-within:border-soft-periwinkle focus-within:ring-1 focus-within:ring-soft-periwinkle transition-all">
              <Search size={18} className="text-lavender-grey mr-3" />
              <input
                type="text"
                placeholder="Search current page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Updates instantly as you type
                className="bg-transparent border-none focus:outline-none text-sm w-56 text-ink-black placeholder-lavender-grey"
              />
            </div>

            <button className="relative p-2 text-lavender-grey hover:text-soft-periwinkle transition-colors">
              <Bell size={24} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 bg-soft-periwinkle rounded-full flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:bg-soft-periwinkle/90 transition-colors"
              >
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "C"}
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-soft-linen rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-soft-linen mb-2">
                     <p className="text-sm font-bold text-ink-black truncate">{user?.fullName || "Content Creator"}</p>
                     <p className="text-[10px] uppercase font-bold text-warm-taupe truncate">{user?.role || "Creator"}</p>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium rounded-b-2xl"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 2. PASS THE SEARCH TEXT DOWN TO WHATEVER PAGE IS OPEN! */}
        <main className="flex-1 overflow-y-auto p-10">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}
