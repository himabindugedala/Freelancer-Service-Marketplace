import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, DollarSign, ArrowRight, X } from 'lucide-react';
import { proposalApi } from '../../services/api';
import type { Proposal, Project } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const MyProposals: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const res = await proposalApi.getMyProposals();
      if (res.success) setProposals(res.data);
    } catch (err) {
      console.error('Failed to load my proposals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleWithdraw = async (proposalId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this proposal?')) return;
    try {
      await proposalApi.withdraw(proposalId);
      fetchProposals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw proposal');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your submitted proposals..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Submitted Proposals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track status of your project bids, review client responses, and manage opportunities.
          </p>
        </div>

        <Link to="/projects">
          <Button variant="primary">
            Find New Projects
          </Button>
        </Link>
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          title="No submitted proposals"
          description="You haven't pitched for any projects yet. Browse open client requisitions to discover work."
          actionText="Browse Open Projects"
          onAction={() => window.location.assign('/projects')}
        />
      ) : (
        <div className="space-y-4">
          {proposals.map((prop) => {
            const project = typeof prop.project === 'object' ? (prop.project as Project) : null;

            return (
              <div
                key={prop._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:border-indigo-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        prop.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prop.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : prop.status === 'withdrawn'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {prop.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Pitched on {new Date(prop.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {project?.title || 'Client Project'}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    "{prop.coverLetter}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                    <span>Your Bid: <strong className="text-slate-900">${prop.bidAmount} USD</strong></span>
                    <span>&bull;</span>
                    <span>Delivery in {prop.deliveryTimeDays} days</span>
                    {project && (
                      <>
                        <span>&bull;</span>
                        <span>Client Budget: ${project.budgetMin} - ${project.budgetMax}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-shrink-0">
                  {project && (
                    <Link to={`/projects/${project._id}`}>
                      <Button variant="outline" size="sm">
                        View Project
                      </Button>
                    </Link>
                  )}

                  {prop.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => handleWithdraw(prop._id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
