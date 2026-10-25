import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';
import { adminApi, serviceApi } from '../../services/api';
import type { Service } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await adminApi.getServices(params);
      if (res.success) setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [statusFilter]);

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this service from the marketplace?')) return;
    try {
      await serviceApi.delete(id);
      fetchServices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Services Catalog Moderation
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review published packages, monitor compliance, and moderate listings.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchServices();
          }}
          className="relative w-full sm:max-w-md"
        >
          <input
            type="text"
            placeholder="Search services by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Loading services catalog..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Freelancer</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80'}
                          alt={s.title}
                          className="w-10 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                        <span className="font-bold text-slate-900 line-clamp-1">{s.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {s.freelancer?.name}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ${s.price}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {s.ordersCount || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteService(s._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
