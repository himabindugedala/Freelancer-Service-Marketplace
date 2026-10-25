import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Bookmark } from 'lucide-react';
import type { Service } from '../../types';
import { RatingStars } from './RatingStars';
import { savedItemApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ServiceCard: React.FC<{ service: Service; initialSaved?: boolean }> = ({
  service,
  initialSaved = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setIsSaving(true);
    try {
      const res = await savedItemApi.toggle({ itemType: 'service', itemId: service._id });
      if (res.success) {
        setIsSaved(res.data.isSaved);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Link
      to={`/services/${service._id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-200/80 transition-all duration-300 overflow-hidden"
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={service.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80'}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-700 shadow-sm">
          {service.category?.name || 'Service'}
        </div>

        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaving}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500'
          } shadow-sm`}
          aria-label="Save service"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-grow p-4">
        {/* Freelancer snippet */}
        <div className="flex items-center gap-2 mb-2.5">
          <img
            src={
              service.freelancer?.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                service.freelancer?.name || 'F'
              )}`
            }
            alt={service.freelancer?.name}
            className="w-6 h-6 rounded-full object-cover border border-slate-200"
          />
          <span className="text-xs font-medium text-slate-600 truncate hover:text-indigo-600">
            {service.freelancer?.name}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-3">
          {service.title}
        </h4>

        {/* Rating */}
        <div className="flex items-center mb-4 mt-auto">
          <RatingStars rating={service.ratingAvg || 5.0} count={service.ratingCount || 0} size="sm" />
        </div>

        {/* Footer info: Delivery + Price */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{service.deliveryTimeDays}d delivery</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block -mb-0.5 font-medium">STARTING AT</span>
            <span className="text-base font-extrabold text-slate-900">
              ${service.price}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
