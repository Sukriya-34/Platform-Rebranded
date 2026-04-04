import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CreatorLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/creator/dashboard', icon: 'grid-outline' },
    { name: 'My Courses', path: '/creator/courses', icon: 'book-outline' },
    { name: 'Upload Content', path: '/creator/upload', icon: 'cloud-upload-outline' },
    { name: 'Analytics', path: '/creator/analytics', icon: 'bar-chart-outline' },
    { name: 'Settings', path: '/creator/settings', icon: 'settings-outline' },
  ];

  return (
    <div className="flex h-screen w-full bg-porcelain text-ink-black overflow-hidden font-poppins">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-black text-white flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-soft-periwinkle rounded-full flex items-center justify-center font-bold text-ink-black">
              PX
            </div>
            <div>
              <h1 className="font-playfair font-bold text-lg leading-none">THE PLATFRM.X</h1>
              <span className="text-xs text-warm-taupe uppercase tracking-widest">Creator Studio</span>
            </div>
          </div>

          <div className="px-4 mt-6">
            <p className="text-xs text-warm-taupe mb-4 ml-2">MENU</p>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname.includes(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-soft-periwinkle text-ink-black font-medium' 
                        : 'text-warm-taupe hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{item.name}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ink-black"></div>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 mb-4 mx-4 bg-white/5 rounded-2xl border border-white/10">
          <h4 className="font-medium text-sm mb-1">Need help?</h4>
          <p className="text-xs text-warm-taupe mb-3">Check our creator guide for tips.</p>
          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
            View Guide →
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 border-b border-soft-linen flex items-center justify-between px-8 bg-porcelain">
          <div className="w-96">
            <input 
              type="text" 
              placeholder="Search courses, videos, documents..." 
              className="w-full bg-soft-linen px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-soft-periwinkle"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-soft-linen flex items-center justify-center text-lavender-grey hover:text-ink-black">
              🔔
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-lavender-grey rounded-full flex items-center justify-center text-white font-medium">
                JD
              </div>
              <div className="text-sm">
                <p className="font-medium leading-none">Jane Doe</p>
                <span className="text-xs text-lavender-grey">Creator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default CreatorLayout;