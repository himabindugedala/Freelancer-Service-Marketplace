import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Upload,
  AlertCircle,
  MessageSquare,
  History,
  Send,
  Download,
} from 'lucide-react';
import { orderApi, chatApi, uploadApi } from '../../services/api';
import type { Order } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const FreelancerOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Delivery form state
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; size?: number }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

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
        recipientId: order.client._id,
        orderId: order._id,
      });
      if (res.success) {
        navigate('/messages', { state: { conversationId: res.data._id } });
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadApi.uploadSingle(file);
      if (res.success && res.data) {
        setUploadedFiles((prev) => [
          ...prev,
          { name: res.data.originalName, url: res.data.url, size: res.data.size },
        ]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!deliveryNotes.trim()) {
      setActionError('Please provide delivery notes explaining what you completed.');
      return;
    }

    setIsSubmittingDelivery(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await orderApi.submitDelivery(order._id, {
        deliveryNotes,
        deliveryFiles: uploadedFiles,
      });
      if (res.success) {
        setActionSuccess('Delivery submitted! Client has been notified for inspection.');
        fetchOrderDetail();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to submit delivery.');
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800">Order Not Found</h3>
        <Link to="/freelancer/orders" className="mt-4 inline-block">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const canDeliver = order.status === 'in_progress' || order.status === 'revision_requested';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Freelancer Dashboard', to: '/freelancer/dashboard' },
          { label: 'Orders', to: '/freelancer/orders' },
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
                    ? 'bg-amber-50 text-amber-700'
                    : order.status === 'revision_requested'
                    ? 'bg-purple-50 text-purple-700 animate-pulse'
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
              {order.paymentStatus === 'released' ? 'Earnings Credited' : 'Held in Escrow'}
            </span>
          </div>
        </div>

        {/* Client & Due Date Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-xs text-slate-600 font-medium">
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
              <span className="font-bold text-slate-900 block">{order.client?.name}</span>
              <span className="text-slate-400">{order.client?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Clock className="w-4 h-4 text-indigo-600" />
              Deadline: {new Date(order.deadline).toLocaleDateString()}
            </span>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageSquare className="w-4 h-4" />}
              onClick={handleStartChat}
            >
              Chat with Client
            </Button>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Revision Request Alert (If client requested revisions) */}
      {order.status === 'revision_requested' && (
        <div className="p-6 bg-purple-50/70 border border-purple-200 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-purple-900 text-sm">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            <span>Client Requested Revisions (Revision #{order.revisionCount})</span>
          </div>
          <p className="text-xs text-purple-800 leading-relaxed whitespace-pre-line pl-7">
            {order.revisionNotes}
          </p>
        </div>
      )}

      {/* Delivery Form (If In Progress or Revision Requested) */}
      {canDeliver ? (
        <form
          onSubmit={handleSubmitDelivery}
          className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {order.status === 'revision_requested' ? 'Submit Revised Delivery' : 'Deliver Completed Work'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Provide thorough notes and attach source deliverables for the client to review and approve.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Delivery Notes & Overview
            </label>
            <textarea
              rows={5}
              required
              placeholder="Describe the completed work, how to test/verify, and any links or access notes..."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Attach delivery files */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Attach Delivery Files (Source Zip, PDF, Images)
            </label>
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center">
              <Upload className="w-8 h-8 text-indigo-500 mb-2" />
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
                <span>{isUploading ? 'Uploading...' : 'Choose File to Attach'}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      {f.name}
                    </span>
                    <span className="text-slate-400">Attached</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmittingDelivery}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit Delivery to Client
            </Button>
          </div>
        </form>
      ) : (
        /* Display submitted delivery info if delivered or completed */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Submitted Delivery</h3>
              <p className="text-xs text-slate-500">
                {order.status === 'completed' ? 'Approved by client' : 'Awaiting client review & approval'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line border border-slate-200">
            {order.deliveryNotes || 'Delivery submitted.'}
          </div>

          {order.deliveryFiles && order.deliveryFiles.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Delivered Files
              </h5>
              <div className="space-y-2">
                {order.deliveryFiles.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 text-xs text-slate-700"
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
        </div>
      )}

      {/* Contract Audit History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Contract History Audit Trail</h3>
        </div>

        {(!order.history || order.history.length === 0) ? (
          <p className="text-xs text-slate-400 italic">No status transition history recorded.</p>
        ) : (
          <div className="space-y-4">
            {order.history.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-xs border-l-2 border-indigo-200 pl-4 py-1">
                <div>
                  <span className="font-bold text-slate-900 block">
                    {h.fromStatus} &rarr; {h.toStatus}
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
  );
};
