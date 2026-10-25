import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Briefcase,
  FileText,
  MessageSquare,
  Bell,
  Bookmark,
  User,
  Settings,
  PlusCircle,
  Search,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isClient = user.role === 'client';

  const clientLinks = [
    { label: 'Overview', to: '/client/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Post a Project', to: '/client/projects/new', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'My Projects', to: '/client/projects', icon: <Layers className="w-4 h-4" /> },
    { label: 'Active Orders', to: '/client/orders', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Saved Favorites', to: '/saved', icon: <Bookmark className="w-4 h-4" /> },
    { label: 'Messages', to: '/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Notifications', to: '/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Profile Settings', to: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const freelancerLinks = [
    { label: 'Overview', to: '/freelancer/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Services', to: '/freelancer/services', icon: <Layers className="w-4 h-4" /> },
    { label: 'Create Service', to: '/freelancer/services/new', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Find Projects', to: '/projects', icon: <Search className="w-4 h-4" /> },
    { label: 'My Proposals', to: '/freelancer/proposals', icon: <FileText className="w-4 h-4" /> },
    { label: 'My Orders', to: '/freelancer/orders', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Public Profile', to: `/freelancers/${user._id}`, icon: <User className="w-4 h-4" /> },
    { label: 'Messages', to: '/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Notifications', to: '/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Edit Profile', to: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const navLinks = isClient ? clientLinks : freelancerLinks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-24">
            {/* User Profile Mini Card */}
            <div className="flex items-center gap-3 pb-5 mb-4 border-b border-slate-100">
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                }
                alt={user.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{user.name}</h4>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                  {user.role} Workspace
                </span>
                <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                  Balance: ${user.walletBalance || 0}
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Dashboard Area */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
