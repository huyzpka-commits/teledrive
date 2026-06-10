import { NavLink } from 'react-router-dom';
import { Home, Library, Music, Film, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/library?type=audio', icon: Music, label: 'Music' },
  { to: '/library?type=video', icon: Film, label: 'Movies' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="font-bold text-lg">T</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Teledrive</h1>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <Settings size={14} />
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
