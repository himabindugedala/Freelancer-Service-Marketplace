import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  BarChart3,
  Users,
  Layers,
  FolderTree,
  AlertOctagon,
  ArrowLeft,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const adminLinks = [
    { label: 'Platform Analytics', to: '/admin', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'User Directory', to: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Services Moderation', to: '/admin/services', icon: <Layers className="w-4 h-4" /> },
    { label: 'Category Manager', to: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
    { label: 'Reports & Disputes', to: '/admin/reports', icon: <AlertOctagon className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Top Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Platform Administration Console</h2>
            <p className="text-xs text-slate-400">System oversight, user management, and service moderation</p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs sticky top-24 space-y-1">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
              Management Modules
            </h5>
            {adminLinks.map((item) => {
              const isActive =
                item.to === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-200'
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
          </div>
        </aside>

        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
