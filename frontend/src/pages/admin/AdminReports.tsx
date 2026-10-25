import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Resolution modal
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getReports({ status: statusFilter });
      if (res.success) setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolveOrDismiss = async (status: 'resolved' | 'dismissed') => {
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      await adminApi.updateReport(selectedReport._id, { status, adminNotes });
      setSelectedReport(null);
      setAdminNotes('');
      fetchReports();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update report status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Trust & Safety Moderation Reports
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Investigate reported complaints, mediate disputes, and enforce marketplace guidelines.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold text-slate-500">
        {['all', 'pending', 'resolved', 'dismissed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
              statusFilter === st
                ? 'bg-rose-600 text-white'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports found"
          description="There are currently no reports submitted under this filter."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      report.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : report.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Target: <strong className="text-slate-700 capitalize">{report.targetType}</strong> &bull; Reported {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">Reason: {report.reason}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{report.description || 'No additional notes provided.'}</p>
                <span className="text-[11px] text-slate-400 block">
                  Reported by: {report.reporter?.name} ({report.reporter?.email})
                </span>

                {report.adminNotes && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 mt-2">
                    <span className="font-bold text-slate-900 block mb-0.5">Admin Resolution Notes:</span>
                    {report.adminNotes}
                  </div>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex sm:flex-col items-end gap-2 flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setSelectedReport(report);
                      setAdminNotes('');
                    }}
                  >
                    Resolve Report
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Report Resolution Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Resolve or Dismiss Report"
        description="Add administrative notes and conclude investigation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Investigation Notes & Actions Taken
            </label>
            <textarea
              rows={4}
              placeholder="Document the investigation findings and any warnings or actions issued..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => handleResolveOrDismiss('dismissed')}
              isLoading={isUpdating}
            >
              Dismiss Report
            </Button>
            <Button
              variant="primary"
              onClick={() => handleResolveOrDismiss('resolved')}
              isLoading={isUpdating}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Mark Resolved
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
