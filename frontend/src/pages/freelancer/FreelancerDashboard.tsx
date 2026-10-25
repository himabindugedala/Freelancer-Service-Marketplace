import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Briefcase,
  DollarSign,
  PlusCircle,
  Clock,
  CheckCircle2,
  FileText,
  Search,
  Star,
  Award,
} from 'lucide-react';
import { serviceApi, orderApi, projectApi } from '../../services/api';
import type { Service, Order, Project } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const FreelancerDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [openProjects, setOpenProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [servRes, ordRes, projRes] = await Promise.all([
          serviceApi.getMyServices(),
          orderApi.getMyOrders({ role: 'freelancer' }),
          projectApi.getOpenProjects({ limit: 4 }),
        ]);

        if (servRes.success) setServices(servRes.data);
        if (ordRes.success) setOrders(ordRes.data);
        if (projRes.success) setOpenProjects(projRes.data);
      } catch (err) {
        console.error('Error loading freelancer dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading freelancer studio..." />;
  }

  // Profile completion calculation
  let completionPoints = 0;
  if (user?.name) completionPoints += 20;
  if (user?.avatar) completionPoints += 20;
  if (profile?.headline) completionPoints += 20;
  if (profile?.bio) completionPoints += 20;
  if (profile?.skills && profile.skills.length > 0) completionPoints += 20;

  const activeOrders = orders.filter((o) => o.status === 'in_progress' || o.status === 'delivered' || o.status === 'revision_requested');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalEarnings = profile?.earningsTotal || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
            Freelancer Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-md">
            Manage your published services, deliver open orders, and bid on new opportunities.
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/freelancer/services/new">
            <Button size="md" variant="primary" className="bg-white text-indigo-950 hover:bg-slate-100 shadow-md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create Service
            </Button>
          </Link>
          <Link to="/projects">
            <Button size="md" variant="outline" className="border-indigo-400 text-white hover:bg-white/10" leftIcon={<Search className="w-4 h-4" />}>
              Browse Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Completion Indicator */}
      {completionPoints < 100 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              Profile Completeness: {completionPoints}%
            </span>
            <Link to="/settings" className="text-xs font-bold text-indigo-600 hover:underline">
              Complete Profile &rarr;
            </Link>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPoints}%` }}
            />
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Earnings
          </span>
          <span className="text-3xl font-black text-slate-900">${totalEarnings}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Orders
          </span>
          <span className="text-3xl font-black text-indigo-600">{activeOrders.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Completed Orders
          </span>
          <span className="text-3xl font-black text-emerald-600">{completedOrders.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Rating
          </span>
          <span className="text-3xl font-black text-slate-900 flex items-center gap-1">
            {profile?.ratingAvg ? profile.ratingAvg.toFixed(1) : '5.0'}
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </span>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Orders in Progress</h3>
            <p className="text-xs text-slate-500">Deliver finished work and respond to client revision requests</p>
          </div>
          <Link to="/freelancer/orders" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            No active orders in progress right now.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeOrders.map((order) => (
              <div key={order._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      order.client?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        order.client?.name || 'C'
                      )}`
                    }
                    alt={order.client?.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{order.title}</h4>
                    <p className="text-xs text-slate-500">
                      Client: <span className="font-semibold text-slate-700">{order.client?.name}</span> &bull; ${order.agreedPrice} USD
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      order.status === 'delivered'
                        ? 'bg-amber-50 text-amber-700'
                        : order.status === 'revision_requested'
                        ? 'bg-purple-50 text-purple-700 animate-pulse'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>

                  <Link to={`/freelancer/orders/${order._id}`}>
                    <Button variant="primary" size="sm">
                      Deliver Work
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Project Opportunities */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">New Project Opportunities</h3>
            <p className="text-xs text-slate-500">Discover projects posted by hiring clients</p>
          </div>
          <Link to="/projects" className="text-xs font-bold text-indigo-600 hover:underline">
            Browse All Projects &rarr;
          </Link>
        </div>

        {openProjects.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            No open projects found.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {openProjects.map((proj) => (
              <div key={proj._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{proj.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                    <span>Budget: <strong className="text-slate-800">${proj.budgetMin} - ${proj.budgetMax}</strong></span>
                    <span>&bull;</span>
                    <span>{proj.proposalsCount} proposals</span>
                  </div>
                </div>

                <Link to={`/projects/${proj._id}`}>
                  <Button variant="outline" size="sm">
                    Submit Proposal
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
