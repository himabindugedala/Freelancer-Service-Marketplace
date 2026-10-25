import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Briefcase,
  Wallet,
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { projectApi, orderApi } from '../../services/api';
import type { Project, Order } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [projRes, ordRes] = await Promise.all([
          projectApi.getMyProjects(),
          orderApi.getMyOrders({ role: 'client' }),
        ]);

        if (projRes.success) setProjects(projRes.data);
        if (ordRes.success) setOrders(ordRes.data);
      } catch (err) {
        console.error('Error loading client dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading client workspace..." />;
  }

  const activeProjectsCount = projects.filter((p) => p.status === 'open' || p.status === 'in_progress').length;
  const activeOrdersCount = orders.filter((o) => o.status === 'in_progress' || o.status === 'delivered' || o.status === 'revision_requested').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completed').length;
  const totalEscrowVolume = orders.reduce((sum, o) => sum + (o.agreedPrice || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
            Client Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-md">
            Manage your project requisitions, incoming proposals, and active work orders.
          </p>
        </div>

        <Link to="/client/projects/new">
          <Button size="lg" variant="primary" className="bg-white text-indigo-900 hover:bg-slate-100 shadow-md" leftIcon={<PlusCircle className="w-5 h-5" />}>
            Post New Project
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Projects
          </span>
          <span className="text-3xl font-black text-slate-900">{activeProjectsCount}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Orders
          </span>
          <span className="text-3xl font-black text-indigo-600">{activeOrdersCount}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Completed Orders
          </span>
          <span className="text-3xl font-black text-emerald-600">{completedOrdersCount}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Spend
          </span>
          <span className="text-3xl font-black text-slate-900">${totalEscrowVolume}</span>
        </div>
      </div>

      {/* Active Orders Quick View */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Work Orders</h3>
            <p className="text-xs text-slate-500">Track milestones, inspect deliverables, and manage escrow</p>
          </div>
          <Link to="/client/orders" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            You do not have any active orders yet. Browse services or accept a project proposal to begin!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      order.freelancer?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        order.freelancer?.name || 'F'
                      )}`
                    }
                    alt={order.freelancer?.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{order.title}</h4>
                    <p className="text-xs text-slate-500">
                      Freelancer: <span className="font-semibold text-slate-700">{order.freelancer?.name}</span> &bull; ${order.agreedPrice} USD
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      order.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.status === 'delivered'
                        ? 'bg-amber-50 text-amber-700 animate-pulse'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>

                  <Link to={`/client/orders/${order._id}`}>
                    <Button variant="outline" size="sm">
                      Inspect Order
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Posted Projects Quick View */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Posted Projects</h3>
            <p className="text-xs text-slate-500">Monitor incoming proposals and hire candidates</p>
          </div>
          <Link to="/client/projects" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Projects &rarr;
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            You haven't posted any projects yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {projects.slice(0, 4).map((proj) => (
              <div key={proj._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                  <p className="text-xs text-slate-500">
                    Category: {proj.category?.name} &bull; Budget: ${proj.budgetMin} - ${proj.budgetMax} &bull; {proj.proposalsCount} Proposals Received
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/client/projects/${proj._id}/proposals`}>
                    <Button variant="primary" size="sm">
                      Review Proposals ({proj.proposalsCount})
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
