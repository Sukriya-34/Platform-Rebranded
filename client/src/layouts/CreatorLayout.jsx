import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, User, MessageSquare } from "lucide-react";

export default function CreatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Global Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const fetchNotifications = async (uid) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${uid}`);
      if (res.ok) setNotifications(await res.json());
    } catch(err) {
      console.error(err);
    }
  };

  const handleMarkNotificationsRead = async () => {
    if (!user) return;
    try {
      await fetch(`http://localhost:5000/api/notifications/${user.id}/read`, {
        method: "PUT"
      });
      fetchNotifications(user.id);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim().length > 0) {
        // If not on a searchable page, redirect to courses
        if (!path.includes("/creator/courses") && !path.includes("/creator/manage") && !path.includes("/creator/quizzes")) {
          navigate("/creator/courses");
        }
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        fetchNotifications(parsed.id);
        const interval = setInterval(() => fetchNotifications(parsed.id), 10000);
        return () => clearInterval(interval);
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
              { name: "Messages", to: "/creator/chat" },
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

        {/* Profile Details at Bottom of Sidebar */}
        <div className="p-6 border-t border-gray-800 bg-ink-black shrink-0">
          <div className="flex items-center gap-4 px-2 py-2 mb-4">
            <div className="w-12 h-12 bg-soft-periwinkle rounded-full flex items-center justify-center text-base font-bold text-white shadow-sm shrink-0">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.fullName || "Content Creator"}
              </p>
              <p className="text-xs text-warm-taupe truncate">
                {user?.role || "Creator"}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Link 
              to="/creator/profile"
              className="w-full text-left px-4 py-2 text-sm text-warm-taupe hover:bg-gray-800 hover:text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <User size={16} /> Profile Settings
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-soft-linen flex items-center px-10 justify-end shrink-0">
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center bg-porcelain px-5 py-2.5 rounded-xl border border-soft-linen focus-within:border-soft-periwinkle focus-within:ring-1 focus-within:ring-soft-periwinkle transition-all">
              <Search size={18} className="text-lavender-grey mr-3 cursor-pointer hover:text-soft-periwinkle" onClick={handleSearchSubmit} />
              <input
                type="text"
                placeholder="Search Course"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="bg-transparent border-none focus:outline-none text-sm w-56 text-ink-black placeholder-lavender-grey"
              />
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (!showNotifMenu) handleMarkNotificationsRead();
                }}
                className="relative p-2 text-lavender-grey hover:text-soft-periwinkle transition-colors bg-porcelain rounded-full"
              >
                <Bell size={20} />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-soft-linen rounded-2xl shadow-xl py-4 z-50 animate-fadeIn text-sm">
                  <div className="px-4 pb-2 border-b border-soft-linen mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-black uppercase tracking-wider">Notifications</span>
                    {notifications.some(n => !n.isRead) && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-soft-linen/50 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-lavender-grey text-center py-6">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 text-xs text-ink-black hover:bg-porcelain/30 transition-colors">
                          <p className={n.isRead ? "text-lavender-grey" : "font-semibold"}>{n.message}</p>
                          <span className="text-[8px] text-lavender-grey uppercase font-bold mt-1.5 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
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
