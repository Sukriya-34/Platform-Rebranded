import { LayoutDashboard, Upload, FolderOpen, Video } from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Content', icon: Upload },
    { id: 'manage', label: 'Manage Content', icon: FolderOpen }
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#101219] text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#9893DA] rounded-xl flex items-center justify-center">
            <Video size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">LearnHub</h1>
            <p className="text-xs text-gray-400">Creator Studio</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#9893DA] text-white'
                      : 'text-gray-300 hover:bg-[#797A9E] hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-[#9893DA] rounded-full flex items-center justify-center text-sm font-bold">
            CC
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Content Creator</p>
            <p className="text-xs text-gray-400">creator@learnhub.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
