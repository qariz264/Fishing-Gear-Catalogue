import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Logo } from '../Logo';
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Calendar,
  GraduationCap,
  MapPin,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Products Catalogue', path: '/admin/products', icon: Package },
    { name: 'Blog Articles', path: '/admin/blogs', icon: BookOpen },
    { name: 'Events & Tournaments', path: '/admin/events', icon: Calendar },
    { name: 'Fishing Training', path: '/admin/training', icon: GraduationCap },
    { name: 'Fishing Spots Guide', path: '/admin/fishing-spots', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-white px-2 py-0.5 rounded">
            <Logo className="h-6 w-auto" />
          </div>
          <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Logo & Badge */}
          <div className="space-y-2">
            <div className="inline-block bg-white px-3 py-1.5 rounded-xl shadow-xs">
              <Logo className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-1.5 px-1 text-xs text-amber-400 font-mono font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin Control Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/80">
          <div className="px-1 text-[11px] text-slate-400">
            <span className="block text-slate-500 font-mono text-[10px]">Logged in as:</span>
            <span className="font-medium text-slate-200 truncate block">
              {currentUser?.email || currentUser?.uid}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Store</span>
            </a>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white rounded-lg transition-colors border border-red-800/40"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
