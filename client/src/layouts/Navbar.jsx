import { Search, Bell, Settings } from 'lucide-react';

export default function Navbar({ title, onSearch }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink-black">{title}</h2>
        </div>

        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search content..."
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-soft-periwinkle focus:border-transparent transition-all"
            />
          </div>

          <button className="relative p-2 text-gray-600 hover:text-soft-periwinkle transition-colors">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="p-2 text-gray-600 hover:text-soft-periwinkle transition-colors">
            <Settings size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
}
