import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Award, Briefcase } from 'lucide-react';
import type { FreelancerProfile, User } from '../../types';
import { RatingStars } from './RatingStars';

export const FreelancerCard: React.FC<{ profile: FreelancerProfile }> = ({ profile }) => {
  const user = typeof profile.user === 'object' ? (profile.user as User) : null;
  const displayName = user?.name || 'Verified Freelancer';
  const avatar =
    user?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  const isAvailable = profile.availability === 'available';

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-xl hover:border-indigo-200/80 transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={avatar}
              alt={displayName}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-inner"
            />
            {isAvailable && (
              <span
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                title="Available now"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                <Link to={`/freelancers/${user?._id || profile._id}`}>{displayName}</Link>
              </h4>
              <CheckCircle2 className="w-4 h-4 text-indigo-500 fill-indigo-50" />
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {profile.headline || 'Professional Specialist'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-black text-slate-900 block leading-tight">
            ${profile.hourlyRate}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            / hour
          </span>
        </div>
      </div>

      {/* Bio excerpt */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
        {profile.bio || 'Experienced freelancer providing quality work and reliable communication.'}
      </p>

      {/* Skills tags */}
      <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
        {(profile.skills || []).slice(0, 4).map((skill, index) => (
          <span
            key={index}
            className="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg transition-colors"
          >
            {skill}
          </span>
        ))}
        {(profile.skills || []).length > 4 && (
          <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[11px] font-medium rounded-lg">
            +{profile.skills.length - 4}
          </span>
        )}
      </div>

      {/* Stats footer & CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <RatingStars rating={profile.ratingAvg || 5.0} count={profile.ratingCount || 0} size="sm" />
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile.completedOrdersCount || 0} jobs</span>
          </div>
        </div>

        <Link
          to={`/freelancers/${user?._id || profile._id}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          View Profile &rarr;
        </Link>
      </div>
    </div>
  );
};
