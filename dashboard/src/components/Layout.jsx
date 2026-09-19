import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Megaphone, Store, Tag, Settings, LogOut } from 'lucide-react';
import Logo from '../assets/logo.png'; // <--- Download your image as logo.png here

export default function Layout({ children }) {
  const location = useLocation();
  
const handleLogout = () => {
  localStorage.removeItem('umucuruzi_token');
  window.location.href = '/login'; // Force reload to clear state
};
  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Users', icon: Users, path: '/users' },
    { name: 'Advertisements', icon: Megaphone, path: '/ads' },
    { name: 'Markets', icon: Store, path: '/markets' },
    { name: 'Categories', icon: Tag, path: '/categories' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2C3E50] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-700">
          {/* The Logo */}
          <img src={Logo} alt="Umucuruzi Logo" className="w-12 h-12 rounded-full object-cover" />
          <h1 className="text-xl font-bold tracking-wider">Umucuruzi.com</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-[#FF6B35] text-white' : 'hover:bg-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="p-4 flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}