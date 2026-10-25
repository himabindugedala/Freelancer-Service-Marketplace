import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { orderApi } from '../../services/api';
import type { Order } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const ClientOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await orderApi.getMyOrders({ role: 'client' });
        if (res.success) setOrders(res.data);
      } catch (err) {
        console.error('Failed to load client orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  if (isLoading) {
    return <LoadingSpinner message="Loading your orders..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Client Order Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track active project progress, inspect deliveries, and approve escrow release.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold text-slate-500">
        {['all', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="You do not have any orders under this status."
          actionText="Explore Marketplace Services"
          onAction={() => window.location.assign('/services')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:border-indigo-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img
                  src={
                    order.freelancer?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      order.freelancer?.name || 'F'
                    )}`
                  }
                  alt={order.freelancer?.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-inner"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.status === 'delivered'
                          ? 'bg-amber-50 text-amber-700 animate-pulse'
                          : order.status === 'revision_requested'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{order.title}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span>Freelancer: <strong className="text-slate-800">{order.freelancer?.name}</strong></span>
                    <span>&bull;</span>
                    <span className="text-slate-900 font-extrabold">${order.agreedPrice} USD</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Due: {new Date(order.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-shrink-0">
                <Link to={`/client/orders/${order._id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Manage Order
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
