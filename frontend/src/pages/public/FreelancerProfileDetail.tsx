import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Award,
  Star,
  Globe,
  ExternalLink,
  MessageSquare,
  Briefcase,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { freelancerApi, chatApi } from '../../services/api';
import type { FreelancerProfile, Service, Review, User } from '../../types';
import { RatingStars } from '../../components/common/RatingStars';
import { ServiceCard } from '../../components/common/ServiceCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';


export const FreelancerProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<
    (FreelancerProfile & { services: Service[]; reviews: Review[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    freelancerApi
      .getById(id)
      .then((res) => {
        if (res.success) setProfile(res.data);
      })
      .catch((err) => console.error('Failed to load profile:', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner fullPage message="Loading freelancer profile..." />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested freelancer profile does not exist.</p>
        <Link to="/freelancers" className="mt-4 inline-block">
          <Button variant="outline">Back to Freelancers</Button>
        </Link>
      </div>
    );
  }

  const user = typeof profile.user === 'object' ? (profile.user as User) : null;
  const displayName = user?.name || 'Verified Freelancer';
  const avatar =
    user?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  const isSelf = currentUser?._id === user?._id;

  const handleMessage = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!user) return;
    try {
      const res = await chatApi.getOrCreateConversation({ recipientId: user._id });
      if (res.success) {
        navigate('/messages', { state: { conversationId: res.data._id } });
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Freelancers', to: '/freelancers' },
          { label: displayName },
        ]}
      />

      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <img
                src={avatar}
                alt={displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-slate-100 shadow-md"
              />
              {profile.availability === 'available' && (
                <span
                  className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"
                  title="Available for new projects"
                />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {displayName}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-50" />
              </div>
              <p className="text-sm font-semibold text-indigo-600 mb-3">
                {profile.headline || 'Independent Specialist'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                <RatingStars rating={profile.ratingAvg || 5.0} count={profile.ratingCount || 0} />
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {profile.completedOrdersCount || 0} completed orders
                </span>
                <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {profile.experienceLevel} Level
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs & Rate */}
          <div className="flex flex-col sm:flex-row items-end md:items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-left sm:text-right">
              <span className="text-3xl font-black text-slate-900">${profile.hourlyRate}</span>
              <span className="text-xs text-slate-400 block font-medium">/ hour</span>
            </div>

            {!isSelf && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleMessage}
                leftIcon={<MessageSquare className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-md shadow-indigo-200"
              >
                Send Message
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio, Skills, Portfolio */}
        <div className="lg:col-span-2 space-y-8">
          {/* Biography */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">About Me</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {profile.bio || 'Professional freelancer delivering reliable high-quality work.'}
            </p>

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Languages
                </h5>
                <div className="flex flex-wrap gap-2 text-xs text-slate-700 font-medium">
                  {profile.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 rounded-lg">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Portfolio Projects */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Featured Portfolio Projects</h3>
            {!profile.portfolio || profile.portfolio.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No portfolio items published yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profile.portfolio.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                  >
                    {item.image && (
                      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-indigo-600 p-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{item.description}</p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {item.tags.map((t, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Published Services by this Freelancer */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Published Services</h3>
            {!profile.services || profile.services.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No active published services at this time.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profile.services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}
          </div>

          {/* Client Reviews */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Client Reviews</h3>
              <RatingStars rating={profile.ratingAvg || 5.0} count={profile.reviews?.length || 0} />
            </div>

            {!profile.reviews || profile.reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No reviews recorded yet.</p>
            ) : (
              <div className="space-y-6">
                {profile.reviews.map((rev) => (
                  <div key={rev._id} className="pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            rev.client?.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              rev.client?.name || 'C'
                            )}`
                          }
                          alt={rev.client?.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{rev.client?.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} showText={false} size="sm" />
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pl-10">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Skills & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Skills & Endorsements</h4>
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          {profile.socialLinks && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Online Presence</h4>
              <div className="space-y-3 text-xs font-medium">
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-indigo-600 hover:underline"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      <Globe className="w-4 h-4 text-slate-400" />
                      Personal Website
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-indigo-600 hover:underline"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      GitHub Profile
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-indigo-600 hover:underline"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      LinkedIn Profile
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
