import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Star,
  History,
  ExternalLink,
} from 'lucide-react';
import { orderApi, reviewApi, chatApi } from '../../services/api';
import type { Order } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { RatingStars } from '../../components/common/RatingStars';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const ClientOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Revision modal
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Approving
  const [isApproving, setIsApproving] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchOrderDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await orderApi.getById(id);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleStartChat = async () => {
    if (!order) return;
    try {
      const res = await chatApi.getOrCreateConversation({
        recipientId: order.freelancer._id,
        orderId: order._id,
      });
      if (res.success) {
        navigate('/messages', { state: { conversationId: res.data._id } });
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleApproveOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you satisfied with the delivery and ready to release escrow payment?')) return;
    setIsApproving(true);
    setActionError('');
    try {
      const res = await orderApi.approve(order._id);
      if (res.success) {
        await fetchOrderDetail();
        // Immediately open review modal so client can review the freelancer!
        setIsReviewModalOpen(true);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to approve order.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !revisionNotes.trim()) return;
    setIsSubmittingRevision(true);
    setActionError('');
    try {
      const res = await orderApi.requestRevision(order._id, { revisionNotes });
      if (res.success) {
        setIsRevisionModalOpen(false);
        setRevisionNotes('');
        fetchOrderDetail();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to request revision.');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    setActionError('');
    try {
      const res = await reviewApi.create(order._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.success) {
        setIsReviewModalOpen(false);
        alert('Thank you! Your verified review has been published.');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading contract details..." />;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800">Order Not Found</h3>
        <Link to="/client/orders" className="mt-4 inline-block">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Client Dashboard', to: '/client/dashboard' },
          { label: 'Orders', to: '/client/orders' },
          { label: `#${order.orderNumber}` },
        ]}
      />

      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-slate-400">
                #{order.orderNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{order.title}</h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-3xl font-black text-slate-900 block">${order.agreedPrice}</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {order.paymentStatus === 'released' ? 'Escrow Released' : 'Held in Escrow'}
            </span>
          </div>
        </div>

        {/* Order Lifecycle Progress Bar */}
        <div className="pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Order Progress Lifecycle
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div
              className={`p-3 rounded-2xl border ${
                order.status === 'in_progress' || order.status === 'delivered' || order.status === 'completed'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              1. In Progress
            </div>
            <div
              className={`p-3 rounded-2xl border ${
                order.status === 'delivered' || order.status === 'completed'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              2. Work Delivered
            </div>
            <div
              className={`p-3 rounded-2xl border ${
                order.status === 'completed'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              3. Approved & Paid
            </div>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Delivery Review Section (If Delivered or Completed) */}
      {(order.status === 'delivered' || order.status === 'completed') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Delivered Work & Files</h3>
              <p className="text-xs text-slate-500">Submitted by {order.freelancer?.name}</p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Revisions Used: {order.revisionCount || 0}
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Freelancer Delivery Notes:</span>
            {order.deliveryNotes || 'No delivery notes provided.'}
          </div>

          {/* Downloadable Delivery Files */}
          {order.deliveryFiles && order.deliveryFiles.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Attached Delivery Files
              </h5>
              <div className="space-y-2">
                {order.deliveryFiles.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs text-slate-700 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      {file.name}
                    </span>
                    <Download className="w-4 h-4 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons if status === 'delivered' */}
          {order.status === 'delivered' && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setIsRevisionModalOpen(true)}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Request Revision
              </Button>

              <Button
                variant="primary"
                onClick={handleApproveOrder}
                isLoading={isApproving}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
              >
                Approve Work & Release Payment
              </Button>
            </div>
          )}

          {/* Review button if status === 'completed' */}
          {order.status === 'completed' && (
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <Button
                variant="primary"
                onClick={() => setIsReviewModalOpen(true)}
                leftIcon={<Star className="w-4 h-4 fill-white" />}
              >
                Leave a Verified Review
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Grid: Freelancer Card & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Freelancer Profile Quick Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contracted Freelancer
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={
                  order.freelancer?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    order.freelancer?.name || 'F'
                  )}`
                }
                alt={order.freelancer?.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <Link
                  to={`/freelancers/${order.freelancer?._id}`}
                  className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  {order.freelancer?.name}
                </Link>
                <p className="text-xs text-slate-500">{order.freelancer?.email}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<MessageSquare className="w-4 h-4" />}
              onClick={handleStartChat}
            >
              Message Freelancer
            </Button>
          </div>
        </div>

        {/* Audit Trail Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Contract Audit Trail</h3>
            </div>

            {(!order.history || order.history.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No status transition history recorded.</p>
            ) : (
              <div className="space-y-4">
                {order.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs border-l-2 border-indigo-200 pl-4 py-1">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Transition: {h.fromStatus} &rarr; {h.toStatus}
                      </span>
                      <p className="text-slate-600 mt-0.5">{h.notes}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(h.createdAt).toLocaleString()} by {h.changedBy?.name || 'System'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Request Order Revision"
        description="Specify changes or improvements needed on this delivery"
      >
        <form onSubmit={handleRequestRevision} className="space-y-4">
          <textarea
            rows={5}
            required
            placeholder="Please detail specifically what adjustments are required..."
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRevisionModalOpen(false)}
              disabled={isSubmittingRevision}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingRevision}>
              Send Revision Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Rate & Review Freelancer"
        description="Share your feedback to help the community evaluate quality"
      >
        <form onSubmit={handleSubmitReview} className="space-y-5">
          <div className="text-center py-2">
            <span className="text-xs font-bold text-slate-500 block mb-2">Overall Rating</span>
            <RatingStars
              rating={reviewRating}
              interactive
              size="lg"
              onChange={(r) => setReviewRating(r)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Written Review
            </label>
            <textarea
              rows={4}
              required
              placeholder="How was the communication, quality of delivery, and technical expertise?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isSubmittingReview}
            >
              Close
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingReview}>
              Publish Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
