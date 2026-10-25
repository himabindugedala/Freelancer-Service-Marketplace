import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Layers,
  Briefcase,
  DollarSign,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Aggregating platform metrics..." />;
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Platform Overview & Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          High-level operational metrics across users, services, escrow volume, and active orders.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Users
          </span>
          <span className="text-3xl font-black text-slate-900">{metrics.totalUsers || 0}</span>
          <span className="text-xs text-slate-500 block mt-1">
            {metrics.clientCount || 0} Clients &bull; {metrics.freelancerCount || 0} Freelancers
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Services
          </span>
          <span className="text-3xl font-black text-indigo-600">{metrics.totalServices || 0}</span>
          <span className="text-xs text-slate-500 block mt-1">Active published catalog</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Orders
          </span>
          <span className="text-3xl font-black text-emerald-600">{metrics.activeOrders || 0}</span>
          <span className="text-xs text-slate-500 block mt-1">
            {metrics.completedOrders || 0} Completed to Date
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Simulated Volume
          </span>
          <span className="text-3xl font-black text-slate-900">${metrics.totalVolume || 0}</span>
          <span className="text-xs text-slate-500 block mt-1">Escrow transactions processed</span>
        </div>
      </div>

      {/* Recent Orders Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Recent Platform Orders</h3>
          <span className="text-xs text-slate-400">Live order audit</span>
        </div>

        {(!data?.recentOrders || data.recentOrders.length === 0) ? (
          <p className="text-xs text-slate-400 italic py-4">No recent orders recorded.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recentOrders.map((ord: any) => (
              <div key={ord._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-mono text-slate-400">#{ord.orderNumber}</span>
                  <span className="font-bold text-slate-900 ml-2">{ord.title}</span>
                  <span className="text-slate-500 block mt-0.5">
                    Client: {ord.client?.name} &rarr; Freelancer: {ord.freelancer?.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900">${ord.agreedPrice}</span>
                  <span className="block text-[10px] text-slate-400 capitalize">{ord.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Users Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Recent Member Registrations</h3>
          <Link to="/admin/users" className="text-xs font-bold text-rose-600 hover:underline">
            Manage All Users &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {data?.recentUsers?.map((u: any) => (
            <div key={u._id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                  alt={u.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <span className="font-bold text-slate-900">{u.name}</span>
                  <span className="text-slate-400 block">{u.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-[10px] text-slate-700">
                  {u.role}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {u.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
