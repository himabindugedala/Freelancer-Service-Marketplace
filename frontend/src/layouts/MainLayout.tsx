import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useNotifications } from '../context/NotificationContext';
import { Bell, X } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { toast, clearToast } = useNotifications();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      {/* Floating Live Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-indigo-100 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-bold text-slate-900 truncate">{toast.title}</h5>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{toast.message}</p>
          </div>
          <button
            onClick={clearToast}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
