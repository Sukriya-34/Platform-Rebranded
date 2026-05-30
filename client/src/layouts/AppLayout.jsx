import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Figure out which menu item should be highlighted based on the URL
  const getCurrentPage = () => {
    if (location.pathname.includes('/new')) return 'upload';
    if (location.pathname.includes('/courses')) return 'manage';
    return 'dashboard';
  };

  // Handle clicks from the Bolt Sidebar
  const handleNavigate = (id) => {
    if (id === 'dashboard') navigate('/creator/dashboard');
    if (id === 'upload') navigate('/creator/courses/new');
    if (id === 'manage') navigate('/creator/courses');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-poppins">
      {/* Sidebar is fixed, so it stays on the left */}
      <Sidebar currentPage={getCurrentPage()} onNavigate={handleNavigate} />
      
      {/* Main content area needs margin-left to avoid hiding behind the fixed sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        <Navbar title={title || "Creator Studio"} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}