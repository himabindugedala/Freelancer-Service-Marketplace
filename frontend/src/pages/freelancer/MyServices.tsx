import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, PlusCircle, Trash2, Edit3, Eye, Clock, Star } from 'lucide-react';
import { serviceApi } from '../../services/api';
import type { Service } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const MyServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await serviceApi.getMyServices();
      if (res.success) setServices(res.data);
    } catch (err) {
      console.error('Failed to load my services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await serviceApi.delete(id);
      fetchServices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete service');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your published services..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Published Services
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your service catalog offerings, edit pricing, and publish new packages.
          </p>
        </div>

        <Link to="/freelancer/services/new">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Service
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="No services published yet"
          description="Create and publish your first freelance service package to start receiving orders directly from clients."
          actionText="Create a Service"
          onAction={() => window.location.assign('/freelancer/services/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                <img
                  src={service.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80'}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-700 shadow-sm">
                  {service.category?.name || 'Category'}
                </span>
                <span
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    service.status === 'published'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {service.status}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2">
                  {service.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {service.deliveryTimeDays}d delivery
                  </span>
                  <span className="text-sm font-black text-slate-900">${service.price} USD</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                  <Link
                    to={`/services/${service._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link to={`/freelancer/services/edit/${service._id}`}>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </Link>

                    <button
                      onClick={() => handleDelete(service._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
