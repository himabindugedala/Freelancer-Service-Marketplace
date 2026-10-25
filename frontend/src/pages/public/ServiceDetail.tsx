import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Bookmark,
  Share2,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { serviceApi, orderApi, chatApi } from '../../services/api';
import type { Service, FreelancerProfile, Review } from '../../types';
import { RatingStars } from '../../components/common/RatingStars';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';


export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [service, setService] = useState<
    (Service & { freelancerProfile: FreelancerProfile; reviews: Review[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    serviceApi
      .getById(id)
      .then((res) => {
        if (res.success) setService(res.data);
      })
      .catch((err) => console.error('Failed to load service:', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner fullPage message="Loading service details..." />;
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Service not found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested service could not be located.</p>
        <Link to="/services" className="mt-4 inline-block">
          <Button variant="outline">Back to Services</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === service.freelancer?._id;

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await chatApi.getOrCreateConversation({
        recipientId: service.freelancer._id,
      });
      if (res.success) {
        navigate('/messages', { state: { conversationId: res.data._id } });
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleConfirmOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsOrdering(true);
    setOrderError('');
    try {
      const res = await orderApi.createDirect(service._id);
      if (res.success && res.data) {
        setIsOrderModalOpen(false);
        navigate(`/client/orders/${res.data._id}`);
      }
    } catch (err: any) {
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Breadcrumbs */}
      <nav className="text-xs font-semibold text-slate-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link to="/services" className="hover:text-indigo-600">Services</Link>
        <span>/</span>
        <Link to={`/services?category=${service.category?.slug}`} className="text-indigo-600">
          {service.category?.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          <Breadcrumbs
            items={[
              { label: 'Services', to: '/services' },
              ...(service.category
                ? [
                    {
                      label: service.category.name,
                      to: `/services?category=${service.category.slug}`,
                    },
                  ]
                : []),
              { label: service.title },
            ]}
            className="mb-2"
          />

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug mb-4">
              {service.title}
            </h1>

            {/* Freelancer Info Header */}
            <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-slate-200">
              <Link to={`/freelancers/${service.freelancer?._id}`} className="flex items-center gap-3 group">
                <img
                  src={
                    service.freelancer?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      service.freelancer?.name || 'F'
                    )}`
                  }
                  alt={service.freelancer?.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {service.freelancer?.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {service.freelancerProfile?.headline || 'Verified Specialist'}
                  </p>
                </div>
              </Link>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <RatingStars rating={service.ratingAvg || 5.0} count={service.ratingCount || 0} />
                <span className="text-xs text-slate-400">({service.ordersCount || 0} orders)</span>
              </div>
            </div>
          </div>

          {/* Main Cover Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
            <img
              src={service.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'}
              alt={service.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>

          {/* Service Description */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">About this service</h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
              {service.description}
            </div>

            {/* Tags / Skills */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Skills & Technologies
              </h5>
              <div className="flex flex-wrap gap-2">
                {(service.skills || []).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews & Client Feedback */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Verified Client Reviews</h3>
                <p className="text-xs text-slate-500">Authentic feedback from completed orders</p>
              </div>
              <div className="flex items-center gap-2">
                <RatingStars rating={service.ratingAvg || 5.0} count={service.reviews?.length || 0} />
              </div>
            </div>

            {!service.reviews || service.reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">
                No reviews recorded for this service yet. Be the first to order and review!
              </p>
            ) : (
              <div className="space-y-6">
                {service.reviews.map((rev) => (
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

        {/* Right Column: Pricing & Order Action Box */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xl sticky top-24 space-y-6">
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fixed Package</span>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900">${service.price}</span>
                <span className="text-xs text-slate-400 block font-medium">USD Escrow</span>
              </div>
            </div>

            {/* Deliverable Specifications */}
            <div className="space-y-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Estimated Delivery Time
                </span>
                <span className="font-bold text-slate-900">{service.deliveryTimeDays} Days</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-500" />
                  Revisions Included
                </span>
                <span className="font-bold text-slate-900">{service.revisionsAllowed} Revisions</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Escrow Protection
                </span>
                <span className="font-bold text-emerald-600">100% Protected</span>
              </div>
            </div>

            {/* Order CTAs */}
            <div className="space-y-3 pt-2">
              {isOwner ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center font-medium">
                  This is your published service.
                </div>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full shadow-lg shadow-indigo-200"
                    onClick={() => setIsOrderModalOpen(true)}
                  >
                    Order Now &bull; ${service.price}
                  </Button>

                  <Button
                    size="md"
                    variant="outline"
                    className="w-full"
                    leftIcon={<MessageSquare className="w-4 h-4" />}
                    onClick={handleStartChat}
                  >
                    Contact Freelancer
                  </Button>
                </>
              )}
            </div>

            {/* Escrow Guarantee Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SkillForge Escrow Guarantee</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Your funds remain safely deposited in escrow until you have reviewed and approved the delivered work.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Escrow Checkout Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Confirm Order & Fund Escrow"
        description="Verify order details prior to initiating escrow deposit"
      >
        <div className="space-y-5">
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
            <h4 className="text-sm font-bold text-slate-900 mb-1">{service.title}</h4>
            <p className="text-xs text-slate-600">Provided by {service.freelancer?.name}</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Service Price:</span>
              <span className="font-bold text-slate-900">${service.price} USD</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Platform Escrow Fee:</span>
              <span className="font-bold text-emerald-600">$0.00 (Demo Mode)</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-black border-t border-slate-200">
              <span>Total Escrow Hold:</span>
              <span className="text-indigo-600">${service.price} USD</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This simulated payment deposits <strong>${service.price}</strong> into escrow. The freelancer will start work immediately, and funds are only transferred upon your final approval.
            </p>
          </div>

          {orderError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{orderError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setIsOrderModalOpen(false)} disabled={isOrdering}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmOrder}
              isLoading={isOrdering}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Deposit & Start Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
